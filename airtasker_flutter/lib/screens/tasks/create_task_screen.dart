import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../bloc/create_task/create_task_bloc.dart';
import '../../bloc/create_task/create_task_event.dart';
import '../../bloc/create_task/create_task_state.dart';
import '../../config/theme.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/service_locator.dart';

class CreateTaskScreen extends StatelessWidget {
  final String? initialTitle;
  
  const CreateTaskScreen({super.key, this.initialTitle});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<CreateTaskBloc>(),
      child: _CreateTaskContent(initialTitle: initialTitle),
    );
  }
}

class _CreateTaskContent extends StatefulWidget {
  final String? initialTitle;
  
  const _CreateTaskContent({this.initialTitle});

  @override
  State<_CreateTaskContent> createState() => _CreateTaskContentState();
}

class _CreateTaskContentState extends State<_CreateTaskContent> {
  late final PageController _pageController;
  int _currentStep = 0;
  final int _totalSteps = 7;

  @override
  void initState() {
    super.initState();
    bool hasTitle = widget.initialTitle != null && widget.initialTitle!.isNotEmpty;
    _currentStep = hasTitle ? 1 : 0;
    _pageController = PageController(initialPage: _currentStep);
    
    if (hasTitle) {
      // Pre-fill title
      context.read<CreateTaskBloc>().add(CreateTaskTitleChanged(widget.initialTitle!));
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentStep < _totalSteps - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep++);
    }
  }

  void _prevPage() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() => _currentStep--);
    } else {
      // Go back to previous screen if on first step
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
      } else {
        // Fallback if can't pop (e.g. direct link)
        context.go('/home');
      }
    }
  }

  void _goToStep(int step) {
    _pageController.jumpToPage(step);
    setState(() => _currentStep = step);
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CreateTaskBloc, CreateTaskState>(
      listener: (context, state) {
        if (state.status == CreateTaskStatus.success) {
          // Navigate to success step
          setState(() {
            _currentStep = 7;
            _pageController.jumpToPage(7);
          });
        } else if (state.status == CreateTaskStatus.failure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage ?? 'Failed to post task')),
          );
        }
      },
      child: Scaffold(
        appBar: _currentStep >= 7
            ? null
            : AppBar(
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: _prevPage,
                ),
                title: Text('Step ${_currentStep + 1} of $_totalSteps'),
                bottom: PreferredSize(
                  preferredSize: const Size.fromHeight(4),
                  child: LinearProgressIndicator(
                    value: (_currentStep + 1) / _totalSteps,
                    backgroundColor: AppTheme.divider,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryBlue),
                  ),
                ),
              ),
        body: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            _StepTitle(onNext: _nextPage),
            _StepDescription(onNext: _nextPage),
            _StepDecideWhen(onNext: _nextPage),
            _StepLocation(onNext: _nextPage),
            _StepBudget(onNext: _nextPage),
            _StepPhotos(onNext: _nextPage),
            _StepReview(onNavigateToStep: _goToStep),
            const _StepSuccess(),
          ],
        ),
      ),
    );
  }
}

// --- Step 1: Title ---
class _StepTitle extends StatefulWidget {
  final VoidCallback onNext;
  const _StepTitle({required this.onNext});

  @override
  State<_StepTitle> createState() => _StepTitleState();
}

class _StepTitleState extends State<_StepTitle> {
  final _controller = TextEditingController();
  bool _isValid = false;

  @override
  void initState() {
    super.initState();
    final state = context.read<CreateTaskBloc>().state;
    _controller.text = state.title;
    _isValid = state.title.length >= 10;
    _controller.addListener(() {
      setState(() {
        _isValid = _controller.text.length >= 10;
      });
      context.read<CreateTaskBloc>().add(CreateTaskTitleChanged(_controller.text));
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<CreateTaskBloc, CreateTaskState>(
      listenWhen: (previous, current) => previous.title != current.title && current.title != _controller.text,
      listener: (context, state) {
        _controller.text = state.title;
        _controller.selection = TextSelection.fromPosition(TextPosition(offset: _controller.text.length));
        setState(() {
          _isValid = _controller.text.length >= 10;
        });
      },
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Start with a title',
              style: GoogleFonts.oswald(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryBlue,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'In a few words, what do you need done?',
              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                color: AppTheme.primaryBlue,
              ),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _controller,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'e.g. Clean my 2 bedroom apartment',
                border: UnderlineInputBorder(),
              ),
              style: const TextStyle(fontSize: 20),
              minLines: 1,
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            if (_controller.text.isNotEmpty && !_isValid)
              const Text(
                'Please enter at least 10 characters',
                style: TextStyle(color: AppTheme.accentRed),
              ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isValid ? widget.onNext : null,
                child: const Text('Next'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Step 2: Description ---
class _StepDescription extends StatefulWidget {
  final VoidCallback onNext;
  const _StepDescription({required this.onNext});

  @override
  State<_StepDescription> createState() => _StepDescriptionState();
}

class _StepDescriptionState extends State<_StepDescription> {
  final _controller = TextEditingController();
  bool _isValid = false;

  @override
  void initState() {
    super.initState();
    final state = context.read<CreateTaskBloc>().state;
    _controller.text = state.description;
    _isValid = state.description.length >= 25;
    _controller.addListener(() {
      setState(() {
        _isValid = _controller.text.length >= 25;
      });
      context.read<CreateTaskBloc>().add(CreateTaskDescriptionChanged(_controller.text));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Show title if we have one (context for user)
          BlocBuilder<CreateTaskBloc, CreateTaskState>(
            builder: (context, state) {
              if (state.title.isNotEmpty) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 24.0),
                  child: Text(
                    state.title,
                    style: Theme.of(context).textTheme.titleLarge!.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          Text(
            'What are the details?',
            style: GoogleFonts.oswald(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Be as specific as you can about what needs doing.',
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: _controller,
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'Describe the task in detail...',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
            style: const TextStyle(fontSize: 16),
            minLines: 5,
            maxLines: 10,
          ),
          const SizedBox(height: 16),
          if (_controller.text.isNotEmpty && !_isValid)
            const Text(
              'Please enter at least 25 characters',
              style: TextStyle(color: AppTheme.accentRed),
            ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isValid ? widget.onNext : null,
              child: const Text('Next'),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Step 3: Decide on When ---
class _StepDecideWhen extends StatelessWidget {
  final VoidCallback onNext;
  const _StepDecideWhen({required this.onNext});

  Future<void> _selectDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null && context.mounted) {
      context.read<CreateTaskBloc>().add(CreateTaskDateChanged(picked));
    }
  }

  String _formatDate(DateTime date) {
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return 'On ${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatBeforeDate(DateTime date) {
    final months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    String daySuffix(int day) {
      if (day >= 11 && day <= 13) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    }
    return '${months[date.month - 1]} ${date.day}${daySuffix(date.day)}';
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CreateTaskBloc, CreateTaskState>(
      builder: (context, state) {
        final canContinue = state.dateType != null;
        
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Decide on when',
                        style: GoogleFonts.oswald(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'When do you need this done?',
                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                      const SizedBox(height: 32),
                      
                      // Date Type Options
                      _DateTypeButton(
                        label: state.dateType == 'on_date' && state.date != null 
                            ? _formatDate(state.date!) 
                            : 'On date',
                        isSelected: state.dateType == 'on_date',
                        onTap: () {
                          context.read<CreateTaskBloc>().add(const CreateTaskDateTypeChanged('on_date'));
                          _selectDate(context);
                        },
                      ),
                      const SizedBox(height: 16),
                      _DateTypeButton(
                        label: state.dateType == 'before_date' && state.date != null 
                            ? 'Before ${_formatBeforeDate(state.date!)}' 
                            : 'Before date',
                        isSelected: state.dateType == 'before_date',
                        onTap: () {
                          context.read<CreateTaskBloc>().add(const CreateTaskDateTypeChanged('before_date'));
                          _selectDate(context);
                        },
                      ),
                      const SizedBox(height: 16),
                      _DateTypeButton(
                        label: 'I\'m flexible',
                        isSelected: state.dateType == 'flexible',
                        onTap: () {
                          context.read<CreateTaskBloc>().add(const CreateTaskDateTypeChanged('flexible'));
                        },
                      ),
                      
                      // Time of day checkbox and options (only show when a date is set for 'on_date')
                      if (state.dateType == 'on_date' && state.date != null) ...[
                        const SizedBox(height: 32),
                        Row(
                          children: [
                            Checkbox(
                              value: state.hasSpecificTime,
                              onChanged: (val) {
                                context.read<CreateTaskBloc>().add(CreateTaskSpecificTimeToggled(val ?? false));
                              },
                              activeColor: AppTheme.primaryBlue,
                            ),
                            const SizedBox(width: 8),
                            const Flexible(
                              child: Text(
                                'I need a certain time of the day',
                                style: TextStyle(fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                        
                        if (state.hasSpecificTime) ...[
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                child: _TimeOfDayCard(
                                  icon: Icons.wb_twilight,
                                  label: 'Morning',
                                  timeRange: 'Before 10am',
                                  isSelected: state.timeOfDay == 'morning',
                                  onTap: () {
                                    context.read<CreateTaskBloc>().add(const CreateTaskTimeOfDayChanged('morning'));
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _TimeOfDayCard(
                                  icon: Icons.wb_sunny,
                                  label: 'Midday',
                                  timeRange: '10am - 2pm',
                                  isSelected: state.timeOfDay == 'midday',
                                  onTap: () {
                                    context.read<CreateTaskBloc>().add(const CreateTaskTimeOfDayChanged('midday'));
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _TimeOfDayCard(
                                  icon: Icons.wb_sunny_outlined,
                                  label: 'Afternoon',
                                  timeRange: '2pm - 6pm',
                                  isSelected: state.timeOfDay == 'afternoon',
                                  onTap: () {
                                    context.read<CreateTaskBloc>().add(const CreateTaskTimeOfDayChanged('afternoon'));
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _TimeOfDayCard(
                                  icon: Icons.nightlight,
                                  label: 'Evening',
                                  timeRange: 'After 6pm',
                                  isSelected: state.timeOfDay == 'evening',
                                  onTap: () {
                                    context.read<CreateTaskBloc>().add(const CreateTaskTimeOfDayChanged('evening'));
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: canContinue ? onNext : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: canContinue ? AppTheme.primaryBlue : Colors.grey.shade300,
                  ),
                  child: const Text('Continue'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Helper widget for date type buttons
class _DateTypeButton extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _DateTypeButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade200,
          border: Border.all(
            color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade400,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppTheme.primaryBlue,
          ),
        ),
      ),
    );
  }
}

// Helper widget for time of day cards
class _TimeOfDayCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String timeRange;
  final bool isSelected;
  final VoidCallback onTap;

  const _TimeOfDayCard({
    required this.icon,
    required this.label,
    required this.timeRange,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryBlue.withValues(alpha: 0.1) : Colors.grey.shade100,
          border: Border.all(
            color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade600,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isSelected ? AppTheme.primaryBlue : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              timeRange,
              style: TextStyle(
                fontSize: 12,
                color: isSelected ? AppTheme.primaryBlue : AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Step 4: Location ---
class _StepLocation extends StatefulWidget {
  final VoidCallback onNext;
  const _StepLocation({required this.onNext});

  @override
  State<_StepLocation> createState() => _StepLocationState();
}

class _StepLocationState extends State<_StepLocation> {
  final _controller = TextEditingController();
  // Default to Sydney
  static const _initialPosition = LatLng(-33.8688, 151.2093);
  LatLng? _selectedLocation;
  Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    final state = context.read<CreateTaskBloc>().state;
    _controller.text = state.location;
    if (state.latitude != null && state.longitude != null) {
      _selectedLocation = LatLng(state.latitude!, state.longitude!);
      _markers = {
        Marker(
          markerId: const MarkerId('selected'),
          position: _selectedLocation!,
        ),
      };
    }
    _controller.addListener(() {
      // Only update text, lat/lng updated via map tap
      context.read<CreateTaskBloc>().add(CreateTaskLocationChanged(
        _controller.text,
        latitude: _selectedLocation?.latitude,
        longitude: _selectedLocation?.longitude,
      ));
    });
  }

  void _onMapTap(LatLng position) {
    setState(() {
      _selectedLocation = position;
      _markers = {
        Marker(
          markerId: const MarkerId('selected'),
          position: position,
        ),
      };
      // In a real app, we would reverse geocode here to get address
      _controller.text = '${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
    });
    context.read<CreateTaskBloc>().add(CreateTaskLocationChanged(
      _controller.text,
      latitude: position.latitude,
      longitude: position.longitude,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Where is the task?',
            style: GoogleFonts.oswald(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            onChanged: (value) {
              setState(() {}); // Rebuild to update button state
              context.read<CreateTaskBloc>().add(CreateTaskLocationChanged(value));
            },
            decoration: const InputDecoration(
              hintText: 'Search or tap on map',
              prefixIcon: Icon(Icons.location_on_outlined),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: GoogleMap(
                initialCameraPosition: CameraPosition(
                  target: _selectedLocation ?? _initialPosition,
                  zoom: 11,
                ),
                markers: _markers,
                onTap: _onMapTap,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _controller.text.isNotEmpty ? widget.onNext : null,
              child: const Text('Next'),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Step 5: Budget ---
class _StepBudget extends StatefulWidget {
  final VoidCallback onNext;
  const _StepBudget({required this.onNext});

  @override
  State<_StepBudget> createState() => _StepBudgetState();
}

class _StepBudgetState extends State<_StepBudget> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    final state = context.read<CreateTaskBloc>().state;
    if (state.budget > 0) {
      _controller.text = state.budget.toStringAsFixed(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'What is your budget?',
            style: GoogleFonts.oswald(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Please enter the total amount you are willing to pay.',
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 32),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            onChanged: (value) {
              setState(() {}); // Rebuild to update button state
              if (value.isNotEmpty) {
                final val = double.tryParse(value) ?? 0;
                context.read<CreateTaskBloc>().add(CreateTaskBudgetChanged(val));
              }
            },
            decoration: const InputDecoration(
              prefixText: '\$ ',
              hintText: '0',
              border: OutlineInputBorder(),
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            ),
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _controller.text.isNotEmpty ? widget.onNext : null,
              child: const Text('Next'),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Step 6: Photos ---
class _StepPhotos extends StatelessWidget {
  final VoidCallback onNext;
  const _StepPhotos({required this.onNext});

  Future<void> _pickImage(BuildContext context) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null && context.mounted) {
      context.read<CreateTaskBloc>().add(CreateTaskPhotoAdded(image.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<CreateTaskBloc>().state;
    
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Snap a photo',
            style: GoogleFonts.oswald(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Photos help Taskers understand what needs doing.',
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 32),
          if (state.photos.isEmpty)
            GestureDetector(
              onTap: () => _pickImage(context),
              child: Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.divider),
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.grey.shade50,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.add_a_photo_outlined, size: 48, color: AppTheme.textSecondary),
                    const SizedBox(height: 16),
                    Text(
                      'Add Photos',
                      style: Theme.of(context).textTheme.titleMedium!.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: state.photos.length + 1,
                itemBuilder: (context, index) {
                  if (index == state.photos.length) {
                    return GestureDetector(
                      onTap: () => _pickImage(context),
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: AppTheme.divider),
                          borderRadius: BorderRadius.circular(12),
                          color: Colors.grey.shade50,
                        ),
                        child: const Icon(Icons.add, size: 48, color: AppTheme.textSecondary),
                      ),
                    );
                  }
                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(
                          File(state.photos[index]),
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            context.read<CreateTaskBloc>().add(CreateTaskPhotoRemoved(index));
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.close, size: 16, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          if (state.photos.isEmpty) const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onNext, // Photos are optional
              child: const Text('Next'),
            ),
          ),
        ],
      ),
    );
  }
}

// --- Step 7: Review ---
class _StepReview extends StatelessWidget {
  final Function(int) onNavigateToStep;
  
  const _StepReview({required this.onNavigateToStep});

  String _formatDateDisplay(BuildContext context, CreateTaskState state) {
    if (state.date == null) return 'Flexible';
    
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    String dateStr;
    
    if (state.dateType == 'before_date') {
      dateStr = 'Before ${state.date!.day} ${months[state.date!.month - 1]} ${state.date!.year}';
    } else {
      dateStr = 'On ${state.date!.day} ${months[state.date!.month - 1]} ${state.date!.year}';
    }
    
    if (state.hasSpecificTime && state.timeOfDay != null) {
      String timeOfDayStr = state.timeOfDay!;
      dateStr += ' (${timeOfDayStr[0].toUpperCase()}${timeOfDayStr.substring(1)})';
    }
    
    return dateStr;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CreateTaskBloc, CreateTaskState>(
      builder: (context, state) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Alright, ready to get offers?',
                style: GoogleFonts.oswald(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Post the task when you\'re ready',
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  color: AppTheme.primaryBlue,
                ),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      _ReviewRow(
                        icon: Icons.brush_outlined,
                        text: state.title,
                        onTap: () => onNavigateToStep(0),
                      ),
                      _ReviewRow(
                        icon: Icons.calendar_today_outlined,
                        text: _formatDateDisplay(context, state),
                        onTap: () => onNavigateToStep(2),
                      ),
                      _ReviewRow(
                        icon: Icons.location_on_outlined,
                        text: state.location.isNotEmpty ? state.location : 'No location set',
                        onTap: () => onNavigateToStep(3),
                      ),
                      _ReviewRow(
                        icon: Icons.description_outlined,
                        text: state.description.length > 60 
                            ? '${state.description.substring(0, 60)}...'
                            : state.description,
                        onTap: () => onNavigateToStep(1),
                      ),
                      _ReviewRow(
                        icon: Icons.attach_money_outlined,
                        text: '£${state.budget.toStringAsFixed(0)}',
                        onTap: () => onNavigateToStep(4),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: state.status == CreateTaskStatus.submitting
                      ? null
                      : () {
                          context.read<CreateTaskBloc>().add(CreateTaskSubmitted());
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: state.status == CreateTaskStatus.submitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Post the task', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Helper widget for review row items
class _ReviewRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final VoidCallback onTap;

  const _ReviewRow({
    required this.icon,
    required this.text,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 4),
        child: Row(
          children: [
            Icon(
              icon,
              color: AppTheme.textSecondary,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                text,
                style: const TextStyle(
                  fontSize: 16,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppTheme.textSecondary,
              size: 24,
            ),
          ],
        ),
      ),
    );
  }
}

// --- Success Step ---
class _StepSuccess extends StatelessWidget {
  const _StepSuccess();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFB8E6B8),
            Color(0xFFA8E0A8),
          ],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(),
            Text(
              'LET\'S GO',
              style: GoogleFonts.oswald(
                fontSize: 64,
                fontWeight: FontWeight.w900,
                color: AppTheme.primaryBlue,
                height: 0.9,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 64),
            Text(
              'Your task is posted. Here\'s what\'s next:',
              style: Theme.of(context).textTheme.titleMedium!.copyWith(
                color: AppTheme.primaryBlue,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            const _NextStepItem(
              number: 1,
              text: 'Taskers will make offers',
            ),
            const SizedBox(height: 24),
            const _NextStepItem(
              number: 2,
              text: 'Accept an offer',
            ),
            const SizedBox(height: 24),
            const _NextStepItem(
              number: 3,
              text: 'Chat and get it done!',
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // Navigate to my tasks tab - using home route will show the main scaffold
                  context.go('/home');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Go to my task', style: TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// Helper widget for next steps
class _NextStepItem extends StatelessWidget {
  final int number;
  final String text;

  const _NextStepItem({
    required this.number,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: const BoxDecoration(
            color: AppTheme.primaryBlue,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '$number',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 16,
              color: AppTheme.primaryBlue,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
