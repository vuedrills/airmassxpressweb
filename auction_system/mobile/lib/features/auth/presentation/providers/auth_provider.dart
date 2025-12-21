import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/auth/data/repositories/auth_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

// State to hold current auth info
class AuthState {
  final String? token;
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.token, this.user, this.isLoading = false, this.error});

  AuthState copyWith({
    String? token,
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      token: token ?? this.token,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  bool get isAuthenticated => token != null;
}

// Global Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;
  
  AuthNotifier(this._ref) : super(AuthState(isLoading: true)) {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    // Note: In a real app we would load the User object too or fetch it /me
    if (token != null) {
      state = AuthState(token: token, isLoading: false);
      // Ideally fetch user profile here
    } else {
      state = AuthState(isLoading: false);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repo = _ref.read(authRepositoryProvider);
      final response = await repo.login(email, password);
      
      final token = response['token'] as String;
      final userJson = response['user'] as Map<String, dynamic>;
      final user = User.fromJson(userJson);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);

      state = AuthState(token: token, user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> register(String username, String email, String password, int townId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final repo = _ref.read(authRepositoryProvider); // Use _ref.read to get repository
      final response = await repo.register(username, email, password, townId); // Assuming repo has register method

      final token = response['token'] as String;
      final userJson = response['user'] as Map<String, dynamic>;
      final user = User.fromJson(userJson);
      
      // Save to storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      await prefs.setString('user_data', json.encode(user.toJson())); // Save user data

      state = state.copyWith(
        user: user,
        token: token,
        isLoading: false,
        // isAuthenticated: true, // AuthState does not have an isAuthenticated field to copy
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
      );
      print("Registration error: $e");
    }
  }

  Future<void> logout() async { // Kept existing Future<void> signature
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data'); // Also remove user data on logout
    state = AuthState(isLoading: false);
  }
}
