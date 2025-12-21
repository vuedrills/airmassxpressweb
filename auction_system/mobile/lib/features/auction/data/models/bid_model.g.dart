// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bid_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Bid _$BidFromJson(Map<String, dynamic> json) => Bid(
  id: (json['id'] as num).toInt(),
  auctionId: (json['auction_id'] as num).toInt(),
  userId: (json['user_id'] as num).toInt(),
  amount: (json['amount'] as num).toDouble(),
  createdAt: DateTime.parse(json['created_at'] as String),
  auction: json['auction'] == null
      ? null
      : Auction.fromJson(json['auction'] as Map<String, dynamic>),
);

Map<String, dynamic> _$BidToJson(Bid instance) => <String, dynamic>{
  'id': instance.id,
  'auction_id': instance.auctionId,
  'user_id': instance.userId,
  'amount': instance.amount,
  'created_at': instance.createdAt.toIso8601String(),
  'auction': instance.auction,
};
