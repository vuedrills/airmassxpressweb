import 'package:json_annotation/json_annotation.dart';

part 'category_model.g.dart';

@JsonSerializable()
class Category {
  final int id;
  final String name;
  final String slug;
  
  @JsonKey(name: 'duration_days')
  final int durationDays;

  @JsonKey(name: 'max_active_slots_per_town')
  final int? maxActiveSlotsPerTown;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    required this.durationDays,
    this.maxActiveSlotsPerTown,
  });

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryToJson(this);
}
