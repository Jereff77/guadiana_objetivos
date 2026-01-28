// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $ProductsTable extends Products with TableInfo<$ProductsTable, Product> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProductsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _skuMeta = const VerificationMeta('sku');
  @override
  late final GeneratedColumn<String> sku = GeneratedColumn<String>(
      'sku', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _categoryIdMeta =
      const VerificationMeta('categoryId');
  @override
  late final GeneratedColumn<String> categoryId = GeneratedColumn<String>(
      'category_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _brandMeta = const VerificationMeta('brand');
  @override
  late final GeneratedColumn<String> brand = GeneratedColumn<String>(
      'brand', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _standardCostMeta =
      const VerificationMeta('standardCost');
  @override
  late final GeneratedColumn<double> standardCost = GeneratedColumn<double>(
      'standard_cost', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _averageCostMeta =
      const VerificationMeta('averageCost');
  @override
  late final GeneratedColumn<double> averageCost = GeneratedColumn<double>(
      'average_cost', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _stockMaxMeta =
      const VerificationMeta('stockMax');
  @override
  late final GeneratedColumn<int> stockMax = GeneratedColumn<int>(
      'stock_max', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _stockMinMeta =
      const VerificationMeta('stockMin');
  @override
  late final GeneratedColumn<int> stockMin = GeneratedColumn<int>(
      'stock_min', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _isActiveMeta =
      const VerificationMeta('isActive');
  @override
  late final GeneratedColumn<bool> isActive = GeneratedColumn<bool>(
      'is_active', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_active" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _warehouseIdMeta =
      const VerificationMeta('warehouseId');
  @override
  late final GeneratedColumn<String> warehouseId = GeneratedColumn<String>(
      'warehouse_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
      'sync_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('synced'));
  static const VerificationMeta _lastModifiedMeta =
      const VerificationMeta('lastModified');
  @override
  late final GeneratedColumn<int> lastModified = GeneratedColumn<int>(
      'last_modified', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        sku,
        name,
        description,
        categoryId,
        brand,
        standardCost,
        averageCost,
        stockMax,
        stockMin,
        isActive,
        warehouseId,
        createdAt,
        updatedAt,
        syncStatus,
        lastModified,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'products';
  @override
  VerificationContext validateIntegrity(Insertable<Product> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('sku')) {
      context.handle(
          _skuMeta, sku.isAcceptableOrUnknown(data['sku']!, _skuMeta));
    } else if (isInserting) {
      context.missing(_skuMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('category_id')) {
      context.handle(
          _categoryIdMeta,
          categoryId.isAcceptableOrUnknown(
              data['category_id']!, _categoryIdMeta));
    }
    if (data.containsKey('brand')) {
      context.handle(
          _brandMeta, brand.isAcceptableOrUnknown(data['brand']!, _brandMeta));
    }
    if (data.containsKey('standard_cost')) {
      context.handle(
          _standardCostMeta,
          standardCost.isAcceptableOrUnknown(
              data['standard_cost']!, _standardCostMeta));
    }
    if (data.containsKey('average_cost')) {
      context.handle(
          _averageCostMeta,
          averageCost.isAcceptableOrUnknown(
              data['average_cost']!, _averageCostMeta));
    }
    if (data.containsKey('stock_max')) {
      context.handle(_stockMaxMeta,
          stockMax.isAcceptableOrUnknown(data['stock_max']!, _stockMaxMeta));
    }
    if (data.containsKey('stock_min')) {
      context.handle(_stockMinMeta,
          stockMin.isAcceptableOrUnknown(data['stock_min']!, _stockMinMeta));
    }
    if (data.containsKey('is_active')) {
      context.handle(_isActiveMeta,
          isActive.isAcceptableOrUnknown(data['is_active']!, _isActiveMeta));
    }
    if (data.containsKey('warehouse_id')) {
      context.handle(
          _warehouseIdMeta,
          warehouseId.isAcceptableOrUnknown(
              data['warehouse_id']!, _warehouseIdMeta));
    } else if (isInserting) {
      context.missing(_warehouseIdMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('sync_status')) {
      context.handle(
          _syncStatusMeta,
          syncStatus.isAcceptableOrUnknown(
              data['sync_status']!, _syncStatusMeta));
    }
    if (data.containsKey('last_modified')) {
      context.handle(
          _lastModifiedMeta,
          lastModified.isAcceptableOrUnknown(
              data['last_modified']!, _lastModifiedMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Product map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Product(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      sku: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sku'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      categoryId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category_id']),
      brand: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}brand']),
      standardCost: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}standard_cost']),
      averageCost: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}average_cost']),
      stockMax: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}stock_max']),
      stockMin: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}stock_min']),
      isActive: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_active'])!,
      warehouseId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}warehouse_id'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      syncStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sync_status'])!,
      lastModified: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}last_modified'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $ProductsTable createAlias(String alias) {
    return $ProductsTable(attachedDatabase, alias);
  }
}

class Product extends DataClass implements Insertable<Product> {
  final String id;
  final String sku;
  final String name;
  final String? description;
  final String? categoryId;
  final String? brand;
  final double? standardCost;
  final double? averageCost;
  final int? stockMax;
  final int? stockMin;
  final bool isActive;
  final String warehouseId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String syncStatus;
  final int lastModified;
  final int syncVersion;
  const Product(
      {required this.id,
      required this.sku,
      required this.name,
      this.description,
      this.categoryId,
      this.brand,
      this.standardCost,
      this.averageCost,
      this.stockMax,
      this.stockMin,
      required this.isActive,
      required this.warehouseId,
      required this.createdAt,
      required this.updatedAt,
      required this.syncStatus,
      required this.lastModified,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['sku'] = Variable<String>(sku);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    if (!nullToAbsent || categoryId != null) {
      map['category_id'] = Variable<String>(categoryId);
    }
    if (!nullToAbsent || brand != null) {
      map['brand'] = Variable<String>(brand);
    }
    if (!nullToAbsent || standardCost != null) {
      map['standard_cost'] = Variable<double>(standardCost);
    }
    if (!nullToAbsent || averageCost != null) {
      map['average_cost'] = Variable<double>(averageCost);
    }
    if (!nullToAbsent || stockMax != null) {
      map['stock_max'] = Variable<int>(stockMax);
    }
    if (!nullToAbsent || stockMin != null) {
      map['stock_min'] = Variable<int>(stockMin);
    }
    map['is_active'] = Variable<bool>(isActive);
    map['warehouse_id'] = Variable<String>(warehouseId);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['sync_status'] = Variable<String>(syncStatus);
    map['last_modified'] = Variable<int>(lastModified);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  ProductsCompanion toCompanion(bool nullToAbsent) {
    return ProductsCompanion(
      id: Value(id),
      sku: Value(sku),
      name: Value(name),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      categoryId: categoryId == null && nullToAbsent
          ? const Value.absent()
          : Value(categoryId),
      brand:
          brand == null && nullToAbsent ? const Value.absent() : Value(brand),
      standardCost: standardCost == null && nullToAbsent
          ? const Value.absent()
          : Value(standardCost),
      averageCost: averageCost == null && nullToAbsent
          ? const Value.absent()
          : Value(averageCost),
      stockMax: stockMax == null && nullToAbsent
          ? const Value.absent()
          : Value(stockMax),
      stockMin: stockMin == null && nullToAbsent
          ? const Value.absent()
          : Value(stockMin),
      isActive: Value(isActive),
      warehouseId: Value(warehouseId),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      syncStatus: Value(syncStatus),
      lastModified: Value(lastModified),
      syncVersion: Value(syncVersion),
    );
  }

  factory Product.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Product(
      id: serializer.fromJson<String>(json['id']),
      sku: serializer.fromJson<String>(json['sku']),
      name: serializer.fromJson<String>(json['name']),
      description: serializer.fromJson<String?>(json['description']),
      categoryId: serializer.fromJson<String?>(json['categoryId']),
      brand: serializer.fromJson<String?>(json['brand']),
      standardCost: serializer.fromJson<double?>(json['standardCost']),
      averageCost: serializer.fromJson<double?>(json['averageCost']),
      stockMax: serializer.fromJson<int?>(json['stockMax']),
      stockMin: serializer.fromJson<int?>(json['stockMin']),
      isActive: serializer.fromJson<bool>(json['isActive']),
      warehouseId: serializer.fromJson<String>(json['warehouseId']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      lastModified: serializer.fromJson<int>(json['lastModified']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'sku': serializer.toJson<String>(sku),
      'name': serializer.toJson<String>(name),
      'description': serializer.toJson<String?>(description),
      'categoryId': serializer.toJson<String?>(categoryId),
      'brand': serializer.toJson<String?>(brand),
      'standardCost': serializer.toJson<double?>(standardCost),
      'averageCost': serializer.toJson<double?>(averageCost),
      'stockMax': serializer.toJson<int?>(stockMax),
      'stockMin': serializer.toJson<int?>(stockMin),
      'isActive': serializer.toJson<bool>(isActive),
      'warehouseId': serializer.toJson<String>(warehouseId),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'lastModified': serializer.toJson<int>(lastModified),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  Product copyWith(
          {String? id,
          String? sku,
          String? name,
          Value<String?> description = const Value.absent(),
          Value<String?> categoryId = const Value.absent(),
          Value<String?> brand = const Value.absent(),
          Value<double?> standardCost = const Value.absent(),
          Value<double?> averageCost = const Value.absent(),
          Value<int?> stockMax = const Value.absent(),
          Value<int?> stockMin = const Value.absent(),
          bool? isActive,
          String? warehouseId,
          DateTime? createdAt,
          DateTime? updatedAt,
          String? syncStatus,
          int? lastModified,
          int? syncVersion}) =>
      Product(
        id: id ?? this.id,
        sku: sku ?? this.sku,
        name: name ?? this.name,
        description: description.present ? description.value : this.description,
        categoryId: categoryId.present ? categoryId.value : this.categoryId,
        brand: brand.present ? brand.value : this.brand,
        standardCost:
            standardCost.present ? standardCost.value : this.standardCost,
        averageCost: averageCost.present ? averageCost.value : this.averageCost,
        stockMax: stockMax.present ? stockMax.value : this.stockMax,
        stockMin: stockMin.present ? stockMin.value : this.stockMin,
        isActive: isActive ?? this.isActive,
        warehouseId: warehouseId ?? this.warehouseId,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        syncStatus: syncStatus ?? this.syncStatus,
        lastModified: lastModified ?? this.lastModified,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  Product copyWithCompanion(ProductsCompanion data) {
    return Product(
      id: data.id.present ? data.id.value : this.id,
      sku: data.sku.present ? data.sku.value : this.sku,
      name: data.name.present ? data.name.value : this.name,
      description:
          data.description.present ? data.description.value : this.description,
      categoryId:
          data.categoryId.present ? data.categoryId.value : this.categoryId,
      brand: data.brand.present ? data.brand.value : this.brand,
      standardCost: data.standardCost.present
          ? data.standardCost.value
          : this.standardCost,
      averageCost:
          data.averageCost.present ? data.averageCost.value : this.averageCost,
      stockMax: data.stockMax.present ? data.stockMax.value : this.stockMax,
      stockMin: data.stockMin.present ? data.stockMin.value : this.stockMin,
      isActive: data.isActive.present ? data.isActive.value : this.isActive,
      warehouseId:
          data.warehouseId.present ? data.warehouseId.value : this.warehouseId,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      syncStatus:
          data.syncStatus.present ? data.syncStatus.value : this.syncStatus,
      lastModified: data.lastModified.present
          ? data.lastModified.value
          : this.lastModified,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Product(')
          ..write('id: $id, ')
          ..write('sku: $sku, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('categoryId: $categoryId, ')
          ..write('brand: $brand, ')
          ..write('standardCost: $standardCost, ')
          ..write('averageCost: $averageCost, ')
          ..write('stockMax: $stockMax, ')
          ..write('stockMin: $stockMin, ')
          ..write('isActive: $isActive, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastModified: $lastModified, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      sku,
      name,
      description,
      categoryId,
      brand,
      standardCost,
      averageCost,
      stockMax,
      stockMin,
      isActive,
      warehouseId,
      createdAt,
      updatedAt,
      syncStatus,
      lastModified,
      syncVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Product &&
          other.id == this.id &&
          other.sku == this.sku &&
          other.name == this.name &&
          other.description == this.description &&
          other.categoryId == this.categoryId &&
          other.brand == this.brand &&
          other.standardCost == this.standardCost &&
          other.averageCost == this.averageCost &&
          other.stockMax == this.stockMax &&
          other.stockMin == this.stockMin &&
          other.isActive == this.isActive &&
          other.warehouseId == this.warehouseId &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.syncStatus == this.syncStatus &&
          other.lastModified == this.lastModified &&
          other.syncVersion == this.syncVersion);
}

class ProductsCompanion extends UpdateCompanion<Product> {
  final Value<String> id;
  final Value<String> sku;
  final Value<String> name;
  final Value<String?> description;
  final Value<String?> categoryId;
  final Value<String?> brand;
  final Value<double?> standardCost;
  final Value<double?> averageCost;
  final Value<int?> stockMax;
  final Value<int?> stockMin;
  final Value<bool> isActive;
  final Value<String> warehouseId;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<String> syncStatus;
  final Value<int> lastModified;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const ProductsCompanion({
    this.id = const Value.absent(),
    this.sku = const Value.absent(),
    this.name = const Value.absent(),
    this.description = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.brand = const Value.absent(),
    this.standardCost = const Value.absent(),
    this.averageCost = const Value.absent(),
    this.stockMax = const Value.absent(),
    this.stockMin = const Value.absent(),
    this.isActive = const Value.absent(),
    this.warehouseId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProductsCompanion.insert({
    required String id,
    required String sku,
    required String name,
    this.description = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.brand = const Value.absent(),
    this.standardCost = const Value.absent(),
    this.averageCost = const Value.absent(),
    this.stockMax = const Value.absent(),
    this.stockMin = const Value.absent(),
    this.isActive = const Value.absent(),
    required String warehouseId,
    required DateTime createdAt,
    required DateTime updatedAt,
    this.syncStatus = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        sku = Value(sku),
        name = Value(name),
        warehouseId = Value(warehouseId),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<Product> custom({
    Expression<String>? id,
    Expression<String>? sku,
    Expression<String>? name,
    Expression<String>? description,
    Expression<String>? categoryId,
    Expression<String>? brand,
    Expression<double>? standardCost,
    Expression<double>? averageCost,
    Expression<int>? stockMax,
    Expression<int>? stockMin,
    Expression<bool>? isActive,
    Expression<String>? warehouseId,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<String>? syncStatus,
    Expression<int>? lastModified,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (sku != null) 'sku': sku,
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (categoryId != null) 'category_id': categoryId,
      if (brand != null) 'brand': brand,
      if (standardCost != null) 'standard_cost': standardCost,
      if (averageCost != null) 'average_cost': averageCost,
      if (stockMax != null) 'stock_max': stockMax,
      if (stockMin != null) 'stock_min': stockMin,
      if (isActive != null) 'is_active': isActive,
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (lastModified != null) 'last_modified': lastModified,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProductsCompanion copyWith(
      {Value<String>? id,
      Value<String>? sku,
      Value<String>? name,
      Value<String?>? description,
      Value<String?>? categoryId,
      Value<String?>? brand,
      Value<double?>? standardCost,
      Value<double?>? averageCost,
      Value<int?>? stockMax,
      Value<int?>? stockMin,
      Value<bool>? isActive,
      Value<String>? warehouseId,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<String>? syncStatus,
      Value<int>? lastModified,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return ProductsCompanion(
      id: id ?? this.id,
      sku: sku ?? this.sku,
      name: name ?? this.name,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      brand: brand ?? this.brand,
      standardCost: standardCost ?? this.standardCost,
      averageCost: averageCost ?? this.averageCost,
      stockMax: stockMax ?? this.stockMax,
      stockMin: stockMin ?? this.stockMin,
      isActive: isActive ?? this.isActive,
      warehouseId: warehouseId ?? this.warehouseId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      syncStatus: syncStatus ?? this.syncStatus,
      lastModified: lastModified ?? this.lastModified,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (sku.present) {
      map['sku'] = Variable<String>(sku.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<String>(categoryId.value);
    }
    if (brand.present) {
      map['brand'] = Variable<String>(brand.value);
    }
    if (standardCost.present) {
      map['standard_cost'] = Variable<double>(standardCost.value);
    }
    if (averageCost.present) {
      map['average_cost'] = Variable<double>(averageCost.value);
    }
    if (stockMax.present) {
      map['stock_max'] = Variable<int>(stockMax.value);
    }
    if (stockMin.present) {
      map['stock_min'] = Variable<int>(stockMin.value);
    }
    if (isActive.present) {
      map['is_active'] = Variable<bool>(isActive.value);
    }
    if (warehouseId.present) {
      map['warehouse_id'] = Variable<String>(warehouseId.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (lastModified.present) {
      map['last_modified'] = Variable<int>(lastModified.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProductsCompanion(')
          ..write('id: $id, ')
          ..write('sku: $sku, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('categoryId: $categoryId, ')
          ..write('brand: $brand, ')
          ..write('standardCost: $standardCost, ')
          ..write('averageCost: $averageCost, ')
          ..write('stockMax: $stockMax, ')
          ..write('stockMin: $stockMin, ')
          ..write('isActive: $isActive, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastModified: $lastModified, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $InventoryTable extends Inventory
    with TableInfo<$InventoryTable, InventoryData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $InventoryTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
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
  static const VerificationMeta _quantityMeta =
      const VerificationMeta('quantity');
  @override
  late final GeneratedColumn<int> quantity = GeneratedColumn<int>(
      'quantity', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _toFulfillMeta =
      const VerificationMeta('toFulfill');
  @override
  late final GeneratedColumn<int> toFulfill = GeneratedColumn<int>(
      'to_fulfill', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _orderToFulfillMeta =
      const VerificationMeta('orderToFulfill');
  @override
  late final GeneratedColumn<int> orderToFulfill = GeneratedColumn<int>(
      'order_to_fulfill', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _availableMeta =
      const VerificationMeta('available');
  @override
  late final GeneratedColumn<int> available = GeneratedColumn<int>(
      'available', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _entryMeta = const VerificationMeta('entry');
  @override
  late final GeneratedColumn<int> entry = GeneratedColumn<int>(
      'entry', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _exitMeta = const VerificationMeta('exit');
  @override
  late final GeneratedColumn<int> exit = GeneratedColumn<int>(
      'exit', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _stockValueMeta =
      const VerificationMeta('stockValue');
  @override
  late final GeneratedColumn<double> stockValue = GeneratedColumn<double>(
      'stock_value', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _lastPurchaseDateMeta =
      const VerificationMeta('lastPurchaseDate');
  @override
  late final GeneratedColumn<DateTime> lastPurchaseDate =
      GeneratedColumn<DateTime>('last_purchase_date', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastSaleDateMeta =
      const VerificationMeta('lastSaleDate');
  @override
  late final GeneratedColumn<DateTime> lastSaleDate = GeneratedColumn<DateTime>(
      'last_sale_date', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _daysWithoutPurchaseMeta =
      const VerificationMeta('daysWithoutPurchase');
  @override
  late final GeneratedColumn<int> daysWithoutPurchase = GeneratedColumn<int>(
      'days_without_purchase', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _daysWithoutSaleMeta =
      const VerificationMeta('daysWithoutSale');
  @override
  late final GeneratedColumn<int> daysWithoutSale = GeneratedColumn<int>(
      'days_without_sale', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _serverOriginMeta =
      const VerificationMeta('serverOrigin');
  @override
  late final GeneratedColumn<String> serverOrigin = GeneratedColumn<String>(
      'server_origin', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
      'sync_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('synced'));
  static const VerificationMeta _lastModifiedMeta =
      const VerificationMeta('lastModified');
  @override
  late final GeneratedColumn<int> lastModified = GeneratedColumn<int>(
      'last_modified', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        productId,
        warehouseId,
        quantity,
        toFulfill,
        orderToFulfill,
        available,
        entry,
        exit,
        stockValue,
        lastPurchaseDate,
        lastSaleDate,
        daysWithoutPurchase,
        daysWithoutSale,
        serverOrigin,
        updatedAt,
        syncStatus,
        lastModified,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'inventory';
  @override
  VerificationContext validateIntegrity(Insertable<InventoryData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
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
    if (data.containsKey('quantity')) {
      context.handle(_quantityMeta,
          quantity.isAcceptableOrUnknown(data['quantity']!, _quantityMeta));
    }
    if (data.containsKey('to_fulfill')) {
      context.handle(_toFulfillMeta,
          toFulfill.isAcceptableOrUnknown(data['to_fulfill']!, _toFulfillMeta));
    }
    if (data.containsKey('order_to_fulfill')) {
      context.handle(
          _orderToFulfillMeta,
          orderToFulfill.isAcceptableOrUnknown(
              data['order_to_fulfill']!, _orderToFulfillMeta));
    }
    if (data.containsKey('available')) {
      context.handle(_availableMeta,
          available.isAcceptableOrUnknown(data['available']!, _availableMeta));
    }
    if (data.containsKey('entry')) {
      context.handle(
          _entryMeta, entry.isAcceptableOrUnknown(data['entry']!, _entryMeta));
    }
    if (data.containsKey('exit')) {
      context.handle(
          _exitMeta, exit.isAcceptableOrUnknown(data['exit']!, _exitMeta));
    }
    if (data.containsKey('stock_value')) {
      context.handle(
          _stockValueMeta,
          stockValue.isAcceptableOrUnknown(
              data['stock_value']!, _stockValueMeta));
    }
    if (data.containsKey('last_purchase_date')) {
      context.handle(
          _lastPurchaseDateMeta,
          lastPurchaseDate.isAcceptableOrUnknown(
              data['last_purchase_date']!, _lastPurchaseDateMeta));
    }
    if (data.containsKey('last_sale_date')) {
      context.handle(
          _lastSaleDateMeta,
          lastSaleDate.isAcceptableOrUnknown(
              data['last_sale_date']!, _lastSaleDateMeta));
    }
    if (data.containsKey('days_without_purchase')) {
      context.handle(
          _daysWithoutPurchaseMeta,
          daysWithoutPurchase.isAcceptableOrUnknown(
              data['days_without_purchase']!, _daysWithoutPurchaseMeta));
    }
    if (data.containsKey('days_without_sale')) {
      context.handle(
          _daysWithoutSaleMeta,
          daysWithoutSale.isAcceptableOrUnknown(
              data['days_without_sale']!, _daysWithoutSaleMeta));
    }
    if (data.containsKey('server_origin')) {
      context.handle(
          _serverOriginMeta,
          serverOrigin.isAcceptableOrUnknown(
              data['server_origin']!, _serverOriginMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('sync_status')) {
      context.handle(
          _syncStatusMeta,
          syncStatus.isAcceptableOrUnknown(
              data['sync_status']!, _syncStatusMeta));
    }
    if (data.containsKey('last_modified')) {
      context.handle(
          _lastModifiedMeta,
          lastModified.isAcceptableOrUnknown(
              data['last_modified']!, _lastModifiedMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  InventoryData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return InventoryData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      productId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}product_id'])!,
      warehouseId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}warehouse_id'])!,
      quantity: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}quantity'])!,
      toFulfill: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}to_fulfill']),
      orderToFulfill: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}order_to_fulfill']),
      available: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}available'])!,
      entry: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}entry'])!,
      exit: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}exit'])!,
      stockValue: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}stock_value']),
      lastPurchaseDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_purchase_date']),
      lastSaleDate: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_sale_date']),
      daysWithoutPurchase: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}days_without_purchase'])!,
      daysWithoutSale: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}days_without_sale'])!,
      serverOrigin: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}server_origin']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      syncStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sync_status'])!,
      lastModified: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}last_modified'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $InventoryTable createAlias(String alias) {
    return $InventoryTable(attachedDatabase, alias);
  }
}

class InventoryData extends DataClass implements Insertable<InventoryData> {
  final String id;
  final String productId;
  final String warehouseId;
  final int quantity;
  final int? toFulfill;
  final int? orderToFulfill;
  final int available;
  final int entry;
  final int exit;
  final double? stockValue;
  final DateTime? lastPurchaseDate;
  final DateTime? lastSaleDate;
  final int daysWithoutPurchase;
  final int daysWithoutSale;
  final String? serverOrigin;
  final DateTime updatedAt;
  final String syncStatus;
  final int lastModified;
  final int syncVersion;
  const InventoryData(
      {required this.id,
      required this.productId,
      required this.warehouseId,
      required this.quantity,
      this.toFulfill,
      this.orderToFulfill,
      required this.available,
      required this.entry,
      required this.exit,
      this.stockValue,
      this.lastPurchaseDate,
      this.lastSaleDate,
      required this.daysWithoutPurchase,
      required this.daysWithoutSale,
      this.serverOrigin,
      required this.updatedAt,
      required this.syncStatus,
      required this.lastModified,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['product_id'] = Variable<String>(productId);
    map['warehouse_id'] = Variable<String>(warehouseId);
    map['quantity'] = Variable<int>(quantity);
    if (!nullToAbsent || toFulfill != null) {
      map['to_fulfill'] = Variable<int>(toFulfill);
    }
    if (!nullToAbsent || orderToFulfill != null) {
      map['order_to_fulfill'] = Variable<int>(orderToFulfill);
    }
    map['available'] = Variable<int>(available);
    map['entry'] = Variable<int>(entry);
    map['exit'] = Variable<int>(exit);
    if (!nullToAbsent || stockValue != null) {
      map['stock_value'] = Variable<double>(stockValue);
    }
    if (!nullToAbsent || lastPurchaseDate != null) {
      map['last_purchase_date'] = Variable<DateTime>(lastPurchaseDate);
    }
    if (!nullToAbsent || lastSaleDate != null) {
      map['last_sale_date'] = Variable<DateTime>(lastSaleDate);
    }
    map['days_without_purchase'] = Variable<int>(daysWithoutPurchase);
    map['days_without_sale'] = Variable<int>(daysWithoutSale);
    if (!nullToAbsent || serverOrigin != null) {
      map['server_origin'] = Variable<String>(serverOrigin);
    }
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['sync_status'] = Variable<String>(syncStatus);
    map['last_modified'] = Variable<int>(lastModified);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  InventoryCompanion toCompanion(bool nullToAbsent) {
    return InventoryCompanion(
      id: Value(id),
      productId: Value(productId),
      warehouseId: Value(warehouseId),
      quantity: Value(quantity),
      toFulfill: toFulfill == null && nullToAbsent
          ? const Value.absent()
          : Value(toFulfill),
      orderToFulfill: orderToFulfill == null && nullToAbsent
          ? const Value.absent()
          : Value(orderToFulfill),
      available: Value(available),
      entry: Value(entry),
      exit: Value(exit),
      stockValue: stockValue == null && nullToAbsent
          ? const Value.absent()
          : Value(stockValue),
      lastPurchaseDate: lastPurchaseDate == null && nullToAbsent
          ? const Value.absent()
          : Value(lastPurchaseDate),
      lastSaleDate: lastSaleDate == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSaleDate),
      daysWithoutPurchase: Value(daysWithoutPurchase),
      daysWithoutSale: Value(daysWithoutSale),
      serverOrigin: serverOrigin == null && nullToAbsent
          ? const Value.absent()
          : Value(serverOrigin),
      updatedAt: Value(updatedAt),
      syncStatus: Value(syncStatus),
      lastModified: Value(lastModified),
      syncVersion: Value(syncVersion),
    );
  }

  factory InventoryData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return InventoryData(
      id: serializer.fromJson<String>(json['id']),
      productId: serializer.fromJson<String>(json['productId']),
      warehouseId: serializer.fromJson<String>(json['warehouseId']),
      quantity: serializer.fromJson<int>(json['quantity']),
      toFulfill: serializer.fromJson<int?>(json['toFulfill']),
      orderToFulfill: serializer.fromJson<int?>(json['orderToFulfill']),
      available: serializer.fromJson<int>(json['available']),
      entry: serializer.fromJson<int>(json['entry']),
      exit: serializer.fromJson<int>(json['exit']),
      stockValue: serializer.fromJson<double?>(json['stockValue']),
      lastPurchaseDate:
          serializer.fromJson<DateTime?>(json['lastPurchaseDate']),
      lastSaleDate: serializer.fromJson<DateTime?>(json['lastSaleDate']),
      daysWithoutPurchase:
          serializer.fromJson<int>(json['daysWithoutPurchase']),
      daysWithoutSale: serializer.fromJson<int>(json['daysWithoutSale']),
      serverOrigin: serializer.fromJson<String?>(json['serverOrigin']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      lastModified: serializer.fromJson<int>(json['lastModified']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'productId': serializer.toJson<String>(productId),
      'warehouseId': serializer.toJson<String>(warehouseId),
      'quantity': serializer.toJson<int>(quantity),
      'toFulfill': serializer.toJson<int?>(toFulfill),
      'orderToFulfill': serializer.toJson<int?>(orderToFulfill),
      'available': serializer.toJson<int>(available),
      'entry': serializer.toJson<int>(entry),
      'exit': serializer.toJson<int>(exit),
      'stockValue': serializer.toJson<double?>(stockValue),
      'lastPurchaseDate': serializer.toJson<DateTime?>(lastPurchaseDate),
      'lastSaleDate': serializer.toJson<DateTime?>(lastSaleDate),
      'daysWithoutPurchase': serializer.toJson<int>(daysWithoutPurchase),
      'daysWithoutSale': serializer.toJson<int>(daysWithoutSale),
      'serverOrigin': serializer.toJson<String?>(serverOrigin),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'lastModified': serializer.toJson<int>(lastModified),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  InventoryData copyWith(
          {String? id,
          String? productId,
          String? warehouseId,
          int? quantity,
          Value<int?> toFulfill = const Value.absent(),
          Value<int?> orderToFulfill = const Value.absent(),
          int? available,
          int? entry,
          int? exit,
          Value<double?> stockValue = const Value.absent(),
          Value<DateTime?> lastPurchaseDate = const Value.absent(),
          Value<DateTime?> lastSaleDate = const Value.absent(),
          int? daysWithoutPurchase,
          int? daysWithoutSale,
          Value<String?> serverOrigin = const Value.absent(),
          DateTime? updatedAt,
          String? syncStatus,
          int? lastModified,
          int? syncVersion}) =>
      InventoryData(
        id: id ?? this.id,
        productId: productId ?? this.productId,
        warehouseId: warehouseId ?? this.warehouseId,
        quantity: quantity ?? this.quantity,
        toFulfill: toFulfill.present ? toFulfill.value : this.toFulfill,
        orderToFulfill:
            orderToFulfill.present ? orderToFulfill.value : this.orderToFulfill,
        available: available ?? this.available,
        entry: entry ?? this.entry,
        exit: exit ?? this.exit,
        stockValue: stockValue.present ? stockValue.value : this.stockValue,
        lastPurchaseDate: lastPurchaseDate.present
            ? lastPurchaseDate.value
            : this.lastPurchaseDate,
        lastSaleDate:
            lastSaleDate.present ? lastSaleDate.value : this.lastSaleDate,
        daysWithoutPurchase: daysWithoutPurchase ?? this.daysWithoutPurchase,
        daysWithoutSale: daysWithoutSale ?? this.daysWithoutSale,
        serverOrigin:
            serverOrigin.present ? serverOrigin.value : this.serverOrigin,
        updatedAt: updatedAt ?? this.updatedAt,
        syncStatus: syncStatus ?? this.syncStatus,
        lastModified: lastModified ?? this.lastModified,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  InventoryData copyWithCompanion(InventoryCompanion data) {
    return InventoryData(
      id: data.id.present ? data.id.value : this.id,
      productId: data.productId.present ? data.productId.value : this.productId,
      warehouseId:
          data.warehouseId.present ? data.warehouseId.value : this.warehouseId,
      quantity: data.quantity.present ? data.quantity.value : this.quantity,
      toFulfill: data.toFulfill.present ? data.toFulfill.value : this.toFulfill,
      orderToFulfill: data.orderToFulfill.present
          ? data.orderToFulfill.value
          : this.orderToFulfill,
      available: data.available.present ? data.available.value : this.available,
      entry: data.entry.present ? data.entry.value : this.entry,
      exit: data.exit.present ? data.exit.value : this.exit,
      stockValue:
          data.stockValue.present ? data.stockValue.value : this.stockValue,
      lastPurchaseDate: data.lastPurchaseDate.present
          ? data.lastPurchaseDate.value
          : this.lastPurchaseDate,
      lastSaleDate: data.lastSaleDate.present
          ? data.lastSaleDate.value
          : this.lastSaleDate,
      daysWithoutPurchase: data.daysWithoutPurchase.present
          ? data.daysWithoutPurchase.value
          : this.daysWithoutPurchase,
      daysWithoutSale: data.daysWithoutSale.present
          ? data.daysWithoutSale.value
          : this.daysWithoutSale,
      serverOrigin: data.serverOrigin.present
          ? data.serverOrigin.value
          : this.serverOrigin,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      syncStatus:
          data.syncStatus.present ? data.syncStatus.value : this.syncStatus,
      lastModified: data.lastModified.present
          ? data.lastModified.value
          : this.lastModified,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('InventoryData(')
          ..write('id: $id, ')
          ..write('productId: $productId, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('quantity: $quantity, ')
          ..write('toFulfill: $toFulfill, ')
          ..write('orderToFulfill: $orderToFulfill, ')
          ..write('available: $available, ')
          ..write('entry: $entry, ')
          ..write('exit: $exit, ')
          ..write('stockValue: $stockValue, ')
          ..write('lastPurchaseDate: $lastPurchaseDate, ')
          ..write('lastSaleDate: $lastSaleDate, ')
          ..write('daysWithoutPurchase: $daysWithoutPurchase, ')
          ..write('daysWithoutSale: $daysWithoutSale, ')
          ..write('serverOrigin: $serverOrigin, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastModified: $lastModified, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      productId,
      warehouseId,
      quantity,
      toFulfill,
      orderToFulfill,
      available,
      entry,
      exit,
      stockValue,
      lastPurchaseDate,
      lastSaleDate,
      daysWithoutPurchase,
      daysWithoutSale,
      serverOrigin,
      updatedAt,
      syncStatus,
      lastModified,
      syncVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is InventoryData &&
          other.id == this.id &&
          other.productId == this.productId &&
          other.warehouseId == this.warehouseId &&
          other.quantity == this.quantity &&
          other.toFulfill == this.toFulfill &&
          other.orderToFulfill == this.orderToFulfill &&
          other.available == this.available &&
          other.entry == this.entry &&
          other.exit == this.exit &&
          other.stockValue == this.stockValue &&
          other.lastPurchaseDate == this.lastPurchaseDate &&
          other.lastSaleDate == this.lastSaleDate &&
          other.daysWithoutPurchase == this.daysWithoutPurchase &&
          other.daysWithoutSale == this.daysWithoutSale &&
          other.serverOrigin == this.serverOrigin &&
          other.updatedAt == this.updatedAt &&
          other.syncStatus == this.syncStatus &&
          other.lastModified == this.lastModified &&
          other.syncVersion == this.syncVersion);
}

class InventoryCompanion extends UpdateCompanion<InventoryData> {
  final Value<String> id;
  final Value<String> productId;
  final Value<String> warehouseId;
  final Value<int> quantity;
  final Value<int?> toFulfill;
  final Value<int?> orderToFulfill;
  final Value<int> available;
  final Value<int> entry;
  final Value<int> exit;
  final Value<double?> stockValue;
  final Value<DateTime?> lastPurchaseDate;
  final Value<DateTime?> lastSaleDate;
  final Value<int> daysWithoutPurchase;
  final Value<int> daysWithoutSale;
  final Value<String?> serverOrigin;
  final Value<DateTime> updatedAt;
  final Value<String> syncStatus;
  final Value<int> lastModified;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const InventoryCompanion({
    this.id = const Value.absent(),
    this.productId = const Value.absent(),
    this.warehouseId = const Value.absent(),
    this.quantity = const Value.absent(),
    this.toFulfill = const Value.absent(),
    this.orderToFulfill = const Value.absent(),
    this.available = const Value.absent(),
    this.entry = const Value.absent(),
    this.exit = const Value.absent(),
    this.stockValue = const Value.absent(),
    this.lastPurchaseDate = const Value.absent(),
    this.lastSaleDate = const Value.absent(),
    this.daysWithoutPurchase = const Value.absent(),
    this.daysWithoutSale = const Value.absent(),
    this.serverOrigin = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  InventoryCompanion.insert({
    required String id,
    required String productId,
    required String warehouseId,
    this.quantity = const Value.absent(),
    this.toFulfill = const Value.absent(),
    this.orderToFulfill = const Value.absent(),
    this.available = const Value.absent(),
    this.entry = const Value.absent(),
    this.exit = const Value.absent(),
    this.stockValue = const Value.absent(),
    this.lastPurchaseDate = const Value.absent(),
    this.lastSaleDate = const Value.absent(),
    this.daysWithoutPurchase = const Value.absent(),
    this.daysWithoutSale = const Value.absent(),
    this.serverOrigin = const Value.absent(),
    required DateTime updatedAt,
    this.syncStatus = const Value.absent(),
    this.lastModified = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        productId = Value(productId),
        warehouseId = Value(warehouseId),
        updatedAt = Value(updatedAt);
  static Insertable<InventoryData> custom({
    Expression<String>? id,
    Expression<String>? productId,
    Expression<String>? warehouseId,
    Expression<int>? quantity,
    Expression<int>? toFulfill,
    Expression<int>? orderToFulfill,
    Expression<int>? available,
    Expression<int>? entry,
    Expression<int>? exit,
    Expression<double>? stockValue,
    Expression<DateTime>? lastPurchaseDate,
    Expression<DateTime>? lastSaleDate,
    Expression<int>? daysWithoutPurchase,
    Expression<int>? daysWithoutSale,
    Expression<String>? serverOrigin,
    Expression<DateTime>? updatedAt,
    Expression<String>? syncStatus,
    Expression<int>? lastModified,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (productId != null) 'product_id': productId,
      if (warehouseId != null) 'warehouse_id': warehouseId,
      if (quantity != null) 'quantity': quantity,
      if (toFulfill != null) 'to_fulfill': toFulfill,
      if (orderToFulfill != null) 'order_to_fulfill': orderToFulfill,
      if (available != null) 'available': available,
      if (entry != null) 'entry': entry,
      if (exit != null) 'exit': exit,
      if (stockValue != null) 'stock_value': stockValue,
      if (lastPurchaseDate != null) 'last_purchase_date': lastPurchaseDate,
      if (lastSaleDate != null) 'last_sale_date': lastSaleDate,
      if (daysWithoutPurchase != null)
        'days_without_purchase': daysWithoutPurchase,
      if (daysWithoutSale != null) 'days_without_sale': daysWithoutSale,
      if (serverOrigin != null) 'server_origin': serverOrigin,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (lastModified != null) 'last_modified': lastModified,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  InventoryCompanion copyWith(
      {Value<String>? id,
      Value<String>? productId,
      Value<String>? warehouseId,
      Value<int>? quantity,
      Value<int?>? toFulfill,
      Value<int?>? orderToFulfill,
      Value<int>? available,
      Value<int>? entry,
      Value<int>? exit,
      Value<double?>? stockValue,
      Value<DateTime?>? lastPurchaseDate,
      Value<DateTime?>? lastSaleDate,
      Value<int>? daysWithoutPurchase,
      Value<int>? daysWithoutSale,
      Value<String?>? serverOrigin,
      Value<DateTime>? updatedAt,
      Value<String>? syncStatus,
      Value<int>? lastModified,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return InventoryCompanion(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      warehouseId: warehouseId ?? this.warehouseId,
      quantity: quantity ?? this.quantity,
      toFulfill: toFulfill ?? this.toFulfill,
      orderToFulfill: orderToFulfill ?? this.orderToFulfill,
      available: available ?? this.available,
      entry: entry ?? this.entry,
      exit: exit ?? this.exit,
      stockValue: stockValue ?? this.stockValue,
      lastPurchaseDate: lastPurchaseDate ?? this.lastPurchaseDate,
      lastSaleDate: lastSaleDate ?? this.lastSaleDate,
      daysWithoutPurchase: daysWithoutPurchase ?? this.daysWithoutPurchase,
      daysWithoutSale: daysWithoutSale ?? this.daysWithoutSale,
      serverOrigin: serverOrigin ?? this.serverOrigin,
      updatedAt: updatedAt ?? this.updatedAt,
      syncStatus: syncStatus ?? this.syncStatus,
      lastModified: lastModified ?? this.lastModified,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (productId.present) {
      map['product_id'] = Variable<String>(productId.value);
    }
    if (warehouseId.present) {
      map['warehouse_id'] = Variable<String>(warehouseId.value);
    }
    if (quantity.present) {
      map['quantity'] = Variable<int>(quantity.value);
    }
    if (toFulfill.present) {
      map['to_fulfill'] = Variable<int>(toFulfill.value);
    }
    if (orderToFulfill.present) {
      map['order_to_fulfill'] = Variable<int>(orderToFulfill.value);
    }
    if (available.present) {
      map['available'] = Variable<int>(available.value);
    }
    if (entry.present) {
      map['entry'] = Variable<int>(entry.value);
    }
    if (exit.present) {
      map['exit'] = Variable<int>(exit.value);
    }
    if (stockValue.present) {
      map['stock_value'] = Variable<double>(stockValue.value);
    }
    if (lastPurchaseDate.present) {
      map['last_purchase_date'] = Variable<DateTime>(lastPurchaseDate.value);
    }
    if (lastSaleDate.present) {
      map['last_sale_date'] = Variable<DateTime>(lastSaleDate.value);
    }
    if (daysWithoutPurchase.present) {
      map['days_without_purchase'] = Variable<int>(daysWithoutPurchase.value);
    }
    if (daysWithoutSale.present) {
      map['days_without_sale'] = Variable<int>(daysWithoutSale.value);
    }
    if (serverOrigin.present) {
      map['server_origin'] = Variable<String>(serverOrigin.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (lastModified.present) {
      map['last_modified'] = Variable<int>(lastModified.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('InventoryCompanion(')
          ..write('id: $id, ')
          ..write('productId: $productId, ')
          ..write('warehouseId: $warehouseId, ')
          ..write('quantity: $quantity, ')
          ..write('toFulfill: $toFulfill, ')
          ..write('orderToFulfill: $orderToFulfill, ')
          ..write('available: $available, ')
          ..write('entry: $entry, ')
          ..write('exit: $exit, ')
          ..write('stockValue: $stockValue, ')
          ..write('lastPurchaseDate: $lastPurchaseDate, ')
          ..write('lastSaleDate: $lastSaleDate, ')
          ..write('daysWithoutPurchase: $daysWithoutPurchase, ')
          ..write('daysWithoutSale: $daysWithoutSale, ')
          ..write('serverOrigin: $serverOrigin, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('lastModified: $lastModified, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$LocalDatabase extends GeneratedDatabase {
  _$LocalDatabase(QueryExecutor e) : super(e);
  $LocalDatabaseManager get managers => $LocalDatabaseManager(this);
  late final $ProductsTable products = $ProductsTable(this);
  late final $InventoryTable inventory = $InventoryTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [products, inventory];
}

typedef $$ProductsTableCreateCompanionBuilder = ProductsCompanion Function({
  required String id,
  required String sku,
  required String name,
  Value<String?> description,
  Value<String?> categoryId,
  Value<String?> brand,
  Value<double?> standardCost,
  Value<double?> averageCost,
  Value<int?> stockMax,
  Value<int?> stockMin,
  Value<bool> isActive,
  required String warehouseId,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<String> syncStatus,
  Value<int> lastModified,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$ProductsTableUpdateCompanionBuilder = ProductsCompanion Function({
  Value<String> id,
  Value<String> sku,
  Value<String> name,
  Value<String?> description,
  Value<String?> categoryId,
  Value<String?> brand,
  Value<double?> standardCost,
  Value<double?> averageCost,
  Value<int?> stockMax,
  Value<int?> stockMin,
  Value<bool> isActive,
  Value<String> warehouseId,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<String> syncStatus,
  Value<int> lastModified,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$ProductsTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $ProductsTable,
    Product,
    $$ProductsTableFilterComposer,
    $$ProductsTableOrderingComposer,
    $$ProductsTableCreateCompanionBuilder,
    $$ProductsTableUpdateCompanionBuilder> {
  $$ProductsTableTableManager(_$LocalDatabase db, $ProductsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$ProductsTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$ProductsTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> sku = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String?> categoryId = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<double?> standardCost = const Value.absent(),
            Value<double?> averageCost = const Value.absent(),
            Value<int?> stockMax = const Value.absent(),
            Value<int?> stockMin = const Value.absent(),
            Value<bool> isActive = const Value.absent(),
            Value<String> warehouseId = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<int> lastModified = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProductsCompanion(
            id: id,
            sku: sku,
            name: name,
            description: description,
            categoryId: categoryId,
            brand: brand,
            standardCost: standardCost,
            averageCost: averageCost,
            stockMax: stockMax,
            stockMin: stockMin,
            isActive: isActive,
            warehouseId: warehouseId,
            createdAt: createdAt,
            updatedAt: updatedAt,
            syncStatus: syncStatus,
            lastModified: lastModified,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String sku,
            required String name,
            Value<String?> description = const Value.absent(),
            Value<String?> categoryId = const Value.absent(),
            Value<String?> brand = const Value.absent(),
            Value<double?> standardCost = const Value.absent(),
            Value<double?> averageCost = const Value.absent(),
            Value<int?> stockMax = const Value.absent(),
            Value<int?> stockMin = const Value.absent(),
            Value<bool> isActive = const Value.absent(),
            required String warehouseId,
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<String> syncStatus = const Value.absent(),
            Value<int> lastModified = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProductsCompanion.insert(
            id: id,
            sku: sku,
            name: name,
            description: description,
            categoryId: categoryId,
            brand: brand,
            standardCost: standardCost,
            averageCost: averageCost,
            stockMax: stockMax,
            stockMin: stockMin,
            isActive: isActive,
            warehouseId: warehouseId,
            createdAt: createdAt,
            updatedAt: updatedAt,
            syncStatus: syncStatus,
            lastModified: lastModified,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
        ));
}

class $$ProductsTableFilterComposer
    extends FilterComposer<_$LocalDatabase, $ProductsTable> {
  $$ProductsTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get sku => $state.composableBuilder(
      column: $state.table.sku,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get categoryId => $state.composableBuilder(
      column: $state.table.categoryId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get brand => $state.composableBuilder(
      column: $state.table.brand,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get standardCost => $state.composableBuilder(
      column: $state.table.standardCost,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get averageCost => $state.composableBuilder(
      column: $state.table.averageCost,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get stockMax => $state.composableBuilder(
      column: $state.table.stockMax,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get stockMin => $state.composableBuilder(
      column: $state.table.stockMin,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<bool> get isActive => $state.composableBuilder(
      column: $state.table.isActive,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get syncStatus => $state.composableBuilder(
      column: $state.table.syncStatus,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get lastModified => $state.composableBuilder(
      column: $state.table.lastModified,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get syncVersion => $state.composableBuilder(
      column: $state.table.syncVersion,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$ProductsTableOrderingComposer
    extends OrderingComposer<_$LocalDatabase, $ProductsTable> {
  $$ProductsTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get sku => $state.composableBuilder(
      column: $state.table.sku,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get name => $state.composableBuilder(
      column: $state.table.name,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get description => $state.composableBuilder(
      column: $state.table.description,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get categoryId => $state.composableBuilder(
      column: $state.table.categoryId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get brand => $state.composableBuilder(
      column: $state.table.brand,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get standardCost => $state.composableBuilder(
      column: $state.table.standardCost,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get averageCost => $state.composableBuilder(
      column: $state.table.averageCost,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get stockMax => $state.composableBuilder(
      column: $state.table.stockMax,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get stockMin => $state.composableBuilder(
      column: $state.table.stockMin,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<bool> get isActive => $state.composableBuilder(
      column: $state.table.isActive,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get createdAt => $state.composableBuilder(
      column: $state.table.createdAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get syncStatus => $state.composableBuilder(
      column: $state.table.syncStatus,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get lastModified => $state.composableBuilder(
      column: $state.table.lastModified,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get syncVersion => $state.composableBuilder(
      column: $state.table.syncVersion,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

typedef $$InventoryTableCreateCompanionBuilder = InventoryCompanion Function({
  required String id,
  required String productId,
  required String warehouseId,
  Value<int> quantity,
  Value<int?> toFulfill,
  Value<int?> orderToFulfill,
  Value<int> available,
  Value<int> entry,
  Value<int> exit,
  Value<double?> stockValue,
  Value<DateTime?> lastPurchaseDate,
  Value<DateTime?> lastSaleDate,
  Value<int> daysWithoutPurchase,
  Value<int> daysWithoutSale,
  Value<String?> serverOrigin,
  required DateTime updatedAt,
  Value<String> syncStatus,
  Value<int> lastModified,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$InventoryTableUpdateCompanionBuilder = InventoryCompanion Function({
  Value<String> id,
  Value<String> productId,
  Value<String> warehouseId,
  Value<int> quantity,
  Value<int?> toFulfill,
  Value<int?> orderToFulfill,
  Value<int> available,
  Value<int> entry,
  Value<int> exit,
  Value<double?> stockValue,
  Value<DateTime?> lastPurchaseDate,
  Value<DateTime?> lastSaleDate,
  Value<int> daysWithoutPurchase,
  Value<int> daysWithoutSale,
  Value<String?> serverOrigin,
  Value<DateTime> updatedAt,
  Value<String> syncStatus,
  Value<int> lastModified,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$InventoryTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $InventoryTable,
    InventoryData,
    $$InventoryTableFilterComposer,
    $$InventoryTableOrderingComposer,
    $$InventoryTableCreateCompanionBuilder,
    $$InventoryTableUpdateCompanionBuilder> {
  $$InventoryTableTableManager(_$LocalDatabase db, $InventoryTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          filteringComposer:
              $$InventoryTableFilterComposer(ComposerState(db, table)),
          orderingComposer:
              $$InventoryTableOrderingComposer(ComposerState(db, table)),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> productId = const Value.absent(),
            Value<String> warehouseId = const Value.absent(),
            Value<int> quantity = const Value.absent(),
            Value<int?> toFulfill = const Value.absent(),
            Value<int?> orderToFulfill = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<int> entry = const Value.absent(),
            Value<int> exit = const Value.absent(),
            Value<double?> stockValue = const Value.absent(),
            Value<DateTime?> lastPurchaseDate = const Value.absent(),
            Value<DateTime?> lastSaleDate = const Value.absent(),
            Value<int> daysWithoutPurchase = const Value.absent(),
            Value<int> daysWithoutSale = const Value.absent(),
            Value<String?> serverOrigin = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<int> lastModified = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              InventoryCompanion(
            id: id,
            productId: productId,
            warehouseId: warehouseId,
            quantity: quantity,
            toFulfill: toFulfill,
            orderToFulfill: orderToFulfill,
            available: available,
            entry: entry,
            exit: exit,
            stockValue: stockValue,
            lastPurchaseDate: lastPurchaseDate,
            lastSaleDate: lastSaleDate,
            daysWithoutPurchase: daysWithoutPurchase,
            daysWithoutSale: daysWithoutSale,
            serverOrigin: serverOrigin,
            updatedAt: updatedAt,
            syncStatus: syncStatus,
            lastModified: lastModified,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String productId,
            required String warehouseId,
            Value<int> quantity = const Value.absent(),
            Value<int?> toFulfill = const Value.absent(),
            Value<int?> orderToFulfill = const Value.absent(),
            Value<int> available = const Value.absent(),
            Value<int> entry = const Value.absent(),
            Value<int> exit = const Value.absent(),
            Value<double?> stockValue = const Value.absent(),
            Value<DateTime?> lastPurchaseDate = const Value.absent(),
            Value<DateTime?> lastSaleDate = const Value.absent(),
            Value<int> daysWithoutPurchase = const Value.absent(),
            Value<int> daysWithoutSale = const Value.absent(),
            Value<String?> serverOrigin = const Value.absent(),
            required DateTime updatedAt,
            Value<String> syncStatus = const Value.absent(),
            Value<int> lastModified = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              InventoryCompanion.insert(
            id: id,
            productId: productId,
            warehouseId: warehouseId,
            quantity: quantity,
            toFulfill: toFulfill,
            orderToFulfill: orderToFulfill,
            available: available,
            entry: entry,
            exit: exit,
            stockValue: stockValue,
            lastPurchaseDate: lastPurchaseDate,
            lastSaleDate: lastSaleDate,
            daysWithoutPurchase: daysWithoutPurchase,
            daysWithoutSale: daysWithoutSale,
            serverOrigin: serverOrigin,
            updatedAt: updatedAt,
            syncStatus: syncStatus,
            lastModified: lastModified,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
        ));
}

class $$InventoryTableFilterComposer
    extends FilterComposer<_$LocalDatabase, $InventoryTable> {
  $$InventoryTableFilterComposer(super.$state);
  ColumnFilters<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get productId => $state.composableBuilder(
      column: $state.table.productId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get quantity => $state.composableBuilder(
      column: $state.table.quantity,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get toFulfill => $state.composableBuilder(
      column: $state.table.toFulfill,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get orderToFulfill => $state.composableBuilder(
      column: $state.table.orderToFulfill,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get available => $state.composableBuilder(
      column: $state.table.available,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get entry => $state.composableBuilder(
      column: $state.table.entry,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get exit => $state.composableBuilder(
      column: $state.table.exit,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<double> get stockValue => $state.composableBuilder(
      column: $state.table.stockValue,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastPurchaseDate => $state.composableBuilder(
      column: $state.table.lastPurchaseDate,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get lastSaleDate => $state.composableBuilder(
      column: $state.table.lastSaleDate,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get daysWithoutPurchase => $state.composableBuilder(
      column: $state.table.daysWithoutPurchase,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get daysWithoutSale => $state.composableBuilder(
      column: $state.table.daysWithoutSale,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get serverOrigin => $state.composableBuilder(
      column: $state.table.serverOrigin,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<String> get syncStatus => $state.composableBuilder(
      column: $state.table.syncStatus,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get lastModified => $state.composableBuilder(
      column: $state.table.lastModified,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));

  ColumnFilters<int> get syncVersion => $state.composableBuilder(
      column: $state.table.syncVersion,
      builder: (column, joinBuilders) =>
          ColumnFilters(column, joinBuilders: joinBuilders));
}

class $$InventoryTableOrderingComposer
    extends OrderingComposer<_$LocalDatabase, $InventoryTable> {
  $$InventoryTableOrderingComposer(super.$state);
  ColumnOrderings<String> get id => $state.composableBuilder(
      column: $state.table.id,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get productId => $state.composableBuilder(
      column: $state.table.productId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get warehouseId => $state.composableBuilder(
      column: $state.table.warehouseId,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get quantity => $state.composableBuilder(
      column: $state.table.quantity,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get toFulfill => $state.composableBuilder(
      column: $state.table.toFulfill,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get orderToFulfill => $state.composableBuilder(
      column: $state.table.orderToFulfill,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get available => $state.composableBuilder(
      column: $state.table.available,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get entry => $state.composableBuilder(
      column: $state.table.entry,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get exit => $state.composableBuilder(
      column: $state.table.exit,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<double> get stockValue => $state.composableBuilder(
      column: $state.table.stockValue,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastPurchaseDate => $state.composableBuilder(
      column: $state.table.lastPurchaseDate,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get lastSaleDate => $state.composableBuilder(
      column: $state.table.lastSaleDate,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get daysWithoutPurchase => $state.composableBuilder(
      column: $state.table.daysWithoutPurchase,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get daysWithoutSale => $state.composableBuilder(
      column: $state.table.daysWithoutSale,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get serverOrigin => $state.composableBuilder(
      column: $state.table.serverOrigin,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<DateTime> get updatedAt => $state.composableBuilder(
      column: $state.table.updatedAt,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<String> get syncStatus => $state.composableBuilder(
      column: $state.table.syncStatus,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get lastModified => $state.composableBuilder(
      column: $state.table.lastModified,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));

  ColumnOrderings<int> get syncVersion => $state.composableBuilder(
      column: $state.table.syncVersion,
      builder: (column, joinBuilders) =>
          ColumnOrderings(column, joinBuilders: joinBuilders));
}

class $LocalDatabaseManager {
  final _$LocalDatabase _db;
  $LocalDatabaseManager(this._db);
  $$ProductsTableTableManager get products =>
      $$ProductsTableTableManager(_db, _db.products);
  $$InventoryTableTableManager get inventory =>
      $$InventoryTableTableManager(_db, _db.inventory);
}
