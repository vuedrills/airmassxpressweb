import 'package:equatable/equatable.dart';

/// Comprehensive user profile model
class UserProfile extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? profileImage;
  final String? bio;
  final List<String> skills;
  final double rating;
  final int totalReviews;
  final int completedTasks;
  final double completionRate;
  final bool isVerified;
  final String? verificationType;
  
  // Work info
  final String? jobTitle;
  final String? company;
  
  // Address info
  final String? address;
  final String? city;
  final String? country;
  final String? postcode;
  final DateTime? dateOfBirth;

  const UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.profileImage,
    this.bio,
    this.skills = const [],
    this.rating = 0.0,
    this.totalReviews = 0,
    this.completedTasks = 0,
    this.completionRate = 0.0,
    this.isVerified = false,
    this.verificationType,
    this.jobTitle,
    this.company,
    this.address,
    this.city,
    this.country,
    this.postcode,
    this.dateOfBirth,
  });

  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? profileImage,
    String? bio,
    List<String>? skills,
    double? rating,
    int? totalReviews,
    int? completedTasks,
    double? completionRate,
    bool? isVerified,
    String? verificationType,
    String? jobTitle,
    String? company,
    String? address,
    String? city,
    String? country,
    String? postcode,
    DateTime? dateOfBirth,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      profileImage: profileImage ?? this.profileImage,
      bio: bio ?? this.bio,
      skills: skills ?? this.skills,
      rating: rating ?? this.rating,
      totalReviews: totalReviews ?? this.totalReviews,
      completedTasks: completedTasks ?? this.completedTasks,
      completionRate: completionRate ?? this.completionRate,
      isVerified: isVerified ?? this.isVerified,
      verificationType: verificationType ?? this.verificationType,
      jobTitle: jobTitle ?? this.jobTitle,
      company: company ?? this.company,
      address: address ?? this.address,
      city: city ?? this.city,
      country: country ?? this.country,
      postcode: postcode ?? this.postcode,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profileImage': profileImage,
      'bio': bio,
      'skills': skills,
      'rating': rating,
      'totalReviews': totalReviews,
      'completedTasks': completedTasks,
      'completionRate': completionRate,
      'isVerified': isVerified,
      'verificationType': verificationType,
      'jobTitle': jobTitle,
      'company': company,
      'address': address,
      'city': city,
      'country': country,
      'postcode': postcode,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
    };
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      profileImage: json['profileImage'] as String?,
      bio: json['bio'] as String?,
      skills: (json['skills'] as List<dynamic>?)?.cast<String>() ?? [],
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] as int? ?? 0,
      completedTasks: json['completedTasks'] as int? ?? 0,
      completionRate: (json['completionRate'] as num?)?.toDouble() ?? 0.0,
      isVerified: json['isVerified'] as bool? ?? false,
      verificationType: json['verificationType'] as String?,
      jobTitle: json['jobTitle'] as String?,
      company: json['company'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      postcode: json['postcode'] as String?,
      dateOfBirth: json['dateOfBirth'] != null
          ? DateTime.parse(json['dateOfBirth'] as String)
          : null,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        email,
        phone,
        profileImage,
        bio,
        skills,
        rating,
        totalReviews,
        completedTasks,
        completionRate,
        isVerified,
        verificationType,
        jobTitle,
        company,
        address,
        city,
        country,
        postcode,
        dateOfBirth,
      ];
}
