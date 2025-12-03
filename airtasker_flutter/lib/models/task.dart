class Task {
  final String id;
  final String posterId;
  final String title;
  final String description;
  final String category;
  final String locationAddress;
  final double? locationLat;
  final double? locationLng;
  final List<String> photos;
  final double budget;
  final DateTime? deadline;
  final String status;
  final String? assignedTo;
  final DateTime createdAt;
  
  // Additional fields for UI
  final String? posterName;
  final String? posterImage;
  final bool? posterVerified;
  final double? posterRating;
  final int offersCount;
  final int views;
  final String? dateType; // 'on_date', 'before_date', 'flexible'
  final String? timeOfDay; // 'morning', 'midday', 'afternoon', 'evening'
  final bool hasSpecificTime;

  Task({
    required this.id,
    required this.posterId,
    required this.title,
    required this.description,
    required this.category,
    required this.locationAddress,
    this.locationLat,
    this.locationLng,
    this.photos = const [],
    required this.budget,
    this.deadline,
    required this.status,
    this.assignedTo,
    required this.createdAt,
    this.posterName,
    this.posterImage,
    this.posterVerified,
    this.posterRating,
    this.offersCount = 0,
    this.views = 0,
    this.dateType,
    this.timeOfDay,
    this.hasSpecificTime = false,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      posterId: json['poster_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      locationAddress: json['location_address'] as String,
      locationLat: (json['location_lat'] as num?)?.toDouble(),
      locationLng: (json['location_lng'] as num?)?.toDouble(),
      photos: (json['photos'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      budget: (json['budget'] as num).toDouble(),
      deadline: json['deadline'] != null ? DateTime.parse(json['deadline'] as String) : null,
      status: json['status'] as String,
      assignedTo: json['assigned_to'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      posterName: json['poster_name'] as String?,
      posterImage: json['poster_image'] as String?,
      posterVerified: json['poster_verified'] as bool?,
      posterRating: (json['poster_rating'] as num?)?.toDouble(),
      offersCount: json['offers_count'] as int? ?? 0,
      views: json['views'] as int? ?? 0,
      dateType: json['date_type'] as String?,
      timeOfDay: json['time_of_day'] as String?,
      hasSpecificTime: json['has_specific_time'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'poster_id': posterId,
      'title': title,
      'description': description,
      'category': category,
      'location_address': locationAddress,
      'location_lat': locationLat,
      'location_lng': locationLng,
      'photos': photos,
      'budget': budget,
      'deadline': deadline?.toIso8601String(),
      'status': status,
      'assigned_to': assignedTo,
      'created_at': createdAt.toIso8601String(),
      'poster_name': posterName,
      'poster_image': posterImage,
      'poster_verified': posterVerified,
      'poster_rating': posterRating,
      'poster_rating': posterRating,
      'offers_count': offersCount,
      'views': views,
      'date_type': dateType,
      'time_of_day': timeOfDay,
      'has_specific_time': hasSpecificTime,
    };
  }
}
