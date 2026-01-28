import 'package:flutter_test/flutter_test.dart';
import 'package:guadiana_app/core/config/allowed_domains.dart';

void main() {
  group('AllowedDomains', () {
    test('permite dominios en la lista blanca', () {
      expect(AllowedDomains.isEmailAllowed('user@llantasyrinesdelguadiana.com'), isTrue);
      expect(AllowedDomains.isEmailAllowed('admin@aceleremos.com'), isTrue);
    });

    test('bloquea dominios no permitidos', () {
      expect(AllowedDomains.isEmailAllowed('user@gmail.com'), isFalse);
      expect(AllowedDomains.isEmailAllowed('user@hotmail.com'), isFalse);
      expect(AllowedDomains.isEmailAllowed('user@otrodominio.com'), isFalse);
    });

    test('es insensible a mayúsculas y minúsculas', () {
      expect(AllowedDomains.isEmailAllowed('User@LlantasYRinesDelGuadiana.com'), isTrue);
      expect(AllowedDomains.isEmailAllowed('ADMIN@ACELEREMOS.COM'), isTrue);
    });

    test('maneja emails inválidos', () {
      expect(AllowedDomains.isEmailAllowed('invalid-email'), isFalse);
      expect(AllowedDomains.isEmailAllowed(''), isFalse);
      expect(AllowedDomains.isEmailAllowed('@aceleremos.com'), isTrue); // Técnicamente válido dominio, aunque email raro
      expect(AllowedDomains.isEmailAllowed('user@'), isFalse);
    });
  });
}
