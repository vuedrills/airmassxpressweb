import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

/// Task category model
class Category extends Equatable {
  final String id;
  final String name;
  final IconData icon;
  final int taskCount;

  const Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.taskCount,
  });

  Category copyWith({
    String? id,
    String? name,
    IconData? icon,
    int? taskCount,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      taskCount: taskCount ?? this.taskCount,
    );
  }

  @override
  List<Object?> get props => [id, name, icon, taskCount];
}
