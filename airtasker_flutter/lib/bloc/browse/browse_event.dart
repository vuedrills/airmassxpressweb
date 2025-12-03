import 'package:equatable/equatable.dart';
import '../../models/sort_option.dart';

/// Browse events
abstract class BrowseEvent extends Equatable {
  const BrowseEvent();

  @override
  List<Object?> get props => [];
}

/// Load tasks for browsing
class LoadBrowseTasks extends BrowseEvent {}

/// Select a category filter
class SelectCategory extends BrowseEvent {
  final String categoryId;

  const SelectCategory(this.categoryId);

  @override
  List<Object?> get props => [categoryId];
}

/// Set sort option
class SetSortOption extends BrowseEvent {
  final SortOption sortOption;

  const SetSortOption(this.sortOption);

  @override
  List<Object?> get props => [sortOption];
}

/// Toggle between list and map view
class ToggleView extends BrowseEvent {
  final bool isMapView;

  const ToggleView(this.isMapView);

  @override
  List<Object?> get props => [isMapView];
}
