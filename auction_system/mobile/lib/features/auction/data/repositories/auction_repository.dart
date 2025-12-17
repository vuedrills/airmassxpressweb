import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'dart:io';

class AuctionRepository {
  // Use localhost for iOS simulator, 10.0.2.2 for Android emulator
  // Or specific IP if on real device. 
  // For iOS Simulator: http://127.0.0.1:8080 or localhost
  // For Android Emulator: http://10.0.2.2:8080
  
  String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  Future<List<Auction>> getAuctions() async {
    // Note: We need to implement GET /auctions endpoint in Backend!
    // Currently only implemented POST /auctions.
    // Assuming we add GET /auctions.
    
    final response = await http.get(Uri.parse('$baseUrl/auctions'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Auction.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load auctions');
    }
  }
}
