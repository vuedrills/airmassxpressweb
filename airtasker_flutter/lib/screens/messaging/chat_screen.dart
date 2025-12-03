import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../bloc/message/message_bloc.dart';
import '../../bloc/message/message_event.dart';
import '../../bloc/message/message_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';

class ChatScreen extends StatefulWidget {
  final String conversationId;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserImage;

  const ChatScreen({
    super.key,
    required this.conversationId,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserImage,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<MessageBloc>()..add(LoadMessages(conversationId: widget.conversationId)),
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundImage: widget.otherUserImage != null
                    ? NetworkImage(widget.otherUserImage!)
                    : null,
                child: widget.otherUserImage == null
                    ? const Icon(Icons.person, size: 18)
                    : null,
              ),
              const SizedBox(width: 12),
              Text(widget.otherUserName),
            ],
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: BlocConsumer<MessageBloc, MessageState>(
                listener: (context, state) {
                  if (state is MessagesLoaded) {
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      _scrollToBottom();
                    });
                  }
                },
                builder: (context, state) {
                  if (state is MessagesLoading) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (state is MessageError) {
                    return Center(child: Text(state.message));
                  }

                  if (state is MessagesLoaded) {
                    final messages = state.messages;

                    if (messages.isEmpty) {
                      return const Center(
                        child: Text('No messages yet. Start the conversation!'),
                      );
                    }

                    return ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final message = messages[index];
                        final isMe = message.senderId == 'currentUser';
                        final showTime = index == 0 ||
                            messages[index - 1].timestamp.difference(message.timestamp).inMinutes.abs() > 30;

                        return Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            if (showTime)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                child: Center(
                                  child: Text(
                                    DateFormat('MMM d, h:mm a').format(message.timestamp),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ),
                              ),
                            Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.of(context).size.width * 0.7,
                              ),
                              decoration: BoxDecoration(
                                color: isMe ? AppTheme.primaryBlue : Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                message.content,
                                style: TextStyle(
                                  color: isMe ? Colors.white : const Color(0xFF0E1638),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    );
                  }

                  return const Center(child: Text('Load messages'));
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      ),
                      maxLines: null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: AppTheme.primaryBlue,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 20),
                      onPressed: () {
                        final message = _messageController.text.trim();
                        if (message.isNotEmpty) {
                          context.read<MessageBloc>().add(SendMessage(
                                conversationId: widget.conversationId,
                                receiverId: widget.otherUserId,
                                content: message,
                              ));
                          _messageController.clear();
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
