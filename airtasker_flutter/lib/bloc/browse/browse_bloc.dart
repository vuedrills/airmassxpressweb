import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/mock_data_service.dart';
import '../../models/task.dart';
import '../../models/sort_option.dart';
import 'browse_event.dart';
import 'browse_state.dart';

/// Browse BLoC - Handles task browsing with filtering, sorting, and view toggling
class BrowseBloc extends Bloc<BrowseEvent, BrowseState> {
  final MockDataService _dataService;

  BrowseBloc(this._dataService) : super(BrowseInitial()) {
    on<LoadBrowseTasks>(_onLoadBrowseTasks);
    on<SelectCategory>(_onSelectCategory);
    on<SetSortOption>(_onSetSortOption);
    on<ToggleView>(_onToggleView);
  }

  Future<void> _onLoadBrowseTasks(
    LoadBrowseTasks event,
    Emitter<BrowseState> emit,
  ) async {
    emit(BrowseLoading());
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final tasks = await _dataService.getTasks();
      final categories = await _dataService.getCategories();
      emit(BrowseLoaded(
        tasks: tasks,
        categories: categories,
      ));
    } catch (e) {
      emit(BrowseError(e.toString()));
    }
  }

  Future<void> _onSelectCategory(
    SelectCategory event,
    Emitter<BrowseState> emit,
  ) async {
    if (state is BrowseLoaded) {
      final currentState = state as BrowseLoaded;
      final allTasks = await _dataService.getTasks();
      
      List<Task> filteredTasks;
      if (event.categoryId == 'all') {
        filteredTasks = allTasks;
      } else {
        filteredTasks = allTasks.where((task) {
          return task.category.toLowerCase() == event.categoryId.toLowerCase();
        }).toList();
      }
      
      emit(currentState.copyWith(
        tasks: filteredTasks,
        selectedCategoryId: event.categoryId,
      ));
    }
  }

  Future<void> _onSetSortOption(
    SetSortOption event,
    Emitter<BrowseState> emit,
  ) async {
    if (state is BrowseLoaded) {
      final currentState = state as BrowseLoaded;
      final sortedTasks = _sortTasks(currentState.tasks, event.sortOption);
      
      emit(currentState.copyWith(
        tasks: sortedTasks,
        sortOption: event.sortOption,
      ));
    }
  }

  Future<void> _onToggleView(
    ToggleView event,
    Emitter<BrowseState> emit,
  ) async {
    if (state is BrowseLoaded) {
      final currentState = state as BrowseLoaded;
      emit(currentState.copyWith(isMapView: event.isMapView));
    }
  }

  List<Task> _sortTasks(List<Task> tasks, SortOption sortOption) {
    final sortedTasks = List<Task>.from(tasks);
    
    switch (sortOption) {
      case SortOption.closestFirst:
        // TODO: Implement distance-based sorting
        break;
      case SortOption.newestPosted:
        sortedTasks.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case SortOption.mostRelevant:
        // Default sorting (already sorted by relevance in mock data)
        break;
      case SortOption.highestBudget:
        sortedTasks.sort((a, b) => b.budget.compareTo(a.budget));
        break;
      case SortOption.lowestBudget:
        sortedTasks.sort((a, b) => a.budget.compareTo(b.budget));
        break;
      case SortOption.endingSoon:
        sortedTasks.sort((a, b) {
          // Handle null deadlines by putting them at the end
          if (a.deadline == null && b.deadline == null) return 0;
          if (a.deadline == null) return 1;
          if (b.deadline == null) return -1;
          return a.deadline!.compareTo(b.deadline!);
        });
        break;
    }
    
    return sortedTasks;
  }
}
