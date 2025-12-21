import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile/features/notification/data/models/notification_model.dart';
import 'dart:io';

// Repository for notification API calls
class NotificationRepository {
  final String? token;
  NotificationRepository(this.token);

  String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  Future<List<AppNotification>> getNotifications() async {
    if (token == null) {
      throw Exception('Please log in to view notifications');
    }

    final response = await http.get(
      Uri.parse('$baseUrl/users/me/notifications'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => AppNotification.fromJson(json)).toList();
    } else if (response.statusCode == 401) {
      throw Exception('Session expired. Please log in again');
    } else {
      throw Exception('Failed to load notifications');
    }
  }

  Future<void> markAsRead(int notificationId) async {
    if (token == null) return;

    await http.patch(
      Uri.parse('$baseUrl/notifications/$notificationId/read'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
  }

  Future<void> markAllAsRead() async {
    if (token == null) return;

    await http.patch(
      Uri.parse('$baseUrl/notifications/read-all'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
  }
}

// Provider for notification repository
final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  final authState = ref.watch(authProvider);
  return NotificationRepository(authState.token);
});

// Fetch notifications from API
final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final repo = ref.watch(notificationRepositoryProvider);
  return repo.getNotifications();
});

// Unread count provider
final unreadNotificationCountProvider = Provider<int>((ref) {
  final notificationsAsync = ref.watch(notificationsProvider);
  return notificationsAsync.when(
    data: (notifications) => notifications.where((n) => !n.isRead).length,
    loading: () => 0,
    error: (_, __) => 0,
  );
});
