
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/presentation/screens/home_screen.dart';
import 'package:mobile/features/auction/presentation/screens/create_auction_screen.dart';
import 'package:mobile/features/auction/presentation/screens/auction_details_screen.dart';
import 'package:mobile/features/auction/presentation/screens/search_screen.dart';
import 'package:mobile/features/auction/presentation/screens/category_grid_screen.dart';
import 'package:mobile/features/auction/presentation/screens/town_browser_screen.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';
import 'package:mobile/features/auth/presentation/screens/login_screen.dart';
import 'package:mobile/features/auth/presentation/screens/register_screen.dart';
import 'package:mobile/features/auth/presentation/screens/profile_screen.dart';
import 'package:mobile/features/auth/presentation/screens/edit_profile_screen.dart';
import 'package:mobile/features/notification/presentation/screens/notification_screen.dart';
import 'package:mobile/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:mobile/features/auth/presentation/screens/onboarding_screen.dart';
import 'package:mobile/features/auth/presentation/screens/settings_screen.dart';
import 'package:mobile/features/auth/presentation/screens/public_profile_screen.dart';

import 'package:mobile/features/chat/presentation/screens/message_center_screen.dart';
import 'package:mobile/core/widgets/main_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: authState.isAuthenticated ? '/' : '/onboarding',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isGoingToAuthRoute = ['/login', '/register', '/forgot-password', '/onboarding'].contains(state.uri.path);

      // If not authenticated
      if (!isAuthenticated) {
        // Allow access to auth-related routes
        if (isGoingToAuthRoute) {
          return null;
        }
        // Otherwise, redirect to onboarding
        return '/onboarding';
      }

      // If authenticated
      // If trying to access auth-related routes, redirect to home
      if (isAuthenticated && isGoingToAuthRoute) {
        return '/';
      }

      // Otherwise, allow access
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/categories',
            builder: (context, state) => const CategoryGridScreen(),
          ),
          GoRoute(
            path: '/messages',
            builder: (context, state) => const MessageCenterScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/create-auction',
        builder: (context, state) => const CreateAuctionScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) {
          final categoryIdStr = state.uri.queryParameters['category_id'];
          final townIdStr = state.uri.queryParameters['town_id'];
          final categoryId = categoryIdStr != null ? int.tryParse(categoryIdStr) : null;
          final townId = townIdStr != null ? int.tryParse(townIdStr) : null;
          return SearchScreen(initialCategoryId: categoryId, initialTownId: townId);
        },
      ),
      GoRoute(
        path: '/town/:id',
        builder: (context, state) {
          final townId = int.parse(state.pathParameters['id']!);
          final townName = state.uri.queryParameters['name'] ?? 'Town';
          return TownBrowserScreen(townId: townId, townName: townName);
        },
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/edit-profile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationScreen(),
      ),
      GoRoute(
        path: '/auction/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          final auction = state.extra as Auction?;
          
          if (auction == null) {
            // If extra is missing (e.g. on hot restart), we pass a minimally initialized auction
            // The screen's auctionListProvider watch will then fetch the real data
            return AuctionDetailsScreen(
              auctionId: id, 
              initialData: Auction(
                id: id,
                title: "Loading...",
                description: "",
                currentPrice: 0,
                userId: 0,
                endTime: DateTime.now(),
                status: "active",
                images: [],
                category: "",
                bidCount: 0,
                createdAt: DateTime.now(),
              ),
            );
          }
          return AuctionDetailsScreen(auctionId: id, initialData: auction);
        },
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/users/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return PublicProfileScreen(userId: id);
        },
      ),
    ],
  );
});
