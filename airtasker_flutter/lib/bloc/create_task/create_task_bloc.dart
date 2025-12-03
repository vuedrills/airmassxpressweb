import 'package:flutter_bloc/flutter_bloc.dart';
import 'create_task_event.dart';
import 'create_task_state.dart';

class CreateTaskBloc extends Bloc<CreateTaskEvent, CreateTaskState> {
  CreateTaskBloc() : super(const CreateTaskState()) {
    on<CreateTaskTitleChanged>(_onTitleChanged);
    on<CreateTaskDescriptionChanged>(_onDescriptionChanged);
    on<CreateTaskDateChanged>(_onDateChanged);
    on<CreateTaskFlexibleChanged>(_onFlexibleChanged);
    on<CreateTaskLocationChanged>(_onLocationChanged);
    on<CreateTaskBudgetChanged>(_onBudgetChanged);
    on<CreateTaskPhotoAdded>(_onPhotoAdded);
    on<CreateTaskPhotoRemoved>(_onPhotoRemoved);
    on<CreateTaskSubmitted>(_onSubmitted);
    on<CreateTaskDateTypeChanged>(_onDateTypeChanged);
    on<CreateTaskTimeOfDayChanged>(_onTimeOfDayChanged);
    on<CreateTaskSpecificTimeToggled>(_onSpecificTimeToggled);
  }

  void _onTitleChanged(
    CreateTaskTitleChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(title: event.title));
  }

  void _onDescriptionChanged(
    CreateTaskDescriptionChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(description: event.description));
  }

  void _onDateChanged(
    CreateTaskDateChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(date: event.date));
  }

  void _onFlexibleChanged(
    CreateTaskFlexibleChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(isFlexible: event.isFlexible));
  }

  void _onLocationChanged(
    CreateTaskLocationChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
    ));
  }

  void _onBudgetChanged(
    CreateTaskBudgetChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(budget: event.budget));
  }

  void _onPhotoAdded(
    CreateTaskPhotoAdded event,
    Emitter<CreateTaskState> emit,
  ) {
    final updatedPhotos = List<String>.from(state.photos)..add(event.path);
    emit(state.copyWith(photos: updatedPhotos));
  }

  void _onPhotoRemoved(
    CreateTaskPhotoRemoved event,
    Emitter<CreateTaskState> emit,
  ) {
    final updatedPhotos = List<String>.from(state.photos)..removeAt(event.index);
    emit(state.copyWith(photos: updatedPhotos));
  }

  Future<void> _onSubmitted(
    CreateTaskSubmitted event,
    Emitter<CreateTaskState> emit,
  ) async {
    emit(state.copyWith(status: CreateTaskStatus.submitting));
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      emit(state.copyWith(status: CreateTaskStatus.success));
    } catch (e) {
      emit(state.copyWith(
        status: CreateTaskStatus.failure,
        errorMessage: 'Failed to create task',
      ));
    }
  }

  void _onDateTypeChanged(
    CreateTaskDateTypeChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(dateType: event.dateType));
  }

  void _onTimeOfDayChanged(
    CreateTaskTimeOfDayChanged event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(timeOfDay: event.timeOfDay));
  }

  void _onSpecificTimeToggled(
    CreateTaskSpecificTimeToggled event,
    Emitter<CreateTaskState> emit,
  ) {
    emit(state.copyWith(hasSpecificTime: event.isEnabled));
  }
}
