import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/features/auction/data/models/auction_model.dart';
import 'package:mobile/features/auction/data/models/bid_model.dart';
import 'package:mobile/features/auction/data/models/category_model.dart';
import 'package:mobile/features/auction/data/models/town_model.dart';
import 'package:mobile/features/auction/data/models/comment_model.dart';
import 'dart:io';

class AuctionRepository {
  final String? token;
  AuctionRepository(this.token);

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

  Future<Auction> createAuction(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auctions'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return Auction.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create auction: ${response.body}');
    }
  }

  Future<List<Auction>> getMyAuctions() async {
    if (token == null) {
      throw Exception('Please log in to view your auctions');
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/users/me/auctions'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Auction.fromJson(json)).toList();
    } else if (response.statusCode == 401) {
      throw Exception('Session expired. Please log in again');
    } else {
      throw Exception('Failed to load my auctions');
    }
  }

  Future<List<Bid>> getMyBids() async {
    if (token == null) {
      throw Exception('Please log in to view your bids');
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/users/me/bids'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Bid.fromJson(json)).toList();
    } else if (response.statusCode == 401) {
      throw Exception('Session expired. Please log in again');
    } else {
      throw Exception('Failed to load my bids');
    }
  }

  Future<void> placeBid(int auctionId, double amount) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auctions/$auctionId/bids'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: json.encode({'amount': amount}),
    );

    if (response.statusCode != 201) {
      final error = json.decode(response.body)['error'] ?? 'Failed to place bid';
      throw Exception(error);
    }
  }

  Future<List<Auction>> searchAuctions({
    String? query,
    int? categoryId,
    int? townId,
    double? minPrice,
    double? maxPrice,
    String? sortBy,
    String? order,
  }) async {
    String url = '$baseUrl/auctions';
    Map<String, String> params = {};
    if (query != null && query.isNotEmpty) params['q'] = query;
    if (categoryId != null) params['category_id'] = categoryId.toString();
    if (townId != null) params['town_id'] = townId.toString();
    if (minPrice != null) params['min_price'] = minPrice.toString();
    if (maxPrice != null) params['max_price'] = maxPrice.toString();
    if (sortBy != null) params['sort_by'] = sortBy;
    if (order != null) params['order'] = order;

    if (params.isNotEmpty) {
      final uri = Uri.parse(url).replace(queryParameters: params);
      url = uri.toString();
    }

    // Pass token if we have it, though this is a public endpoint
    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Auction.fromJson(json)).toList();
    } else {
      throw Exception('Failed to search auctions');
    }
  }

  Future<List<Category>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/categories'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Category.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }
  Future<List<Town>> getTowns() async {
    final response = await http.get(Uri.parse('$baseUrl/towns'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Town.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load towns');
    }
  }

  Future<List<CategoryWithCount>> getCategoriesForTown(int townId) async {
    final response = await http.get(Uri.parse('$baseUrl/towns/$townId/categories'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => CategoryWithCount.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories for town');
    }
  }

  Future<List<dynamic>> getBidHistory(int auctionId) async {
    final response = await http.get(Uri.parse('$baseUrl/auctions/$auctionId/bids'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data;
    } else {
      throw Exception('Failed to load bid history');
    }
  }
  Future<List<Comment>> getComments(int auctionId) async {
    final response = await http.get(Uri.parse('$baseUrl/auctions/$auctionId/comments'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Comment.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load comments');
    }
  }

  Future<Comment> postComment(int auctionId, String content) async {
    if (token == null) {
      throw Exception('Please log in to post a comment');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/auctions/$auctionId/comments'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'content': content}),
    );

    if (response.statusCode == 201) {
      return Comment.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to post comment: ${response.body}');
    }
  }

  Future<void> toggleFavorite(int auctionId) async {
    if (token == null) throw Exception('Please log in to manage favorites');

    final response = await http.post(
      Uri.parse('$baseUrl/auctions/$auctionId/favorite'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to toggle favorite');
    }
  }

  Future<List<Auction>> getFavorites() async {
    if (token == null) throw Exception('Please log in to view favorites');

    final response = await http.get(
      Uri.parse('$baseUrl/users/me/favorites'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Auction.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load favorites');
    }
  }
}
