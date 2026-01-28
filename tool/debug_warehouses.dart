import 'dart:io';
import 'package:supabase/supabase.dart';
import 'package:args/args.dart';

void main(List<String> args) async {
  final parser = ArgParser()
    ..addOption('url')
    ..addOption('key');

  final results = parser.parse(args);
  final url = results['url'];
  final key = results['key'];

  if (url == null || key == null) {
    stdout.writeln('Faltan argumentos');
    return;
  }

  final client = SupabaseClient(url, key);

  try {
    // 1. Contar total de filas
    final count = await client.from('inventario').count();
    stdout.writeln('Total de filas en inventario: $count');

    // 2. Intentar obtener una muestra de almacenes
    // Sin distinct, PostgREST devuelve filas duplicadas.
    // Si hay muchos datos, solo veremos los primeros 1000.
    final res = await client.from('inventario').select('Almacen').limit(100);
    final almacenes = (res as List).map((e) => e['Almacen']).toSet();
    stdout.writeln('Muestra de primeros 100 almacenes (unique): $almacenes');

    // 3. Intentar obtener todos usando rangos si es necesario, pero mejor ver si podemos usar .distinct() simulado o group
    // PostgREST no soporta DISTINCT directo en select fácil sin modificadores.
    // Pero si usamos un RPC sería ideal.

    // Verifiquemos si hay otros valores haciendo queries especificas si conocemos nombres,
    // pero como no sabemos, intentemos ordenar descendente a ver si sale otro.
    final resDesc = await client
        .from('inventario')
        .select('Almacen')
        .order('Almacen', ascending: false)
        .limit(50);
    final almacenesDesc = (resDesc as List).map((e) => e['Almacen']).toSet();
    stdout.writeln('Muestra de últimos 50 almacenes (unique): $almacenesDesc');
  } catch (e) {
    stderr.writeln('Error: $e');
  }
}
