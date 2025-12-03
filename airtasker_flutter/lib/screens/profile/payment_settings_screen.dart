import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../bloc/profile/profile_bloc.dart';
import '../../bloc/profile/profile_event.dart';
import '../../bloc/profile/profile_state.dart';
import '../../models/payment_method.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';

/// Payment settings screen - manage payment methods
class PaymentSettingsScreen extends StatelessWidget {
  const PaymentSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProfileBloc>()..add(LoadPaymentMethods()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Payment Settings'),
        ),
        body: BlocBuilder<ProfileBloc, ProfileState>(
          builder: (context, state) {
            if (state is ProfileLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is PaymentMethodsLoaded) {
              return _buildPaymentMethodsList(context, state.methods);
            }

            return const Center(child: Text('No payment methods'));
          },
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => _showAddPaymentMethod(context),
          icon: const Icon(Icons.add),
          label: const Text('Add Payment Method'),
        ),
      ),
    );
  }

  Widget _buildPaymentMethodsList(BuildContext context, List<PaymentMethod> methods) {
    if (methods.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.payment, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No payment methods yet',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 80), // Space for FAB
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: methods.length,
      separatorBuilder: (_, __) => const Divider(),
      itemBuilder: (context, index) {
        final method = methods[index];
        return _buildPaymentMethodCard(context, method);
      },
    );
  }

  Widget _buildPaymentMethodCard(BuildContext context, PaymentMethod method) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: Icon(
        _getPaymentIcon(method.type),
        size: 32,
        color: AppTheme.primaryBlue,
      ),
      title: Row(
        children: [
          Text(method.displayName),
          if (method.isDefault) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.accentTeal,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'DEFAULT',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ],
      ),
      subtitle: method.expiryDate != null
          ? Text('Expires ${DateFormat('MM/yy').format(method.expiryDate!)}')
          : null,
      trailing: PopupMenuButton(
        itemBuilder: (context) => [
          if (!method.isDefault)
            const PopupMenuItem(
              value: 'default',
              child: Text('Set as default'),
            ),
          const PopupMenuItem(
            value: 'remove',
            child: Text('Remove', style: TextStyle(color: AppTheme.accentRed)),
          ),
        ],
        onSelected: (value) {
          if (value == 'default') {
            context.read<ProfileBloc>().add(SetDefaultPaymentMethod(method.id));
          } else if (value == 'remove') {
            _confirmRemove(context, method);
          }
        },
      ),
    );
  }

  IconData _getPaymentIcon(PaymentType type) {
    switch (type) {
      case PaymentType.card:
        return Icons.credit_card;
      case PaymentType.bankAccount:
        return Icons.account_balance;
      case PaymentType.paypal:
        return Icons.payment;
    }
  }

  void _confirmRemove(BuildContext context, PaymentMethod method) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Remove Payment Method'),
        content: Text('Are you sure you want to remove ${method.displayName}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              context.read<ProfileBloc>().add(RemovePaymentMethod(method.id));
              Navigator.pop(dialogContext);
            },
            style: TextButton.styleFrom(foregroundColor: AppTheme.accentRed),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }

  void _showAddPaymentMethod(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add payment method coming soon')),
    );
  }
}
