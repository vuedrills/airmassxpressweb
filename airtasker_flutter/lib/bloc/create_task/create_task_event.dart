import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';


abstract class CreateTaskEvent extends Equatable {
  const CreateTaskEvent();

  @override
  List<Object?> get props => [];
}

class CreateTaskTitleChanged extends CreateTaskEvent {
  final String title;
  const CreateTaskTitleChanged(this.title);
  @override
  List<Object?> get props => [title];
}

class CreateTaskDescriptionChanged extends CreateTaskEvent {
  final String description;
  const CreateTaskDescriptionChanged(this.description);
  @override
  List<Object?> get props => [description];
}

class CreateTaskDateChanged extends CreateTaskEvent {
  final DateTime? date;
  const CreateTaskDateChanged(this.date);
  @override
  List<Object?> get props => [date];
}

class CreateTaskFlexibleChanged extends CreateTaskEvent {
  final bool isFlexible;
  const CreateTaskFlexibleChanged(this.isFlexible);
  @override
  List<Object?> get props => [isFlexible];
}

class CreateTaskLocationChanged extends CreateTaskEvent {
  final String location;
  final double? latitude;
  final double? longitude;
  const CreateTaskLocationChanged(this.location, {this.latitude, this.longitude});
  @override
  List<Object?> get props => [location, latitude, longitude];
}

class CreateTaskBudgetChanged extends CreateTaskEvent {
  final double budget;
  const CreateTaskBudgetChanged(this.budget);
  @override
  List<Object?> get props => [budget];
}

class CreateTaskPhotoAdded extends CreateTaskEvent {
  final String path;
  const CreateTaskPhotoAdded(this.path);
  @override
  List<Object?> get props => [path];
}

class CreateTaskPhotoRemoved extends CreateTaskEvent {
  final int index;
  const CreateTaskPhotoRemoved(this.index);
  @override
  List<Object?> get props => [index];
}

class CreateTaskSubmitted extends CreateTaskEvent {}
class CreateTaskSpecificTimeToggled extends CreateTaskEvent {
  final bool isEnabled;
  const CreateTaskSpecificTimeToggled(this.isEnabled);
  @override
  List<Object?> get props => [isEnabled];
}

class CreateTaskSpecificTimeChanged extends CreateTaskEvent {
  final TimeOfDay time;
  const CreateTaskSpecificTimeChanged(this.time);
  @override
  List<Object?> get props => [time];
}

class CreateTaskDateTypeChanged extends CreateTaskEvent {
  final String dateType; // 'on_date', 'before_date', 'flexible'
  const CreateTaskDateTypeChanged(this.dateType);
  @override
  List<Object?> get props => [dateType];
}

class CreateTaskTimeOfDayChanged extends CreateTaskEvent {
  final String? timeOfDay; // 'morning', 'midday', 'afternoon', 'evening'
  const CreateTaskTimeOfDayChanged(this.timeOfDay);
  @override
  List<Object?> get props => [timeOfDay];
}
