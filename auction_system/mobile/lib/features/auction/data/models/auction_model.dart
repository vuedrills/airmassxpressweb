import 'package:json_annotation/json_annotation.dart';

part 'auction_model.g.dart';

@JsonSerializable()
class Auction {
  final int id;
  @JsonKey(name: 'user_id')
  final int userId;
  @JsonKey(name: 'town_id')
  final int? townId;
  @JsonKey(name: 'category_id')
  final int categoryId;
  final String title;
  final String description;
  @JsonKey(name: 'start_price')
  final double startPrice;
  @JsonKey(name: 'current_price')
  final double currentPrice;
  @JsonKey(name: 'bid_count')
  final int bidCount;
  final String status;
  final String scope;
  @JsonKey(name: 'start_time')
  final DateTime? startTime;
  @JsonKey(name: 'end_time')
  final DateTime? endTime;
  
  // Images might be complex in GORM (datatypes.JSON), but for MVP we sent separate input images.
  // The backend might need to surface images in the response.
  // For now, let's assume we might get a list of strings or null.
  // Update Backend if needed. For now, using placeholder logic in UI if null.
  @JsonKey(name: 'images')
  final List<String>? images;

  Auction({
    required this.id,
    required this.userId,
    this.townId,
    required this.categoryId,
    required this.title,
    required this.description,
    required this.startPrice,
    required this.currentPrice,
    required this.bidCount,
    required this.status,
    required this.scope,
    this.startTime,
    this.endTime,
    this.images,
  });

  factory Auction.fromJson(Map<String, dynamic> json) => _$AuctionFromJson(json);
  Map<String, dynamic> toJson() => _$AuctionToJson(this);

  Auction copyWith({
    int? id,
    int? userId,
    int? townId,
    int? categoryId,
    String? title,
    String? description,
    double? startPrice,
    double? currentPrice,
    int? bidCount,
    String? status,
    String? scope,
    DateTime? startTime,
    DateTime? endTime,
    List<String>? images,
  }) {
    return Auction(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      townId: townId ?? this.townId,
      categoryId: categoryId ?? this.categoryId,
      title: title ?? this.title,
      description: description ?? this.description,
      startPrice: startPrice ?? this.startPrice,
      currentPrice: currentPrice ?? this.currentPrice,
      bidCount: bidCount ?? this.bidCount,
      status: status ?? this.status,
      scope: scope ?? this.scope,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      images: images ?? this.images,
    );
  }
}
