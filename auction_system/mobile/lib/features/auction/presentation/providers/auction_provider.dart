import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/repositories/auction_repository.dart';

final auctionRepositoryProvider = Provider<AuctionRepository>((ref) {
  return AuctionRepository();
});

final auctionListProvider = FutureProvider<List<Auction>>((ref) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getAuctions();
});
