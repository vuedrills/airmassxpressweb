import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/browse/browse_bloc.dart';
import '../../bloc/browse/browse_event.dart';
import '../../bloc/browse/browse_state.dart';
import '../../models/sort_option.dart';
import '../../config/theme.dart';

/// Sort bottom sheet with radio options
class SortBottomSheet extends StatelessWidget {
  const SortBottomSheet({super.key});

  static void show(BuildContext context) {
    final browseBloc = context.read<BrowseBloc>();
    
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (newContext) => BlocProvider.value(
        value: browseBloc,
        child: const SortBottomSheet(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BrowseBloc, BrowseState>(
      builder: (context, state) {
        final currentSort = state is BrowseLoaded ? state.sortOption : SortOption.mostRelevant;
        
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              
              // Title
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Text(
                  'Sort by',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Sort options
              ...SortOption.values.map((option) {
                return RadioListTile<SortOption>(
                  value: option,
                  groupValue: currentSort,
                  onChanged: (value) {
                    if (value != null) {
                      context.read<BrowseBloc>().add(SetSortOption(value));
                      Navigator.pop(context);
                    }
                  },
                  title: Text(option.label),
                  activeColor: AppTheme.primaryBlue,
                );
              }).toList(),
              
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}
