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
  static const VerificationMeta _productMeta =
      const VerificationMeta('product');
  @override
  late final GeneratedColumn<String> product = GeneratedColumn<String>(
      'product', aliasedName, true,
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
  static const VerificationMeta _physicalStockMeta =
      const VerificationMeta('physicalStock');
  @override
  late final GeneratedColumn<int> physicalStock = GeneratedColumn<int>(
      'physical_stock', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
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
        product,
        description,
        category,
        brand,
        stock,
        available,
        physicalStock,
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
    if (data.containsKey('product')) {
      context.handle(_productMeta,
          product.isAcceptableOrUnknown(data['product']!, _productMeta));
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
    if (data.containsKey('physical_stock')) {
      context.handle(
          _physicalStockMeta,
          physicalStock.isAcceptableOrUnknown(
              data['physical_stock']!, _physicalStockMeta));
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
      product: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}product']),
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
      physicalStock: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}physical_stock']),
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
  final String? product;
  final String description;
  final String? category;
  final String? brand;
  final int stock;
  final int available;
  final int? physicalStock;
  final String? notes;
  final bool isSynced;
  final DateTime? lastUpdated;
  const LocalInventoryData(
      {required this.productId,
      required this.warehouseId,
      this.code,
      this.product,
      required this.description,
      this.category,
      this.brand,
      required this.stock,
      required this.available,
      this.physicalStock,
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
    if (!nullToAbsent || product != null) {
      map['product'] = Variable<String>(product);
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
    if (!nullToAbsent || physicalStock != null) {
      map['physical_stock'] = Variable<int>(physicalStock);
    }
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
      product: product == null && nullToAbsent
          ? const Value.absent()
          : Value(product),
      description: Value(description),
      category: category == null && nullToAbsent
          ? const Value.absent()
          : Value(category),
      brand:
          brand == null && nullToAbsent ? const Value.absent() : Value(brand),
      stock: Value(stock),
      available: Value(available),
      physicalStock: physicalStock == null && nullToAbsent
          ? const Value.absent()
          : Value(physicalStock),
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
      product: serializer.fromJson<String?>(json['product']),
      description: serializer.fromJson<String>(json['description']),
      category: serializer.fromJson<String?>(json['category']),
      brand: serializer.fromJson<String?>(json['brand']),
      stock: serializer.fromJson<int>(json['stock']),
      available: serializer.fromJson<int>(json['available']),
      physicalStock: serializer.fromJson<int?>(json['physicalStock']),
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
      'product': serializer.toJson<String?>(product),
      'description': serializer.toJson<String>(description),
      'category': serializer.toJson<String?>(category),
      'brand': serializer.toJson<String?>(brand),
      'stock': serializer.toJson<int>(stock),
      'available': serializer.toJson<int>(available),
      'physicalStock': serializer.toJson<int?>(physicalStock),
      'notes': serializer.toJson<String?>(notes),
      'isSynced': serializer.toJson<bool>(isSynced),
      'lastUpdated': serializer.toJson<DateTime?>(lastUpdated),
    };
  }

  LocalInventoryData copyWith(
          {String? productId,
          String? warehouseId,
          Value<String?> code = const Value.absent(),
          Value<String?> product = const Value.absent(),
          String? description,
          Value<String?> category = const Value.absent(),
          Value<String?> brand = const Value.absent(),
          int? stock,
          int? available,
          Value<int?> physicalStock = const Value.absent(),
          Value<String?> notes = const Value.absent(),
          bool? isSynced,
          Value<DateTime?> lastUpdated = const Value.absent()}) =>
      LocalInventoryData(
        productId: productId ?? this.productId,
        warehouseId: warehouseId ?? this.warehouseId,
        code: code.present ? code.value : this.code,
        product: product.present ? product.value : this.product,
        description: description ?? this.description,
        category: category.present ? category.value : this.category,
        brand: brand.present ? brand.value : this.brand,
        stock: stock ?? this.stock,
        available: available ?? this.available,
        physicalStock:
            physicalStock.present ? physicalStock.value : this.physicalStock,
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
      product: data.product.present ? data.product.value : this.product,
      description:
          data.description.present ? data.description.value : this.description,
      category: data.category.present ? data.category.value : this.category,
      brand: data.brand.present ? data.brand.value : this.brand,
      stock: data.stock.present ? data.stock.value : this.stock,
      available: data.available.present ? data.available.value : this.available,
      physicalStock: data.physicalStock.present
          ? data.physicalStock.value
          : this.physicalStock,
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
          ..write('product: $product, ')
          ..write('description: $description, ')
          ..write('category: $category, ')
          ..write('brand: $brand, ')
          ..write('stock: $stock, ')
          ..write('available: $available, ')
          ..write('physicalStock: $physicalStock, ')
          ..write('notes: $notes, ')
          ..write('isSynced: $isSynced, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      productId,
      warehouseId,
      code,
      product,
      description,
      category,
      brand,
      stock,
      available,
      physicalStock,
      notes,
      isSynced,
      lastUpdated);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalInventoryData &&
          other.productId == this.productId &&
          other.warehouseId == this.warehouseId &&
          other.code == this.code &&
          other.product == this.product &&
          other.description == this.description &&
          other.category == this.category &&
          other.brand == this.brand &&
          other.stock == this.stock &&
          other.available == this.available &&
          other.physicalStock == this.physicalStock &&
          other.notes == this.notes &&
          other.isSynced == this.isSynced &&
          other.lastUpdated == this.lastUpdated);
}

class LocalInventoryCompanion extends UpdateCompanion<LocalInventoryData> {
  final Value<String> productId;
  final Value<String> warehouseId;
  final Value<String?> code;
  final Value<String?> product;
  final Value<String> description;
  final Value<String?> category;
  final Value<String?> brand;
  final Value<int> stock;
  final Value<int> available;
  final Value<int?> physicalStock;
  final Value<String?> notes;
  final Value<bool> isSynced;
  final Value<DateTime?> lastUpdated;
  final Value<int> rowid;
  const LocalInventoryCompanion({
    this.productId = const Value.absent(),
    this.warehouseId = const Value.absent(),
    this.code = const Value.absent(),
    this.product = const Value.absent(),
    this.description = const Value.absent(),
    this.category = const Value.absent(),
    this.brand = const Value.absent(),
    this.stock = const Value.absent(),
    this.available = const Value.absent(),
    this.physicalStock = const Value.absent(),
    this.notes = const Value.absent(),
    this.isSynced = const Value.absent(),
    this.lastUpdated = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalInventoryCompanion.insert({
    required String productId,
    required String warehouseId,
    this.code = const Value.absent(),
    this.product = const Value.absent(),
    required String description,
    this.category = const Value.absent(),
    this.brand = const Value.absent(),
    this.stock = const Value.absent(),
    this.available = const Value.absent(),
    this.physicalStock = const Value.absent(),
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
    Expression<String>? product,
    Expression<String>? description,
    Expression<String>? category,
    Expression<String>? brand,
    Expression<int>? stock,
    Expression<int>? available,
    Expression<int>? physicalStock,
    Expression<String>? notes,
    Expression<bool>? isSynced,
    Expression<DateTime>? lastUpdated,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (productId != null) 'product_id': productId,
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (code != null) 'code': code,
      if (product != null) 'product': product,
      if (description != null) 'description': description,
      if (category != null) 'category': category,
      if (brand != null) 'brand': brand,
      if (stock != null) 'stock': stock,
      if (available != null) 'available': available,
      if (physicalStock != null) 'physical_stock': physicalStock,
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
      Value<String?>? product,
      Value<String>? description,
      Value<String?>? category,
      Value<String?>? brand,
      Value<int>? stock,
      Value<int>? available,
      Value<int?>? physicalStock,
      Value<String?>? notes,
      Value<bool>? isSynced,
      Value<DateTime?>? lastUpdated,
      Value<int>? rowid}) {
    return LocalInventoryCompanion(
      productId: productId ?? this.productId,
      warehouseId: warehouseId ?? this.warehouseId,
      code: code ?? this.code,
      product: product ?? this.product,
      description: description ?? this.description,
      category: category ?? this.category,
      brand: brand ?? this.brand,
      stock: stock ?? this.stock,
      available: available ?? this.available,
      physicalStock: physicalStock ?? this.physicalStock,
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
    if (product.present) {
      map['product'] = Variable<String>(product.value);
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
    if (physicalStock.present) {
      map['physical_stock'] = Variable<int>(physicalStock.value);
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
          ..write('product: $product, ')
          ..write('description: $description, ')
          ..write('category: $category, ')
          ..write('brand: $brand, ')
          ..write('stock: $stock, ')
          ..write('available: $available, ')
          ..write('physicalStock: $physicalStock, ')
          ..write('notes: $notes, ')
          ..write('isSynced: $isSynced, ')
          ..write('lastUpdated: $lastUpdated, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $InventoryNotesTable extends InventoryNotes
    with TableInfo<$InventoryNotesTable, InventoryNote> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $InventoryNotesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _warehouseIdMeta =
      const VerificationMeta('warehouseId');
  @override
  late final GeneratedColumn<String> warehouseId = GeneratedColumn<String>(
      'warehouse_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sessionIdMeta =
      const VerificationMeta('sessionId');
  @override
  late final GeneratedColumn<String> sessionId = GeneratedColumn<String>(
      'session_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
      'note', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns =>
      [id, warehouseId, sessionId, note, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'inventory_notes';
  @override
  VerificationContext validateIntegrity(Insertable<InventoryNote> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('warehouse_id')) {
      context.handle(
          _warehouseIdMeta,
          warehouseId.isAcceptableOrUnknown(
              data['warehouse_id']!, _warehouseIdMeta));
    } else if (isInserting) {
      context.missing(_warehouseIdMeta);
    }
    if (data.containsKey('session_id')) {
      context.handle(_sessionIdMeta,
          sessionId.isAcceptableOrUnknown(data['session_id']!, _sessionIdMeta));
    } else if (isInserting) {
      context.missing(_sessionIdMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
          _noteMeta, note.isAcceptableOrUnknown(data['note']!, _noteMeta));
    } else if (isInserting) {
      context.missing(_noteMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  InventoryNote map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return InventoryNote(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      warehouseId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}warehouse_id'])!,
      sessionId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}session_id'])!,
      note: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}note'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $InventoryNotesTable createAlias(String alias) {
    return $InventoryNotesTable(attachedDatabase, alias);
  }
}

class InventoryNote extends DataClass implements Insertable<InventoryNote> {
  final int id;
  final String warehouseId;
  final String sessionId;
  final String note;
  final DateTime createdAt;
  const InventoryNote(
      {required this.id,
      required this.warehouseId,
      required this.sessionId,
      required this.note,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['warehouse_id'] = Variable<String>(warehouseId);
    map['session_id'] = Variable<String>(sessionId);
    map['note'] = Variable<String>(note);
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  InventoryNotesCompanion toCompanion(bool nullToAbsent) {
    return InventoryNotesCompanion(
      id: Value(id),
      warehouseId: Value(warehouseId),
      sessionId: Value(sessionId),
      note: Value(note),
      createdAt: Value(createdAt),
    );
  }

  factory InventoryNote.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return InventoryNote(
      id: serializer.fromJson<int>(json['id']),
      warehouseId: serializer.fromJson<String>(json['warehouseId']),
      sessionId: serializer.fromJson<String>(json['sessionId']),
      note: serializer.fromJson<String>(json['note']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'warehouseId': serializer.toJson<String>(warehouseId),
      'sessionId': serializer.toJson<String>(sessionId),
      'note': serializer.toJson<String>(note),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  InventoryNote copyWith(
          {int? id,
          String? warehouseId,
          String? sessionId,
          String? note,
          DateTime? createdAt}) =>
      InventoryNote(
        id: id ?? this.id,
        warehouseId: warehouseId ?? this.warehouseId,
        sessionId: sessionId ?? this.sessionId,
        note: note ?? this.note,
        createdAt: createdAt ?? this.createdAt,
      );
  InventoryNote copyWithCompanion(InventoryNotesCompanion data) {
    return InventoryNote(
      id: data.id.present ? data.id.value : this.id,
      warehouseId:
          data.warehouseId.present ? data.warehouseId.value : this.warehouseId,
      sessionId: data.sessionId.present ? data.sessionId.value : this.sessionId,
      note: data.note.present ? data.note.value : this.note,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('InventoryNote(')
          ..write('id: $id, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('sessionId: $sessionId, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, warehouseId, sessionId, note, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is InventoryNote &&
          other.id == this.id &&
          other.warehouseId == this.warehouseId &&
          other.sessionId == this.sessionId &&
          other.note == this.note &&
          other.createdAt == this.createdAt);
}

class InventoryNotesCompanion extends UpdateCompanion<InventoryNote> {
  final Value<int> id;
  final Value<String> warehouseId;
  final Value<String> sessionId;
  final Value<String> note;
  final Value<DateTime> createdAt;
  const InventoryNotesCompanion({
    this.id = const Value.absent(),
    this.warehouseId = const Value.absent(),
    this.sessionId = const Value.absent(),
    this.note = const Value.absent(),
    this.createdAt = const Value.absent(),
  });
  InventoryNotesCompanion.insert({
    this.id = const Value.absent(),
    required String warehouseId,
    required String sessionId,
    required String note,
    this.createdAt = const Value.absent(),
  })  : warehouseId = Value(warehouseId),
        sessionId = Value(sessionId),
        note = Value(note);
  static Insertable<InventoryNote> custom({
    Expression<int>? id,
    Expression<String>? warehouseId,
    Expression<String>? sessionId,
    Expression<String>? note,
    Expression<DateTime>? createdAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (sessionId != null) 'session_id': sessionId,
      if (note != null) 'note': note,
      if (createdAt != null) 'created_at': createdAt,
    });
  }

  InventoryNotesCompanion copyWith(
      {Value<int>? id,
      Value<String>? warehouseId,
      Value<String>? sessionId,
      Value<String>? note,
      Value<DateTime>? createdAt}) {
    return InventoryNotesCompanion(
      id: id ?? this.id,
      warehouseId: warehouseId ?? this.warehouseId,
      sessionId: sessionId ?? this.sessionId,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (warehouseId.present) {
      map['warehouse_id'] = Variable<String>(warehouseId.value);
    }
    if (sessionId.present) {
      map['session_id'] = Variable<String>(sessionId.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('InventoryNotesCompanion(')
          ..write('id: $id, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('sessionId: $sessionId, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }
}

abstract class _$LocalDatabase extends GeneratedDatabase {
  _$LocalDatabase(QueryExecutor e) : super(e);
  $LocalDatabaseManager get managers => $LocalDatabaseManager(this);
  late final $LocalInventoryTable localInventory = $LocalInventoryTable(this);
  late final $InventoryNotesTable inventoryNotes = $InventoryNotesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [localInventory, inventoryNotes];
}

typedef $$LocalInventoryTableCreateCompanionBuilder = LocalInventoryCompanion
    Function({
  required String productId,
  required String warehouseId,
  Value<String?> code,
  Value<String?> product,
  required String description,
  Value<String?> category,
  Value<String?> brand,
  Value<int> stock,
  Value<int> available,
  Value<int?> physicalStock,
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
  Value<String?> product,
  Value<String> description,
  Value<String?> category,
  Value<String?> brand,
  Value<int> stock,
  Value<int> available,
  Value<int?> physicalStock,
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
            Value<String?> product = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String?> category = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<int> stock = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<int?> physicalStock = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime?> lastUpdated = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalInventoryCompanion(
            productId: productId,
            warehouseId: warehouseId,
            code: code,
            product: product,
            description: description,
            category: category,
            brand: brand,
            stock: stock,
            available: available,
            physicalStock: physicalStock,
            notes: notes,
            isSynced: isSynced,
            lastUpdated: lastUpdated,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String productId,
            required String warehouseId,
            Value<String?> code = const Value.absent(),
            Value<String?> product = const Value.absent(),
            required String description,
            Value<String?> category = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<int> stock = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<int?> physicalStock = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<bool> isSynced = const Value.absent(),
            Value<DateTime?> lastUpdated = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LocalInventoryCompanion.insert(
            productId: productId,
            warehouseId: warehouseId,
            code: code,
            product: product,
            description: description,
            category: category,
            brand: brand,
            stock: stock,
            available: available,
            physicalStock: physicalStock,
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

  ColumnFilters<String> get product => $state.composableBuilder(
      column: $state.table.product,
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

  ColumnFilters<int> get physicalStock => $state.composableBuilder(
      column: $state.table.physicalStock,
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

  ColumnOrderings<String> get product => $state.composableBuilder(
      column: $state.table.product,
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

  ColumnOrderings<int> get physicalStock => $state.composableBuilder(
      column: $state.table.physicalStock,
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

typedef $$InventoryNotesTableCreateCompanionBuilder = InventoryNotesCompanion
    Function({
  Value<int> id,
  required String warehouseId,
  required String sessionId,
  required String note,
  Value<DateTime> createdAt,
});
typedef $$InventoryNotesTableUpdateCompanionBuilder = InventoryNotesCompanion
    Function({
  Value<int> id,
  Value<String> warehouseId,
  Value<String> sessionId,
  Value<String> note,
  Value<DateTime> createdAt,
});

class $$InventoryNotesTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $InventoryNotesTable,
    InventoryNote,
    $$InventoryNotesTableFilterComposer,
    $$InventoryNotesTableOrderingComposer,
    $$InventoryNotesTableCreateCompanionBuilder,
    $$InventoryNotesTableUpdateCompanionBuilder> {
  $$InventoryNotesTableTableManager(
      _$LocalDatabase db, $InventoryNotesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$InventoryNotesTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$InventoryNotesTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> warehouseId = const Value.absent(),
            Value<String> sessionId = const Value.absent(),
            Value<String> note = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
          }) =>
              InventoryNotesCompanion(
            id: id,
            warehouseId: warehouseId,
            sessionId: sessionId,
            note: note,
            createdAt: createdAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String warehouseId,
            required String sessionId,
            required String note,
            Value<DateTime> createdAt = const Value.absent(),
          }) =>
              InventoryNotesCompanion.insert(
            id: id,
            warehouseId: warehouseId,
            sessionId: sessionId,
            note: note,
            createdAt: createdAt,
          ),
        ));
}

class $$InventoryNotesTableFilterComposer
    extends FilterComposer<_$LocalDatabase, $InventoryNotesTable> {
  $$InventoryNotesTableFilterComposer(super.$state);
  ColumnFilters<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get sessionId => $state.composableBuilder(
      column: $state.table.sessionId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get note => $state.composableBuilder(
      column: $state.table.note,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$InventoryNotesTableOrderingComposer
    extends OrderingComposer<_$LocalDatabase, $InventoryNotesTable> {
  $$InventoryNotesTableOrderingComposer(super.$state);
  ColumnOrderings<int> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get sessionId => $state.composableBuilder(
      column: $state.table.sessionId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get note => $state.composableBuilder(
      column: $state.table.note,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class $LocalDatabaseManager {
  final _$LocalDatabase _db;
  $LocalDatabaseManager(this._db);
  $$LocalInventoryTableTableManager get localInventory =>
      $$LocalInventoryTableTableManager(_db, _db.localInventory);
  $$InventoryNotesTableTableManager get inventoryNotes =>
      $$InventoryNotesTableTableManager(_db, _db.inventoryNotes);
}
