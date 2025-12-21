import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/notification/data/models/notification_model.dart';
import 'package:mobile/features/notification/presentation/providers/notification_provider.dart';
import 'package:timeago/timeago.dart' as timeago;

class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Text(
          "Notifications",
          style: GoogleFonts.outfit(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () async {
              HapticFeedback.mediumImpact();
              await ref.read(notificationRepositoryProvider).markAllAsRead();
              ref.invalidate(notificationsProvider);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('All notifications marked as read')),
                );
              }
            },
            child: Text(
              "Mark all read",
              style: GoogleFonts.inter(
                color: Colors.blue,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    "No notifications yet",
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "We'll notify you when something happens",
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.grey[500],
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: notifications.length,
            separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey[200]),
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return _NotificationTile(notification: notification);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text("Error: $e")),
      ),
    );
  }
}

class _NotificationTile extends ConsumerWidget {
  final AppNotification notification;

  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      color: notification.isRead ? Colors.white : Colors.blue.withOpacity(0.05),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: _getIconBackgroundColor(),
            shape: BoxShape.circle,
          ),
          child: Icon(
            _getIcon(),
            color: _getIconColor(),
            size: 24,
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                notification.title,
                style: GoogleFonts.inter(
                  fontWeight: notification.isRead ? FontWeight.w500 : FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            if (!notification.isRead)
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              notification.message,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: Colors.grey[700],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              timeago.format(notification.createdAt),
              style: GoogleFonts.inter(
                fontSize: 11,
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
        onTap: () async {
          if (!notification.isRead) {
            await ref.read(notificationRepositoryProvider).markAsRead(notification.id);
            ref.invalidate(notificationsProvider);
          }
          if (notification.auctionId != null) {
            context.push('/auction/${notification.auctionId}');
          }
        },
      ),
    );
  }

  IconData _getIcon() {
    switch (notification.type) {
      case NotificationType.outbid:
        return Icons.trending_up;
      case NotificationType.won:
        return Icons.emoji_events;
      case NotificationType.ending_soon:
        return Icons.timer;
      case NotificationType.new_bid:
        return Icons.gavel;
      case NotificationType.auction_ended:
        return Icons.check_circle;
      case NotificationType.welcome:
        return Icons.waving_hand;
    }
  }

  Color _getIconColor() {
    switch (notification.type) {
      case NotificationType.outbid:
        return Colors.orange[700]!;
      case NotificationType.won:
        return Colors.green[700]!;
      case NotificationType.ending_soon:
        return Colors.red[700]!;
      case NotificationType.new_bid:
        return Colors.blue[700]!;
      case NotificationType.auction_ended:
        return Colors.grey[700]!;
      case NotificationType.welcome:
        return Colors.purple[700]!;
    }
  }

  Color _getIconBackgroundColor() {
    switch (notification.type) {
      case NotificationType.outbid:
        return Colors.orange[50]!;
      case NotificationType.won:
        return Colors.green[50]!;
      case NotificationType.ending_soon:
        return Colors.red[50]!;
      case NotificationType.new_bid:
        return Colors.blue[50]!;
      case NotificationType.auction_ended:
        return Colors.grey[100]!;
      case NotificationType.welcome:
        return Colors.purple[50]!;
    }
  }
}
