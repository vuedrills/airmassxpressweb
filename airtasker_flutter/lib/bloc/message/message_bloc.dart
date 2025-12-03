import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/mock_data_service.dart';
import '../../models/message.dart';
import 'message_event.dart';
import 'message_state.dart';

class MessageBloc extends Bloc<MessageEvent, MessageState> {
  final MockDataService _dataService;

  MessageBloc(this._dataService) : super(MessageInitial()) {
    on<LoadConversations>(_onLoadConversations);
    on<LoadMessages>(_onLoadMessages);
    on<SendMessage>(_onSendMessage);
    on<MarkAsRead>(_onMarkAsRead);
  }

  Future<void> _onLoadConversations(
    LoadConversations event,
    Emitter<MessageState> emit,
  ) async {
    emit(ConversationsLoading());
    try {
      final conversations = await _dataService.getConversations();
      emit(ConversationsLoaded(conversations: conversations));
    } catch (e) {
      emit(MessageError(message: e.toString()));
    }
  }

  Future<void> _onLoadMessages(
    LoadMessages event,
    Emitter<MessageState> emit,
  ) async {
    emit(MessagesLoading());
    try {
      final messages = await _dataService.getMessages(event.conversationId);
      emit(MessagesLoaded(
        messages: messages,
        conversationId: event.conversationId,
      ));
    } catch (e) {
      emit(MessageError(message: e.toString()));
    }
  }

  Future<void> _onSendMessage(
    SendMessage event,
    Emitter<MessageState> emit,
  ) async {
    emit(MessageSending());
    try {
      final message = Message(
        id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
        conversationId: event.conversationId,
        senderId: 'currentUser', // TODO: Get from auth
        receiverId: event.receiverId,
        content: event.content,
        timestamp: DateTime.now(),
        read: false,
      );
      
      await _dataService.sendMessage(message);
      emit(MessageSent(message: message));
      
      // Reload messages after sending
      final messages = await _dataService.getMessages(event.conversationId);
      emit(MessagesLoaded(
        messages: messages,
        conversationId: event.conversationId,
      ));
    } catch (e) {
      emit(MessageError(message: e.toString()));
    }
  }

  Future<void> _onMarkAsRead(
    MarkAsRead event,
    Emitter<MessageState> emit,
  ) async {
    try {
      await _dataService.markMessageAsRead(event.messageId);
      // State update handled by re-loading conversations or messages
    } catch (e) {
      emit(MessageError(message: e.toString()));
    }
  }
}
