import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../bloc/task/task_bloc.dart';
import '../../bloc/task/task_event.dart';
import '../../bloc/task/task_state.dart';
import '../../widgets/task/task_card.dart';
import '../../config/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with AutomaticKeepAliveClientMixin {
  final TextEditingController _taskInputController = TextEditingController();

  @override
  bool get wantKeepAlive => true;

  @override
  void dispose() {
    _taskInputController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskBloc>().add(const TaskLoadAll());
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset(
              'assets/images/logo.jpeg',
              height: 32,
              fit: BoxFit.contain,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              // Navigate to notifications
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<TaskBloc>().add(const TaskLoadAll());
          // Wait a bit for the loading to complete
          await Future.delayed(const Duration(milliseconds: 300));
        },
        child: BlocBuilder<TaskBloc, TaskState>(
          builder: (context, state) {
            if (state.isLoading && state.tasks.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state.error != null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: AppTheme.textSecondary.withValues(alpha: 0.5),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      state.error!,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              );
            }

            final tasks = state.tasks.where((task) => 
              task.status != 'assigned' && 
              task.status != 'completed' && 
              task.status != 'cancelled'
            ).toList();

            if (tasks.isEmpty && !state.isLoading) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.work_outline,
                      size: 64,
                      color: AppTheme.textSecondary.withValues(alpha: 0.5),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No tasks available',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              );
            }

            return ListView(
              padding: EdgeInsets.zero,
              children: [
                // CTA Hero Section - Blue background with image
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryBlue,
                    image: DecorationImage(
                      image: AssetImage('assets/images/bgimag.jpeg'),
                      fit: BoxFit.cover,
                      alignment: Alignment.centerRight,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Greeting
                        Text(
                          'Good afternoon, ${_getUserFirstName()}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Main headline
                        Text(
                          'Post a task. Get it done.',
                          style: GoogleFonts.oswald(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w700,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Input field
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: TextField(
                            controller: _taskInputController,
                            decoration: InputDecoration(
                              hintText: 'In a few words, what do you need done?',
                              hintStyle: TextStyle(
                                color: Colors.grey.shade400,
                                fontSize: 16,
                              ),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 18,
                              ),
                            ),
                            onSubmitted: (value) {
                              if (value.trim().isNotEmpty) {
                                context.push('/create-task', extra: {'title': value.trim()});
                                _taskInputController.clear();
                              }
                            },
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Get Offers button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              final text = _taskInputController.text.trim();
                              if (text.isNotEmpty) {
                                context.push('/create-task', extra: {'title': text});
                                _taskInputController.clear();
                              } else {
                                // If empty, just go to create task (step 1)
                                context.push('/create-task');
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0E1638),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 32),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                              elevation: 0,
                            ),
                            child: const Row(
                              children: [
                                Text(
                                  'Get Offers',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Spacer(),
                                Icon(Icons.arrow_forward, size: 20),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        
                        // Quick action chips
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildQuickActionChip(
                                context,
                                icon: Icons.cleaning_services_outlined,
                                label: 'End of lease cleaning',
                              ),
                              const SizedBox(width: 12),
                              _buildQuickActionChip(
                                context,
                                icon: Icons.build_outlined,
                                label: 'Fix my washing machine',
                              ),
                              const SizedBox(width: 12),
                              _buildQuickActionChip(
                                context,
                                icon: Icons.local_shipping_outlined,
                                label: 'Move my furniture',
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Section header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Text(
                    'Available Tasks',
                    style: Theme.of(context).textTheme.titleLarge!.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                
                // Task list
                ...tasks.map((task) => TaskCard(task: task)),
              ],
            );
          },
        ),
      ),
    );
  }

  String _getUserFirstName() {
    // TODO: Get from auth bloc/user profile
    // For now returning a placeholder
    return 'there';
  }

  Widget _buildQuickActionChip(BuildContext context, {required IconData icon, required String label}) {
    return OutlinedButton.icon(
      onPressed: () {
        // Navigate to create task with pre-filled title (skips step 1)
        context.push('/create-task', extra: {'title': label});
      },
      style: OutlinedButton.styleFrom(
        foregroundColor: Colors.white,
        side: const BorderSide(color: Colors.white, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
      ),
      icon: Icon(icon, size: 20),
      label: Text(
        label,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      ),
    );
  }
}
