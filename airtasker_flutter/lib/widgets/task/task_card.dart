import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../models/task.dart';
import '../../config/theme.dart';
import '../../screens/tasks/task_detail_screen.dart';

class TaskCard extends StatelessWidget {
  final Task task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TaskDetailScreen(taskId: task.id),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Poster info
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundImage: task.posterImage != null
                        ? NetworkImage(task.posterImage!)
                        : null,
                    child: task.posterImage == null
                        ? Text(task.posterName?[0] ?? 'U')
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              task.posterName ?? 'User',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            if (task.posterVerified == true) ...[
                              const SizedBox(width: 4),
                              const Icon(
                                Icons.verified,
                                size: 16,
                                color: AppTheme.verifiedBlue,
                              ),
                            ],
                          ],
                        ),
                        Text(
                          timeago.format(task.createdAt),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  if (task.posterRating != null)
                    Row(
                      children: [
                        const Icon(Icons.star, size: 16, color: Colors.amber),
                        const SizedBox(width: 4),
                        Text(
                          task.posterRating!.toStringAsFixed(1),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Task title
              Text(
                task.title,
                style: Theme.of(context).textTheme.headlineMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              
              // Task description
              Text(
                task.description,
                style: Theme.of(context).textTheme.bodyMedium,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              
              // Category and location
              Row(
                children: [
                  Chip(
                    label: Text(task.category),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    visualDensity: VisualDensity.compact,
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.location_on, size: 16, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      task.locationAddress,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Budget and offers
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '\$${task.budget.toStringAsFixed(0)}',
                    style: Theme.of(context).textTheme.headlineMedium!.copyWith(
                      color: AppTheme.primaryBlue,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.accentTeal.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      '${task.offersCount} ${task.offersCount == 1 ? 'offer' : 'offers'}',
                      style: Theme.of(context).textTheme.bodySmall!.copyWith(
                        color: AppTheme.accentTeal,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
