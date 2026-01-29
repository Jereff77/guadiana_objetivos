import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

class LocalInventory extends Table {
  TextColumn get productId => text()();
  TextColumn get warehouseId => text()();
  TextColumn get code => text().nullable()(); // Added code column
  TextColumn get description => text()();
  TextColumn get category => text().nullable()();
  TextColumn get brand => text().nullable()();
  IntColumn get stock => integer().withDefault(const Constant(0))();
  IntColumn get available => integer().withDefault(const Constant(0))();
  TextColumn get notes => text().nullable()();

  // Sync fields
  BoolColumn get isSynced => boolean().withDefault(const Constant(true))();
  DateTimeColumn get lastUpdated => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {productId, warehouseId};
}

@DriftDatabase(tables: [LocalInventory])
class LocalDatabase extends _$LocalDatabase {
  LocalDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) async {
          await m.createAll();
        },
        onUpgrade: (Migrator m, int from, int to) async {
          // Since we are changing schema significantly, we might want to drop and recreate
          // or handle migration. For now, since it's dev, we can just create new tables.
          if (from < 3) {
            // If we had previous tables, we could drop them here if needed,
            // but Drift usually handles new table creation.
            // Given the complete change, it's safer to delete old tables manually if we could,
            // but for now let's just create the new one.
            await m.createTable(localInventory);
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
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'guadiana_inventory_v3.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
