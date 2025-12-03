import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/search/search_bloc.dart';
import '../../bloc/search/search_event.dart';
import '../../bloc/search/search_state.dart';
import '../../bloc/browse/browse_bloc.dart';
import '../../bloc/browse/browse_event.dart';
import '../../config/theme.dart';
import '../../widgets/enhanced_task_card.dart';

/// Full-screen search modal with history and suggestions
class SearchModal extends StatefulWidget {
  const SearchModal({super.key});

  static Future<void> show(BuildContext context) {
    final searchBloc = context.read<SearchBloc>();
    final browseBloc = context.read<BrowseBloc>();
    
    return Navigator.of(context).push(
      MaterialPageRoute(
        fullscreenDialog: true,
        builder: (newContext) => MultiBlocProvider(
          providers: [
            BlocProvider.value(value: searchBloc),
            BlocProvider.value(value: browseBloc),
          ],
          child: const SearchModal(),
        ),
      ),
    );
  }

  @override
  State<SearchModal> createState() => _SearchModalState();
}

class _SearchModalState extends State<SearchModal> {
  late TextEditingController _searchController;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    if (!_initialized) {
      _initialized = true;
      final searchBloc = context.read<SearchBloc>();
      searchBloc.add(LoadSearchHistory());
      
      _searchController.addListener(() {
        if (_searchController.text.isNotEmpty) {
          searchBloc.add(GetSearchSuggestions(_searchController.text));
        } else {
          searchBloc.add(LoadSearchHistory());
        }
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Search for any task',
            border: InputBorder.none,
          ),
          onSubmitted: (query) => _performSearch(query),
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
                context.read<SearchBloc>().add(LoadSearchHistory());
              },
            ),
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => _performSearch(_searchController.text),
          ),
        ],
      ),
      body: BlocBuilder<SearchBloc, SearchState>(
        builder: (context, state) {
          if (state is SearchLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          
          if (state is SearchLoaded) {
            return _buildSearchResults(state);
          }
          
          if (state is SearchSuggestionsLoaded) {
           return _buildSuggestions(state);
          }
          
          if (state is SearchHistoryLoaded) {
            return _buildSearchHistory(state);
          }
          
          return _buildEmptyState();
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search, size: 64, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'Search for any task',
            style: TextStyle(color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchHistory(SearchHistoryLoaded state) {
    if (state.history.isEmpty) {
      return _buildEmptyState();
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              TextButton(
                onPressed: () => context.read<SearchBloc>().add(ClearSearchHistory()),
                child: const Text('Clear all'),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: state.history.length,
            itemBuilder: (context, index) {
              final item = state.history[index];
              return ListTile(
                leading: const Icon(Icons.history, color: AppTheme.textSecondary),
                title: Text(item.query),
                onTap: () => _performSearch(item.query),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSuggestions(SearchSuggestionsLoaded state) {
    if (state.suggestions.isEmpty) {
      return const Center(
        child: Text('No suggestions found', style: TextStyle(color: AppTheme.textSecondary)),
      );
    }
    
    return ListView.builder(
      itemCount: state.suggestions.length,
      itemBuilder: (context, index) {
        final suggestion = state.suggestions[index];
        return ListTile(
          leading: const Icon(Icons.search, color: AppTheme.textSecondary),
          title: Text(suggestion),
          onTap: () => _performSearch(suggestion),
        );
      },
    );
  }

  Widget _buildSearchResults(SearchLoaded state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            '${state.tasks.length} task${state.tasks.length != 1 ? 's' : ''} found',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: state.tasks.isEmpty
              ? const Center(child: Text('No tasks found'))
              : ListView.builder(
                  itemCount: state.tasks.length,
                  itemBuilder: (context, index) {
                    return EnhancedTaskCard(task: state.tasks[index]);
                  },
                ),
        ),
      ],
    );
  }

  void _performSearch(String query) {
    if (query.trim().isEmpty) return;
    context.read<SearchBloc>().add(SearchTasks(query));
  }
}
