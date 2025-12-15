import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/offer/offer_bloc.dart';
import '../../bloc/offer/offer_event.dart';
import '../../bloc/offer/offer_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';
import '../../models/task.dart';

class MakeOfferScreen extends StatelessWidget {
  final Task task;

  const MakeOfferScreen({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<OfferBloc>(),
      child: _MakeOfferContent(task: task),
    );
  }
}

class _MakeOfferContent extends StatefulWidget {
  final Task task;

  const _MakeOfferContent({required this.task});

  @override
  State<_MakeOfferContent> createState() => _MakeOfferContentState();
}

class _MakeOfferContentState extends State<_MakeOfferContent> {
  final _amountController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _amountController.addListener(() {
      final val = double.tryParse(_amountController.text) ?? 0;
      context.read<OfferBloc>().add(OfferAmountChanged(val));
    });
    _messageController.addListener(() {
      context.read<OfferBloc>().add(OfferMessageChanged(_messageController.text));
    });
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<OfferBloc, OfferState>(
      listener: (context, state) {
        if (state.status == OfferStatus.success) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Offer submitted successfully!')),
          );
        } else if (state.status == OfferStatus.failure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.errorMessage ?? 'Failed to submit offer')),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Make an Offer'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Task Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.divider),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.task.title,
                            style: Theme.of(context).textTheme.titleMedium!.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.task.locationAddress,
                            style: Theme.of(context).textTheme.bodySmall!.copyWith(
                              color: AppTheme.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${widget.task.budget.toStringAsFixed(0)}',
                      style: Theme.of(context).textTheme.titleLarge!.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Offer Amount
              Text(
                'Your Offer',
                style: Theme.of(context).textTheme.titleMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  prefixText: '\$ ',
                  hintText: '0',
                  border: OutlineInputBorder(),
                  helperText: 'Enter the amount you want to be paid',
                ),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),

              // Message
              Text(
                'Message',
                style: Theme.of(context).textTheme.titleMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _messageController,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'Why are you the best person for this task?',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              BlocBuilder<OfferBloc, OfferState>(
                builder: (context, state) {
                  return SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: state.status == OfferStatus.submitting
                          ? null
                          : () {
                              context.read<OfferBloc>().add(OfferSubmitted(widget.task.id));
                            },
                      child: state.status == OfferStatus.submitting
                          ? const CircularProgressIndicator()
                          : const Text('Submit Offer'),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
