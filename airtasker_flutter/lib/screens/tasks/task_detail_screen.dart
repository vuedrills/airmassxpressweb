import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../bloc/task/task_bloc.dart';
import '../../bloc/task/task_event.dart';
import '../../bloc/task/task_state.dart';
import '../../bloc/offer/offer_list_bloc.dart';
import '../../bloc/offer/offer_list_state.dart';
import '../../bloc/question/question_bloc.dart';
import '../../bloc/question/question_event.dart';
import '../../bloc/question/question_state.dart';
import '../../bloc/offer/offer_list_event.dart';
import '../profile/public_profile_screen.dart';
import '../../models/user.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';
import 'make_offer_screen.dart';
import 'offer_card.dart';
import '../../services/mock_data_service.dart';

class TaskDetailScreen extends StatefulWidget {
  final String taskId;

  const TaskDetailScreen({super.key, required this.taskId});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  int _selectedTab = 0; // 0 for Offers, 1 for Questions

  late final OfferListBloc _offerListBloc;
  late final QuestionBloc _questionBloc;
  final TextEditingController _questionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<TaskBloc>().add(TaskLoadById(widget.taskId));
    _offerListBloc = getIt<OfferListBloc>();
    _questionBloc = getIt<QuestionBloc>();
    _offerListBloc.add(LoadOffers(taskId: widget.taskId));
    _questionBloc.add(LoadQuestions(widget.taskId));
  }

  @override
  void dispose() {
    _offerListBloc.close();
    _questionBloc.close();
    _questionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_horiz, color: Colors.black),
            onSelected: (value) {
              // Handle menu selection
            },
            itemBuilder: (BuildContext context) {
              return [
                const PopupMenuItem<String>(
                  value: 'notifications',
                  child: Row(
                    children: [
                      Icon(Icons.notifications_outlined, color: Colors.black54),
                      SizedBox(width: 12),
                      Text('Notification settings'),
                    ],
                  ),
                ),
                const PopupMenuItem<String>(
                  value: 'share',
                  child: Row(
                    children: [
                      Icon(Icons.share_outlined, color: Colors.black54),
                      SizedBox(width: 12),
                      Text('Share task'),
                    ],
                  ),
                ),
                const PopupMenuItem<String>(
                  value: 'report',
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.black54),
                      SizedBox(width: 12),
                      Text('Report task'),
                    ],
                  ),
                ),
              ];
            },
          ),
        ],
      ),
      body: BlocBuilder<TaskBloc, TaskState>(
         builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error != null) {
            return Center(child: Text(state.error!));
          }

          if (state.selectedTask == null) {
            return const Center(child: Text('Task not found'));
          }

          final task = state.selectedTask!;

          return MultiBlocProvider(
            providers: [
              BlocProvider.value(value: _offerListBloc),
              BlocProvider.value(value: _questionBloc),
            ],
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Container(
                  color: const Color(0xFFF6F8FD), // Light blue background
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Make an offer now',
                        style: Theme.of(context).textTheme.titleMedium!.copyWith(
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0E1638),
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
                                builder: (_) => MakeOfferScreen(task: task),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(24),
                            ),
                            elevation: 0,
                          ),
                          child: const Text(
                            'Make offer',
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

                // Task Details
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      Text(
                        task.title,
                        style: GoogleFonts.oswald(
                          fontSize: 28,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF0E1638),
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Poster Info
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () {
                              // Navigate to public profile
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => PublicProfileScreen(
                                    user: MockDataService.getUserById(task.posterId),
                                    showRequestQuoteButton: false, // Poster is client, not tasker
                                  ),
                                ),
                              );
                            },
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: Colors.grey.shade200,
                                  backgroundImage: task.posterImage != null
                                      ? NetworkImage(task.posterImage!)
                                      : null,
                                  child: task.posterImage == null
                                      ? const Icon(Icons.person, color: Colors.grey)
                                      : null,
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      task.posterName ?? 'User',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    if (task.posterRating != null)
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 14, color: Colors.amber),
                                          const SizedBox(width: 4),
                                          Text(
                                            task.posterRating!.toStringAsFixed(1),
                                            style: const TextStyle(
                                              fontSize: 14,
                                              color: Colors.amber,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.chevron_right, color: Colors.grey),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Location
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.location_on_outlined, color: AppTheme.textSecondary, size: 24),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              task.locationAddress,
                              style: const TextStyle(fontSize: 16, color: Color(0xFF0E1638)),
                            ),
                          ),
                          const Text(
                            'View on map',
                            style: TextStyle(
                              color: AppTheme.primaryBlue,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Date
                      // Date
                      const Row(
                        children: [
                          Icon(Icons.calendar_today_outlined, color: AppTheme.textSecondary, size: 22),
                          SizedBox(width: 18),
                          Text(
                            'Today', // TODO: Format actual date
                            style: TextStyle(fontSize: 16, color: Color(0xFF0E1638)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Budget
                      Row(
                        children: [
                          const Icon(Icons.attach_money, color: AppTheme.textSecondary, size: 24),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '\$${task.budget.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF0E1638),
                                ),
                              ),
                              const Text(
                                'Budget',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Description
                      Text(
                        task.description,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFF0E1638),
                          height: 1.5,
                        ),
                      ),
                      
                      // Task Images
                      if (task.photos.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 80, // 60% smaller (was 200, now 80)
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: EdgeInsets.zero,
                            itemCount: task.photos.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: EdgeInsets.only(
                                  right: index < task.photos.length - 1 ? 8 : 0,
                                ),
                                child: GestureDetector(
                                  onTap: () {
                                    // Show fullscreen image
                                    showDialog(
                                      context: context,
                                      builder: (context) => Dialog(
                                        backgroundColor: Colors.black,
                                        insetPadding: EdgeInsets.zero,
                                        child: Stack(
                                          children: [
                                            Center(
                                              child: InteractiveViewer(
                                                panEnabled: true,
                                                boundaryMargin: const EdgeInsets.all(20),
                                                minScale: 0.5,
                                                maxScale: 4,
                                                child: Image.network(
                                                  task.photos[index],
                                                  fit: BoxFit.contain,
                                                ),
                                              ),
                                            ),
                                            Positioned(
                                              top: 40,
                                              right: 20,
                                              child: IconButton(
                                                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                                                onPressed: () => Navigator.pop(context),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      task.photos[index],
                                      height: 80,
                                      width: 112, // 60% smaller (was 280, now 112)
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Container(
                                          height: 80,
                                          width: 112,
                                          decoration: BoxDecoration(
                                            color: Colors.grey.shade200,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: const Icon(Icons.image, size: 24, color: Colors.grey),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),

                // Views
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.visibility_outlined, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 8),
                      Text(
                        '${task.views} taskers have viewed this task already',
                        style: const TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Offers / Questions Tabs
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF6F8FD),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTab = 0),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _selectedTab == 0 ? const Color(0xFF0E1638) : Colors.transparent,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: Center(
                                child: BlocBuilder<OfferListBloc, OfferListState>(
                                  bloc: _offerListBloc,
                                  builder: (context, offerState) {
                                    final count = offerState is OfferListLoaded 
                                        ? offerState.offers.length 
                                        : task.offersCount;
                                    return Text(
                                      'Offers  $count',
                                      style: TextStyle(
                                        color: _selectedTab == 0 ? Colors.white : AppTheme.textSecondary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _selectedTab = 1),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _selectedTab == 1 ? const Color(0xFF0E1638) : Colors.transparent,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: Center(
                                child: Text(
                                  'Questions',
                                  style: TextStyle(
                                    color: _selectedTab == 1 ? Colors.white : AppTheme.textSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Tab Content
                if (_selectedTab == 0)
                  BlocBuilder<OfferListBloc, OfferListState>(
                    bloc: _offerListBloc,
                    builder: (context, offerState) {
                      if (offerState is OfferListLoading) {
                        return const Center(child: CircularProgressIndicator());
                      } else if (offerState is OfferListLoaded) {
                        return Column(
                          children: [
                            ...offerState.offers.map((offer) => OfferCard(
                              offer: offer,
                              taskOwnerId: task.posterId,
                            )),
                            const SizedBox(height: 24),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'What happens when a task is cancelled',
                                    style: Theme.of(context).textTheme.titleMedium!.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF0E1638),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'If you are responsible for cancelling this task, a Cancellation fee may be deducted from your next payment payout(s).',
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                      color: AppTheme.textSecondary,
                                      height: 1.5,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Learn more',
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                      color: AppTheme.primaryBlue,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      } else if (offerState is OfferListFailure) {
                        return Center(child: Text('Error: ${offerState.message}'));
                      }
                      return const Center(child: Text('No offers yet'));
                    },
                  )
                else
                  BlocBuilder<QuestionBloc, QuestionState>(
                    bloc: _questionBloc,
                    builder: (context, questionState) {
                      if (questionState is QuestionsLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      
                      if (questionState is QuestionsLoaded) {
                        if (questionState.questions.isEmpty) {
                          return _buildEmptyQuestions();
                        }
                        return _buildQuestionsList(questionState.questions);
                      }
                      
                      return _buildEmptyQuestions();
                    },
                  ),
                  
                const SizedBox(height: 40),
              ],
            ),
          ),
        );
        },
      ),
    );
  }

  Widget _buildEmptyQuestions() {
    return Column(
      children: [
        // Public warning message
        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'These messages are public. Don\'t share private info. We never ask for payment, send links/QR codes, or request verification in Questions.',
                  style: TextStyle(
                    color: Colors.blue.shade900,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Empty state illustration
        const SizedBox(height: 40),
        Image.asset(
          'assets/images/empty_mailbox.png',
          width: 120,
          height: 120,
          errorBuilder: (context, error, stackTrace) {
            return Icon(
              Icons.mail_outline,
              size: 80,
              color: Colors.grey.shade300,
            );
          },
        ),
        const SizedBox(height: 24),
        Text(
          'Questions? Nope, not yet...',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0E1638),
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Text(
            'So far it seems you were crystal clear. Find questions from Taskers here when they send them.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppTheme.textSecondary,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionsList(List questions) {
    return Column(
      children: [
        // Public warning message
        Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'These messages are public. Don\'t share private info. We never ask for payment, send links/QR codes, or request verification in Questions.',
                  style: TextStyle(
                    color: Colors.blue.shade900,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Question input field
        _buildQuestionInput(),

        const SizedBox(height: 24),

        // Questions list
        ...questions.map((question) => _buildQuestionCard(question)),

        const SizedBox(height: 24),

        // Cancellation info
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'What happens when a task is cancelled',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0E1638),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'If you are responsible for cancelling this task, a Cancellation fee may be deducted from your next payment payout(s).',
                style: TextStyle(
                  color: AppTheme.textSecondary,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Learn more',
                style: TextStyle(
                  color: AppTheme.primaryBlue,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuestionInput() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          TextField(
            controller: _questionController,
            decoration: InputDecoration(
              hintText: 'Ask a question',
              hintStyle: TextStyle(color: Colors.grey.shade400),
              border: InputBorder.none,
              filled: false,
            ),
            maxLines: 3,
            minLines: 1,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () {
                  // TODO: Image attachment
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Image attachment coming soon')),
                  );
                },
                icon: Icon(Icons.image_outlined, color: Colors.grey.shade600),
              ),
              ElevatedButton(
                onPressed: () => _sendQuestion(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey.shade300,
                  foregroundColor: Colors.grey.shade600,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text('Send'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(question) {
    final timeAgo = _getTimeAgo(question.timestamp);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: question.userImage != null
                    ? NetworkImage(question.userImage!)
                    : null,
                child: question.userImage == null
                    ? Text(
                        question.userName[0],
                        style: const TextStyle(fontSize: 16),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  question.userName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0E1638),
                  ),
                ),
              ),
              IconButton(
                icon: Icon(Icons.more_horiz, color: Colors.grey.shade600),
                onPressed: () {},
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            question.question,
            style: TextStyle(
              color: const Color(0xFF0E1638),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            timeAgo,
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  String _getTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else {
      return 'Just now';
    }
  }

  void _sendQuestion() {
    if (_questionController.text.trim().isEmpty) return;
    
    _questionBloc.add(AskQuestion(
      taskId: widget.taskId,
      question: _questionController.text.trim(),
    ));
    _questionController.clear();
  }
}
