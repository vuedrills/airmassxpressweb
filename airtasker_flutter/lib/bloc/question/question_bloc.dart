import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/mock_data_service.dart';
import 'question_event.dart';
import 'question_state.dart';

/// Question BLoC - Handles task questions
class QuestionBloc extends Bloc<QuestionEvent, QuestionState> {
  final MockDataService _dataService;

  QuestionBloc(this._dataService) : super(QuestionInitial()) {
    on<LoadQuestions>(_onLoadQuestions);
    on<AskQuestion>(_onAskQuestion);
  }

  Future<void> _onLoadQuestions(
    LoadQuestions event,
    Emitter<QuestionState> emit,
  ) async {
    emit(QuestionsLoading());
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final questions = await _dataService.getQuestions(event.taskId);
      emit(QuestionsLoaded(questions));
    } catch (e) {
      emit(QuestionError(e.toString()));
    }
  }

  Future<void> _onAskQuestion(
    AskQuestion event,
    Emitter<QuestionState> emit,
  ) async {
    final currentState = state;
    emit(QuestionSending());
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      await _dataService.askQuestion(event.taskId, event.question);
      
      // Reload questions
      final questions = await _dataService.getQuestions(event.taskId);
      emit(QuestionsLoaded(questions));
    } catch (e) {
      // Restore previous state on error
      if (currentState is QuestionsLoaded) {
        emit(currentState);
      }
      emit(QuestionError(e.toString()));
    }
  }
}
