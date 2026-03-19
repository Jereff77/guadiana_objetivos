import 'dart:io';
import 'package:supabase/supabase.dart';

Future<void> main(List<String> args) async {
  final url = _arg(args, '--url') ?? Platform.environment['SUPABASE_URL'] ?? '';
  final key = _arg(args, '--key') ?? Platform.environment['SUPABASE_ANON_KEY'] ?? '';
  if (url.isEmpty || key.isEmpty) {
    stderr.writeln('Faltan --url y/o --key');
    exit(1);
  }
  final client = SupabaseClient(url, key);
  try {
    await client.from('inventory_movements').delete().neq('product_id', '');
    await client.from('inventory').delete().neq('id', '');
    await client.from('products').delete().neq('id', '');
    await client.from('categories').delete().neq('id', '');
    await client.from('warehouses').delete().neq('id', '');
    stdout.writeln('Registros demo eliminados.');
  } catch (e) {
    stderr.writeln('Error al eliminar: $e');
    exit(2);
  }
}

String? _arg(List<String> args, String key) {
  for (final a in args) {
    if (a.startsWith('$key=')) return a.substring(key.length + 1);
  }
  return null;
}
