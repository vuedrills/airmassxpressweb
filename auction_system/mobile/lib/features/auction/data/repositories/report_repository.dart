import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'dart:io';

class ReportRepository {
  final String? token;
  ReportRepository(this.token);

  String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  Future<void> report({
    required String subjectType,
    required int subjectId,
    required String reason,
    String? description,
  }) async {
    if (token == null) throw Exception('Authentication required');

    final response = await http.post(
      Uri.parse('$baseUrl/reports'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'subject_type': subjectType,
        'subject_id': subjectId,
        'reason': reason,
        'description': description,
      }),
    );

    if (response.statusCode != 201) {
      final data = json.decode(response.body);
      throw Exception(data['error'] ?? 'Failed to submit report');
    }
  }
}

final reportRepositoryProvider = Provider<ReportRepository>((ref) {
  final authState = ref.watch(authProvider);
  return ReportRepository(authState.token);
});
