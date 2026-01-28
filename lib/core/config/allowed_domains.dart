class AllowedDomains {
  static const List<String> domains = [
    'llantasyrinesdelguadiana.com',
    'aceleremos.com',
  ];

  static bool isEmailAllowed(String email) {
    if (!email.contains('@')) return false;
    final domain = email.split('@').last.toLowerCase();
    // Verifica si el dominio está en la lista o es un subdominio de alguno permitido (opcional, aquí estricto)
    return domains.contains(domain);
  }
}
