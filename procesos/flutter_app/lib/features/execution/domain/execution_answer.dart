class ExecutionAnswer {
  const ExecutionAnswer({
    this.boolValue,
    this.textValue,
    this.numberValue,
    this.dateValue,
    this.optionIds,
    this.comment,
  });

  final bool? boolValue;
  final String? textValue;
  final double? numberValue;
  final DateTime? dateValue;
  final List<String>? optionIds;
  final String? comment;

  ExecutionAnswer copyWith({
    bool? boolValue,
    String? textValue,
    double? numberValue,
    DateTime? dateValue,
    List<String>? optionIds,
    String? comment,
  }) {
    return ExecutionAnswer(
      boolValue: boolValue ?? this.boolValue,
      textValue: textValue ?? this.textValue,
      numberValue: numberValue ?? this.numberValue,
      dateValue: dateValue ?? this.dateValue,
      optionIds: optionIds ?? this.optionIds,
      comment: comment ?? this.comment,
    );
  }

  bool get hasAnyValue =>
      boolValue != null ||
      textValue != null ||
      numberValue != null ||
      dateValue != null ||
      (optionIds != null && optionIds!.isNotEmpty) ||
      (comment != null && comment!.isNotEmpty);
}

