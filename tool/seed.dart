import 'dart:io';
import 'package:supabase/supabase.dart';
import 'package:uuid/uuid.dart';

Future<void> main(List<String> args) async {
  final urlArg = _argValue(args, '--url');
  final keyArg = _argValue(args, '--key');
  final url = urlArg?.isNotEmpty == true ? urlArg! : Platform.environment['SUPABASE_URL'] ?? '';
  final key = keyArg?.isNotEmpty == true ? keyArg! : Platform.environment['SUPABASE_ANON_KEY'] ?? '';
  if (url.isEmpty || key.isEmpty) {
    stderr.writeln('Faltan --url o --key');
    exit(1);
  }
  final client = SupabaseClient(url, key);
  try {
    final existingWarehouses = await client.from('warehouses').select('id,name').limit(1);
    if ((existingWarehouses as List).isNotEmpty) {
      stdout.writeln('Ya existen almacenes, se omitirá creación básica.');
    } else {
      final w1 = {'name': 'Almacén Central', 'code': 'ALM-CEN', 'address': 'Av. Principal 123', 'is_active': true};
      final w2 = {'name': 'Almacén Norte', 'code': 'ALM-NOR', 'address': 'Calle Norte 45', 'is_active': true};
      await client.from('warehouses').insert([w1, w2]);
      stdout.writeln('Almacenes creados.');
    }
    final warehouses = await client.from('warehouses').select('id,name').limit(2);
    if ((warehouses as List).isEmpty) {
      stderr.writeln('No se pudieron obtener almacenes.');
      exit(2);
    }
    final warehouseId = warehouses.first['id'] as String;
    final existingCats = await client.from('categories').select('id').eq('warehouse_id', warehouseId).limit(1);
    if ((existingCats as List).isEmpty) {
      final cat1 = {'name': 'Electrónica', 'warehouse_id': warehouseId};
      final cat2 = {'name': 'Ferretería', 'warehouse_id': warehouseId};
      await client.from('categories').insert([cat1, cat2]);
      stdout.writeln('Categorías creadas.');
    }
    final categories = await client.from('categories').select('id,name').eq('warehouse_id', warehouseId);
    final categoryId = (categories as List).isNotEmpty ? categories.first['id'] as String : null;
    final prodCheck = await client.from('products').select('id').eq('warehouse_id', warehouseId).limit(1);
    if ((prodCheck as List).isEmpty) {
      final now = DateTime.now().toIso8601String();
      final p1 = {
        'sku': 'SKU-0001',
        'name': 'Taladro Inalámbrico',
        'description': 'Taladro 18V con batería',
        'category_id': categoryId,
        'brand': 'ToolPro',
        'stock_max': 100,
        'stock_min': 5,
        'is_active': true,
        'warehouse_id': warehouseId,
        'updated_at': now
      };
      final p2 = {
        'sku': 'SKU-0002',
        'name': 'Cámara IP',
        'description': 'Cámara de seguridad WiFi',
        'category_id': categoryId,
        'brand': 'SecureCam',
        'stock_max': 200,
        'stock_min': 10,
        'is_active': true,
        'warehouse_id': warehouseId,
        'updated_at': now
      };
      final inserted = await client.from('products').insert([p1, p2]).select('id,sku');
      stdout.writeln('Productos creados: $inserted');
      const uuid = Uuid();
      for (final pr in inserted as List) {
        final pid = pr['id'] as String;
        final invRow = {
          'id': uuid.v4(),
          'product_id': pid,
          'warehouse_id': warehouseId,
          'quantity': 20,
          'available': 20,
          'updated_at': DateTime.now().toIso8601String()
        };
        await client.from('inventory').insert(invRow);
      }
      stdout.writeln('Inventario creado para productos.');
    } else {
      stdout.writeln('Ya existen productos, se omite creación.');
    }
    stdout.writeln('Seed finalizado correctamente.');
  } catch (e) {
    stderr.writeln('Error durante seed: $e');
    exit(3);
  }
}

String? _argValue(List<String> args, String key) {
  for (final a in args) {
    if (a.startsWith('$key=')) {
      return a.substring(key.length + 1);
    }
  }
  return null;
}
