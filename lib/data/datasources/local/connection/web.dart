import 'package:drift/drift.dart';
import 'package:drift/web.dart';

LazyDatabase connect() {
  return LazyDatabase(() async {
    return WebDatabase('guadiana_inventory_v3');
  });
}
