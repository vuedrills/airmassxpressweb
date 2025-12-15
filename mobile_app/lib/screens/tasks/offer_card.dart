import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/offer.dart';
import '../../models/user.dart';
import '../../config/theme.dart';
import '../../services/mock_data_service.dart';
import '../../bloc/offer/offer_list_bloc.dart';
import '../../bloc/offer/offer_list_event.dart';
import '../profile/public_profile_screen.dart';

class OfferCard extends StatelessWidget {
  final Offer offer;
  final String? taskOwnerId; // To show/hide accept button
  const OfferCard({required this.offer, this.taskOwnerId, super.key});

  void _showInfoDialog(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Got it'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User info section
            Row(
              children: [
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PublicProfileScreen(
                          user: MockDataService.getUserById(offer.taskerId),
                          showRequestQuoteButton: true,
                        ),
                      ),
                    );
                  },
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundImage: offer.taskerImage != null
                            ? NetworkImage(offer.taskerImage!)
                            : null,
                        child: offer.taskerImage == null
                            ? const Icon(Icons.person, size: 28)
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                offer.taskerName ?? 'Tasker',
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0E1638),
                                ),
                              ),
                              if (offer.taskerVerified == true) ...[
                                const SizedBox(width: 6),
                                GestureDetector(
                                  onTap: () => _showInfoDialog(
                                    context,
                                    'Verification badge',
                                    'Taskers with this badge have been verified with a Government Photo ID. Learn more',
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.all(3),
                                    decoration: const BoxDecoration(
                                      color: AppTheme.verifiedBlue,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.check,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          // Rating or New badge
                          if (offer.isNew == true)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.purple.shade50,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'New!',
                                style: TextStyle(
                                  color: Colors.purple.shade700,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                ),
                              ),
                            )
                          else if (offer.taskerRating != null)
                            Row(
                              children: [
                                Text(
                                  offer.taskerRating!.toStringAsFixed(1),
                                  style: const TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.orange,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(Icons.star,
                                    size: 18, color: Colors.orange),
                                const SizedBox(width: 4),
                                Text(
                                  '(${offer.reviewCount ?? 0})',
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          // Completion rate
                          if (offer.completionRate != null) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Text(
                                  '${offer.completionRate}%',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryBlue,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Text(
                                  'Completion rate',
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(width: 5),
                                GestureDetector(
                                  onTap: () => _showInfoDialog(
                                    context,
                                    'Completion rate',
                                    'The percentage of the last 20 tasks successfully completed by the Tasker.',
                                  ),
                                  child: Icon(
                                    Icons.info_outline,
                                    size: 17,
                                    color: Colors.grey.shade500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                          // Rebook count
                          if (offer.rebookCount != null) ...[
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(Icons.refresh, size: 15, color: Colors.grey.shade600),
                                const SizedBox(width: 5),
                                Text(
                                  'Rebooked ${offer.rebookCount}+ times in 2025',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            // Availability section (if provided)
            if (offer.availability != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF6F8FD),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Text(
                      'Availability:',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF0E1638),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      offer.availability!,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Color(0xFF0E1638),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 16),
            // Light gray background for offer message
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    offer.message,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF0E1638),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () {
                      // TODO: Expand message
                    },
                    child: const Text(
                      'More',
                      style: TextStyle(
                       color: AppTheme.primaryBlue,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Use FutureBuilder to check if current user is task owner
            FutureBuilder<User?>(
              future: MockDataService.getCurrentUser(),
              builder: (context, snapshot) {
                final isTaskOwner = snapshot.hasData && 
                    taskOwnerId != null && 
                    snapshot.data?.id == taskOwnerId;
                
                return Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () {},
                      child: const Text('Message'),
                    ),
                    if (isTaskOwner) ...[ 
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () async {
                          // Show confirmation dialog
                          final confirmed = await showDialog<bool>(
                            context: context,
                            builder: (BuildContext context) {
                              return AlertDialog(
                                title: const Text('Accept Offer'),
                                content: Text(
                                  'Are you sure you want to accept the offer from ${offer.taskerName} for \$${offer.amount.toStringAsFixed(0)}?',
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, false),
                                    child: const Text('Cancel'),
                                  ),
                                  ElevatedButton(
                                    onPressed: () => Navigator.pop(context, true),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppTheme.primaryBlue,
                                      foregroundColor: Colors.white,
                                    ),
                                    child: const Text('Accept'),
                                  ),
                                ],
                              );
                            },
                          );

                          if (confirmed == true && context.mounted) {
                            // Get the OfferListBloc from context and dispatch accept event
                            final offerBloc = context.read<OfferListBloc>();
                            offerBloc.add(AcceptOffer(
                              offerId: offer.id,
                              taskId: offer.taskId,
                            ));

                            // Show success message
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Offer from ${offer.taskerName} accepted!'),
                                  backgroundColor: Colors.green,
                                  duration: const Duration(seconds: 3),
                                ),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryBlue,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Accept'),
                      ),
                    ],
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
