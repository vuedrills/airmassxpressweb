import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/auction_model.dart';
import 'auction_provider.dart';

final favoritesProvider = StateNotifierProvider<FavoritesNotifier, AsyncValue<List<Auction>>>((ref) {
  return FavoritesNotifier(ref);
});

class FavoritesNotifier extends StateNotifier<AsyncValue<List<Auction>>> {
  final Ref ref;

  FavoritesNotifier(this.ref) : super(const AsyncValue.loading()) {
    loadFavorites();
  }

  Future<void> loadFavorites() async {
    try {
      final repository = ref.read(auctionRepositoryProvider);
      final favorites = await repository.getFavorites();
      state = AsyncValue.data(favorites);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> toggleFavorite(int auctionId) async {
    try {
      final repository = ref.read(auctionRepositoryProvider);
      await repository.toggleFavorite(auctionId);
      
      // Reload to get updated list
      await loadFavorites();
    } catch (e) {
      // Handle error
    }
  }

  bool isFavorite(int auctionId) {
    return state.when(
      data: (list) => list.any((a) => a.id == auctionId),
      loading: () => false,
      error: (_, __) => false,
    );
  }
}
