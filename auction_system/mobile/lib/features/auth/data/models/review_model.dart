
class Review {
  final int id;
  final int rating;
  final String content;
  final DateTime createdAt;
  final Reviewer? reviewer;

  Review({
    required this.id,
    required this.rating,
    required this.content,
    required this.createdAt,
    this.reviewer,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      rating: json['rating'],
      content: json['content'],
      createdAt: DateTime.parse(json['created_at']),
      reviewer: json['reviewer'] != null ? Reviewer.fromJson(json['reviewer']) : null,
    );
  }
}

class Reviewer {
  final int id;
  final String username;
  final String? avatarUrl;

  Reviewer({required this.id, required this.username, this.avatarUrl});

  factory Reviewer.fromJson(Map<String, dynamic> json) {
    return Reviewer(
      id: json['id'],
      username: json['username'],
      avatarUrl: json['avatar_url'],
    );
  }
}
