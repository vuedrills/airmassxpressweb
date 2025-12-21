import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auction/presentation/providers/auction_provider.dart';
import 'package:mobile/features/auction/presentation/providers/town_provider.dart';

class TownSelector extends ConsumerStatefulWidget {
  const TownSelector({super.key});

  @override
  ConsumerState<TownSelector> createState() => _TownSelectorState();
}

class _TownSelectorState extends ConsumerState<TownSelector> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final townsAsync = ref.watch(townListProvider);

    return townsAsync.when(
      data: (towns) {
        // Prepend "All Towns" option
        final allTowns = [
          {'id': null, 'name': 'All Towns'},
          ...towns.map((t) => {'id': t.id, 'name': t.name}),
        ];

        return SizedBox(
          height: 50,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: allTowns.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final isSelected = index == _selectedIndex;
              final town = allTowns[index];
              final townId = town['id'] as int?;
              final townName = town['name'] as String;

              return ActionChip(
                label: Text(townName),
                backgroundColor: isSelected ? Colors.black : Colors.white,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                ),
                side: BorderSide(color: Colors.grey[300]!),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                onPressed: () {
                  if (townId == null) {
                    // "All Towns" - filter on home screen
                    setState(() => _selectedIndex = index);
                    ref.read(auctionListProvider.notifier).filterByTown(null);
                  } else {
                    // Navigate to Town Browser Screen with category grid
                    context.push('/town/$townId?name=${Uri.encodeComponent(townName)}');
                  }
                },
              );
            },
          ),
        );
      },
      loading: () => const SizedBox(
        height: 50,
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      ),
      error: (e, s) => SizedBox(
        height: 50,
        child: Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
      ),
    );
  }
}
