enum NotificationType {
  outbid,
  won,
  ending_soon,
  new_bid,
  auction_ended,
  welcome,
}

class AppNotification {
  final int id;
  final String title;
  final String message;
  final NotificationType type;
  final int? auctionId;
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.auctionId,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as int,
      title: json['title'] as String,
      message: json['message'] as String,
      type: _parseType(json['type'] as String),
      auctionId: json['auction_id'] as int?,
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  static NotificationType _parseType(String type) {
    switch (type) {
      case 'outbid':
        return NotificationType.outbid;
      case 'won':
        return NotificationType.won;
      case 'ending_soon':
        return NotificationType.ending_soon;
      case 'new_bid':
        return NotificationType.new_bid;
      case 'auction_ended':
        return NotificationType.auction_ended;
      case 'welcome':
        return NotificationType.welcome;
      default:
        return NotificationType.welcome;
    }
  }
}
