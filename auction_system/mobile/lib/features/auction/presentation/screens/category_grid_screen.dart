import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auction/presentation/providers/category_provider.dart';

class CategoryGridScreen extends ConsumerWidget {
  const CategoryGridScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoryListProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Text(
          "Browse Categories",
          style: GoogleFonts.outfit(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: categoriesAsync.when(
        data: (categories) {
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.5,
            ),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final category = categories[index];
              return GestureDetector(
                onTap: () {
                  context.push('/search?category_id=${category.id}');
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Placeholder icon based on slug/name
                      Icon(
                        _getIconForCategory(category.slug),
                        size: 32,
                        color: Colors.black87,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        category.name,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) => Center(child: Text("Error: $e")),
      ),
    );
  }

  IconData _getIconForCategory(String slug) {
    switch (slug) {
      case 'cars': return Icons.directions_car;
      case 'property': return Icons.home;
      case 'electronics': return Icons.phone_iphone;
      case 'furniture': return Icons.chair;
      case 'farming': return Icons.agriculture;
      case 'tools': return Icons.build;
      case 'fashion': return Icons.checkroom;
      case 'stationery': return Icons.library_books;
      default: return Icons.category;
    }
  }
}
