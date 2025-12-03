import 'package:equatable/equatable.dart';

class Review extends Equatable {
  final String id;
  final String reviewerId;
  final String reviewerName;
  final String reviewerAvatar;
  final double rating;
  final String comment;
  final DateTime date;
  final String? taskTitle;
  final List<String> _images;

  List<String> get images => _images;

  const Review({
    required this.id,
    required this.reviewerId,
    required this.reviewerName,
    required this.reviewerAvatar,
    required this.rating,
    required this.comment,
    required this.date,
    this.taskTitle,
    List<String>? images,
  }) : _images = images ?? const <String>[];

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as String,
      reviewerId: json['reviewerId'] as String,
      reviewerName: json['reviewerName'] as String,
      reviewerAvatar: json['reviewerAvatar'] as String,
      rating: (json['rating'] as num).toDouble(),
      comment: json['comment'] as String,
      date: DateTime.parse(json['date'] as String),
      taskTitle: json['taskTitle'] as String?,
      images: (json['images'] as List<dynamic>?)?.map((e) => e as String).toList() ?? const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reviewerId': reviewerId,
      'reviewerName': reviewerName,
      'reviewerAvatar': reviewerAvatar,
      'rating': rating,
      'comment': comment,
      'date': date.toIso8601String(),
      'taskTitle': taskTitle,
      'images': images,
    };
  }

  @override
  List<Object?> get props => [
        id,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        rating,
        comment,
        date,
        taskTitle,
        images,
      ];
}
