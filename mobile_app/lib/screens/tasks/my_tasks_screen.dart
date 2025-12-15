import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../config/theme.dart';
import '../../bloc/task/task_bloc.dart';
import '../../bloc/task/task_event.dart';
import '../../bloc/task/task_state.dart';
import '../../models/task.dart';

class MyTasksScreen extends StatefulWidget {
  const MyTasksScreen({super.key});

  @override
  State<MyTasksScreen> createState() => _MyTasksScreenState();
}

class _MyTasksScreenState extends State<MyTasksScreen> {
  String _selectedFilter = 'All tasks';
  
  final List<String> _filterOptions = [
    'All tasks',
    'Posted',
    'Assigned',
    'Booking Requests',
    'Offered',
    'Completed',
  ];

  @override
  void initState() {
    super.initState();
    // Load user's tasks
    context.read<TaskBloc>().add(const TaskLoadMyTasks());
  }

  List<Task> _filterTasks(List<Task> tasks) {
    switch (_selectedFilter) {
      case 'Posted':
        return tasks.where((t) => t.status == 'open' || t.status == 'posted').toList();
      case 'Assigned':
        return tasks.where((t) => t.status == 'assigned' || t.status == 'in_progress').toList();
      case 'Booking Requests':
        return tasks.where((t) => t.status == 'pending').toList();
      case 'Offered':
        return tasks.where((t) => t.offersCount > 0).toList();
      case 'Completed':
        return tasks.where((t) => t.status == 'completed').toList();
      default:
        return tasks;
    }
  }

  Map<String, List<Task>> _groupTasksByStatus(List<Task> tasks) {
    final Map<String, List<Task>> grouped = {};
    
    for (var task in tasks) {
      String groupKey;
      if (task.status == 'cancelled') {
        groupKey = 'CANCELLED TASKS';
      } else if (task.status == 'completed') {
        groupKey = 'COMPLETED TASKS';
      } else if (task.status == 'assigned' || task.status == 'in_progress') {
        groupKey = 'ACTIVE TASKS';
      } else {
        groupKey = 'POSTED TASKS';
      }
      
      grouped.putIfAbsent(groupKey, () => []);
      grouped[groupKey]!.add(task);
    }
    
    return grouped;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My tasks',
          style: GoogleFonts.oswald(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryBlue,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppTheme.primaryBlue),
            onPressed: () {
              // TODO: Implement search
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: AppTheme.primaryBlue),
            onPressed: () {
              // TODO: Navigate to notifications
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter dropdown
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                PopupMenuButton<String>(
                  onSelected: (value) {
                    setState(() {
                      _selectedFilter = value;
                    });
                  },
                  itemBuilder: (context) => _filterOptions
                      .map((option) => PopupMenuItem<String>(
                            value: option,
                            child: Text(option),
                          ))
                      .toList(),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _selectedFilter,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.arrow_drop_down,
                        color: AppTheme.primaryBlue,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          
          // Task list
          Expanded(
            child: BlocBuilder<TaskBloc, TaskState>(
              builder: (context, state) {
                if (state.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state.error != null) {
                  return Center(child: Text('Error: ${state.error}'));
                }

                final filteredTasks = _filterTasks(state.myTasks);
                final groupedTasks = _groupTasksByStatus(filteredTasks);

                if (filteredTasks.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.assignment_outlined,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No tasks found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: groupedTasks.length,
                  itemBuilder: (context, index) {
                    final groupKey = groupedTasks.keys.elementAt(index);
                    final tasks = groupedTasks[groupKey]!;
                    
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Section header
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            groupKey,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey.shade600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        // Tasks in this group
                        ...tasks.map((task) => _TaskCard(task: task)),
                      ],
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// Task card widget
class _TaskCard extends StatelessWidget {
  final Task task;

  const _TaskCard({required this.task});

  String _formatDate(DateTime? date) {
    if (date == null) return 'Flexible';
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return 'On ${date.day >= 10 ? '' : ''}${months[date.month - 1].substring(0, 3)}, ${date.day} ${months[date.month - 1]}';
  }

  Color _getStatusColor() {
    switch (task.status) {
      case 'cancelled':
        return Colors.red;
      case 'completed':
        return Colors.green;
      case 'assigned':
      case 'in_progress':
        return Colors.orange;
      default:
        return AppTheme.primaryBlue;
    }
  }

  String _getStatusText() {
    switch (task.status) {
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'open':
      case 'posted':
        return 'Posted';
      default:
        return task.status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          context.push('/tasks/${task.id}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
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
                          task.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Location
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 16, color: AppTheme.textSecondary),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                task.locationAddress,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textSecondary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        // Date
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_outlined, size: 16, color: AppTheme.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              _formatDate(task.deadline),
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        if (task.hasSpecificTime && task.timeOfDay != null) ...[
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.access_time, size: 16, color: AppTheme.textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                task.timeOfDay![0].toUpperCase() + task.timeOfDay!.substring(1),
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 12),
                        // Status and offers
                        Row(
                          children: [
                            Text(
                              _getStatusText(),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: _getStatusColor(),
                              ),
                            ),
                            if (task.offersCount > 0) ...[
                              const SizedBox(width: 4),
                              const Text('•', style: TextStyle(color: AppTheme.textSecondary)),
                              const SizedBox(width: 4),
                              Text(
                                '${task.offersCount} Offer${task.offersCount != 1 ? 's' : ''}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Budget and avatar
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '£${task.budget.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppTheme.primaryBlue.withValues(alpha: 0.1),
                        child: const Icon(Icons.person, color: AppTheme.primaryBlue, size: 24),
                      ),
                    ],
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
