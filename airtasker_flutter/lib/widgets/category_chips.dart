import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/browse/browse_bloc.dart';
import '../bloc/browse/browse_event.dart';
import '../bloc/browse/browse_state.dart';
import 'category_chip.dart';

/// Horizontal scrolling category chips
class CategoryChips extends StatelessWidget {
  const CategoryChips({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BrowseBloc, BrowseState>(
      builder: (context, state) {
        if (state is! BrowseLoaded) {
          return const SizedBox.shrink();
        }

        return SizedBox(
          height: 50,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: state.categories.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final category = state.categories[index];
              final isSelected = category.id == state.selectedCategoryId;
              
              return CategoryChip(
                category: category,
                isSelected: isSelected,
                onTap: () {
                  context.read<BrowseBloc>().add(SelectCategory(category.id));
                },
              );
            },
          ),
        );
      },
    );
  }
}
