import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/filter/filter_bloc.dart';
import '../../../bloc/filter/filter_event.dart';
import '../../../bloc/filter/filter_state.dart';
import '../../../bloc/browse/browse_bloc.dart';
import '../../../bloc/browse/browse_event.dart';
import '../../../models/filter_criteria.dart';
import '../../../config/theme.dart';
import 'package:intl/intl.dart';

/// Filter bottom sheet with price, distance, date, and status filters
class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  static Future<void> show(BuildContext context) {
    final filterBloc = context.read<FilterBloc>();
    final browseBloc = context.read<BrowseBloc>();
    
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (newContext) => MultiBlocProvider(
        providers: [
          BlocProvider.value(value: filterBloc),
          BlocProvider.value(value: browseBloc),
        ],
        child: const FilterBottomSheet(),
      ),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late TextEditingController _minPriceController;
  late TextEditingController _maxPriceController;
  double _distance = 25;
  DateTime? _fromDate;
  DateTime? _toDate;
  List<String> _selectedStatus = ['open'];

  @override
  void initState() {
    super.initState();
    final filterState = context.read<FilterBloc>().state;
    final criteria = filterState is FilterApplied ? filterState.criteria : const FilterCriteria();
    
    _minPriceController = TextEditingController(text: criteria.minPrice?.toStringAsFixed(0) ?? '');
    _maxPriceController = TextEditingController(text: criteria.maxPrice?.toStringAsFixed(0) ?? '');
    _distance = criteria.distanceKm ?? 25;
    _fromDate = criteria.fromDate;
    _toDate = criteria.toDate;
    _selectedStatus = List.from(criteria.taskStatus);
  }

  @override
  void dispose() {
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize:0.9,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppTheme.divider)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Text(
                      'Filters',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      context.read<FilterBloc>().add(ClearFilters());
                      setState(() {
                        _minPriceController.clear();
                        _maxPriceController.clear();
                        _distance = 25;
                        _fromDate = null;
                        _toDate = null;
                        _selectedStatus = ['open'];
                      });
                    },
                    child: const Text('Clear all'),
                  ),
                ],
              ),
            ),
            
            // Content
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(24),
                children: [
                  // Price Range
                  const Text(
                    'Price Range',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _minPriceController,
                          decoration: const InputDecoration(
                            labelText: 'Min (AUD)',
                            prefixText: '\$',
                          ),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextField(
                          controller: _maxPriceController,
                          decoration: const InputDecoration(
                            labelText: 'Max (AUD)',
                            prefixText: '\$',
                          ),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Distance
                  const Text(
                    'Distance',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Within ${_distance.toInt()} km',
                    style: const TextStyle(color: AppTheme.textSecondary),
                  ),
                  Slider(
                    value: _distance,
                    min: 0,
                    max: 100,
                    divisions: 20,
                    label: '${_distance.toInt()} km',
                    onChanged: (value) => setState(() => _distance = value),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Date Range
                  const Text(
                    'Date Range',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _fromDate ?? DateTime.now(),
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) setState(() => _fromDate = date);
                          },
                          icon: const Icon(Icons.calendar_today),
                          label: Text(_fromDate != null ? DateFormat('MMM d, y').format(_fromDate!) : 'From'),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: _toDate ?? DateTime.now().add(const Duration(days: 7)),
                              firstDate: _fromDate ?? DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) setState(() => _toDate = date);
                          },
                          icon: const Icon(Icons.calendar_today),
                          label: Text(_toDate != null ? DateFormat('MMM d, y').format(_toDate!) : 'To'),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // Task Status
                  const Text(
                    'Task Status',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  ..._buildStatusCheckboxes(),
                ],
              ),
            ),
            
            // Apply button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppTheme.divider)),
              ),
              child: SafeArea(
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _applyFilters,
                    child: const Text('Apply Filters'),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  List<Widget> _buildStatusCheckboxes() {
    final statuses = [
      {'value': 'open', 'label': 'Open'},
      {'value': 'assigned', 'label': 'Assigned'},
      {'value': 'completed', 'label': 'Completed'},
    ];
    
    return statuses.map((status) {
      final value = status['value']!;
      final label = status['label']!;
      return CheckboxListTile(
        value: _selectedStatus.contains(value),
        onChanged: (checked) {
          setState(() {
            if (checked == true) {
              _selectedStatus.add(value);
            } else {
              _selectedStatus.remove(value);
            }
          });
        },
        title: Text(label),
        activeColor: AppTheme.primaryBlue,
        contentPadding: EdgeInsets.zero,
      );
    }).toList();
  }

  void _applyFilters() {
    final criteria = FilterCriteria(
      minPrice: _minPriceController.text.isNotEmpty ? double.tryParse(_minPriceController.text) : null,
      maxPrice: _maxPriceController.text.isNotEmpty ? double.tryParse(_maxPriceController.text) : null,
      distanceKm: _distance > 0 ? _distance : null,
      fromDate: _fromDate,
      toDate: _toDate,
      taskStatus: _selectedStatus,
    );
    
    context.read<FilterBloc>().add(UpdateFilter(criteria));
    context.read<FilterBloc>().add(ApplyFilters());
    context.read<BrowseBloc>().add(LoadBrowseTasks());
    
    Navigator.pop(context);
  }
}
