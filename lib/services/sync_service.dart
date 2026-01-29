import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:drift/drift.dart';
import '../core/config/supabase_config.dart';
import '../data/datasources/local/database.dart';

class SyncService {
  final LocalDatabase db;
  SupabaseClient get client => SupabaseConfig.client;

  SyncService(this.db);

  /// Obtiene las sesiones de inventario activas para un almacén
  Future<List<Map<String, dynamic>>> getActiveSessions(
      String warehouseId) async {
    try {
      final response = await client
          .from('inventory_sessions')
          .select()
          .eq('warehouse_id', warehouseId)
          .eq('status', 'active')
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      // Si la tabla no existe o hay error, retornamos lista vacía para no bloquear
      return [];
    }
  }

  /// Crea una nueva sesión de inventario
  Future<String> createSession(String name, String warehouseId) async {
    try {
      final response = await client
          .from('inventory_sessions')
          .insert({
            'name': name,
            'warehouse_id': warehouseId,
            'created_by': client.auth.currentUser?.id,
            'status': 'active'
          })
          .select()
          .single();
      return response['id'];
    } catch (e) {
      if (e.toString().contains('unique constraint') ||
          e.toString().contains('inventory_sessions_name_warehouse_unique')) {
        throw Exception(
            'Ya existe un inventario con el nombre "$name" en este almacén. Por favor elige otro nombre.');
      }
      throw Exception('Error al crear sesión de inventario: $e');
    }
  }

  /// Cierra una sesión de inventario
  Future<void> closeSession(String sessionId) async {
    try {
      await client.from('inventory_sessions').update({
        'status': 'closed',
        'closed_at': DateTime.now().toIso8601String(),
      }).eq('id', sessionId);
    } catch (e) {
      throw Exception('Error al cerrar sesión de inventario: $e');
    }
  }

  /// Descarga el inventario del almacén desde Supabase y lo guarda localmente.
  /// Esto sobrescribirá los datos locales para ese almacén.
  /// Si se proporciona [sessionId], también se descargarán los conteos previos de esa sesión.
  /// Si [clearExistingCounts] es true, NO se preservarán los conteos locales previos (para nuevas sesiones).
  Future<void> downloadInventory(String warehouseId,
      {String? sessionId, bool clearExistingCounts = false}) async {
    try {
      // 1. Obtener datos de Supabase (Catálogo/Stock Sistema)
      final response = await client
          .from('inventario')
          .select('*')
          .eq('Almacen', warehouseId)
          .gt('Disponible',
              0); // Solo descargar artículos con disponible mayor a cero

      final List<dynamic> data = response as List<dynamic>;

      // 1.1 Obtener conteos previos de la sesión (si existe)
      Map<String, Map<String, dynamic>> sessionCounts = {};
      if (sessionId != null) {
        try {
          final countsResponse = await client
              .from('conteo_inventario')
              .select('product_id, quantity, notes')
              .eq('session_id', sessionId);

          for (var item in (countsResponse as List)) {
            if (item['product_id'] != null) {
              sessionCounts[item['product_id']] = item;
            }
          }
        } catch (e) {
          // Si falla la carga de conteos, continuamos con el inventario base
          // pero logueamos el error
          print('Error cargando conteos de sesión: $e');
        }
      }

      // 2. Guardar en base de datos local (Transacción para asegurar consistencia)
      await db.transaction(() async {
        // A. Preservar conteos físicos locales existentes (que no se han subido aún)
        // SOLO si NO estamos limpiando explícitamente (clearExistingCounts == false)
        final Map<String, LocalInventoryData> preservedItems = {};

        if (!clearExistingCounts) {
          final existingCounts = await (db.select(db.localInventory)
                ..where((t) =>
                    t.warehouseId.equals(warehouseId) &
                    t.physicalStock.isNotNull()))
              .get();

          for (var item in existingCounts) {
            preservedItems[item.productId] = item;
          }
        }

        // B. Eliminar datos anteriores del almacén
        await (db.delete(db.localInventory)
              ..where((t) => t.warehouseId.equals(warehouseId)))
            .go();

        // C. Insertar datos descargados fusionando con conteos preservados y de sesión
        await db.batch((batch) {
          for (final item in data) {
            final productId = item['ProductId']?.toString() ?? '';
            final preserved = preservedItems[productId];
            final sessionCount = sessionCounts[productId];

            // Prioridad:
            // 1. Conteo Local Preservado (cambios recientes no subidos)
            // 2. Conteo de Sesión Remota (ya sincronizado)
            // 3. Null (sin conteo)

            int? physicalStock;
            String? notes;
            bool isSynced = true;

            if (preserved != null) {
              physicalStock = preserved.physicalStock;
              notes = preserved.notes;
              isSynced = preserved.isSynced;
            } else if (sessionCount != null) {
              physicalStock = sessionCount['quantity'] as int?;
              notes = sessionCount['notes'] as String?;
              isSynced = true; // Viene del servidor, así que está sincronizado
            }

            batch.insert(
              db.localInventory,
              LocalInventoryCompanion(
                productId: Value(productId),
                warehouseId: Value(item['Almacen']?.toString() ?? ''),
                code: Value(item['Codigo']?.toString()),
                description: Value(item['Descripcion']?.toString() ?? ''),
                category: Value(item['Categoria']?.toString()),
                brand: Value(item['Marca']?.toString()),
                stock: Value(item['Existencia'] is int
                    ? item['Existencia']
                    : (item['Existencia'] as num?)?.toInt() ?? 0),
                physicalStock: Value(physicalStock),
                available: Value(item['Disponible'] is int
                    ? item['Disponible']
                    : (item['Disponible'] as num?)?.toInt() ?? 0),
                notes: Value(notes),
                isSynced: Value(isSynced),
                lastUpdated: Value(DateTime.now()),
              ),
              mode: InsertMode.insertOrReplace,
            );

            // Remover de las listas para saber cuáles sobraron (si aplica)
            preservedItems.remove(productId);
            sessionCounts.remove(productId);
          }

          // D. Re-insertar items que tenían conteo pero no vinieron en la descarga
          // (Ej. items que ahora tienen disponible=0 en sistema pero fueron contados)

          // D1. Primero los locales preservados
          for (final preserved in preservedItems.values) {
            batch.insert(
              db.localInventory,
              preserved.toCompanion(true),
              mode: InsertMode.insertOrReplace,
            );
          }

          // D2. (Opcional) Podríamos insertar los items de la sesión que no están en el inventario descargado
          // Pero requeriría tener todos los datos del producto.
          // Por ahora, asumimos que si no está en el inventario descargado (stock>0),
          // tal vez no deberíamos mostrarlo, o no tenemos info para mostrarlo.
          // Sin embargo, si se contó, debería aparecer.
          // Como no tenemos la info completa del producto en conteo_inventario, no podemos crearlo completamente.
          // Una mejora futura sería guardar snapshot del producto en conteo_inventario.
        });
      });
    } catch (e) {
      throw Exception('Error al descargar inventario: $e');
    }
  }

  /// Sube los cambios locales pendientes a Supabase.
  Future<void> syncUp(String warehouseId, String sessionId) async {
    try {
      // 1. Obtener items con cambios pendientes
      final pendingItems = await (db.select(db.localInventory)
            ..where((t) =>
                t.warehouseId.equals(warehouseId) & t.isSynced.equals(false)))
          .get();

      if (pendingItems.isEmpty) return;

      // 2. Subir cada cambio a Supabase (Tabla de conteo físico)
      for (final item in pendingItems) {
        // Solo subir si hay un conteo físico registrado
        if (item.physicalStock != null) {
          await client.from('conteo_inventario').upsert({
            'session_id': sessionId,
            'warehouse_id': item.warehouseId,
            'product_id': item.productId,
            'quantity': item.physicalStock,
            'system_stock':
                item.stock, // Snapshot del stock teórico al momento del conteo
            'notes': item.notes,
            'user_id': client.auth.currentUser?.id,
            'updated_at': DateTime.now().toIso8601String(),
          }, onConflict: 'session_id, product_id, warehouse_id');
        }

        // 3. Marcar como sincronizado localmente
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
