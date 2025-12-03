import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/browse/browse_bloc.dart';
import '../../bloc/browse/browse_event.dart';
import '../../bloc/browse/browse_state.dart';
import '../../bloc/search/search_bloc.dart';
import '../../bloc/filter/filter_bloc.dart';
import '../../bloc/filter/filter_event.dart';
import '../../bloc/filter/filter_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';
import '../../widgets/category_chips.dart';
import '../../widgets/enhanced_task_card.dart';
import '../../widgets/filter_chip.dart' as custom;
import '../../widgets/active_filters_list.dart';
import '../browse/search_modal.dart';
import '../browse/filter_bottom_sheet.dart';
import '../browse/sort_bottom_sheet.dart';
import '../browse/category_grid_view.dart';

/// Enhanced browse tasks screen with search, filters, categories, and sort
class BrowseTasksScreen extends StatefulWidget {
  const BrowseTasksScreen({super.key});

  @override
  State<BrowseTasksScreen> createState() => _BrowseTasksScreenState();
}

class _BrowseTasksScreenState extends State<BrowseTasksScreen> {
  late BrowseBloc _browseBloc;
  late SearchBloc _searchBloc;
  late FilterBloc _filterBloc;

  @override
  void initState() {
    super.initState();
    _browseBloc = getIt<BrowseBloc>();
    _searchBloc = getIt<SearchBloc>();
    _filterBloc = getIt<FilterBloc>();
    _browseBloc.add(LoadBrowseTasks());
  }

  @override
  void dispose() {
    _browseBloc.close();
    _searchBloc.close();
    _filterBloc.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(value: _browseBloc),
        BlocProvider.value(value: _searchBloc),
        BlocProvider.value(value: _filterBloc),
      ],
      child: Builder(
        builder: (context) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Browse Tasks'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined),
                  onPressed: () {},
                ),
              ],
            ),
            body: Column(
              children: [
                // Search bar
                _buildSearchBar(context),
                
                // Category chips
                const CategoryChips(),
                
                const SizedBox(height: 12),
                
                // Filter/Sort buttons
                _buildFilterSortBar(context),
                
                // Active filter chips
                _buildFilterChips(),
                
                // Task list
                Expanded(
                  child: BlocBuilder<BrowseBloc, BrowseState>(
                    builder: (context, state) {
                      if (state is BrowseLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      
                      if (state is BrowseLoaded) {
                        // Filter tasks based on current filters and exclude assigned/completed/cancelled
                        var filteredTasks = state.tasks.where((task) =>
                          task.status != 'assigned' && 
                          task.status != 'completed' && 
                          task.status != 'cancelled'
                        ).toList();

                        if (filteredTasks.isEmpty) {
                          return _buildEmptyState();
                        }
                        
                        return RefreshIndicator(
                          onRefresh: () async {
                            _browseBloc.add(LoadBrowseTasks());
                            await Future.delayed(const Duration(milliseconds: 500));
                          },
                          child: ListView.builder(
                            itemCount: filteredTasks.length,
                            itemBuilder: (context, index) {
                              return EnhancedTaskCard(task: filteredTasks[index]);
                            },
                          ),
                        );
                      }
                      
                      if (state is BrowseError) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.error_outline, size: 64, color: Colors.red),
                              const SizedBox(height: 16),
                              Text(state.message),
                            ],
                          ),
                        );
                      }
                      
                      return const SizedBox.shrink();
                    },
                  ),
                ),
              ],
            ),
          );
        }
      ),
    );
  }

  Widget _buildSearchBar(BuildContext context) {
    return GestureDetector(
      onTap: () => SearchModal.show(context),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.backgroundColor,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.divider),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: AppTheme.textSecondary),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Search for any task',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSortBar(BuildContext context) {
    return BlocBuilder<FilterBloc, FilterState>(
      builder: (context, filterState) {
        final filterCount = filterState is FilterApplied 
            ? filterState.criteria.activeFilterCount 
            : 0;
            
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              // Filter button
              OutlinedButton.icon(
                onPressed: () => FilterBottomSheet.show(context),
                icon: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Icon(Icons.filter_list, size: 20),
                    if (filterCount > 0)
                      Positioned(
                        right: -8,
                        top: -8,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: AppTheme.primaryBlue,
                            shape: BoxShape.circle,
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 18,
                            minHeight: 18,
                          ),
                          child: Text(
                            '$filterCount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                ),
                label: const Text('Filters'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
              
              const SizedBox(width: 12),
              
              // Sort button
              OutlinedButton.icon(
                onPressed: () => SortBottomSheet.show(context),
                icon: const Icon(Icons.sort, size: 20),
                label: const Text('Sort'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
              
              const Spacer(),
              
              // View categories button
              TextButton(
                onPressed: () {
                  final state = _browseBloc.state;
                  if (state is BrowseLoaded) {
                    CategoryGridView.show(context, state.categories);
                  }
                },
                child: const Text('See all categories'),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFilterChips() {
    return BlocBuilder<FilterBloc, FilterState>(
      builder: (context, state) {
        if (state is! FilterApplied) {
          return const SizedBox.shrink();
        }
        
        return ActiveFiltersList(
          criteria: state.criteria,
          onUpdate: (newCriteria) {
            _filterBloc.add(UpdateFilter(newCriteria));
            _filterBloc.add(ApplyFilters());
            _browseBloc.add(LoadBrowseTasks());
          },
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'No tasks found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Try adjusting your filters',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }
}
