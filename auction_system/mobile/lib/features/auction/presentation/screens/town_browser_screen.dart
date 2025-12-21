import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auction/presentation/providers/town_provider.dart';

class TownBrowserScreen extends ConsumerWidget {
  final int townId;
  final String townName;

  const TownBrowserScreen({
    super.key,
    required this.townId,
    required this.townName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(townCategoriesProvider(townId));

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
          townName,
          style: GoogleFonts.outfit(
            color: Colors.black,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: categoriesAsync.when(
        data: (categories) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Browse by Category",
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 1.2,
                    ),
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      return GestureDetector(
                        onTap: () {
                          // Navigate to search with town+category filter
                          context.push('/search?town_id=$townId&category_id=${category.id}');
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                _getColorForCategory(category.slug).withOpacity(0.8),
                                _getColorForCategory(category.slug),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: _getColorForCategory(category.slug).withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Stack(
                            children: [
                              Positioned(
                                right: 12,
                                top: 12,
                                child: Icon(
                                  _getIconForCategory(category.slug),
                                  size: 40,
                                  color: Colors.white.withOpacity(0.3),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      category.name,
                                      style: GoogleFonts.inter(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      "${category.auctionCount} auction${category.auctionCount == 1 ? '' : 's'}",
                                      style: GoogleFonts.inter(
                                        fontSize: 13,
                                        color: Colors.white.withOpacity(0.9),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
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

  Color _getColorForCategory(String slug) {
    switch (slug) {
      case 'cars': return const Color(0xFF2196F3);
      case 'property': return const Color(0xFF4CAF50);
      case 'electronics': return const Color(0xFF9C27B0);
      case 'furniture': return const Color(0xFF795548);
      case 'farming': return const Color(0xFF8BC34A);
      case 'tools': return const Color(0xFFFF9800);
      case 'fashion': return const Color(0xFFE91E63);
      case 'stationery': return const Color(0xFF607D8B);
      default: return const Color(0xFF9E9E9E);
    }
  }
}
