import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auctionListAsync = ref.watch(auctionListProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: CustomScrollView(
        slivers: [
          // 1. Premium App Bar
          const SliverAppBar(
            floating: true,
            pinned: true,
            snap: false,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white,
            elevation: 0,
            title: Text("AirMass Auctions"),
            centerTitle: false,
            actions: [
              IconButton(onPressed: null, icon: Icon(Icons.search)),
              IconButton(onPressed: null, icon: Icon(Icons.notifications_outlined)),
              Padding(
                padding: EdgeInsets.only(right: 16.0),
                child: CircleAvatar(
                  radius: 16,
                  backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=12"), // Placeholder
                ),
              )
            ],
            bottom: PreferredSize(
              preferredSize: Size.fromHeight(60),
              child: CategorySelector(),
            ),
          ),

          // 2. Featured / Promotional Banner (Horizontal Scroll)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
              child: SizedBox(
                height: 180,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: const [
                    PromoCard(
                      title: "Mutare Estate Sale",
                      subtitle: "Ends in 2h",
                      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                      color: Color(0xFF1E1E1E),
                    ),
                    SizedBox(width: 16),
                    PromoCard(
                      title: "Harare Auto Show",
                      subtitle: "New Listings",
                      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
                      color: Color(0xFFE50914),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 3. Section Title
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverToBoxAdapter(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                   Text(
                    "Trending Auctions",
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () => ref.refresh(auctionListProvider), 
                    child: const Text("View All"),
                  )
                ],
              ),
            ),
          ),

          // 4. Masonry Grid of Auctions (Async)
          auctionListAsync.when(
            data: (auctions) => SliverPadding(
              padding: const EdgeInsets.all(16.0),
              sliver: SliverMasonryGrid.count(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childCount: auctions.length,
                itemBuilder: (context, index) {
                  return AuctionCard(auction: auctions[index]);
                },
              ),
            ),
            loading: () => const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (err, stack) => SliverFillRemaining(
              child: Center(child: Text('Error: $err')),
            ),
          ),
          
          const SliverToBoxAdapter(child: SizedBox(height: 80)) // Bottom padding
        ],
      ),
      // 5. Floating Action Button
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: Colors.black,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text("Sell Item", style: TextStyle(color: Colors.white)),
      ),
    );
  }
}

class CategorySelector extends StatelessWidget {
  const CategorySelector({super.key});

  @override
  Widget build(BuildContext context) {
    final categories = ["All", "Cars", "Electronics", "Furniture", "Fashion", "Tools"];
    return SizedBox(
      height: 60,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final isSelected = index == 0;
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? Colors.black : Colors.grey[100],
              borderRadius: BorderRadius.circular(30),
            ),
            alignment: Alignment.center,
            child: Text(
              categories[index],
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black87,
                fontWeight: FontWeight.w600,
              ),
            ),
          );
        },
      ),
    );
  }
}

class PromoCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String image;
  final Color color;

  const PromoCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.image,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        image: DecorationImage(
          image: NetworkImage(image),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.black.withOpacity(0.3), 
            BlendMode.darken
          ),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            bottom: 16,
            left: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  subtitle.toUpperCase(),
                  style: GoogleFonts.inter(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class AuctionCard extends StatelessWidget {
  final Auction auction;
  const AuctionCard({super.key, required this.auction});

  @override
  Widget build(BuildContext context) {
    // Determine image based on title/category for placeholder (since we don't have real implementation of images yet)
    String imageUrl = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2";
    if (auction.title.toLowerCase().contains("car") || auction.title.toLowerCase().contains("toyota")) {
      imageUrl = "https://images.unsplash.com/photo-1583121274602-3e2820c69888";
    } else if (auction.title.toLowerCase().contains("phone") || auction.title.toLowerCase().contains("macbook")) {
      imageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";
    } else if (auction.title.toLowerCase().contains("house") || auction.title.toLowerCase().contains("bedroom")) {
      imageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";
    } else if (auction.title.toLowerCase().contains("table") || auction.title.toLowerCase().contains("furniture")) {
      imageUrl = "https://images.unsplash.com/photo-1538688525198-9b88f6f53126";
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: AspectRatio(
              aspectRatio: 1.0, // Fixed aspect for now
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(color: Colors.grey[200]),
              ),
            ),
          ),
          
          // Details
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    "Active", // Placeholder for countdown
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  auction.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "\$${auction.currentPrice.toStringAsFixed(0)}",
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.people_outline, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          "${auction.bidCount}",
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
