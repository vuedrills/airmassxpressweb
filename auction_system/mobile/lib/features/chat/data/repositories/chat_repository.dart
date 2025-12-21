import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ChatRepository {
  final String? token;
  ChatRepository(this.token);

  String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8080';
    }
    return 'http://127.0.0.1:8080';
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

  // Get all conversations for the current user
  Future<List<dynamic>> getConversations() async {
    final response = await http.get(
      Uri.parse('$baseUrl/conversations'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as List<dynamic>;
    } else {
      throw Exception('Failed to load conversations');
    }
  }

  // Start or get existing conversation
  Future<dynamic> startConversation(int auctionId, int sellerId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/conversations'),
      headers: _headers,
      body: json.encode({
        'auction_id': auctionId,
        'seller_id': sellerId,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to start conversation');
    }
  }

  // Get messages for a conversation
  Future<List<dynamic>> getMessages(int conversationId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/conversations/$conversationId/messages'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as List<dynamic>;
    } else {
      throw Exception('Failed to load messages');
    }
  }

  // Send a message
  Future<dynamic> sendMessage(int conversationId, String content, {String? imageUrl}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/conversations/$conversationId/messages'),
      headers: _headers,
      body: json.encode({
        'content': content,
        'image_url': imageUrl,
      }),
    );

    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to send message');
    }
  }

  // Upload an image
  Future<String> uploadImage(File imageFile) async {
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/upload'));
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));

    var response = await request.send();
    var responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      final data = json.decode(responseBody);
      return data['url'] as String;
    } else {
      throw Exception('Failed to upload image');
    }
  }
}
