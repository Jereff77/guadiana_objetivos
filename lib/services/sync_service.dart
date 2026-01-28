import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drift/drift.dart';
import '../core/config/supabase_config.dart';
import '../data/datasources/local/database.dart';

enum SyncStatus {
  idle,
  syncing,
  success,
  error,
  conflict,
}

abstract class SyncManager {
  Future<void> syncAll();
  Future<void> syncTable(String tableName);
  Future<void> pushPendingChanges();
  Future<void> pullLatestChanges();
  Stream<SyncStatus> get syncStatusStream;
}

class SyncService implements SyncManager {
  final LocalDatabase db;
  final SupabaseClient client = SupabaseConfig.client;

  final StreamController<SyncStatus> _status = StreamController.broadcast();

  SyncService(this.db);

  @override
  Stream<SyncStatus> get syncStatusStream => _status.stream;

  @override
  Future<void> syncAll() async {
    _status.add(SyncStatus.syncing);
    try {
      await pushPendingChanges();
      await pullLatestChanges();
      _status.add(SyncStatus.success);
    } catch (_) {
      _status.add(SyncStatus.error);
    }
  }

  @override
  Future<void> syncTable(String tableName) async {
    await syncAll();
  }

  @override
  Future<void> pushPendingChanges() async {
    // productos pendientes
    final pendingProducts = await (db.select(db.products)
          ..where((tbl) => tbl.syncStatus.equals('pending')))
        .get();
    for (final p in pendingProducts) {
      await client.from('products').upsert({
        'id': p.id,
        'sku': p.sku,
        'name': p.name,
        'description': p.description,
        'category_id': p.categoryId,
        'brand': p.brand,
        'stock_max': p.stockMax,
        'stock_min': p.stockMin,
        'is_active': p.isActive,
        'warehouse_id': p.warehouseId,
        'updated_at': p.updatedAt.toIso8601String(),
      });
      await (db.update(db.products)..where((t) => t.id.equals(p.id))).write(
        const ProductsCompanion(syncStatus: Value('synced')),
      );
    }

    final pendingInv = await (db.select(db.inventory)
          ..where((tbl) => tbl.syncStatus.equals('pending')))
        .get();
    for (final i in pendingInv) {
      await client.from('inventory').upsert({
        'id': i.id,
        'product_id': i.productId,
        'warehouse_id': i.warehouseId,
        'quantity': i.quantity,
        'available': i.available,
        'notes': i.notes,
        'updated_at': i.updatedAt.toIso8601String(),
      });
      await (db.update(db.inventory)..where((t) => t.id.equals(i.id))).write(
        const InventoryCompanion(syncStatus: Value('synced')),
      );
    }
  }

  @override
  Future<void> pullLatestChanges() async {
    final products = await client.from('products').select('*');
    for (final p in products as List) {
      await db
          .into(db.products)
          .insertOnConflictUpdate(ProductsCompanion.insert(
            id: p['id'] as String,
            sku: p['sku'] as String,
            name: p['name'] as String,
            description: Value(p['description'] as String?),
            categoryId: Value(p['category_id'] as String?),
            brand: Value(p['brand'] as String?),
            standardCost: Value((p['standard_cost'] as num?)?.toDouble()),
            averageCost: Value((p['average_cost'] as num?)?.toDouble()),
            stockMax: Value(p['stock_max'] as int?),
            stockMin: Value(p['stock_min'] as int?),
            isActive: Value(p['is_active'] as bool? ?? true),
            warehouseId: p['warehouse_id'] as String,
            createdAt: DateTime.parse(p['created_at'] as String),
            updatedAt: DateTime.parse(p['updated_at'] as String),
            syncStatus: const Value('synced'),
            lastModified: const Value(0),
            syncVersion: const Value(1),
          ));
    }

    final inv = await client.from('inventory').select('*');
    for (final i in inv as List) {
      await db
          .into(db.inventory)
          .insertOnConflictUpdate(InventoryCompanion.insert(
            id: i['id'] as String,
            productId: i['product_id'] as String,
            warehouseId: i['warehouse_id'] as String,
            quantity: Value(i['quantity'] as int? ?? 0),
            toFulfill: Value(i['to_fulfill'] as int?),
            orderToFulfill: Value(i['order_to_fulfill'] as int?),
            available: Value(i['available'] as int? ?? 0),
            notes: Value(i['notes'] as String?),
            entry: Value(i['entry'] as int? ?? 0),
            exit: Value(i['exit'] as int? ?? 0),
            stockValue: Value((i['stock_value'] as num?)?.toDouble()),
            lastPurchaseDate: Value(i['last_purchase_date'] != null
                ? DateTime.parse(i['last_purchase_date'] as String)
                : null),
            lastSaleDate: Value(i['last_sale_date'] != null
                ? DateTime.parse(i['last_sale_date'] as String)
                : null),
            daysWithoutPurchase: Value(i['days_without_purchase'] as int? ?? 0),
            daysWithoutSale: Value(i['days_without_sale'] as int? ?? 0),
            serverOrigin: Value(i['server_origin'] as String?),
            updatedAt: DateTime.parse(i['updated_at'] as String),
            syncStatus: const Value('synced'),
            lastModified: const Value(0),
            syncVersion: const Value(1),
          ));
    }
  }
}
