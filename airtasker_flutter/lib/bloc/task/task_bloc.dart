import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/task.dart';
import '../../services/mock_data_service.dart';
import 'task_event.dart';
import 'task_state.dart';

class TaskBloc extends Bloc<TaskEvent, TaskState> {
  final MockDataService _dataService;

  TaskBloc(this._dataService) : super(const TaskState()) {
    on<TaskLoadAll>(_onLoadAll);
    on<TaskLoadMyTasks>(_onLoadMyTasks);
    on<TaskLoadById>(_onLoadById);
    on<TaskApplyFilters>(_onApplyFilters);
  }

  Future<void> _onLoadAll(
    TaskLoadAll event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final tasks = await _dataService.getTasks();
      emit(state.copyWith(tasks: tasks, isLoading: false, error: null));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: 'Failed to load tasks: ${e.toString()}'));
    }
  }

  Future<void> _onLoadMyTasks(
    TaskLoadMyTasks event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final allTasks = await _dataService.getTasks();
      // Filter tasks by current user (John Doe has ID '1')
      final currentUserId = '1'; // TODO: Get from auth bloc/service
      final myTasks = allTasks.where((task) => task.posterId == currentUserId).toList();
      emit(state.copyWith(myTasks: myTasks, isLoading: false, error: null));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: 'Failed to load my tasks: ${e.toString()}'));
    }
  }

  Future<void> _onApplyFilters(
    TaskApplyFilters event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      // If no tasks loaded yet, load them first
      List<Task> allTasks = state.tasks;
      if (allTasks.isEmpty) {
        allTasks = await _dataService.getTasks();
      }
      
      List<Task> filteredTasks = List.from(allTasks);
      
      // Filter by category
      if (event.category != null && event.category!.isNotEmpty) {
        filteredTasks = filteredTasks
            .where((task) => task.category.toLowerCase() == event.category!.toLowerCase())
            .toList();
      }
      
      // Filter by price range
      if (event.minPrice != null) {
        filteredTasks = filteredTasks
            .where((task) => task.budget >= event.minPrice!)
            .toList();
      }
      if (event.maxPrice != null) {
        filteredTasks = filteredTasks
            .where((task) => task.budget <= event.maxPrice!)
            .toList();
      }
      
      // Filter by search query (search in title and description)
      if (event.searchQuery != null && event.searchQuery!.isNotEmpty) {
        final query = event.searchQuery!.toLowerCase();
        filteredTasks = filteredTasks.where((task) {
          final titleMatch = task.title.toLowerCase().contains(query);
          final descMatch = task.description.toLowerCase().contains(query);
          final categoryMatch = task.category.toLowerCase().contains(query);
          return titleMatch || descMatch || categoryMatch;
        }).toList();
      }
      
      emit(state.copyWith(tasks: filteredTasks, isLoading: false, error: null));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: 'Failed to filter tasks: ${e.toString()}'));
    }
  }

  Future<void> _onLoadById(
    TaskLoadById event,
    Emitter<TaskState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final task = await _dataService.getTaskById(event.taskId);
      if (task != null) {
        emit(state.copyWith(selectedTask: task, isLoading: false, error: null));
      } else {
        emit(state.copyWith(isLoading: false, error: 'Task not found'));
      }
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: 'Failed to load task: ${e.toString()}'));
    }
  }
}
