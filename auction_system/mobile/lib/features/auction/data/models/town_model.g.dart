// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'town_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Town _$TownFromJson(Map<String, dynamic> json) => Town(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  slug: json['slug'] as String?,
);

Map<String, dynamic> _$TownToJson(Town instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'slug': instance.slug,
};

CategoryWithCount _$CategoryWithCountFromJson(Map<String, dynamic> json) =>
    CategoryWithCount(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      slug: json['slug'] as String,
      auctionCount: (json['auction_count'] as num).toInt(),
    );

Map<String, dynamic> _$CategoryWithCountToJson(CategoryWithCount instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': instance.slug,
      'auction_count': instance.auctionCount,
    };
