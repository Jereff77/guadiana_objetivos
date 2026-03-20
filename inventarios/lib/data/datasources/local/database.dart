import 'package:drift/drift.dart';
import 'connection/connection.dart';

part 'database.g.dart';

class LocalInventory extends Table {
  TextColumn get productId => text()();
  TextColumn get warehouseId => text()();
  TextColumn get code => text().nullable()(); // Código del producto
  TextColumn get product => text().nullable()(); // Columna "Producto" del origen
  TextColumn get description => text()();
  TextColumn get category => text().nullable()();
  TextColumn get brand => text().nullable()();
  IntColumn get stock => integer().withDefault(const Constant(0))();
  IntColumn get available => integer().withDefault(const Constant(0))();
  IntColumn get physicalStock =>
      integer().nullable()(); // Nuevo campo para conteo físico
  TextColumn get notes => text().nullable()();

  // Sync fields
  BoolColumn get isSynced => boolean().withDefault(const Constant(true))();
  DateTimeColumn get lastUpdated => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {productId, warehouseId};
}

class InventoryNotes extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get warehouseId => text()();
  TextColumn get sessionId => text()();
  TextColumn get note => text()();
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();
}

@DriftDatabase(tables: [LocalInventory, InventoryNotes])
class LocalDatabase extends _$LocalDatabase {
  LocalDatabase() : super(connect());

  @override
  int get schemaVersion => 6;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) async {
          await m.createAll();
        },
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 4) {
            await m.addColumn(localInventory, localInventory.physicalStock);
          }
          if (from < 5) {
            await m.addColumn(localInventory, localInventory.product);
          }
          if (from < 6) {
            await m.createTable(inventoryNotes);
          }
        },
      );
  Future<List<String>> getUniqueWarehouses() async {
    final query = selectOnly(localInventory, distinct: true)
      ..addColumns([localInventory.warehouseId]);
    final result =
        await query.map((row) => row.read(localInventory.warehouseId)).get();
    return result.whereType<String>().toList();
  }

  Future<bool> hasInventoryFor(String warehouseId) async {
    final count = await (selectOnly(localInventory)
          ..addColumns([localInventory.productId.count()])
          ..where(localInventory.warehouseId.equals(warehouseId)))
        .map((row) => row.read(localInventory.productId.count()))
        .getSingle();
    return (count ?? 0) > 0;
  }

  Future<Map<String, dynamic>> getWarehouseStats(String warehouseId) async {
    final countExp = localInventory.productId.count();
    final maxDateExp = localInventory.lastUpdated.max();

    final row = await (selectOnly(localInventory)
          ..addColumns([countExp, maxDateExp])
          ..where(localInventory.warehouseId.equals(warehouseId)))
        .getSingle();

    return {
      'count': row.read(countExp) ?? 0,
      'lastUpdated': row.read(maxDateExp),
    };
  }
}
