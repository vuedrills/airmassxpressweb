import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:mobile/features/auction/presentation/widgets/auction_grid_card.dart';

// State for search params
class SearchParams {
  final String query;
  final int? categoryId;
  final int? townId;
  final double? minPrice;
  final double? maxPrice;
  final String? sortBy;
  final String? order;

  SearchParams({
    this.query = '',
    this.categoryId,
    this.townId,
    this.minPrice,
    this.maxPrice,
    this.sortBy,
    this.order,
  });

  SearchParams copyWith({
    String? query,
    int? categoryId,
    int? townId,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? order,
  }) {
    return SearchParams(
      query: query ?? this.query,
      categoryId: categoryId ?? this.categoryId,
      townId: townId ?? this.townId,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      sortBy: sortBy ?? this.sortBy,
      order: order ?? this.order,
    );
  }
}

final searchParamsProvider = StateProvider.autoDispose<SearchParams>((ref) => SearchParams());

// FutureProvider that depends on the params
final searchResultsProvider = FutureProvider.autoDispose<List<Auction>>((ref) async {
  final params = ref.watch(searchParamsProvider);
  // Fetch if query is not empty OR category/town is selected
  if (params.query.isEmpty && params.categoryId == null && params.townId == null) return [];
  
  final repo = ref.watch(auctionRepositoryProvider);
  return repo.searchAuctions(
    query: params.query,
    categoryId: params.categoryId,
    townId: params.townId,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sortBy: params.sortBy,
    order: params.order,
  );
});

class SearchScreen extends ConsumerStatefulWidget {
  final int? initialCategoryId;
  final int? initialTownId;
  const SearchScreen({super.key, this.initialCategoryId, this.initialTownId});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    if (widget.initialCategoryId != null || widget.initialTownId != null) {
      // Defer state update
      Future.microtask(() {
        ref.read(searchParamsProvider.notifier).state = SearchParams(
          categoryId: widget.initialCategoryId,
          townId: widget.initialTownId,
        );
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
       // Keep existing filters, update query
       final current = ref.read(searchParamsProvider);
       ref.read(searchParamsProvider.notifier).state = current.copyWith(query: query);
    });
  }

  void _showFilterModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _FilterModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchAsync = ref.watch(searchResultsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        toolbarHeight: 80,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Container(
          height: 50,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(25),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: TextField(
            controller: _controller,
            autofocus: true,
            onChanged: _onSearchChanged,
            decoration: InputDecoration(
              hintText: "Search items, cars, etc...",
              hintStyle: GoogleFonts.inter(color: Colors.grey[500]),
              prefixIcon: const Icon(Icons.search, color: Colors.black),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            ),
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune, color: Colors.black),
            onPressed: () => _showFilterModal(context),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: searchAsync.when(
        data: (auctions) {
          final params = ref.watch(searchParamsProvider);
          final hasFilter = params.query.isNotEmpty || params.categoryId != null;

          if (auctions.isEmpty && hasFilter) {
             return Center(
               child: Text("No results found.", style: GoogleFonts.inter(color: Colors.grey)),
             );
          }
          if (auctions.isEmpty && !hasFilter) {
             return Center(
               child: Column(
                 mainAxisAlignment: MainAxisAlignment.center,
                 children: [
                   const Icon(Icons.search, size: 64, color: Colors.grey),
                   const SizedBox(height: 16),
                   Text("Type to search", style: GoogleFonts.inter(color: Colors.grey)),
                 ],
               ),
             );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.75,
            ),
            itemCount: auctions.length,
            itemBuilder: (context, index) {
              return AuctionGridCard(auction: auctions[index]);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}

class _FilterModal extends ConsumerStatefulWidget {
  @override
  ConsumerState<_FilterModal> createState() => _FilterModalState();
}

class _FilterModalState extends ConsumerState<_FilterModal> {
  late double _minPrice;
  late double _maxPrice;
  String _sortBy = 'created_at';
  String _order = 'desc';

  @override
  void initState() {
    super.initState();
    final params = ref.read(searchParamsProvider);
    _minPrice = params.minPrice ?? 0;
    _maxPrice = params.maxPrice ?? 10000;
    _sortBy = params.sortBy ?? 'created_at';
    _order = params.order ?? 'desc';
  }

  void _apply() {
    final current = ref.read(searchParamsProvider);
    ref.read(searchParamsProvider.notifier).state = current.copyWith(
      minPrice: _minPrice > 0 ? _minPrice : null,
      maxPrice: _maxPrice < 10000 ? _maxPrice : null,
      sortBy: _sortBy,
      order: _order,
    );
    Navigator.pop(context);
  }

  void _reset() {
    final current = ref.read(searchParamsProvider);
    ref.read(searchParamsProvider.notifier).state = SearchParams(
      query: current.query,
      categoryId: current.categoryId,
      townId: current.townId,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Filters", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
              TextButton(
                onPressed: _reset,
                child: Text("Reset", style: GoogleFonts.inter(color: Colors.red)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          Text("Price Range", style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          RangeSlider(
            values: RangeValues(_minPrice, _maxPrice),
            min: 0,
            max: 10000,
            divisions: 20,
            activeColor: Colors.black,
            labels: RangeLabels("\$${_minPrice.round()}", "\$${_maxPrice.round()}"),
            onChanged: (values) {
              setState(() {
                _minPrice = values.start;
                _maxPrice = values.end;
              });
            },
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("\$${_minPrice.round()}", style: GoogleFonts.inter(color: Colors.grey)),
              Text("\$${_maxPrice.round()}+", style: GoogleFonts.inter(color: Colors.grey)),
            ],
          ),
          
          const SizedBox(height: 24),
          
          Text("Sort By", style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildSortChip("Newest", "created_at", "desc"),
              _buildSortChip("Oldest", "created_at", "asc"),
              _buildSortChip("Price: Low to High", "current_price", "asc"),
              _buildSortChip("Price: High to Low", "current_price", "desc"),
              _buildSortChip("Ending Soon", "end_time", "asc"),
            ],
          ),

          const Spacer(),
          
          ElevatedButton(
            onPressed: _apply,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text("Apply Filters"),
          ),
        ],
      ),
    );
  }

  Widget _buildSortChip(String label, String sort, String order) {
    final isSelected = _sortBy == sort && _order == order;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _sortBy = sort;
            _order = order;
          });
        }
      },
      backgroundColor: Colors.grey[100],
      selectedColor: Colors.black,
      labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
      checkmarkColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide.none),
    );
  }
}
