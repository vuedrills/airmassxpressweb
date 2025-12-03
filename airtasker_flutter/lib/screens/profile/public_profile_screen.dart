import 'package:flutter/material.dart';

import '../../models/user.dart';
import '../../config/theme.dart';
import '../invoice/request_quote_screen.dart';
import 'reviews_screen.dart';

class PublicProfileScreen extends StatefulWidget {
  final User user;
  final bool showRequestQuoteButton;

  const PublicProfileScreen({
    super.key, 
    required this.user,
    this.showRequestQuoteButton = false,
  });

  @override
  State<PublicProfileScreen> createState() => _PublicProfileScreenState();
}

class _PublicProfileScreenState extends State<PublicProfileScreen> {
  bool _isBioExpanded = false;

  @override
  Widget build(BuildContext context) {
    final isPosterEmptyState = widget.user.userType == 'poster' && widget.user.reviews.isEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.user.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            if (isPosterEmptyState)
              _buildPosterEmptyState(context)
            else ...[
              const Divider(height: 1),
              _buildStats(context),
              const Divider(height: 1),
              if (widget.user.userType == 'tasker' && widget.user.portfolio.isNotEmpty) ...[
                _buildPortfolioSection(context),
                const Divider(height: 1),
              ],
              _buildVerifiedInfo(context),
              const Divider(height: 1),
              _buildAboutSection(context),
              if (widget.user.reviews.isNotEmpty) ...[
                const Divider(height: 1),
                _buildReviewsSection(context),
              ],
            ],
            const SizedBox(height: 100), // Space for bottom action bar
          ],
        ),
      ),
      bottomNavigationBar: widget.showRequestQuoteButton ? _buildBottomBar(context) : null,
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MEET',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: Colors.grey,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.user.name,
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0E1638),
                          ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(
                            color: Colors.green,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Online less than a day ago',
                          style: TextStyle(
                            color: Color(0xFF0E1638),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              CircleAvatar(
                radius: 40,
                backgroundColor: Colors.grey.shade200,
                backgroundImage: widget.user.profileImage != null
                    ? NetworkImage(widget.user.profileImage!)
                    : null,
                child: widget.user.profileImage == null
                    ? const Icon(Icons.person, size: 40, color: Colors.grey)
                    : null,
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              const Icon(Icons.location_on_outlined, size: 20, color: Colors.grey),
              const SizedBox(width: 8),
              const Text(
                'Greater London, England, United Kingdom', // Hardcoded to match screenshot or use user.address if available
                style: TextStyle(
                  color: Color(0xFF0E1638),
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPosterEmptyState(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          Row(
            children: [
              Text(
                'No reviews yet',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF0E1638),
                    ),
              ),
              const SizedBox(width: 8),
              const Icon(Icons.star, color: Colors.orange, size: 24),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${widget.user.name.split(' ')[0]} has recently joined Airtasker',
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 15,
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF6F8FD),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Placeholder for the illustration
                Center(
                  child: Container(
                    height: 100,
                    width: 100,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    child: const Icon(Icons.search, size: 40, color: AppTheme.primaryBlue),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  '${widget.user.name.split(' ')[0]} currently has no tasks open',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0E1638),
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'They\'re still exploring the marketplace, looking for creative ideas to check off their to-do list.',
                  style: TextStyle(
                    fontSize: 15,
                    color: Color(0xFF0E1638),
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

  Widget _buildStats(BuildContext context) {
    return Container(
      color: const Color(0xFFF6F8FD),
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      widget.user.rating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0E1638),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.star, color: Colors.orange, size: 24),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Overall rating',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0E1638),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(Icons.info_outline, size: 16, color: Colors.grey.shade400),
                  ],
                ),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ReviewsScreen(user: widget.user),
                      ),
                    );
                  },
                  child: Text(
                    '${widget.user.totalReviews} reviews',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(width: 1, height: 60, color: Colors.grey.shade300),
          Expanded(
            child: Column(
              children: [
                const Text(
                  '100%', // Hardcoded as per screenshot, or calculate from user data
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0E1638),
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Completion rate',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0E1638),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Icon(Icons.info_outline, size: 16, color: Colors.grey.shade400),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${widget.user.totalReviews + 90} tasks', // Mock calculation
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF0E1638),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }



  Widget _buildVerifiedInfo(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Verified information',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0E1638),
                ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF6F8FD),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryBlue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.verified_user, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 16),
                Text(
                  widget.user.verificationType ?? 'ID Verified',
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFF0E1638),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right, color: Colors.grey),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'About',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0E1638),
                ),
          ),
          const SizedBox(height: 16),
          Text(
            widget.user.bio ?? 'No bio available.',
            style: const TextStyle(
              height: 1.5,
              fontSize: 15,
              color: Color(0xFF0E1638),
            ),
            maxLines: _isBioExpanded ? null : 4,
            overflow: _isBioExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
          ),
          if ((widget.user.bio?.length ?? 0) > 100)
            GestureDetector(
              onTap: () {
                setState(() {
                  _isBioExpanded = !_isBioExpanded;
                });
              },
              child: Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Row(
                  children: [
                    Text(
                      _isBioExpanded ? 'Read less' : 'Read more',
                      style: const TextStyle(
                        color: AppTheme.primaryBlue,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    Icon(
                      _isBioExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: AppTheme.primaryBlue,
                    ),
                  ],
                ),
              ),
            ),
          if (widget.user.skills.isNotEmpty) ...[
            const SizedBox(height: 24),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: widget.user.skills.map((skill) {
                return Chip(
                  label: Text(skill),
                  backgroundColor: Colors.grey.shade100,
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPortfolioSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          child: Text(
            'Portfolio',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0E1638),
                ),
          ),
        ),
        SizedBox(
          height: 200,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: widget.user.portfolio.length,
            itemBuilder: (context, index) {
              final item = widget.user.portfolio[index];
              return Container(
                width: 200,
                margin: const EdgeInsets.symmetric(horizontal: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    item.imageUrl,
                    height: 200,
                    width: 200,
                    fit: BoxFit.cover,
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildReviewsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Overall rating ${widget.user.rating.toInt()}',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0E1638),
                        ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.star, color: Colors.orange, size: 24),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.user.totalReviews} reviews',
                style: const TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 220,
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: widget.user.reviews.take(5).length,
            itemBuilder: (context, index) {
              final review = widget.user.reviews[index];
              return Container(
                width: 300,
                margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundImage: NetworkImage(review.reviewerAvatar),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            review.reviewerName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0E1638),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _getTimeAgo(review.date),
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: List.generate(5, (i) {
                        return Icon(
                          i < review.rating ? Icons.star : Icons.star_border,
                          size: 14,
                          color: Colors.orange,
                        );
                      }),
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF6F8FD),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          review.comment,
                          style: const TextStyle(
                            height: 1.4,
                            fontSize: 14,
                            color: Color(0xFF0E1638),
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    if (review.taskTitle != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        review.taskTitle!,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(24.0),
          child: SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ReviewsScreen(user: widget.user),
                  ),
                );
              },
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              child: Text(
                'See all ${widget.user.totalReviews} reviews',
                style: const TextStyle(
                  color: AppTheme.primaryBlue,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Want to work with ${widget.user.name.split(' ')[0]}?',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Post a task and request a quote',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RequestQuoteScreen(
                        taskId: 'temp_task_id',
                        taskTitle: 'Task Title',
                        toUserId: widget.user.id,
                        toUserName: widget.user.name,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                child: const Text(
                  'Request a quote',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getTimeAgo(DateTime date) {
    final difference = DateTime.now().difference(date);
    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()}y ago';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()}mo ago';
    } else if (difference.inDays > 7) {
      return '${(difference.inDays / 7).floor()}w ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else {
      return 'Just now';
    }
  }
}
