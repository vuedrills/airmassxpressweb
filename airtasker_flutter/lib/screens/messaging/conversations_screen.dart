import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../bloc/message/message_bloc.dart';
import '../../bloc/message/message_event.dart';
import '../../bloc/message/message_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';
import 'chat_screen.dart';

class ConversationsScreen extends StatelessWidget {
  const ConversationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<MessageBloc>()..add(const LoadConversations()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Messages'),
        ),
        body: BlocBuilder<MessageBloc, MessageState>(
          builder: (context, state) {
            if (state is ConversationsLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is MessageError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline,size: 64, color: AppTheme.textSecondary.withValues(alpha: 0.5)),
                    const SizedBox(height: 16),
                    Text(state.message),
                  ],
                ),
              );
            }

            if (state is ConversationsLoaded) {
              final conversations = state.conversations;

              if (conversations.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.chat_bubble_outline, size: 64, color: AppTheme.textSecondary),
                      SizedBox(height: 16),
                      Text('No conversations yet', style: TextStyle(fontSize: 18, color: AppTheme.textSecondary)),
                    ],
                  ),
                );
              }

              return ListView.builder(
                itemCount: conversations.length,
                itemBuilder: (context, index) {
                  final conversation = conversations[index];
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundImage: conversation.otherUserImage != null
                          ? NetworkImage(conversation.otherUserImage!)
                          : null,
                      child: conversation.otherUserImage == null
                          ? const Icon(Icons.person)
                          : null,
                    ),
                    title: Text(
                      conversation.otherUserName,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      conversation.lastMessage ?? 'No messages yet',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: conversation.unreadCount > 0
                            ? AppTheme.primaryBlue
                            : AppTheme.textSecondary,
                        fontWeight: conversation.unreadCount > 0
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                    trailing: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        if (conversation.lastMessageTime != null)
                          Text(
                            timeago.format(conversation.lastMessageTime!),
                            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                          ),
                        if (conversation.unreadCount > 0)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryBlue,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${conversation.unreadCount}',
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          ),
                      ],
                    ),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ChatScreen(
                            conversationId: conversation.id,
                            otherUserId: conversation.otherUserId,
                            otherUserName: conversation.otherUserName,
                            otherUserImage: conversation.otherUserImage,
                          ),
                        ),
                      );
                    },
                  );
                },
              );
            }

            return const Center(child: Text('No conversations'));
          },
        ),
      ),
    );
  }
}
