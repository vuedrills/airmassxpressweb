// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auction_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Auction _$AuctionFromJson(Map<String, dynamic> json) => Auction(
  id: (json['id'] as num).toInt(),
  userId: (json['user_id'] as num).toInt(),
  townId: (json['town_id'] as num?)?.toInt(),
  categoryId: (json['category_id'] as num).toInt(),
  title: json['title'] as String,
  description: json['description'] as String,
  startPrice: (json['start_price'] as num).toDouble(),
  currentPrice: (json['current_price'] as num).toDouble(),
  bidCount: (json['bid_count'] as num).toInt(),
  status: json['status'] as String,
  scope: json['scope'] as String,
  startTime: json['start_time'] == null
      ? null
      : DateTime.parse(json['start_time'] as String),
  endTime: json['end_time'] == null
      ? null
      : DateTime.parse(json['end_time'] as String),
);

Map<String, dynamic> _$AuctionToJson(Auction instance) => <String, dynamic>{
  'id': instance.id,
  'user_id': instance.userId,
  'town_id': instance.townId,
  'category_id': instance.categoryId,
  'title': instance.title,
  'description': instance.description,
  'start_price': instance.startPrice,
  'current_price': instance.currentPrice,
  'bid_count': instance.bidCount,
  'status': instance.status,
  'scope': instance.scope,
  'start_time': instance.startTime?.toIso8601String(),
  'end_time': instance.endTime?.toIso8601String(),
};
