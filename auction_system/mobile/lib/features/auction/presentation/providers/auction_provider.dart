import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/repositories/auction_repository.dart';
import 'package:mobile/features/auth/presentation/providers/auth_provider.dart';

final auctionRepositoryProvider = Provider<AuctionRepository>((ref) {
  final authState = ref.watch(authProvider);
  return AuctionRepository(authState.token);
});

final auctionListProvider = AsyncNotifierProvider<AuctionListNotifier, List<Auction>>(
  AuctionListNotifier.new,
);

class AuctionListNotifier extends AsyncNotifier<List<Auction>> {
  List<Auction> _allAuctions = []; // Cache full list

  @override
  Future<List<Auction>> build() async {
    final repository = ref.watch(auctionRepositoryProvider);
    _allAuctions = await repository.getAuctions();
    return _allAuctions;
  }

  int? _selectedTownId;
  int? _selectedCategoryId;

  void filter({int? townId, int? categoryId}) { // Unified filter method
    if (townId != null) _selectedTownId = townId;
    if (categoryId != null) _selectedCategoryId = categoryId;
    
    // If passing null/sentinel (e.g. -1) we could reset. 
    // For now assume chips pass specific ID or 0/-1 for "All".
    // Let's say id 0 means "All".
    
    if (townId == 0) _selectedTownId = null;
    if (categoryId == 0) _selectedCategoryId = null;

    List<Auction> filtered = _allAuctions;

    if (_selectedTownId != null) {
      filtered = filtered.where((a) => a.townId == _selectedTownId).toList();
    }
    
    if (_selectedCategoryId != null) {
      filtered = filtered.where((a) => a.categoryId == _selectedCategoryId).toList();
    }

    state = AsyncData(filtered);
  }

  // Deprecated: use filter(townId: ...)
  void filterByTown(int? townId) => filter(townId: townId ?? 0);
  
  void filterByCategory(int? categoryId) => filter(categoryId: categoryId ?? 0);

  Future<void> refresh() async {
    state = const AsyncLoading();
    try {
      final repository = ref.read(auctionRepositoryProvider);
      _allAuctions = await repository.getAuctions();
      state = AsyncData(_allAuctions);
    } catch (e, stack) {
      state = AsyncError(e, stack);
    }
  }

  void handleRealTimeEvent(Map<String, dynamic> event) {
    if (state.value == null) return;
    
    // logic...
    // Note: We need to update both _allAuctions and state.value
    // Simplified for MVP: Just update _allAuctions and re-filter?
    // Or update current list directly.
    // Let's update _allAuctions to keep cache fresh.
    
    if (event['type'] == 'BID_PLACED') {
      final payload = event['payload'];
      final auctionId = payload['auction_id'] as int;
      final newPrice = (payload['current_price'] as num).toDouble();
      final newCount = payload['bid_count'] as int;

      // Update in cache
      final index = _allAuctions.indexWhere((a) => a.id == auctionId);
      if (index != -1) {
        _allAuctions[index] = _allAuctions[index].copyWith(
          currentPrice: newPrice,
          bidCount: newCount,
        );
      }
      
      // Update in current state
      final currentList = state.value!;
      final stateIndex = currentList.indexWhere((a) => a.id == auctionId);
      if (stateIndex != -1) {
         final newList = List<Auction>.from(currentList);
         newList[stateIndex] = newList[stateIndex].copyWith(
           currentPrice: newPrice,
           bidCount: newCount,
         );
         state = AsyncData(newList);
      }
    }
  }
}
