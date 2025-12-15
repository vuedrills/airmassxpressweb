import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/auth/auth_state.dart';
import '../screens/onboarding/onboarding_screen.dart';
import '../screens/onboarding/account_type_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/profile/edit_profile_screen.dart';
import '../screens/profile/personal_info_screen.dart';
import '../screens/profile/work_info_screen.dart';
import '../screens/profile/payment_settings_screen.dart';
import '../screens/profile/payment_history_screen.dart';
import '../screens/profile/notifications_settings_screen.dart';
import '../screens/profile/help_support_screen.dart';
import '../screens/tasks/task_detail_screen.dart';
import '../screens/tasks/create_task_screen.dart';
import '../main.dart';

/// App router configuration using go_router
/// Implements declarative routing with auth state-based redirects
class AppRouter {
  final AuthBloc authBloc;

  AppRouter(this.authBloc);

  late final GoRouter router = GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    refreshListenable: GoRouterRefreshStream(authBloc.stream),
    redirect: (BuildContext context, GoRouterState state) {
      final authState = authBloc.state;
      final isAuthenticated = authState is AuthAuthenticated;
      final isOnboarding = state.matchedLocation.startsWith('/onboarding') ||
          state.matchedLocation.startsWith('/account-type') ||
          state.matchedLocation.startsWith('/login') ||
          state.matchedLocation.startsWith('/signup');

      // If user is authenticated and trying to access auth/onboarding screens
      if (isAuthenticated && isOnboarding) {
        return '/home';
      }

      // If user is not authenticated and trying to access protected screens
      if (!isAuthenticated && !isOnboarding && state.matchedLocation == '/home') {
        return '/onboarding';
      }

      // No redirect needed
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/onboarding',
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/account-type',
        builder: (context, state) => const AccountTypeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) {
          final accountType = state.uri.queryParameters['type'];
          return RegisterScreen(accountType: accountType);
        },
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const MainScaffold(),
      ),
      GoRoute(
        path: '/create-task',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          final initialTitle = extra?['title'] as String?;
          return CreateTaskScreen(initialTitle: initialTitle);
        },
      ),
      GoRoute(
        path: '/tasks/:id',
        builder: (context, state) {
          final taskId = state.pathParameters['id']!;
          return TaskDetailScreen(taskId: taskId);
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
        routes: [
          GoRoute(
            path: 'edit',
            builder: (context, state) => const EditProfileScreen(),
          ),
          GoRoute(
            path: 'personal-info',
            builder: (context, state) => const PersonalInfoScreen(),
          ),
          GoRoute(
            path: 'work',
            builder: (context, state) => const WorkInfoScreen(),
          ),
          GoRoute(
            path: 'payment-settings',
            builder: (context, state) => const PaymentSettingsScreen(),
          ),
          GoRoute(
            path: 'payment-history',
            builder: (context, state) => const PaymentHistoryScreen(),
          ),
          GoRoute(
            path: 'notifications',
            builder: (context, state) => const NotificationsSettingsScreen(),
          ),
          GoRoute(
            path: 'help',
            builder: (context, state) => const HelpSupportScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
}

/// Helper class to refresh GoRouter when auth state changes
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<AuthState> stream) {
    notifyListeners();
    stream.listen((_) => notifyListeners());
  }
}
