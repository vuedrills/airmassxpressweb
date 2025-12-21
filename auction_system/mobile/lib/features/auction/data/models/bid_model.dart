import 'package:json_annotation/json_annotation.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';

part 'bid_model.g.dart';

@JsonSerializable()
class Bid {
  final int id;
  @JsonKey(name: 'auction_id')
  final int auctionId;
  @JsonKey(name: 'user_id')
  final int userId;
  final double amount;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  
  final Auction? auction; // Preloaded

  Bid({
    required this.id,
    required this.auctionId,
    required this.userId,
    required this.amount,
    required this.createdAt,
    this.auction,
  });

  factory Bid.fromJson(Map<String, dynamic> json) => _$BidFromJson(json);
  Map<String, dynamic> toJson() => _$BidToJson(this);
}
