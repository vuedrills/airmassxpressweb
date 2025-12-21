import 'package:json_annotation/json_annotation.dart';

part 'town_model.g.dart';

@JsonSerializable()
class Town {
  final int id;
  final String name;
  final String? slug;

  Town({required this.id, required this.name, this.slug});

  factory Town.fromJson(Map<String, dynamic> json) => _$TownFromJson(json);
  Map<String, dynamic> toJson() => _$TownToJson(this);
}

@JsonSerializable()
class CategoryWithCount {
  final int id;
  final String name;
  final String slug;
  
  @JsonKey(name: 'auction_count')
  final int auctionCount;

  CategoryWithCount({
    required this.id,
    required this.name,
    required this.slug,
    required this.auctionCount,
  });

  factory CategoryWithCount.fromJson(Map<String, dynamic> json) => _$CategoryWithCountFromJson(json);
  Map<String, dynamic> toJson() => _$CategoryWithCountToJson(this);
}
