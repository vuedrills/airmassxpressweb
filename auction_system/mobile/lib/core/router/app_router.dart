import 'package:go_router/go_router.dart';
import 'package:mobile/features/auction/presentation/screens/home_screen.dart';

// Simple Router for MVP
final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
  ],
);
