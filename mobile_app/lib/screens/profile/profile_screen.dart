import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../bloc/auth/auth_bloc.dart';
import '../../bloc/auth/auth_event.dart';
import '../../bloc/auth/auth_state.dart';
import '../../bloc/profile/profile_bloc.dart';
import '../../bloc/profile/profile_event.dart';
import '../../bloc/profile/profile_state.dart';
import '../../config/theme.dart';
import '../../core/service_locator.dart';

/// Enhanced profile screen with full functionality
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<ProfileBloc>()..add(LoadProfile()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Profile'),
          actions: [
            IconButton(
              icon: const Icon(Icons.settings_outlined),
              onPressed: () => context.go('/profile/help'),
            ),
          ],
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, authState) {
            if (authState is! AuthAuthenticated) {
              return _buildUnauthenticatedView(context);
            }
            
            return BlocBuilder<ProfileBloc, ProfileState>(
              builder: (context, profileState) {
                if (profileState is ProfileLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                if (profileState is ProfileLoaded) {
                  return _buildAuthenticatedView(context, profileState);
                }
                
                if (profileState is ProfileError) {
                  return Center(child: Text('Error: ${profileState.message}'));
                }
                
                return const Center(child: CircularProgressIndicator());
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildUnauthenticatedView(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.account_circle_outlined,
            size: 80,
            color: AppTheme.textSecondary,
          ),
          const SizedBox(height: 24),
          Text(
            'Log in or Sign up',
            style: Theme.of(context).textTheme.headlineMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Join the community to get tasks done or earn money.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  color: AppTheme.textSecondary,
                ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.go('/login'),
              child: const Text('Log in'),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => context.go('/account-type'),
              child: const Text('Sign up'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuthenticatedView(BuildContext context, ProfileLoaded state) {
    final profile = state.profile;
    
    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProfileBloc>().add(LoadProfile());
        await Future.delayed(const Duration(milliseconds: 500));
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Header with Edit
            _buildUserHeader(context, profile),
            
            const SizedBox(height: 24),
            
            // Stats Cards
            _buildStatsCards(profile),
            
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 8),
            
            // Account Section
            _buildSectionHeader(context, 'Account'),
            _buildMenuItem(
              context,
              Icons.person_outline,
              'Personal Info',
              onTap: () => context.go('/profile/personal-info'),
            ),
            _buildMenuItem(
              context,
              Icons.work_outline,
              'Work',
              onTap: () => context.go('/profile/work'),
            ),
            _buildMenuItem(
              context,
              Icons.verified_user_outlined,
              'Verification',
              subtitle: profile.isVerified ? 'Verified' : 'Not verified',
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Verification coming soon')),
                );
              },
            ),
            
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            
            // Payment Section
            _buildSectionHeader(context, 'Payment'),
            _buildMenuItem(
              context,
              Icons.payment,
              'Payment Settings',
              onTap: () => context.go('/profile/payment-settings'),
            ),
            _buildMenuItem(
              context,
              Icons.history,
              'Payment History',
              onTap: () => context.go('/profile/payment-history'),
            ),
            
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            
            // Notifications Section
            _buildSectionHeader(context, 'Notifications'),
            _buildMenuItem(
              context,
              Icons.notifications_outlined,
              'Notification Settings',
              onTap: () => context.go('/profile/notifications'),
            ),
            
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            
            // Settings Section
            _buildSectionHeader(context, 'Settings'),
            _buildMenuItem(
              context,
              Icons.help_outline,
              'Help & Support',
              onTap: () => context.go('/profile/help'),
            ),
            _buildMenuItem(
              context,
              Icons.info_outline,
              'About Airtasker',
              onTap: () {
                showAboutDialog(
                  context: context,
                  applicationName: 'Airtasker Clone',
                  applicationVersion: '1.0.0',
                );
              },
            ),
            
            const SizedBox(height: 24),
            
            // Log out button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  context.read<AuthBloc>().add(AuthLogout());
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.accentRed,
                  side: const BorderSide(color: AppTheme.accentRed),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Log out'),
              ),
            ),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildUserHeader(BuildContext context, profile) {
    return Row(
      children: [
        Stack(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundImage: profile.profileImage != null
                  ? NetworkImage(profile.profileImage!)
                  : null,
              child: profile.profileImage == null
                  ? Text(
                      profile.name[0],
                      style: const TextStyle(fontSize: 32),
                    )
                  : null,
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: GestureDetector(
                onTap: () => context.go('/profile/edit'),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryBlue,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.edit,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profile.name,
                style: Theme.of(context).textTheme.titleLarge!.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 4),
              if (profile.isVerified)
                Row(
                  children: [
                    const Icon(Icons.verified,
                        size: 16, color: AppTheme.verifiedBlue),
                    const SizedBox(width: 4),
                    Text(
                      'Verified',
                      style: Theme.of(context).textTheme.bodySmall!.copyWith(
                            color: AppTheme.verifiedBlue,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    '${profile.rating} (${profile.totalReviews} reviews)',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatsCards(profile) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            '${(profile.completionRate * 100).toStringAsFixed(0)}%',
            'Completion Rate',
            Icons.check_circle_outline,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            '${profile.completedTasks}',
            'Tasks Completed',
            Icons.task_alt,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String value, String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppTheme.primaryBlue, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: Theme.of(context).textTheme.titleMedium!.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondary,
              ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context,
    IconData icon,
    String title, {
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.textPrimary),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: const Icon(Icons.chevron_right, color: AppTheme.textSecondary),
      onTap: onTap,
    );
  }
}
