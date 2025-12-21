import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auction/presentation/widgets/auction_grid_card.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../auction/data/models/auction_model.dart';
import 'package:mobile/features/auth/data/models/review_model.dart';
import 'package:mobile/features/auction/data/repositories/report_repository.dart';
import 'package:intl/intl.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gap/gap.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_animate/flutter_animate.dart';

// --- DATA MODELS ---
class PublicProfile {
  final int id;
  final String username;
  final String? avatarUrl;
  final bool isVerified;
  final int followersCount;
  final int followingCount;
  final List<Auction> auctions;

  PublicProfile({
    required this.id,
    required this.username,
    this.avatarUrl,
    required this.isVerified,
    required this.followersCount,
    required this.followingCount,
    required this.auctions,
  });

  factory PublicProfile.fromJson(Map<String, dynamic> json) {
    var user = json['user'];
    var auctionList = (json['auctions'] as List?)?.map((x) => Auction.fromJson(x)).toList() ?? [];
    return PublicProfile(
      id: user['id'],
      username: user['username'],
      avatarUrl: user['avatar_url'],
      isVerified: user['is_verified'] ?? false,
      followersCount: json['followers_count'] ?? 0,
      followingCount: json['following_count'] ?? 0,
      auctions: auctionList,
    );
  }
}

// --- PROVIDER ---

// --- PROVIDERS ---
final publicProfileProvider = FutureProvider.family<PublicProfile, int>((ref, userId) async {
  final response = await http.get(Uri.parse('http://127.0.0.1:8080/users/$userId'));
  if (response.statusCode == 200) {
    return PublicProfile.fromJson(json.decode(response.body));
  }
  throw Exception('Failed to load profile');
});

final reviewsProvider = FutureProvider.family<List<Review>, int>((ref, userId) async {
  final response = await http.get(Uri.parse('http://127.0.0.1:8080/users/$userId/reviews'));
  if (response.statusCode == 200) {
    final List<dynamic> data = json.decode(response.body);
    return data.map((x) => Review.fromJson(x)).toList();
  }
  return [];
});

final followStatusProvider = StateProvider.family<bool, int>((ref, userId) => false);

// --- SCREEN ---
class PublicProfileScreen extends ConsumerStatefulWidget {
  final int userId;
  const PublicProfileScreen({super.key, required this.userId});

  @override
  ConsumerState<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends ConsumerState<PublicProfileScreen> {
  bool _isFollowing = false;

  Future<void> _toggleFollow() async {
    final auth = ref.read(authProvider);
    if (auth.token == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Login to follow users")));
      return;
    }

    setState(() => _isFollowing = !_isFollowing);

    final response = await http.post(
      Uri.parse('http://127.0.0.1:8080/users/${widget.userId}/follow'),
      headers: {'Authorization': 'Bearer ${auth.token}'},
    );

    if (response.statusCode != 200) {
      setState(() => _isFollowing = !_isFollowing);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to follow")));
    } else {
      ref.invalidate(publicProfileProvider(widget.userId));
    }
  }

  void _showReviewModal() {
    final auth = ref.read(authProvider);
    if (auth.token == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Login to leave a review")));
      return;
    }
    // Prevent reviewing self (rudimentary check, backend also enforces)
    if (auth.user?.id == widget.userId) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("You cannot review yourself")));
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ReviewModal(userId: widget.userId),
    ).then((_) => ref.refresh(reviewsProvider(widget.userId)));
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

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(publicProfileProvider(widget.userId));

    return Scaffold(
      backgroundColor: Colors.white,
      body: profileAsync.when(
        data: (profile) {
          return DefaultTabController(
            length: 2,
            child: NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return [
                  SliverAppBar(
                    expandedHeight: 460.h,
                    pinned: true,
                    backgroundColor: Colors.white,
                    leading: Padding(
                      padding: EdgeInsets.all(8.w),
                      child: Container(
                        decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
                        child: IconButton(icon: const Icon(Icons.arrow_back, color: Colors.black), onPressed: () => context.pop()),
                      ),
                    ),
                    actions: [
                      Padding(
                        padding: EdgeInsets.only(right: 16.w),
                        child: Container(
                           decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
                           child: PopupMenuButton<String>(
                            icon: const Icon(Icons.more_vert, color: Colors.black),
                            onSelected: (value) {
                              if (value == 'report') {
                                _showReportDialog(context, profile.id, "user");
                              }
                            },
                            itemBuilder: (context) => [
                              const PopupMenuItem(
                                value: 'report',
                                child: Row(
                                  children: [
                                    Icon(Icons.flag_outlined, color: Colors.red),
                                    SizedBox(width: 8),
                                    Text("Report User"),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                    flexibleSpace: FlexibleSpaceBar(
                      background: Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24.w),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Gap(60.h),
                            // Avatar & Badge
                            Stack(
                              children: [
                                Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.black.withOpacity(0.05), width: 4),
                                  ),
                                  child: CircleAvatar(
                                    radius: 60.r,
                                    backgroundColor: Colors.grey[100],
                                    backgroundImage: profile.avatarUrl != null && profile.avatarUrl!.isNotEmpty 
                                      ? NetworkImage(profile.avatarUrl!) 
                                      : null,
                                    child: profile.avatarUrl == null || profile.avatarUrl!.isEmpty 
                                      ? Text(profile.username[0].toUpperCase(), style: GoogleFonts.outfit(fontSize: 48.sp, fontWeight: FontWeight.bold)) 
                                      : null,
                                  ),
                                ),
                                if (profile.isVerified)
                                  Positioned(
                                    bottom: 4.h, right: 4.w,
                                    child: Container(
                                      padding: EdgeInsets.all(6.w),
                                      decoration: BoxDecoration(color: Colors.black, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                                      child: Icon(Icons.verified, color: Colors.white, size: 20.sp),
                                    ),
                                  ),
                              ],
                            ).animate().scale(delay: 200.ms, duration: 400.ms),
                            Gap(20.h),
                            
                            // Name
                            Text(
                              profile.username,
                              style: GoogleFonts.outfit(fontSize: 32.sp, fontWeight: FontWeight.w800, color: Colors.black),
                            ),
                            Text(
                              "Verified Collector",
                              style: GoogleFonts.inter(fontSize: 14.sp, color: Colors.grey, fontWeight: FontWeight.w500),
                            ),

                            Gap(32.h),

                            // Stats Grid
                            Container(
                              padding: EdgeInsets.symmetric(vertical: 16.h, horizontal: 24.w),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8F9FA),
                                borderRadius: BorderRadius.circular(20.r),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                children: [
                                  _buildStat("Followers", profile.followersCount),
                                  _buildStat("Following", profile.followingCount),
                                  _buildStat("Auctions", profile.auctions.length),
                                ],
                              ),
                            ),

                            Gap(32.h),

                            // Actions
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: _toggleFollow,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: _isFollowing ? Colors.grey[100] : Colors.black,
                                      foregroundColor: _isFollowing ? Colors.black : Colors.white,
                                      elevation: 0,
                                      padding: EdgeInsets.symmetric(vertical: 18.h),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                                    ),
                                    child: Text(_isFollowing ? "Following" : "Follow", style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                                  ),
                                ),
                                Gap(16.w),
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: _showReviewModal,
                                    style: OutlinedButton.styleFrom(
                                      padding: EdgeInsets.symmetric(vertical: 18.h),
                                      side: const BorderSide(color: Colors.black, width: 1.5),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
                                    ),
                                    child: Text("Rate & Review", style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.black)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    bottom: PreferredSize(
                      preferredSize: Size.fromHeight(60.h),
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 24.w),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border(bottom: BorderSide(color: Colors.grey[200]!, width: 1)),
                        ),
                        child: TabBar(
                          labelColor: Colors.black,
                          unselectedLabelColor: Colors.grey,
                          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16.sp),
                          unselectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w500, fontSize: 16.sp),
                          indicatorColor: Colors.black,
                          indicatorWeight: 3,
                          tabs: const [
                            Tab(text: "Listings"),
                            Tab(text: "Reviews"),
                          ],
                        ),
                      ),
                    ),
                  ),
                ];
              },
              body: TabBarView(
                children: [
                  // Listings Tab
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.7,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: profile.auctions.length,
                      itemBuilder: (context, index) {
                        return AuctionGridCard(auction: profile.auctions[index]);
                      },
                    ),
                  ),
                  
                  // Reviews Tab
                  // Reviews Tab
                  _ReviewsTab(userId: profile.id),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildStat(String label, int value) {
    return Column(
      children: [
        Text(value.toString(), style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: GoogleFonts.inter(fontSize: 14, color: Colors.grey)),
      ],
    );
  }
}

class _ReviewsTab extends ConsumerWidget {
  final int userId;
  const _ReviewsTab({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(reviewsProvider(userId));
    
    return reviewsAsync.when(
      data: (reviews) {
        if (reviews.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.star_border, size: 48, color: Colors.grey[300]),
                const SizedBox(height: 16),
                Text("No reviews yet", style: GoogleFonts.inter(color: Colors.grey)),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: reviews.length,
          separatorBuilder: (_, __) => const SizedBox(height: 16),
          itemBuilder: (context, index) {
            final review = reviews[index];
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 16,
                        backgroundImage: review.reviewer?.avatarUrl != null 
                          ? NetworkImage(review.reviewer!.avatarUrl!) 
                          : null,
                        child: review.reviewer?.avatarUrl == null 
                          ? Text(review.reviewer?.username[0].toUpperCase() ?? "U") 
                          : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(review.reviewer?.username ?? "Anonymous", style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(DateFormat.yMMMd().format(review.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                          ],
                        ),
                      ),
                      Row(
                        children: List.generate(5, (starIndex) {
                          return Icon(
                            starIndex < review.rating ? Icons.star : Icons.star_border,
                            size: 16,
                            color: Colors.amber,
                          );
                        }),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(review.content),
                ],
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text("Error: $e")),
    );
  }
}

class _ReviewModal extends ConsumerStatefulWidget {
  final int userId;
  const _ReviewModal({required this.userId});

  @override
  ConsumerState<_ReviewModal> createState() => _ReviewModalState();
}

class _ReviewModalState extends ConsumerState<_ReviewModal> {
  final _commentController = TextEditingController();
  int _rating = 5;
  bool _isSubmitting = false;

  Future<void> _submit() async {
    if (_commentController.text.isEmpty) return;
    
    setState(() => _isSubmitting = true);
    
    final auth = ref.read(authProvider);
    try {
      final response = await http.post(
        Uri.parse('http://127.0.0.1:8080/users/${widget.userId}/reviews'),
        headers: {
          'Authorization': 'Bearer ${auth.token}',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'rating': _rating,
          'content': _commentController.text.trim(),
        }),
      );

      if (response.statusCode == 201) {
        if (mounted) Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Review submitted!")));
      } else {
        throw Exception(response.body);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Write a Review", style: GoogleFonts.ebGaramond(fontSize: 24, fontWeight: FontWeight.bold)),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              return IconButton(
                onPressed: () => setState(() => _rating = index + 1),
                icon: Icon(
                  index < _rating ? Icons.star : Icons.star_border,
                  size: 32,
                  color: Colors.amber,
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _commentController,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: "Share your experience...",
              filled: true,
              fillColor: Colors.grey[100],
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text("Submit Review"),
            ),
          ),
        ],
      ),
    );
  }
}
