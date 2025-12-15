import 'package:equatable/equatable.dart';
import '../../models/task.dart';

class TaskState extends Equatable {
  final List<Task> tasks; // Browse tasks
  final List<Task> myTasks; // User's own tasks
  final Task? selectedTask;
  final bool isLoading;
  final String? error;
  
  const TaskState({
    this.tasks = const [],
    this.myTasks = const [],
    this.selectedTask,
    this.isLoading = false,
    this.error,
  });
  
  TaskState copyWith({
    List<Task>? tasks,
    List<Task>? myTasks,
    Task? selectedTask,
    bool? isLoading,
    String? error,
  }) {
    return TaskState(
      tasks: tasks ?? this.tasks,
      myTasks: myTasks ?? this.myTasks,
      selectedTask: selectedTask ?? this.selectedTask,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
  
  @override
  List<Object?> get props => [tasks, myTasks, selectedTask, isLoading, error];
}
