import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drift/drift.dart';
import '../core/config/supabase_config.dart';
import '../data/datasources/local/database.dart';

class SyncService {
  final LocalDatabase db;
  SupabaseClient get client => SupabaseConfig.client;

  SyncService(this.db);

  /// Descarga el inventario del almacén desde Supabase y lo guarda localmente.
  /// Esto sobrescribirá los datos locales para ese almacén.
  Future<void> downloadInventory(String warehouseId) async {
    try {
      // 1. Obtener datos de Supabase
      // Filtramos por almacén y existencia > 0 como se solicitó anteriormente
      final response = await client
          .from('inventario')
          .select('*')
          .eq('Almacen', warehouseId);
      // .gt('Existencia', 0); // Descargar todo para tener inventario completo offline

      final List<dynamic> data = response as List<dynamic>;

      // 2. Guardar en base de datos local (Transacción para asegurar consistencia)
      await db.transaction(() async {
        // Eliminar datos anteriores del almacén para reflejar eliminaciones en el servidor
        await (db.delete(db.localInventory)
              ..where((t) => t.warehouseId.equals(warehouseId)))
            .go();

        await db.batch((batch) {
          for (final item in data) {
            batch.insert(
              db.localInventory,
              LocalInventoryCompanion(
                productId: Value(item['ProductId']?.toString() ?? ''),
                warehouseId: Value(item['Almacen']?.toString() ?? ''),
                code: Value(item['Codigo']?.toString()),
                description: Value(item['Descripcion']?.toString() ?? ''),
                category: Value(item['Categoria']?.toString()),
                brand: Value(item['Marca']?.toString()),
                stock: Value(item['Existencia'] is int
                    ? item['Existencia']
                    : (item['Existencia'] as num?)?.toInt() ?? 0),
                available: Value(item['Disponible'] is int
                    ? item['Disponible']
                    : (item['Disponible'] as num?)?.toInt() ?? 0),
                notes: Value(item['Notas']?.toString()),
                isSynced: const Value(true),
                lastUpdated: Value(DateTime.now()),
              ),
              mode: InsertMode.insertOrReplace,
            );
          }
        });
      });
    } catch (e) {
      throw Exception('Error al descargar inventario: $e');
    }
  }

  /// Sube los cambios locales pendientes a Supabase.
  Future<void> syncUp(String warehouseId) async {
    try {
      // 1. Obtener items con cambios pendientes
      final pendingItems = await (db.select(db.localInventory)
            ..where((t) =>
                t.warehouseId.equals(warehouseId) & t.isSynced.equals(false)))
          .get();

      if (pendingItems.isEmpty) return;

      // 2. Subir cada cambio a Supabase
      for (final item in pendingItems) {
        await client
            .from('inventario')
            .update({
              'Existencia': item.stock,
              'Disponible':
                  item.available, // Asumimos que disponible se actualiza igual
              'Notas': item.notes,
            })
            .eq('ProductId', item.productId)
            .eq('Almacen', item.warehouseId);

        // 3. Marcar como sincronizado
        await (db.update(db.localInventory)
              ..where((t) =>
                  t.productId.equals(item.productId) &
                  t.warehouseId.equals(item.warehouseId)))
            .write(const LocalInventoryCompanion(isSynced: Value(true)));
      }
    } catch (e) {
      throw Exception('Error al sincronizar inventario: $e');
    }
  }

  /// Obtiene el conteo de items pendientes de sincronización
  Future<int> getPendingCount(String warehouseId) async {
    final result = await (db.select(db.localInventory)
          ..where((t) =>
              t.warehouseId.equals(warehouseId) & t.isSynced.equals(false)))
        .get();
    return result.length;
  }

  /// Limpia los datos locales de un almacén (opcional, para liberar espacio o resetear)
  Future<void> clearLocalWarehouse(String warehouseId) async {
    await (db.delete(db.localInventory)
          ..where((t) => t.warehouseId.equals(warehouseId)))
        .go();
  }
}
