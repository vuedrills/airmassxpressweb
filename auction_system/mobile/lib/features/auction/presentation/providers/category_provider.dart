import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auction/data/models/category_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';

final categoryListProvider = FutureProvider<List<Category>>((ref) async {
  final repository = ref.watch(auctionRepositoryProvider);
  return repository.getCategories();
});
