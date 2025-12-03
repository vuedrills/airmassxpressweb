import 'package:equatable/equatable.dart';
import '../../models/task.dart';
import '../../models/category.dart';
import '../../models/sort_option.dart';

/// Browse states
abstract class BrowseState extends Equatable {
  const BrowseState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class BrowseInitial extends BrowseState {}

/// Loading tasks
class BrowseLoading extends BrowseState {}

/// Tasks loaded
class BrowseLoaded extends BrowseState {
  final List<Task> tasks;
  final List<Category> categories;
  final String selectedCategoryId;
  final SortOption sortOption;
  final bool isMapView;

  const BrowseLoaded({
    required this.tasks,
    required this.categories,
    this.selectedCategoryId = 'all',
    this.sortOption = SortOption.mostRelevant,
    this.isMapView = false,
  });

  BrowseLoaded copyWith({
    List<Task>? tasks,
    List<Category>? categories,
    String? selectedCategoryId,
    SortOption? sortOption,
    bool? isMapView,
  }) {
    return BrowseLoaded(
      tasks: tasks ?? this.tasks,
      categories: categories ?? this.categories,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      sortOption: sortOption ?? this.sortOption,
      isMapView: isMapView ?? this.isMapView,
    );
  }

  @override
  List<Object?> get props => [tasks, categories, selectedCategoryId, sortOption, isMapView];
}

/// Error state
class BrowseError extends BrowseState {
  final String message;

  const BrowseError(this.message);

  @override
  List<Object?> get props => [message];
}
