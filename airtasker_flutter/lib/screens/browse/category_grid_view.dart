import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/browse/browse_bloc.dart';
import '../../bloc/browse/browse_event.dart';
import '../../models/category.dart';
import '../../config/theme.dart';

/// Full-screen category grid view
class CategoryGridView extends StatelessWidget {
  final List<Category> categories;

  const CategoryGridView({super.key, required this.categories});

  static Future<void> show(BuildContext context, List<Category> categories) {
    final browseBloc = context.read<BrowseBloc>();
    
    return Navigator.of(context).push(
      MaterialPageRoute(
        builder: (newContext) => BlocProvider.value(
          value: browseBloc,
          child: CategoryGridView(categories: categories),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filter out 'All' from the grid
    final displayCategories = categories.where((c) => c.id != 'all').toList();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse by category'),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: displayCategories.length,
        itemBuilder: (context, index) {
          final category = displayCategories[index];
          return _CategoryGridTile(category: category);
        },
      ),
    );
  }
}

class _CategoryGridTile extends StatelessWidget {
  final Category category;

  const _CategoryGridTile({required this.category});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        context.read<BrowseBloc>().add(SelectCategory(category.id));
        Navigator.pop(context);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: AppTheme.divider),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              category.icon,
              size: 48,
              color: AppTheme.accentTeal,
            ),
            const SizedBox(height: 12),
            Text(
              category.name,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              '${category.taskCount} tasks',
              style: const TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
