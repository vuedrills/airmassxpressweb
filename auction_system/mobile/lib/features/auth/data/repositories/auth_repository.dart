import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auction/data/repositories/auction_repository.dart';

final authRepositoryProvider = Provider((ref) => AuthRepository());

class AuthRepository {
  // Using the same base URL logic as AuctionRepository
  String get baseUrl => isAndroid ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

  // Helper to detect platform (simplified, reusing logic)
  bool get isAndroid => false; // Replace with Platform check if needed, mostly for emulators

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'Email': email, 'Password': password}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> register(String username, String email, String password, int townId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'Username': username,
        'Email': email,
        'Password': password,
        'TownID': townId
      }),
    );

    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Registration failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> updateProfile(String token, {String? username, int? townId}) async {
    final body = <String, dynamic>{};
    if (username != null && username.isNotEmpty) body['username'] = username;
    if (townId != null) body['town_id'] = townId;

    final response = await http.patch(
      Uri.parse('$baseUrl/users/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Update failed: ${response.body}');
    }
  }
}
