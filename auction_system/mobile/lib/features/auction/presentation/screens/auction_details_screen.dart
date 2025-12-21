import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/models/comment_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:mobile/features/auction/presentation/providers/favorites_provider.dart';
import 'package:mobile/features/auction/data/repositories/auction_repository.dart';
import 'package:mobile/features/auction/data/repositories/report_repository.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gap/gap.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

// ═══════════════════════════════════════════════════════════════════════════
// AWARD-WINNING AUCTION DETAILS SCREEN
// ═══════════════════════════════════════════════════════════════════════════

class AuctionDetailsScreen extends ConsumerStatefulWidget {
  final int auctionId;
  final Auction initialData;

  const AuctionDetailsScreen({
    super.key,
    required this.auctionId,
    required this.initialData,
  });

  @override
  ConsumerState<AuctionDetailsScreen> createState() => _AuctionDetailsScreenState();
}

class _AuctionDetailsScreenState extends ConsumerState<AuctionDetailsScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(() {
      if (_scrollController.offset > 300 && !_isScrolled) {
        setState(() => _isScrolled = true);
      } else if (_scrollController.offset <= 300 && _isScrolled) {
        setState(() => _isScrolled = false);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Watch for live updates
    final auctionAsync = ref.watch(auctionListProvider.select((asyncList) {
      return asyncList.whenData((list) {
        return list.firstWhere(
          (element) => element.id == widget.auctionId,
          orElse: () => widget.initialData,
        );
      });
    }));

    final auction = auctionAsync.value ?? widget.initialData;

    // Prepare images
    List<String> images = auction.images ?? [];
    if (images.isEmpty || images.first.isEmpty) {
      images = [
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800",
        "https://images.unsplash.com/photo-1596740926475-9b936e9d6754?w=800",
      ];
    }

    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: _buildBottomBar(context, auction),
      body: CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(),
        slivers: [
          // 1. Premium Sticky Header
          SliverAppBar(
            expandedHeight: 400.h,
            pinned: true,
            backgroundColor: Colors.white,
            elevation: 0,
            leading: Padding(
              padding: EdgeInsets.all(8.w),
              child: _GlassButton(
                icon: Icons.arrow_back,
                onTap: () => context.pop(),
              ),
            ),
            actions: [
              _GlassButton(
                icon: Icons.share_outlined,
                onTap: () => HapticFeedback.lightImpact(),
              ),
              Gap(12.w),
              Consumer(
                builder: (context, ref, child) {
                  final isFav = ref.watch(favoritesProvider.select((value) =>
                      value.maybeWhen(
                          data: (list) => list.any((a) => a.id == widget.auctionId),
                          orElse: () => false)));
                  return _GlassButton(
                    icon: isFav ? Icons.favorite : Icons.favorite_border,
                    iconColor: isFav ? Colors.red : Colors.black,
                    onTap: () {
                      HapticFeedback.selectionClick();
                      ref.read(favoritesProvider.notifier).toggleFavorite(widget.auctionId);
                    },
                  );
                },
              ),
              Gap(12.w),
              _GlassButton(
                icon: Icons.more_vert,
                onTap: () => _showMoreOptions(context, auction),
              ),
              Gap(16.w),
            ],
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
              background: _ImageCarousel(images: images, auctionId: auction.id),
            ),
          ),

          // 2. Details Content with Staggered Animations
          // 2. Details Content
          SliverToBoxAdapter(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 32.h),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32.r)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title & Category Badge
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          auction.title,
                          style: GoogleFonts.outfit(
                            fontSize: 28.sp,
                            fontWeight: FontWeight.w800,
                            height: 1.1,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      Gap(12.w),
                      _StatusBadge(status: auction.status, endTime: auction.endTime),
                    ],
                  ),
                  Gap(20.h),

                  // Price & Stats Card
                  _PriceStatsCard(auction: auction),
                  Gap(32.h),

                  // Seller
                  Text("Seller", style: GoogleFonts.outfit(fontSize: 18.sp, fontWeight: FontWeight.w700)),
                  Gap(12.h),
                  _SellerCard(userId: auction.userId),
                  Gap(32.h),

                  // Description
                  Text("Description", style: GoogleFonts.outfit(fontSize: 18.sp, fontWeight: FontWeight.w700)),
                  Gap(12.h),
                  Text(
                    auction.description,
                    style: GoogleFonts.inter(
                      fontSize: 16.sp,
                      height: 1.6,
                      color: Colors.grey[800],
                    ),
                  ),
                  Gap(32.h),

                  // Bid History Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Bid History", style: GoogleFonts.outfit(fontSize: 18.sp, fontWeight: FontWeight.w700)),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Text(
                          "${auction.bidCount} Bids",
                          style: GoogleFonts.inter(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                  Gap(16.h),
                  _BidHistoryList(auctionId: auction.id),
                  Gap(32.h),

                  // Comments Section
                  _CommentsSection(auctionId: auction.id),
                  Gap(120.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, Auction auction) {
    return Container(
      padding: EdgeInsets.fromLTRB(24.w, 16.h, 24.w, MediaQuery.of(context).viewPadding.bottom + 16.h),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("Current Price", style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                Text(
                  "\$${auction.currentPrice.toStringAsFixed(0)}",
                  style: GoogleFonts.outfit(fontSize: 26.sp, fontWeight: FontWeight.w800, color: Colors.black),
                ),
              ],
            ),
          ),
          Gap(24.w),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: () => _showBidSheet(context, ref, auction),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 18.h),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                elevation: 0,
              ),
              child: Text("Place Bid", style: GoogleFonts.outfit(fontSize: 18.sp, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  void _showBidSheet(BuildContext context, WidgetRef ref, Auction auction) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BidBottomSheet(auction: auction),
    );
  }

  void _showMoreOptions(BuildContext context, Auction auction) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))),
          ListTile(
            leading: const Icon(Icons.flag_outlined, color: Colors.red),
            title: const Text("Report Auction"),
            onTap: () {
              Navigator.pop(context);
              _showReportDialog(context, auction.id, "auction");
            },
          ),
          ListTile(
            leading: const Icon(Icons.share_outlined),
            title: const Text("Share"),
            onTap: () {
               Navigator.pop(context);
               // Implement share
            },
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  void _showReportDialog(BuildContext context, int subjectId, String type) {
    String? selectedReason;
    final reasons = ["Inappropriate content", "Spam", "Fraudulent", "Other"];
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text("Report $type"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                items: reasons.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                onChanged: (val) => setState(() => selectedReason = val),
                decoration: const InputDecoration(labelText: "Reason"),
                value: selectedReason,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: descController,
                decoration: const InputDecoration(labelText: "Details (Optional)"),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
            ElevatedButton(
              onPressed: selectedReason == null ? null : () async {
                try {
                  await ref.read(reportRepositoryProvider).report(
                    subjectType: type,
                    subjectId: subjectId,
                    reason: selectedReason!,
                    description: descController.text,
                  );
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Report submitted. Thank you."), backgroundColor: Colors.green),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
                  );
                }
              },
              child: const Text("Submit"),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

class _ImageCarousel extends StatefulWidget {
  final List<String> images;
  final int auctionId;

  const _ImageCarousel({required this.images, required this.auctionId});

  @override
  State<_ImageCarousel> createState() => _ImageCarouselState();
}

class _ImageCarouselState extends State<_ImageCarousel> {
  final PageController _controller = PageController();
  int _current = 0;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        PageView.builder(
          controller: _controller,
          itemCount: widget.images.length,
          onPageChanged: (index) => setState(() => _current = index),
          itemBuilder: (context, index) {
            return CachedNetworkImage(
                imageUrl: widget.images[index],
                fit: BoxFit.cover,
                placeholder: (_, __) => Container(color: Colors.grey[200]),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[300],
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.broken_image, color: Colors.grey, size: 48.sp),
                      Gap(8.h),
                      Text("Image Error", style: GoogleFonts.inter(fontSize: 12.sp, color: Colors.grey[600])),
                    ],
                  ),
                ),
              );
          },
        ),
        // Premium Gradient Overlay
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.4),
                  Colors.transparent,
                  Colors.transparent,
                  Colors.white.withOpacity(0.8),
                ],
                stops: const [0.0, 0.2, 0.7, 1.0],
              ),
            ),
          ),
        ),
        // Indicators
        if (widget.images.length > 1)
          Positioned(
            bottom: 48.h,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                widget.images.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: EdgeInsets.symmetric(horizontal: 4.w),
                  width: _current == index ? 24.w : 8.w,
                  height: 6.h,
                  decoration: BoxDecoration(
                    color: _current == index ? Colors.black : Colors.black.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

class _StatusBadge extends StatelessWidget {
  final String status;
  final DateTime? endTime;

  const _StatusBadge({required this.status, required this.endTime});

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'active';
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
      decoration: BoxDecoration(
        color: isActive ? Colors.black : Colors.grey[100],
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer_outlined,
            size: 16.sp,
            color: isActive ? Colors.white : Colors.grey[700],
          ),
          Gap(6.w),
          Text(
            isActive ? "Ends ${DateFormat.MMMd().format(endTime ?? DateTime.now())}" : "CLOSED",
            style: GoogleFonts.outfit(
              fontSize: 12.sp,
              fontWeight: FontWeight.w700,
              color: isActive ? Colors.white : Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceStatsCard extends StatelessWidget {
  final Auction auction;

  const _PriceStatsCard({required this.auction});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(24.r),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Current Price",
                  style: GoogleFonts.inter(
                    fontSize: 13.sp,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Gap(8.h),
                Text(
                  "\$${auction.currentPrice.toStringAsFixed(0)}",
                  style: GoogleFonts.outfit(
                    fontSize: 34.sp,
                    fontWeight: FontWeight.w800,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 1.w,
            height: 50.h,
            color: Colors.grey[200],
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "Total Bids",
                  style: GoogleFonts.inter(
                    fontSize: 13.sp,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Gap(8.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.gavel_rounded, size: 18.sp, color: Colors.white),
                    ),
                    Gap(10.w),
                    Text(
                      "${auction.bidCount}",
                      style: GoogleFonts.outfit(
                        fontSize: 28.sp,
                        fontWeight: FontWeight.w800,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SellerCard extends StatelessWidget {
  final int userId;

  const _SellerCard({required this.userId});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/users/$userId'),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(2), // Border
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor, // Verified color
                      shape: BoxShape.circle,
                    ),
                    child: const CircleAvatar(
                      radius: 26,
                      backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=60"),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              "Sarah Jenkins", // Placeholder for actual user name
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, size: 16, color: Colors.blue),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(Icons.star, size: 14, color: Colors.amber[700]),
                            const SizedBox(width: 2),
                            Text(
                              "View Profile", // Changed from static rating to call to action
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: Colors.grey[600],
                                fontWeight: FontWeight.w500,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              HapticFeedback.lightImpact();
              // Navigate to chat
              context.push('/messages'); // Or specific thread
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: const Icon(Icons.chat_bubble_outline, size: 20),
          ),
        ],
      ),
    );
  }
}

class _GlassButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color? iconColor;

  const _GlassButton({
    required this.icon,
    required this.onTap,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: 'glass_btn_${icon.hashCode}',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 44.w,
          height: 44.w,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 15,
                spreadRadius: 2,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            icon,
            color: iconColor ?? Colors.black,
            size: 20.sp,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════════════

class _BidBottomSheet extends ConsumerStatefulWidget {
  final Auction auction;

  const _BidBottomSheet({required this.auction});

  @override
  ConsumerState<_BidBottomSheet> createState() => _BidBottomSheetState();
}

class _BidBottomSheetState extends ConsumerState<_BidBottomSheet> {
  late TextEditingController _controller;
  double _currentBid = 0;

  @override
  void initState() {
    super.initState();
    _currentBid = widget.auction.currentPrice + 10;
    _controller = TextEditingController(text: _currentBid.toStringAsFixed(0));
  }

  void _incrementBid(double amount) {
    if (!mounted) return;
    HapticFeedback.selectionClick();
    setState(() {
      _currentBid += amount;
      _controller.text = _currentBid.toStringAsFixed(0);
    });
  }

  Future<void> _placeBid() async {
    HapticFeedback.mediumImpact();
    final amount = double.tryParse(_controller.text);
    if (amount == null || amount <= widget.auction.currentPrice) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Bid must be higher than current price")),
      );
      return;
    }

    try {
      Navigator.pop(context);
      await ref.read(auctionRepositoryProvider).placeBid(widget.auction.id, amount);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(
            content: Text("🎉 Bid of \$$amount placed successfully!"),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 24,
        right: 24,
        top: 32,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Place a Bid",
                style: GoogleFonts.outfit(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close),
              )
            ],
          ),
          const SizedBox(height: 8),
          Text(
            "Current price: \$${widget.auction.currentPrice.toStringAsFixed(0)}",
            style: GoogleFonts.inter(color: Colors.grey[600]),
          ),
          const SizedBox(height: 32),
          
          // Bid Input Field
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            style: GoogleFonts.outfit(fontSize: 40, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
            decoration: InputDecoration(
              prefixText: "\$",
              prefixStyle: GoogleFonts.outfit(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.grey[400]),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Quick Increment Chips
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _IncrementChip(amount: 10, onTap: () => _incrementBid(10)),
              const SizedBox(width: 12),
              _IncrementChip(amount: 50, onTap: () => _incrementBid(50)),
              const SizedBox(width: 12),
              _IncrementChip(amount: 100, onTap: () => _incrementBid(100)),
            ],
          ),
          
          const SizedBox(height: 32),
          
          ElevatedButton(
            onPressed: _placeBid,
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: Text(
              "Confirm Bid",
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _IncrementChip extends StatelessWidget {
  final int amount;
  final VoidCallback onTap;

  const _IncrementChip({required this.amount, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black12),
        ),
        child: Text(
          "+\$$amount",
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BID HISTORY
// ═══════════════════════════════════════════════════════════════════════════

final bidHistoryProvider = FutureProvider.family<List<dynamic>, int>((ref, auctionId) async {
  final repo = ref.watch(auctionRepositoryProvider);
  return repo.getBidHistory(auctionId);
});

class _BidHistoryList extends ConsumerWidget {
  final int auctionId;
  const _BidHistoryList({required this.auctionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bidsAsync = ref.watch(bidHistoryProvider(auctionId));
    
    return bidsAsync.when(
      data: (bids) {
        if (bids.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Icon(Icons.history, size: 48, color: Colors.grey[300]),
                  const SizedBox(height: 12),
                  Text(
                    "No bids yet",
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey[400],
                    ),
                  ),
                  Text(
                    "Be the first to place a bid!",
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
          );
        }
        
        return Column(
          children: List.generate(
             bids.length > 5 ? 5 : bids.length,
             (index) => _BidItem(bid: bids[index], isTopBid: index == 0),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => const SizedBox(),
    );
  }
}

class _BidItem extends StatelessWidget {
  final dynamic bid;
  final bool isTopBid;

  const _BidItem({required this.bid, required this.isTopBid});

  @override
  Widget build(BuildContext context) {
    final amount = bid['amount'] ?? 0.0;
    final createdAt = DateTime.tryParse(bid['created_at'] ?? '') ?? DateTime.now();
    final user = bid['user'];
    final username = user?['username'] ?? 'Bidder';
    
    // Time ago
    String timeAgo = "";
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) {
      timeAgo = "Just now";
    } else if (diff.inMinutes < 60) {
      timeAgo = "${diff.inMinutes}m ago";
    } else if (diff.inHours < 24) {
      timeAgo = "${diff.inHours}h ago";
    } else {
      timeAgo = DateFormat.MMMd().format(createdAt);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isTopBid ? Colors.green.withOpacity(0.05) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isTopBid ? Colors.green.withOpacity(0.2) : Colors.grey[200]!,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: isTopBid ? Colors.green.withOpacity(0.1) : Colors.grey[100],
            child: Text(
              username[0].toUpperCase(),
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.bold,
                color: isTopBid ? Colors.green : Colors.black54,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  username,
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                Text(
                  timeAgo,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          Text(
            "\$${(amount as num).toStringAsFixed(0)}",
            style: GoogleFonts.outfit(
              fontWeight: FontWeight.w800,
              fontSize: 18,
              color: isTopBid ? Colors.green : Colors.black,
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

class _CommentsSection extends ConsumerStatefulWidget {
  final int auctionId;

  const _CommentsSection({required this.auctionId});

  @override
  ConsumerState<_CommentsSection> createState() => _CommentsSectionState();
}

class _CommentsSectionState extends ConsumerState<_CommentsSection> {
  final TextEditingController _commentController = TextEditingController();
  bool _isPosting = false;
  late Future<List<Comment>> _commentsFuture;

  @override
  void initState() {
    super.initState();
    _commentsFuture = ref.read(auctionRepositoryProvider).getComments(widget.auctionId);
  }

  @override
  Widget build(BuildContext context) {
    // We'll manage state locally for simplicity, or could use a provider
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Questions & Comments",
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).primaryColor,
              ),
            ),
            TextButton.icon(
              onPressed: () => _showCommentSheet(context),
              icon: Icon(Icons.add_comment_outlined, size: 18, color: Theme.of(context).colorScheme.secondary),
              label: Text(
                "Ask",
                style: GoogleFonts.inter(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.secondary),
              ),
              style: TextButton.styleFrom(
                foregroundColor: Theme.of(context).colorScheme.secondary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        FutureBuilder<List<Comment>>(
          future: _commentsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Shimmer.fromColors(
                baseColor: Colors.grey[300]!,
                highlightColor: Colors.grey[100]!,
                child: Column(
                  children: List.generate(2, (index) => Container(
                    height: 60,
                    margin: const EdgeInsets.only(bottom: 12),
                    color: Colors.white,
                  )),
                ),
              );
            }

            if (snapshot.hasError) {
              return Text("Failed to load comments", style: TextStyle(color: Colors.red[300]));
            }

            final comments = snapshot.data ?? [];
            if (comments.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(24),
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    Icon(Icons.chat_bubble_outline, size: 32, color: Colors.grey[400]),
                    const SizedBox(height: 8),
                    Text(
                      "No questions yet",
                      style: GoogleFonts.inter(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      "Be the first to ask the seller something!",
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: comments.map((comment) => _CommentCard(comment: comment)).toList(),
            );
          },
        ),
      ],
    );
  }

  void _showCommentSheet(BuildContext context) {
    final TextEditingController _commentController = TextEditingController();
    bool _isPosting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Ask a Question", style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
                    IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _commentController,
                  decoration: InputDecoration(
                    hintText: "Is this still available?",
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  maxLines: 3,
                  autofocus: true,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isPosting ? null : () async {
                      if (_commentController.text.trim().isEmpty) return;
                      setModalState(() => _isPosting = true);
                      try {
                        await ref.read(auctionRepositoryProvider).postComment(
                          widget.auctionId, 
                          _commentController.text.trim()
                        );
                        Navigator.pop(context);
                        _commentController.clear();
                        setState(() {}); // Refresh parent list
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Question posted!"), backgroundColor: Colors.green),
                        );
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
                        );
                      } finally {
                        setModalState(() => _isPosting = false);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _isPosting 
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text("Post Question"),
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

class _CommentCard extends StatelessWidget {
  final Comment comment;

  const _CommentCard({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[100]!),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: Colors.grey[200],
            child: Text(
              comment.user?.username.substring(0, 1).toUpperCase() ?? "U",
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.bold,
                color: Colors.black,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      comment.user?.username ?? "User",
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      DateFormat.MMMd().format(comment.createdAt),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  comment.content,
                  style: GoogleFonts.inter(
                    color: Colors.grey[800],
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
