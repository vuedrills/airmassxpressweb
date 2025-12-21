import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/auction/presentation/providers/realtime_provider.dart';

import 'package:flutter_screenutil/flutter_screenutil.dart';

void main() {
  runApp(
    const ProviderScope(
      child: ScreenUtilInit(
        designSize: Size(393, 852), // iPhone 14/15/16 Pro size
        minTextAdapt: true,
        splitScreenMode: true,
        child: AuctionApp(),
      ),
    ),
  );
}

class AuctionApp extends ConsumerStatefulWidget {
  const AuctionApp({super.key});

  @override
  ConsumerState<AuctionApp> createState() => _AuctionAppState();
}

class _AuctionAppState extends ConsumerState<AuctionApp> {
  @override
  void initState() {
    super.initState();
    // Connect to WebSocket on startup (or when auth changes ideally, but startup is fine for MVP)
  }

  @override
  void dispose() {
    ref.read(realTimeProvider).disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    
    return MaterialApp.router(
      title: 'AirMass Auctions',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
    );
  }
}
