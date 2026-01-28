import 'dart:io';
import 'package:supabase/supabase.dart';
import 'package:args/args.dart';

void main(List<String> args) async {
  final parser = ArgParser()
    ..addOption('url', help: 'Supabase Project URL')
    ..addOption('key', help: 'Supabase Service Role Key (necesaria para borrar/crear)');

  final results = parser.parse(args);
  final url = results['url'];
  final key = results['key'];

  if (url == null || key == null) {
    print('Uso: dart run tool/import_csv.dart --url=... --key=...');
    return;
  }

  final client = SupabaseClient(url, key);

  try {
    print('1. Limpiando datos antiguos...');
    // Intentamos borrar todas las tablas normalizadas anteriores si existen
    final tables = ['inventory_movements', 'inventory', 'products', 'categories', 'warehouses', 'inventario'];
    for (var table in tables) {
      try {
        await client.from(table).delete().neq('Almacen', '___non_existent___');
      } catch (_) {
        // Ignorar si la tabla no existe aún
      }
    }

    print('2. Leyendo CSV...');
    final file = File('documentos/fragmento inventario (1).csv');
    if (!file.existsSync()) {
      print('Error: No se encontró el archivo CSV en documentos/');
      return;
    }

    final lines = await file.readAsLines();
    if (lines.isEmpty) return;

    final headers = lines.first.split(',');
    print('Columnas detectadas: $headers');

    final rows = lines.skip(1).map((line) {
      final values = _splitCsvLine(line);
      final map = <String, dynamic>{};
      for (var i = 0; i < headers.length; i++) {
        var val = values[i].trim();
        // Limpieza básica de valores
        if (val.isEmpty) {
          map[headers[i]] = null;
        } else if (val == 'FALSO') {
          map[headers[i]] = false;
        } else if (val == 'VERDADERO') {
          map[headers[i]] = true;
        } else {
          // Intentar parsear números
          final numVal = num.tryParse(val);
          if (numVal != null) {
            map[headers[i]] = numVal;
          } else {
            map[headers[i]] = val;
          }
        }
      }
      return map;
    }).toList();

    print('3. Insertando ${rows.length} registros en tabla "inventario"...');
    // Insertamos en bloques para evitar límites de payload
    const chunkSize = 50;
    for (var i = 0; i < rows.length; i += chunkSize) {
      final end = (i + chunkSize < rows.length) ? i + chunkSize : rows.length;
      final chunk = rows.sublist(i, end);
      await client.from('inventario').insert(chunk);
      print('   Progreso: $end / ${rows.length}');
    }

    print('¡Importación completada con éxito!');
  } catch (e) {
    print('Error durante la importación: $e');
  }
}

List<String> _splitCsvLine(String line) {
  final result = <String>[];
  var current = StringBuffer();
  var inQuotes = false;

  for (var i = 0; i < line.length; i++) {
    final char = line[i];
    if (char == '"') {
      inQuotes = !inQuotes;
    } else if (char == ',' && !inQuotes) {
      result.add(current.toString());
      current.clear();
    } else {
      current.write(char);
    }
  }
  result.add(current.toString());
  return result;
}
