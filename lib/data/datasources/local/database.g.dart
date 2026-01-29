// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $LocalInventoryTable extends LocalInventory
    with TableInfo<$LocalInventoryTable, LocalInventoryData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalInventoryTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _productIdMeta =
      const VerificationMeta('productId');
  @override
  late final GeneratedColumn<String> productId = GeneratedColumn<String>(
      'product_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _warehouseIdMeta =
      const VerificationMeta('warehouseId');
  @override
  late final GeneratedColumn<String> warehouseId = GeneratedColumn<String>(
      'warehouse_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _codeMeta = const VerificationMeta('code');
  @override
  late final GeneratedColumn<String> code = GeneratedColumn<String>(
      'code', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _brandMeta = const VerificationMeta('brand');
  @override
  late final GeneratedColumn<String> brand = GeneratedColumn<String>(
      'brand', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _stockMeta = const VerificationMeta('stock');
  @override
  late final GeneratedColumn<int> stock = GeneratedColumn<int>(
      'stock', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _availableMeta =
      const VerificationMeta('available');
  @override
  late final GeneratedColumn<int> available = GeneratedColumn<int>(
      'available', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _isSyncedMeta =
      const VerificationMeta('isSynced');
  @override
  late final GeneratedColumn<bool> isSynced = GeneratedColumn<bool>(
      'is_synced', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_synced" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _lastUpdatedMeta =
      const VerificationMeta('lastUpdated');
  @override
  late final GeneratedColumn<DateTime> lastUpdated = GeneratedColumn<DateTime>(
      'last_updated', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        productId,
        warehouseId,
        code,
        description,
        category,
        brand,
        stock,
        available,
        notes,
        isSynced,
        lastUpdated
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_inventory';
  @override
  VerificationContext validateIntegrity(Insertable<LocalInventoryData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('product_id')) {
      context.handle(_productIdMeta,
          productId.isAcceptableOrUnknown(data['product_id']!, _productIdMeta));
    } else if (isInserting) {
      context.missing(_productIdMeta);
    }
    if (data.containsKey('warehouse_id')) {
      context.handle(
          _warehouseIdMeta,
          warehouseId.isAcceptableOrUnknown(
              data['warehouse_id']!, _warehouseIdMeta));
    } else if (isInserting) {
      context.missing(_warehouseIdMeta);
    }
    if (data.containsKey('code')) {
      context.handle(
          _codeMeta, code.isAcceptableOrUnknown(data['code']!, _codeMeta));
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    }
    if (data.containsKey('brand')) {
      context.handle(
          _brandMeta, brand.isAcceptableOrUnknown(data['brand']!, _brandMeta));
    }
    if (data.containsKey('stock')) {
      context.handle(
          _stockMeta, stock.isAcceptableOrUnknown(data['stock']!, _stockMeta));
    }
    if (data.containsKey('available')) {
      context.handle(_availableMeta,
          available.isAcceptableOrUnknown(data['available']!, _availableMeta));
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    if (data.containsKey('is_synced')) {
      context.handle(_isSyncedMeta,
          isSynced.isAcceptableOrUnknown(data['is_synced']!, _isSyncedMeta));
    }
    if (data.containsKey('last_updated')) {
      context.handle(
          _lastUpdatedMeta,
          lastUpdated.isAcceptableOrUnknown(
              data['last_updated']!, _lastUpdatedMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {productId, warehouseId};
  @override
  LocalInventoryData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalInventoryData(
      productId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}product_id'])!,
      warehouseId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}warehouse_id'])!,
      code: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}code']),
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category']),
      brand: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}brand']),
      stock: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}stock'])!,
      available: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}available'])!,
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      isSynced: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_synced'])!,
      lastUpdated: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_updated']),
    );
  }

  @override
  $LocalInventoryTable createAlias(String alias) {
    return $LocalInventoryTable(attachedDatabase, alias);
  }
}

class LocalInventoryData extends DataClass
    implements Insertable<LocalInventoryData> {
  final String productId;
  final String warehouseId;
  final String? code;
  final String description;
  final String? category;
  final String? brand;
  final int stock;
  final int available;
  final String? notes;
  final bool isSynced;
  final DateTime? lastUpdated;
  const LocalInventoryData(
      {required this.productId,
      required this.warehouseId,
      this.code,
      required this.description,
      this.category,
      this.brand,
      required this.stock,
      required this.available,
      this.notes,
      required this.isSynced,
      this.lastUpdated});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['product_id'] = Variable<String>(productId);
    map['warehouse_id'] = Variable<String>(warehouseId);
    if (!nullToAbsent || code != null) {
      map['code'] = Variable<String>(code);
    }
    map['description'] = Variable<String>(description);
    if (!nullToAbsent || category != null) {
      map['category'] = Variable<String>(category);
    }
    if (!nullToAbsent || brand != null) {
      map['brand'] = Variable<String>(brand);
    }
    map['stock'] = Variable<int>(stock);
    map['available'] = Variable<int>(available);
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    map['is_synced'] = Variable<bool>(isSynced);
    if (!nullToAbsent || lastUpdated != null) {
      map['last_updated'] = Variable<DateTime>(lastUpdated);
    }
    return map;
  }

  LocalInventoryCompanion toCompanion(bool nullToAbsent) {
    return LocalInventoryCompanion(
      productId: Value(productId),
      warehouseId: Value(warehouseId),
      code: code == null && nullToAbsent ? const Value.absent() : Value(code),
      description: Value(description),
      category: category == null && nullToAbsent
          ? const Value.absent()
          : Value(category),
      brand:
          brand == null && nullToAbsent ? const Value.absent() : Value(brand),
      stock: Value(stock),
      available: Value(available),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      isSynced: Value(isSynced),
      lastUpdated: lastUpdated == null && nullToAbsent
          ? const Value.absent()
          : Value(lastUpdated),
    );
  }

  factory LocalInventoryData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalInventoryData(
      productId: serializer.fromJson<String>(json['productId']),
      warehouseId: serializer.fromJson<String>(json['warehouseId']),
      code: serializer.fromJson<String?>(json['code']),
      description: serializer.fromJson<String>(json['description']),
      category: serializer.fromJson<String?>(json['category']),
      brand: serializer.fromJson<String?>(json['brand']),
      stock: serializer.fromJson<int>(json['stock']),
      available: serializer.fromJson<int>(json['available']),
      notes: serializer.fromJson<String?>(json['notes']),
      isSynced: serializer.fromJson<bool>(json['isSynced']),
      lastUpdated: serializer.fromJson<DateTime?>(json['lastUpdated']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'productId': serializer.toJson<String>(productId),
      'warehouseId': serializer.toJson<String>(warehouseId),
      'code': serializer.toJson<String?>(code),
      'description': serializer.toJson<String>(description),
      'category': serializer.toJson<String?>(category),
      'brand': serializer.toJson<String?>(brand),
      'stock': serializer.toJson<int>(stock),
      'available': serializer.toJson<int>(available),
      'notes': serializer.toJson<String?>(notes),
      'isSynced': serializer.toJson<bool>(isSynced),
      'lastUpdated': serializer.toJson<DateTime?>(lastUpdated),
    };
  }

  LocalInventoryData copyWith(
          {String? productId,
          String? warehouseId,
          Value<String?> code = const Value.absent(),
          String? description,
          Value<String?> category = const Value.absent(),
          Value<String?> brand = const Value.absent(),
          int? stock,
          int? available,
          Value<String?> notes = const Value.absent(),
          bool? isSynced,
          Value<DateTime?> lastUpdated = const Value.absent()}) =>
      LocalInventoryData(
        productId: productId ?? this.productId,
        warehouseId: warehouseId ?? this.warehouseId,
        code: code.present ? code.value : this.code,
        description: description ?? this.description,
        category: category.present ? category.value : this.category,
        brand: brand.present ? brand.value : this.brand,
        stock: stock ?? this.stock,
        available: available ?? this.available,
        notes: notes.present ? notes.value : this.notes,
        isSynced: isSynced ?? this.isSynced,
        lastUpdated: lastUpdated.present ? lastUpdated.value : this.lastUpdated,
      );
  LocalInventoryData copyWithCompanion(LocalInventoryCompanion data) {
    return LocalInventoryData(
      productId: data.productId.present ? data.productId.value : this.productId,
      warehouseId:
          data.warehouseId.present ? data.warehouseId.value : this.warehouseId,
      code: data.code.present ? data.code.value : this.code,
      description:
          data.description.present ? data.description.value : this.description,
      category: data.category.present ? data.category.value : this.category,
      brand: data.brand.present ? data.brand.value : this.brand,
      stock: data.stock.present ? data.stock.value : this.stock,
      available: data.available.present ? data.available.value : this.available,
      notes: data.notes.present ? data.notes.value : this.notes,
      isSynced: data.isSynced.present ? data.isSynced.value : this.isSynced,
      lastUpdated:
          data.lastUpdated.present ? data.lastUpdated.value : this.lastUpdated,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalInventoryData(')
          ..write('productId: $productId, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('code: $code, ')
          ..write('description: $description, ')
          ..write('category: $category, ')
          ..write('brand: $brand, ')
          ..write('stock: $stock, ')
          ..write('available: $available, ')
          ..write('notes: $notes, ')
          ..write('isSynced: $isSynced, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(productId, warehouseId, code, description,
      category, brand, stock, available, notes, isSynced, lastUpdated);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalInventoryData &&
          other.productId == this.productId &&
          other.warehouseId == this.warehouseId &&
          other.code == this.code &&
          other.description == this.description &&
          other.category == this.category &&
          other.brand == this.brand &&
          other.stock == this.stock &&
          other.available == this.available &&
          other.notes == this.notes &&
          other.isSynced == this.isSynced &&
          other.lastUpdated == this.lastUpdated);
}

class LocalInventoryCompanion extends UpdateCompanion<LocalInventoryData> {
  final Value<String> productId;
  final Value<String> warehouseId;
  final Value<String?> code;
  final Value<String> description;
  final Value<String?> category;
  final Value<String?> brand;
  final Value<int> stock;
  final Value<int> available;
  final Value<String?> notes;
  final Value<bool> isSynced;
  final Value<DateTime?> lastUpdated;
  final Value<int> rowid;
  const LocalInventoryCompanion({
    this.productId = const Value.absent(),
    this.warehouseId = const Value.absent(),
    this.code = const Value.absent(),
    this.description = const Value.absent(),
    this.category = const Value.absent(),
    this.brand = const Value.absent(),
    this.stock = const Value.absent(),
    this.available = const Value.absent(),
    this.notes = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.lastUpdated = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalInventoryCompanion.insert({
    required String productId,
    required String warehouseId,
    this.code = const Value.absent(),
    required String description,
    this.category = const Value.absent(),
    this.brand = const Value.absent(),
    this.stock = const Value.absent(),
    this.available = const Value.absent(),
    this.notes = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.lastUpdated = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : productId = Value(productId),
        warehouseId = Value(warehouseId),
        description = Value(description);
  static Insertable<LocalInventoryData> custom({
    Expression<String>? productId,
    Expression<String>? warehouseId,
    Expression<String>? code,
    Expression<String>? description,
    Expression<String>? category,
    Expression<String>? brand,
    Expression<int>? stock,
    Expression<int>? available,
    Expression<String>? notes,
    Expression<bool>? isSynced,
    Expression<DateTime>? lastUpdated,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (productId != null) 'product_id': productId,
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (code != null) 'code': code,
      if (description != null) 'description': description,
      if (category != null) 'category': category,
      if (brand != null) 'brand': brand,
      if (stock != null) 'stock': stock,
      if (available != null) 'available': available,
      if (notes != null) 'notes': notes,
      if (isSynced != null) 'is_synced': isSynced,
      if (lastUpdated != null) 'last_updated': lastUpdated,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalInventoryCompanion copyWith(
      {Value<String>? productId,
      Value<String>? warehouseId,
      Value<String?>? code,
      Value<String>? description,
      Value<String?>? category,
      Value<String?>? brand,
      Value<int>? stock,
      Value<int>? available,
      Value<String?>? notes,
      Value<bool>? isSynced,
      Value<DateTime?>? lastUpdated,
      Value<int>? rowid}) {
    return LocalInventoryCompanion(
      productId: productId ?? this.productId,
      warehouseId: warehouseId ?? this.warehouseId,
      code: code ?? this.code,
      description: description ?? this.description,
      category: category ?? this.category,
      brand: brand ?? this.brand,
      stock: stock ?? this.stock,
      available: available ?? this.available,
      notes: notes ?? this.notes,
      isSynced: isSynced ?? this.isSynced,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (productId.present) {
      map['product_id'] = Variable<String>(productId.value);
    }
    if (warehouseId.present) {
      map['warehouse_id'] = Variable<String>(warehouseId.value);
    }
    if (code.present) {
      map['code'] = Variable<String>(code.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (brand.present) {
      map['brand'] = Variable<String>(brand.value);
    }
    if (stock.present) {
      map['stock'] = Variable<int>(stock.value);
    }
    if (available.present) {
      map['available'] = Variable<int>(available.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (isSynced.present) {
      map['is_synced'] = Variable<bool>(isSynced.value);
    }
    if (lastUpdated.present) {
      map['last_updated'] = Variable<DateTime>(lastUpdated.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalInventoryCompanion(')
          ..write('productId: $productId, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('code: $code, ')
          ..write('description: $description, ')
          ..write('category: $category, ')
          ..write('brand: $brand, ')
          ..write('stock: $stock, ')
          ..write('available: $available, ')
          ..write('notes: $notes, ')
          ..write('isSynced: $isSynced, ')
          ..write('lastUpdated: $lastUpdated, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$LocalDatabase extends GeneratedDatabase {
  _$LocalDatabase(QueryExecutor e) : super(e);
  $LocalDatabaseManager get managers => $LocalDatabaseManager(this);
  late final $LocalInventoryTable localInventory = $LocalInventoryTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [localInventory];
}

typedef $$LocalInventoryTableCreateCompanionBuilder = LocalInventoryCompanion
    Function({
  required String productId,
  required String warehouseId,
  Value<String?> code,
  required String description,
  Value<String?> category,
  Value<String?> brand,
  Value<int> stock,
  Value<int> available,
  Value<String?> notes,
  Value<bool> isSynced,
  Value<DateTime?> lastUpdated,
  Value<int> rowid,
});
typedef $$LocalInventoryTableUpdateCompanionBuilder = LocalInventoryCompanion
    Function({
  Value<String> productId,
  Value<String> warehouseId,
  Value<String?> code,
  Value<String> description,
  Value<String?> category,
  Value<String?> brand,
  Value<int> stock,
  Value<int> available,
  Value<String?> notes,
  Value<bool> isSynced,
  Value<DateTime?> lastUpdated,
  Value<int> rowid,
});

class $$LocalInventoryTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $LocalInventoryTable,
    LocalInventoryData,
    $$LocalInventoryTableFilterComposer,
    $$LocalInventoryTableOrderingComposer,
    $$LocalInventoryTableCreateCompanionBuilder,
    $$LocalInventoryTableUpdateCompanionBuilder> {
  $$LocalInventoryTableTableManager(
      _$LocalDatabase db, $LocalInventoryTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$LocalInventoryTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$LocalInventoryTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> productId = const Value.absent(),
            Value<String> warehouseId = const Value.absent(),
            Value<String?> code = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String?> category = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<int> stock = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime?> lastUpdated = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalInventoryCompanion(
            productId: productId,
            warehouseId: warehouseId,
            code: code,
            description: description,
            category: category,
            brand: brand,
            stock: stock,
            available: available,
            notes: notes,
            isSynced: isSynced,
            lastUpdated: lastUpdated,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String productId,
            required String warehouseId,
            Value<String?> code = const Value.absent(),
            required String description,
            Value<String?> category = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<int> stock = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime?> lastUpdated = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalInventoryCompanion.insert(
            productId: productId,
            warehouseId: warehouseId,
            code: code,
            description: description,
            category: category,
            brand: brand,
            stock: stock,
            available: available,
            notes: notes,
            isSynced: isSynced,
            lastUpdated: lastUpdated,
            rowid: rowid,
          ),
        ));
}

class $$LocalInventoryTableFilterComposer
    extends FilterComposer<_$LocalDatabase, $LocalInventoryTable> {
  $$LocalInventoryTableFilterComposer(super.$state);
  ColumnFilters<String> get productId => $state.composableBuilder(
      column: $state.table.productId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get code => $state.composableBuilder(
      column: $state.table.code,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get category => $state.composableBuilder(
      column: $state.table.category,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get brand => $state.composableBuilder(
      column: $state.table.brand,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get stock => $state.composableBuilder(
      column: $state.table.stock,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get available => $state.composableBuilder(
      column: $state.table.available,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get notes => $state.composableBuilder(
      column: $state.table.notes,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastUpdated => $state.composableBuilder(
      column: $state.table.lastUpdated,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$LocalInventoryTableOrderingComposer
    extends OrderingComposer<_$LocalDatabase, $LocalInventoryTable> {
  $$LocalInventoryTableOrderingComposer(super.$state);
  ColumnOrderings<String> get productId => $state.composableBuilder(
      column: $state.table.productId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get code => $state.composableBuilder(
      column: $state.table.code,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get category => $state.composableBuilder(
      column: $state.table.category,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get brand => $state.composableBuilder(
      column: $state.table.brand,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get stock => $state.composableBuilder(
      column: $state.table.stock,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get available => $state.composableBuilder(
      column: $state.table.available,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get notes => $state.composableBuilder(
      column: $state.table.notes,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isSynced => $state.composableBuilder(
      column: $state.table.isSynced,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastUpdated => $state.composableBuilder(
      column: $state.table.lastUpdated,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class $LocalDatabaseManager {
  final _$LocalDatabase _db;
  $LocalDatabaseManager(this._db);
  $$LocalInventoryTableTableManager get localInventory =>
      $$LocalInventoryTableTableManager(_db, _db.localInventory);
}
