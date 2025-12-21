import 'dart:convert';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:rxdart/rxdart.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';

final realTimeProvider = Provider<RealTimeService>((ref) {
  final service = RealTimeService();
  final authState = ref.watch(authProvider);
  if (authState.token != null) {
    service.connect(authState.token!);
  }
  return service;
});

final realTimeEventsProvider = StreamProvider<Map<String, dynamic>>((ref) {
  final service = ref.watch(realTimeProvider);
  return service.events;
});

class RealTimeService {
  WebSocketChannel? _channel;
  final _eventSubject = PublishSubject<Map<String, dynamic>>();

  Stream<Map<String, dynamic>> get events => _eventSubject.stream;

  void connect(String token) {
    if (_channel != null) return; // Already connected

    final baseUrl = Platform.isAndroid 
        ? '10.0.2.2:8080' 
        : '127.0.0.1:8080';
    
    final url = 'ws://$baseUrl/ws?token=$token';

    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      _channel!.stream.listen(
        (message) {
          try {
            final data = json.decode(message) as Map<String, dynamic>;
            _eventSubject.add(data);
          } catch (e) {
            print('Error parsing WS message: $e');
          }
        },
        onError: (error) => print('WS Error: $error'),
        onDone: () {
          print('WS Closed');
          _channel = null;
          // Reconnect logic could go here
        },
      );
      print('Connected to WebSocket');
    } catch (e) {
      print('Connection failed: $e');
    }
  }

  void disconnect() {
    _channel?.sink.close(status.goingAway);
    _channel = null;
  }
}
