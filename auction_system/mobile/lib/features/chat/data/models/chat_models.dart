import 'package:json_annotation/json_annotation.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';

part 'chat_models.g.dart';

@JsonSerializable()
class Conversation {
  final int id;
  @JsonKey(name: 'auction_id')
  final int auctionId;
  @JsonKey(name: 'buyer_id')
  final int buyerId;
  @JsonKey(name: 'seller_id')
  final int sellerId;
  @JsonKey(name: 'last_message')
  final String? lastMessage;
  @JsonKey(name: 'last_message_at')
  final DateTime? lastMessageAt;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  final User? buyer;
  final User? seller;
  final Auction? auction;

  Conversation({
    required this.id,
    required this.auctionId,
    required this.buyerId,
    required this.sellerId,
    this.lastMessage,
    this.lastMessageAt,
    required this.createdAt,
    this.buyer,
    this.seller,
    this.auction,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) => _$ConversationFromJson(json);
  Map<String, dynamic> toJson() => _$ConversationToJson(this);
}

@JsonSerializable()
class Message {
  final int id;
  @JsonKey(name: 'conversation_id')
  final int conversationId;
  @JsonKey(name: 'sender_id')
  final int senderId;
  final String content;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'is_read')
  final bool isRead;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  final User? sender;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.imageUrl,
    this.isRead = false,
    required this.createdAt,
    this.sender,
  });

  factory Message.fromJson(Map<String, dynamic> json) => _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);
}
