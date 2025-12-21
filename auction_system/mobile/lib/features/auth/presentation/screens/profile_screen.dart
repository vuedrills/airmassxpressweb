import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/models/bid_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile/features/auction/presentation/providers/favorites_provider.dart';

final myAuctionsProvider = FutureProvider<List<Auction>>((ref) async {
  final repo = ref.watch(auctionRepositoryProvider);
  return repo.getMyAuctions();
});

final myBidsProvider = FutureProvider<List<Bid>>((ref) async {
  final repo = ref.watch(auctionRepositoryProvider);
  return repo.getMyBids();
});

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final username = user?.username ?? "User";
    final email = user?.email ?? "";
    final initial = username.isNotEmpty ? username[0].toUpperCase() : "U";

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA), // Light grey background for emphasis
      body: DefaultTabController(
        length: 3,
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) {
            return [
              SliverOverlapAbsorber(
                handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
                sliver: SliverAppBar(
                  expandedHeight: 360, // Increased height
                  pinned: true,
                  stretch: true,
                  backgroundColor: Colors.white,
                  leading: const SizedBox(), 
                  elevation: 0,
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.settings_outlined, color: Colors.black),
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        context.push('/settings');
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.red),
                      onPressed: () {
                        HapticFeedback.mediumImpact();
                        ref.read(authProvider.notifier).logout();
                        context.go('/login');
                      },
                    ),
                    const SizedBox(width: 8),
                  ],
                  flexibleSpace: FlexibleSpaceBar(
                    stretchModes: const [StretchMode.zoomBackground],
                    background: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Gradient Background
                        Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Color(0xFFE8E8E8),
                                Colors.white,
                              ],
                            ),
                          ),
                        ),
                        // Pattern/Decoration
                        const Positioned(
                          right: -50,
                          top: -50,
                          child: Icon(
                            Icons.gavel_rounded,
                            size: 300,
                            color: Color(0x08000000), 
                          ),
                        ),
                        
                        // Content
                        SafeArea(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const SizedBox(height: 20),
                              // Avatar
                              Hero(
                                tag: 'profile_avatar',
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 4),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.1),
                                        blurRadius: 20,
                                        offset: const Offset(0, 10),
                                      ),
                                    ],
                                  ),
                                  child: CircleAvatar(
                                    radius: 50,
                                    backgroundColor: Colors.black,
                                    backgroundImage: user?.avatarUrl != null 
                                        ? NetworkImage(user!.avatarUrl!) 
                                        : null,
                                    child: user?.avatarUrl == null
                                        ? Text(
                                            initial,
                                            style: GoogleFonts.outfit(
                                              fontSize: 40,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                          )
                                        : null,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Name & Verification
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    username,
                                    style: GoogleFonts.outfit(
                                      fontSize: 28,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.black,
                                    ),
                                  ),
                                  if (user?.isVerified ?? false) ...[
                                    const SizedBox(width: 6),
                                    const Icon(Icons.verified, color: Colors.blue, size: 22),
                                  ],
                                ],
                              ),
                              Text(
                                email,
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 24),
                              // Quick Stats
                              _ProfileStats(ref: ref),
                              const SizedBox(height: 48), // Bottom safe space
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  bottom: PreferredSize(
                    preferredSize: const Size.fromHeight(60),
                    child: Container(
                      height: 50,
                      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: TabBar(
                        indicator: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(25),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        labelColor: Colors.white,
                        unselectedLabelColor: Colors.grey[600],
                        labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                        unselectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14),
                        overlayColor: MaterialStateProperty.all(Colors.transparent),
                        tabs: const [
                          Tab(text: "Listings"),
                          Tab(text: "My Bids"),
                          Tab(text: "Favorites"),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ];
          },
          body: const TabBarView(
            children: [
              MyAuctionsTab(),
              MyBidsTab(),
              FavoritesTab(),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileStats extends ConsumerWidget {
  final WidgetRef ref;
  const _ProfileStats({required this.ref});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingsAsync = ref.watch(myAuctionsProvider);
    final bidsAsync = ref.watch(myBidsProvider);

    int listingCount = listingsAsync.value?.length ?? 0;
    int bidCount = bidsAsync.value?.length ?? 0;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _StatItem(label: "Listings", value: listingCount.toString()),
        Container(height: 24, width: 1, color: Colors.grey[300], margin: const EdgeInsets.symmetric(horizontal: 24)),
        _StatItem(label: "Active Bids", value: bidCount.toString()),
        Container(height: 24, width: 1, color: Colors.grey[300], margin: const EdgeInsets.symmetric(horizontal: 24)),
        const _StatItem(label: "Rating", value: "4.9"),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Colors.black,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            color: Colors.grey[600],
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class MyAuctionsTab extends ConsumerWidget {
  const MyAuctionsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myAuctionsAsync = ref.watch(myAuctionsProvider);

    return myAuctionsAsync.when(
      data: (auctions) {
        if (auctions.isEmpty) {
          return const _EmptyState(
            icon: Icons.storefront_outlined,
            title: "No listings yet",
            description: "Start selling your items today!",
          );
        }
        return CustomScrollView(
          key: const PageStorageKey<String>('myAuctions'),
          slivers: [
            SliverOverlapInjector(
              handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final auction = auctions[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _MyAuctionCard(auction: auction),
                    );
                  },
                  childCount: auctions.length,
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(child: Text("Error: $err")),
    );
  }
}

class _MyAuctionCard extends StatelessWidget {
  final Auction auction;
  const _MyAuctionCard({required this.auction});

  @override
  Widget build(BuildContext context) {
    final isActive = auction.status == 'active';
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        context.push('/auction/${auction.id}', extra: auction);
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Image.network(
                (auction.images != null && auction.images!.isNotEmpty) 
                    ? auction.images!.first 
                    : "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200",
                width: 90,
                height: 90,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    auction.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "\$${auction.currentPrice.toStringAsFixed(0)}",
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isActive ? Colors.green.withOpacity(0.1) : Colors.grey[100],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isActive ? "ACTIVE" : "CLOSED",
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isActive ? Colors.green[700] : Colors.grey[600],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.gavel, size: 14, color: Colors.grey[400]),
                      const SizedBox(width: 4),
                      Text(
                        "${auction.bidCount} Bids",
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}

class MyBidsTab extends ConsumerWidget {
  const MyBidsTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final myBidsAsync = ref.watch(myBidsProvider);

    return myBidsAsync.when(
      data: (bids) {
        if (bids.isEmpty) {
          return const _EmptyState(
            icon: Icons.gavel_outlined,
            title: "No bids placed",
            description: "Browse auctions and place your first bid!",
          );
        }
        return CustomScrollView(
          key: const PageStorageKey<String>('myBids'),
          slivers: [
            SliverOverlapInjector(
              handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final bid = bids[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _MyBidCard(bid: bid),
                    );
                  },
                  childCount: bids.length,
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(child: Text("Error: $err")),
    );
  }
}

class _MyBidCard extends StatelessWidget {
  final Bid bid;
  const _MyBidCard({required this.bid});

  @override
  Widget build(BuildContext context) {
    final auction = bid.auction;
    if (auction == null) return const SizedBox();

    final isWinning = bid.amount >= auction.currentPrice;

    return GestureDetector(
      onTap: () => context.push('/auction/${auction.id}', extra: auction),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isWinning ? Colors.green.withOpacity(0.3) : Colors.transparent,
            width: isWinning ? 2 : 0,
          ),
          boxShadow: [
             BoxShadow(
              color: isWinning ? Colors.green.withOpacity(0.05) : Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    (auction.images != null && auction.images!.isNotEmpty) 
                        ? auction.images!.first 
                        : "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=200",
                    width: 60,
                    height: 60,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        auction.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        DateFormat.MMMd().add_jm().format(bid.createdAt),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.grey[500],
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      "\$${bid.amount.toStringAsFixed(0)}",
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: isWinning ? Colors.green : Colors.black,
                      ),
                    ),
                    if (isWinning)
                      Text(
                        "WINNING",
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverOverlapInjector(
          handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
        ),
        SliverFillRemaining(
          hasScrollBody: false,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 48, color: Colors.grey[400]),
                ),
                const SizedBox(height: 24),
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class FavoritesTab extends ConsumerWidget {
  const FavoritesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);

    return favoritesAsync.when(
      data: (auctions) {
        if (auctions.isEmpty) {
          return const _EmptyState(
            icon: Icons.favorite_border,
            title: "No favorites yet",
            description: "Save items you love to watch them closely!",
          );
        }
        return CustomScrollView(
          key: const PageStorageKey<String>('favorites'),
          slivers: [
            SliverOverlapInjector(
              handle: NestedScrollView.sliverOverlapAbsorberHandleFor(context),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final auction = auctions[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: _MyAuctionCard(auction: auction),
                    );
                  },
                  childCount: auctions.length,
                ),
              ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => Center(child: Text("Error: $err")),
    );
  }
}
