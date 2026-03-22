class Survey {
  const Survey({
    required this.id,
    required this.name,
    required this.status,
    this.description,
    this.category,
    this.version,
  });

  final String id;
  final String name;
  final String status;
  final String? description;
  final String? category;
  final int? version;

  factory Survey.fromJson(Map<String, dynamic> json) {
    return Survey(
      id: json['id'] as String,
      name: json['name'] as String,
      status: json['status'] as String,
      description: json['description'] as String?,
      category: json['category'] as String?,
      version: json['version'] != null
          ? (json['version'] as num).toInt()
          : null,
    );
  }
}
