import 'package:mobile/features/auth/data/models/user_model.dart';

class Comment {
  final int id;
  final int auctionId;
  final int userId;
  final User? user; // Nullable if backend doesn't send full user object immediately (though it does with Preload)
  final String content;
  final DateTime createdAt;

  Comment({
    required this.id,
    required this.auctionId,
    required this.userId,
    this.user,
    required this.content,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'],
      auctionId: json['auction_id'],
      userId: json['user_id'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      content: json['content'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
