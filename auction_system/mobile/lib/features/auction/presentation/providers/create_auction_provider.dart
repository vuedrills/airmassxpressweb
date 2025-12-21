import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';

final createAuctionProvider = FutureProvider.autoDispose.family<void, Map<String, dynamic>>((ref, input) async {
  final repository = ref.read(auctionRepositoryProvider);
  await repository.createAuction(input);
  // Invalidate list to refresh
  ref.invalidate(auctionListProvider);
});
