import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/models/category_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:mobile/features/auction/presentation/providers/realtime_provider.dart';
import 'package:mobile/features/auction/presentation/providers/category_provider.dart';
import 'package:mobile/features/auction/presentation/widgets/town_selector.dart';
import 'package:mobile/features/notification/presentation/providers/notification_provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gap/gap.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_animate/flutter_animate.dart';

// ═══════════════════════════════════════════════════════════════════════════
// AWARD-WINNING HOME SCREEN - A MARVEL AMONG APPS
// ═══════════════════════════════════════════════════════════════════════════

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _searchController;
  late Animation<double> _searchAnimation;
  final ScrollController _scrollController = ScrollController();
  bool _showSearchBar = false;
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..forward();
    
    _searchController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _searchAnimation = CurvedAnimation(
      parent: _searchController,
      curve: Curves.easeOutCubic,
    );
    
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.offset > 100 && !_showSearchBar) {
      setState(() => _showSearchBar = true);
      _searchController.forward();
    } else if (_scrollController.offset <= 100 && _showSearchBar) {
      setState(() => _showSearchBar = false);
      _searchController.reverse();
    }
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    HapticFeedback.mediumImpact();
    setState(() => _isRefreshing = true);
    await ref.read(auctionListProvider.notifier).refresh();
    await Future.delayed(const Duration(milliseconds: 500));
    setState(() => _isRefreshing = false);
    HapticFeedback.lightImpact();
  }

  @override
  Widget build(BuildContext context) {
    final auctionListAsync = ref.watch(auctionListProvider);
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    // Listen to WebSocket events
    ref.listen(realTimeEventsProvider, (previous, next) {
      next.whenData((event) {
        if (event['type'] == 'NOTIFICATION_RECEIVED') {
          // Invalidate notifications list and count
          ref.invalidate(notificationsProvider);
          
          // Show quick toast/snackbar
          final payload = event['payload'] as Map<String, dynamic>;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(payload['title'] ?? 'New Notification', style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(payload['message'] ?? '', style: const TextStyle(fontSize: 12)),
                ],
              ),
              behavior: SnackBarBehavior.floating,
              backgroundColor: Colors.black,
              margin: const EdgeInsets.all(20),
              duration: const Duration(seconds: 4),
              action: SnackBarAction(
                label: "VIEW",
                textColor: Colors.blue,
                onPressed: () => context.push('/notifications'),
              ),
            ),
          );
        } else {
          ref.read(auctionListProvider.notifier).handleRealTimeEvent(event);
        }
      });
    });

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: Stack(
        children: [
          // Main Content
          RefreshIndicator(
            onRefresh: _onRefresh,
            color: Colors.black,
            backgroundColor: Colors.white,
            strokeWidth: 2.5,
            displacement: 60,
            child: AnimationLimiter(
              child: CustomScrollView(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(
                parent: BouncingScrollPhysics(),
              ),
              slivers: [
                // ══════════════════════════════════════════════════════════
                // 1. HERO APP BAR - Premium & Minimal
                // ══════════════════════════════════════════════════════════
                SliverAppBar(
                  expandedHeight: 140.h,
                  floating: false,
                  pinned: true,
                  stretch: true,
                  backgroundColor: const Color(0xFFFAFAFA),
                  surfaceTintColor: Colors.transparent,
                  elevation: 0,
                  flexibleSpace: FlexibleSpaceBar(
                    stretchModes: const [StretchMode.zoomBackground],
                    background: SafeArea(
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // Greeting
                                FadeTransition(
                                  opacity: _fadeController,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _getGreeting(),
                                        style: GoogleFonts.inter(
                                          fontSize: 14.sp,
                                          color: Colors.grey[600],
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Gap(4.h),
                                      Text(
                                        "Discover",
                                        style: GoogleFonts.outfit(
                                          fontSize: 32.sp,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.black,
                                          letterSpacing: -0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Actions
                                Row(
                                  children: [
                                    _NotificationBadge(),
                                    Gap(8.w),
                                    _PremiumAvatar(),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                // 2. SEARCH BAR
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(20.w, 0, 20.w, 16.h),
                    child: _AnimatedSearchBar(
                      onTap: () => context.push('/search'),
                    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.2),
                  ),
                ),

                // 3. TOWN SELECTOR
                SliverToBoxAdapter(
                  child: TownSelector(),
                ),

                // 4. FEATURED CAROUSEL
                SliverToBoxAdapter(
                  child: _FeaturedCarousel(),
                ),

                // 5. CATEGORY SELECTOR
                SliverToBoxAdapter(
                  child: _PremiumCategorySelector(),
                ),

                // ══════════════════════════════════════════════════════════
                // 6. ENDING SOON SECTION - Urgency & FOMO
                // ══════════════════════════════════════════════════════════
                auctionListAsync.when(
                  data: (auctions) => _EndingSoonSection(
                    auctions: auctions.where((a) => a.status == 'active').take(5).toList(),
                  ),
                  loading: () => const SliverToBoxAdapter(child: SizedBox.shrink()),
                  error: (_, __) => const SliverToBoxAdapter(child: SizedBox.shrink()),
                ),

                // ══════════════════════════════════════════════════════════
                // 7. SECTION HEADER - Latest Auctions
                // ══════════════════════════════════════════════════════════
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                  sliver: SliverToBoxAdapter(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "Explore All",
                          style: GoogleFonts.ebGaramond(
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.tune, size: 16, color: Colors.grey[700]),
                              const SizedBox(width: 6),
                              Text(
                                "Filter",
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey[700],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // ══════════════════════════════════════════════════════════
                // 8. AUCTION GRID - Staggered & Animated
                // ══════════════════════════════════════════════════════════
                auctionListAsync.when(
                  data: (auctions) => SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: 20.w),
                    sliver: SliverGrid(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 16.h,
                          crossAxisSpacing: 16.w,
                          childAspectRatio: 0.62,
                        ),
                        delegate: SliverChildBuilderDelegate(
                        (context, index) => AnimationConfiguration.staggeredGrid(
                          position: index,
                          duration: const Duration(milliseconds: 500),
                          columnCount: 2,
                          child: ScaleAnimation(
                            child: FadeInAnimation(
                              child: _AnimatedAuctionCard(
                                auction: auctions[index],
                                index: index,
                              ),
                            ),
                          ),
                        ),
                        childCount: auctions.length,
                      ),
                    ),
                  ),
                  loading: () => SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 16.h,
                        crossAxisSpacing: 16.w,
                        childAspectRatio: 0.62,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _ShimmerAuctionCard(),
                        childCount: 4,
                      ),
                    ),
                  ),
                  error: (err, stack) => SliverFillRemaining(
                    child: _ErrorState(
                      message: err.toString(),
                      onRetry: () => ref.refresh(auctionListProvider),
                    ),
                  ),
                ),

                // Bottom padding for FAB
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),

          // ══════════════════════════════════════════════════════════
          // FLOATING SEARCH BAR (appears on scroll)
          // ══════════════════════════════════════════════════════════
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AnimatedBuilder(
              animation: _searchAnimation,
              builder: (context, child) {
                return Transform.translate(
                  offset: Offset(0, -80 * (1 - _searchAnimation.value)),
                  child: Opacity(
                    opacity: _searchAnimation.value,
                    child: Container(
                      color: const Color(0xFFFAFAFA),
                      child: SafeArea(
                        bottom: false,
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
                          child: _AnimatedSearchBar(
                            onTap: () => context.push('/search'),
                            compact: true,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      
      // ══════════════════════════════════════════════════════════
      // FLOATING ACTION BUTTON - Premium Design
      // ══════════════════════════════════════════════════════════
      floatingActionButton: _PremiumFAB(
        onPressed: () => context.push('/create-auction'),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return "Good morning ☀️";
    if (hour < 17) return "Good afternoon 🌤️";
    return "Good evening 🌙";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM SEARCH BAR
// ═══════════════════════════════════════════════════════════════════════════

class _AnimatedSearchBar extends StatefulWidget {
  final VoidCallback onTap;
  final bool compact;

  const _AnimatedSearchBar({required this.onTap, this.compact = false});

  @override
  State<_AnimatedSearchBar> createState() => _AnimatedSearchBarState();
}

class _AnimatedSearchBarState extends State<_AnimatedSearchBar> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        setState(() => _isPressed = true);
        HapticFeedback.selectionClick();
      },
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        height: widget.compact ? 48 : 56,
        transform: Matrix4.identity()..scale(_isPressed ? 0.98 : 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(_isPressed ? 0.08 : 0.04),
              blurRadius: _isPressed ? 8 : 12,
              offset: Offset(0, _isPressed ? 2 : 4),
            ),
          ],
        ),
        child: Row(
          children: [
            const SizedBox(width: 16),
            Icon(
              Icons.search_rounded,
              color: Colors.grey[400],
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                "Search auctions, categories...",
                style: GoogleFonts.inter(
                  color: Colors.grey[400],
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.mic_none_rounded, size: 18, color: Colors.grey[600]),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM CATEGORY SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

class _PremiumCategorySelector extends ConsumerStatefulWidget {
  @override
  ConsumerState<_PremiumCategorySelector> createState() => _PremiumCategorySelectorState();
}

class _PremiumCategorySelectorState extends ConsumerState<_PremiumCategorySelector> {
  int _selectedIndex = 0;

  static const Map<String, IconData> categoryIcons = {
    'all': Icons.grid_view_rounded,
    'vehicles': Icons.directions_car_rounded,
    'electronics': Icons.devices_rounded,
    'property': Icons.home_rounded,
    'furniture': Icons.chair_rounded,
    'fashion': Icons.checkroom_rounded,
    'sports': Icons.sports_basketball_rounded,
    'collectibles': Icons.diamond_rounded,
    'art': Icons.palette_rounded,
    'books': Icons.menu_book_rounded,
  };

  IconData _getIcon(String name) {
    final key = name.toLowerCase();
    for (final entry in categoryIcons.entries) {
      if (key.contains(entry.key)) return entry.value;
    }
    return Icons.category_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoryListProvider);

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 8),
      child: categoriesAsync.when(
        data: (categories) {
          return SizedBox(
            height: 48,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: categories.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final isSelected = _selectedIndex == index;
                final String label = index == 0 ? "All" : categories[index - 1].name;
                final IconData icon = index == 0 
                    ? Icons.grid_view_rounded 
                    : _getIcon(categories[index - 1].name);

                return GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    setState(() => _selectedIndex = index);
                    final categoryId = index == 0 ? 0 : categories[index - 1].id;
                    ref.read(auctionListProvider.notifier).filterByCategory(categoryId);
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOutCubic,
                    padding: EdgeInsets.symmetric(
                      horizontal: isSelected ? 18 : 14,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.black : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? Colors.black : const Color(0xFFE5E7EB),
                        width: 1.5,
                      ),
                      boxShadow: isSelected ? [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.15),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ] : null,
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      children: [
                        Icon(
                          icon,
                          size: 18,
                          color: isSelected ? Colors.white : Colors.grey[600],
                        ),
                        const SizedBox(width: 8),
                        Text(
                          label,
                          style: GoogleFonts.inter(
                            color: isSelected ? Colors.white : Colors.grey[700],
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
        loading: () => _ShimmerCategories(),
        error: (e, s) => const SizedBox.shrink(),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURED CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

class _FeaturedCarousel extends StatefulWidget {
  @override
  State<_FeaturedCarousel> createState() => _FeaturedCarouselState();
}

class _FeaturedCarouselState extends State<_FeaturedCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.88);
  int _currentPage = 0;

  final List<_FeaturedItem> _items = [
    _FeaturedItem(
      title: "Premium Vehicles",
      subtitle: "Luxury collection",
      gradient: const [Color(0xFF1A1A2E), Color(0xFF16213E)],
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      icon: Icons.directions_car,
    ),
    _FeaturedItem(
      title: "Smart Electronics",
      subtitle: "Latest tech deals",
      gradient: const [Color(0xFF0F4C75), Color(0xFF3282B8)],
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      icon: Icons.devices,
    ),
    _FeaturedItem(
      title: "Home & Living",
      subtitle: "Transform your space",
      gradient: const [Color(0xFF2D6A4F), Color(0xFF40916C)],
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      icon: Icons.home_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 180,
          child: PageView.builder(
            controller: _controller,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _items.length,
            itemBuilder: (context, index) {
              return AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  double value = 1.0;
                  if (_controller.position.haveDimensions) {
                    value = (_controller.page! - index).abs();
                    value = (1 - (value * 0.15)).clamp(0.85, 1.0);
                  }
                  return Center(
                    child: Transform.scale(
                      scale: value,
                      child: Opacity(
                        opacity: value,
                        child: _FeaturedCard(item: _items[index]),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        // Page indicators
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_items.length, (index) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentPage == index ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _currentPage == index ? Colors.black : Colors.grey[300],
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

class _FeaturedItem {
  final String title;
  final String subtitle;
  final List<Color> gradient;
  final String image;
  final IconData icon;

  _FeaturedItem({
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.image,
    required this.icon,
  });
}

class _FeaturedCard extends StatelessWidget {
  final _FeaturedItem item;

  const _FeaturedCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: item.gradient.first.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background image
            CachedNetworkImage(
              imageUrl: item.image,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: item.gradient),
                ),
              ),
            ),
            // Gradient overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  colors: [
                    item.gradient.first.withOpacity(0.7),
                    item.gradient.last.withOpacity(0.95),
                  ],
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            item.subtitle.toUpperCase(),
                            style: GoogleFonts.inter(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item.title,
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "Explore →",
                            style: GoogleFonts.inter(
                              color: Colors.black,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(item.icon, color: Colors.white, size: 32),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ENDING SOON SECTION
// ═══════════════════════════════════════════════════════════════════════════

class _EndingSoonSection extends StatelessWidget {
  final List<Auction> auctions;

  const _EndingSoonSection({required this.auctions});

  @override
  Widget build(BuildContext context) {
    if (auctions.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());

    return SliverToBoxAdapter(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.timer, color: Colors.red, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  "Ending Soon",
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        "LIVE",
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 200,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: auctions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) => _EndingSoonCard(auction: auctions[index]),
            ),
          ),
        ],
      ),
    );
  }
}

class _EndingSoonCard extends StatefulWidget {
  final Auction auction;

  const _EndingSoonCard({required this.auction});

  @override
  State<_EndingSoonCard> createState() => _EndingSoonCardState();
}

class _EndingSoonCardState extends State<_EndingSoonCard> {
  late Timer _timer;
  Duration _remaining = const Duration(hours: 2, minutes: 34, seconds: 12);

  @override
  void initState() {
    super.initState();
    // Simulate countdown (in real app, use actual end time)
    _remaining = Duration(
      hours: Random().nextInt(5) + 1,
      minutes: Random().nextInt(60),
      seconds: Random().nextInt(60),
    );
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_remaining.inSeconds > 0) {
        setState(() => _remaining -= const Duration(seconds: 1));
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String imageUrl = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800";
    if (widget.auction.images != null && widget.auction.images!.isNotEmpty) {
      imageUrl = widget.auction.images!.first;
    }

    return GestureDetector(
      onTap: () => context.push('/auction/${widget.auction.id}', extra: widget.auction),
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.red.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Row(
            children: [
              // Image
              SizedBox(
                width: 120,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.cover,
                  height: double.infinity,
                  placeholder: (_, __) => Container(color: Colors.grey[200]),
                  errorWidget: (_, __, ___) => Container(color: Colors.grey[200]),
                ),
              ),
              // Details
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Countdown
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          "${_remaining.inHours}h ${_remaining.inMinutes % 60}m ${_remaining.inSeconds % 60}s",
                          style: GoogleFonts.jetBrainsMono(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        widget.auction.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          height: 1.2,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "\$${widget.auction.currentPrice.toStringAsFixed(0)}",
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w800,
                              fontSize: 20,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.gavel, size: 14, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(
                                  "${widget.auction.bidCount}",
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED AUCTION CARD
// ═══════════════════════════════════════════════════════════════════════════

class _AnimatedAuctionCard extends StatefulWidget {
  final Auction auction;
  final int index;

  const _AnimatedAuctionCard({required this.auction, required this.index});

  @override
  State<_AnimatedAuctionCard> createState() => _AnimatedAuctionCardState();
}

class _AnimatedAuctionCardState extends State<_AnimatedAuctionCard> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 400 + (widget.index * 50)),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    
    Future.delayed(Duration(milliseconds: widget.index * 100), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String imageUrl = "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800";
    if (widget.auction.images != null && widget.auction.images!.isNotEmpty) {
      imageUrl = widget.auction.images!.first;
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value * (_isPressed ? 0.96 : 1.0),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: child,
          ),
        );
      },
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: () {
          HapticFeedback.lightImpact();
          context.push('/auction/${widget.auction.id}', extra: widget.auction);
        },
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(_isPressed ? 0.08 : 0.05),
                blurRadius: _isPressed ? 8 : 16,
                offset: Offset(0, _isPressed ? 4 : 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image
                Expanded(
                  flex: 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Hero(
                        tag: 'auction_image_${widget.auction.id}',
                        child: CachedNetworkImage(
                          imageUrl: imageUrl,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Shimmer.fromColors(
                            baseColor: Colors.grey[300]!,
                            highlightColor: Colors.grey[100]!,
                            child: Container(color: Colors.grey),
                          ),
                          errorWidget: (_, __, ___) => Container(
                            color: Colors.grey[200],
                            child: Icon(Icons.image, color: Colors.grey[400]),
                          ),
                        ),
                      ),
                      // Status badge
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: widget.auction.status == 'active' 
                                ? Colors.green 
                                : Colors.grey,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            widget.auction.status == 'active' ? "LIVE" : "ENDED",
                            style: GoogleFonts.inter(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      // Heart button
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.favorite_border,
                            size: 18,
                            color: Colors.black54,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Details
                Expanded(
                  flex: 2,
                  child: Padding(
                    padding: EdgeInsets.all(12.w), // Slightly reduced padding
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.auction.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(
                            fontWeight: FontWeight.w600,
                            fontSize: 13.sp, // Responsive font size
                            height: 1.2,
                          ),
                        ),
                        const Spacer(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              flex: 3,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Current Price",
                                    style: GoogleFonts.inter(
                                      fontSize: 9.sp,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  FittedBox(
                                    fit: BoxFit.scaleDown,
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      "\$${widget.auction.currentPrice.toStringAsFixed(0)}",
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 17.sp,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Gap(8.w),
                            Flexible(
                              flex: 2,
                              child: Container(
                                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.04),
                                  borderRadius: BorderRadius.circular(8.r),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.gavel_rounded, size: 10.sp, color: Colors.black54),
                                    Gap(4.w),
                                    Text(
                                      "${widget.auction.bidCount}",
                                      style: GoogleFonts.inter(
                                        fontSize: 11.sp,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SHIMMER LOADING STATES
// ═══════════════════════════════════════════════════════════════════════════

class _ShimmerAuctionCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 3,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 14,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 100,
                      height: 14,
                      color: Colors.grey,
                    ),
                    const Spacer(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(width: 60, height: 20, color: Colors.grey),
                        Container(width: 40, height: 20, color: Colors.grey),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ShimmerCategories extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        scrollDirection: Axis.horizontal,
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) => Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            width: 80 + (index * 10).toDouble(),
            decoration: BoxDecoration(
              color: Colors.grey,
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

class _NotificationBadge extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadNotificationCountProvider);

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        context.push('/notifications');
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Stack(
          children: [
            const Icon(Icons.notifications_outlined, size: 24),
            if (unreadCount > 0)
              Positioned(
                right: -2,
                top: -2,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                  child: Text(
                    unreadCount > 9 ? '9+' : '$unreadCount',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PremiumAvatar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        context.go('/profile');
      },
      child: Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.black, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const CircleAvatar(
          radius: 22,
          backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=12"),
        ),
      ),
    );
  }
}

class _PremiumFAB extends StatefulWidget {
  final VoidCallback onPressed;

  const _PremiumFAB({required this.onPressed});

  @override
  State<_PremiumFAB> createState() => _PremiumFABState();
}

class _PremiumFABState extends State<_PremiumFAB> 
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        HapticFeedback.mediumImpact();
        widget.onPressed();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        transform: Matrix4.identity()..scale(_isPressed ? 0.92 : 1.0),
        child: Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 16,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Icon(
            Icons.add_rounded,
            color: Colors.white,
            size: 32,
          ),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.error_outline, size: 48, color: Colors.red),
            ),
            const SizedBox(height: 24),
            Text(
              "Oops! Something went wrong",
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text("Try Again"),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
