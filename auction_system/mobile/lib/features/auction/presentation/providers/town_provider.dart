import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auction/data/models/town_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';

// Provider for all towns
final townListProvider = FutureProvider<List<Town>>((ref) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getTowns();
});

// Provider for categories with counts for a specific town
final townCategoriesProvider = FutureProvider.family<List<CategoryWithCount>, int>((ref, townId) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getCategoriesForTown(townId);
});
