import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile/features/chat/data/repositories/chat_repository.dart';

// Chat Repository Provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final authState = ref.watch(authProvider);
  return ChatRepository(authState.token);
});

// Conversations List Provider
final conversationsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repo = ref.watch(chatRepositoryProvider);
  return repo.getConversations();
});

// Messages for a specific conversation
final messagesProvider = FutureProvider.family<List<dynamic>, int>((ref, conversationId) async {
  final repo = ref.watch(chatRepositoryProvider);
  return repo.getMessages(conversationId);
});

// Image Upload Helper
final imageUploadProvider = FutureProvider.family<String, File>((ref, imageFile) async {
  final repo = ref.watch(chatRepositoryProvider);
  return repo.uploadImage(imageFile);
});
