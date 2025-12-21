import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/chat/presentation/providers/chat_provider.dart';
import 'package:mobile/features/chat/presentation/screens/chat_screen.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:timeago/timeago.dart' as timeago;

class MessageCenterScreen extends ConsumerWidget {
  const MessageCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final conversationsAsync = ref.watch(conversationsProvider);
    final authState = ref.watch(authProvider);
    final currentUserId = authState.user?.id ?? 0;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text("Messages", style: theme.textTheme.titleLarge),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(conversationsProvider),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: conversationsAsync.when(
        data: (conversations) {
          if (conversations.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text("No messages yet", style: theme.textTheme.titleLarge?.copyWith(color: Colors.grey)),
                  const SizedBox(height: 8),
                  Text("Start a conversation with a seller", style: theme.textTheme.bodyMedium),
                  const SizedBox(height: 24),
                  Text("Tap 'Message Seller' on any auction", style: GoogleFonts.inter(color: Colors.grey, fontSize: 12)),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(conversationsProvider),
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final conv = conversations[index];
                final buyerId = conv['buyer_id'] ?? 0;
                final sellerId = conv['seller_id'] ?? 0;
                final isBuyer = currentUserId == buyerId;
                
                // Get the other user's info
                final otherUser = isBuyer ? conv['seller'] : conv['buyer'];
                final otherName = otherUser?['username'] ?? 'User';
                final otherAvatar = otherUser?['avatar_url'];
                
                final lastMessage = conv['last_message'] ?? 'No messages yet';
                final lastMessageAt = conv['last_message_at'] != null
                    ? DateTime.tryParse(conv['last_message_at'])
                    : null;
                final timeText = lastMessageAt != null ? timeago.format(lastMessageAt) : '';
                
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => ChatScreen(
                            conversationId: conv['id'] as int,
                            otherUserName: otherName,
                            otherUserAvatar: otherAvatar,
                          ),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          // Avatar
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: Colors.grey[200],
                            backgroundImage: otherAvatar != null ? NetworkImage(otherAvatar) : null,
                            child: otherAvatar == null
                                ? Text(otherName[0].toUpperCase(), style: GoogleFonts.inter(fontWeight: FontWeight.bold))
                                : null,
                          ),
                          const SizedBox(width: 16),
                          // Message content
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      otherName,
                                      style: GoogleFonts.inter(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      timeText,
                                      style: GoogleFonts.inter(
                                        fontSize: 12,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  lastMessage,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.grey),
              const SizedBox(height: 16),
              Text('Error loading conversations', style: theme.textTheme.titleMedium),
              const SizedBox(height: 8),
              Text('$err', style: GoogleFonts.inter(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(conversationsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
