import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

class Products extends Table {
  TextColumn get id => text()();
  TextColumn get sku => text()();
  TextColumn get name => text()();
  TextColumn get description => text().nullable()();
  TextColumn get categoryId => text().nullable()();
  TextColumn get brand => text().nullable()();
  RealColumn get standardCost => real().nullable()();
  RealColumn get averageCost => real().nullable()();
  IntColumn get stockMax => integer().nullable()();
  IntColumn get stockMin => integer().nullable()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  TextColumn get warehouseId => text()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  // Sync fields
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();
  IntColumn get lastModified => integer().withDefault(const Constant(0))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}

class Inventory extends Table {
  TextColumn get id => text()();
  TextColumn get productId => text()();
  TextColumn get warehouseId => text()();
  IntColumn get quantity => integer().withDefault(const Constant(0))();
  IntColumn get toFulfill => integer().nullable()();
  IntColumn get orderToFulfill => integer().nullable()();
  IntColumn get available => integer().withDefault(const Constant(0))();
  IntColumn get entry => integer().withDefault(const Constant(0))();
  IntColumn get exit => integer().withDefault(const Constant(0))();
  RealColumn get stockValue => real().nullable()();
  DateTimeColumn get lastPurchaseDate => dateTime().nullable()();
  DateTimeColumn get lastSaleDate => dateTime().nullable()();
  IntColumn get daysWithoutPurchase =>
      integer().withDefault(const Constant(0))();
  IntColumn get daysWithoutSale => integer().withDefault(const Constant(0))();
  TextColumn get serverOrigin => text().nullable()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get updatedAt => dateTime()();
  // Sync fields
  TextColumn get syncStatus => text().withDefault(const Constant('synced'))();
  IntColumn get lastModified => integer().withDefault(const Constant(0))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [Products, Inventory])
class LocalDatabase extends _$LocalDatabase {
  LocalDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            await m.addColumn(inventory, inventory.notes);
          }
        },
      );
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'guadiana_inventory.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
