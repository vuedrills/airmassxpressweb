import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

enum CreateTaskStatus { initial, valid, invalid, submitting, success, failure }

class CreateTaskState extends Equatable {
  final String title;
  final String? dateType; // 'on_date', 'before_date', 'flexible'
  final String description;
  final DateTime? date;
  final TimeOfDay? time;
  final bool isFlexible;
  final bool hasSpecificTime;
  final String? timeOfDay; // 'morning', 'midday', 'afternoon', 'evening'
  final String location;
  final double? latitude;
  final double? longitude;
  final double budget;
  final List<String> photos;
  final CreateTaskStatus status;
  final String? errorMessage;

  const CreateTaskState({
    this.title = '',
    this.dateType,
    this.description = '',
    this.date,
    this.time,
    this.isFlexible = true,
    this.hasSpecificTime = false,
    this.timeOfDay,
    this.location = '',
    this.latitude,
    this.longitude,
    this.budget = 0,
    this.photos = const [],
    this.status = CreateTaskStatus.initial,
    this.errorMessage,
  });

  CreateTaskState copyWith({
    String? title,
    String? dateType,
    String? description,
    DateTime? date,
    TimeOfDay? time,
    bool? isFlexible,
    bool? hasSpecificTime,
    String? timeOfDay,
    String? location,
    double? latitude,
    double? longitude,
    double? budget,
    List<String>? photos,
    CreateTaskStatus? status,
    String? errorMessage,
  }) {
    return CreateTaskState(
      title: title ?? this.title,
      dateType: dateType ?? this.dateType,
      description: description ?? this.description,
      date: date ?? this.date,
      time: time ?? this.time,
      isFlexible: isFlexible ?? this.isFlexible,
      hasSpecificTime: hasSpecificTime ?? this.hasSpecificTime,
      timeOfDay: timeOfDay ?? this.timeOfDay,
      location: location ?? this.location,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      budget: budget ?? this.budget,
      photos: photos ?? this.photos,
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        title,
        dateType,
        description,
        date,
        time,
        isFlexible,
        hasSpecificTime,
        timeOfDay,
        location,
        latitude,
        longitude,
        budget,
        photos,
        status,
        errorMessage,
      ];
}
