class AppConstants {
  // App Info
  static const String appName = 'Airtasker Clone';
  static const String appVersion = '1.0.0';
  
  // API (for later backend integration)
  static const String baseUrl = 'http://localhost:8080/api';
  
  // Pagination
  static const int tasksPerPage = 20;
  static const int messagesPerPage = 30;
  
  // Categories
  static const List<String> taskCategories = [
    'Removalists',
    'Home Cleaning',
    'Furniture Assembly',
    'Deliveries',
    'Gardening & Landscaping',
    'Painting',
    'Handyperson',
    'Business & Admin',
    'Marketing & Design',
    'Photography',
    'Plumbing',
    'Electrical',
    'Car Repair',
    'Pet Care',
    'Tutoring',
    'Other',
  ];
  
  // Task Status
  static const String statusOpen = 'open';
  static const String statusAssigned = 'assigned';
  static const String statusInProgress = 'in_progress';
  static const String statusCompleted = 'completed';
  static const String statusCancelled = 'cancelled';
  
  // Offer Status
  static const String offerPending = 'pending';
  static const String offerAccepted = 'accepted';
  static const String offerRejected = 'rejected';
  
  // Date Formats
  static const String dateFormat = 'dd MMM yyyy';
  static const String dateTimeFormat = 'dd MMM yyyy, HH:mm';
  static const String timeFormat = 'HH:mm';
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxTaskTitleLength = 100;
  static const int maxTaskDescriptionLength = 2000;
  static const double minBudget = 10.0;
  static const double maxBudget = 100000.0;
  
  // Map
  static const double defaultLatitude = -33.8688;
  static const double defaultLongitude = 151.2093; // Sydney
  static const double defaultZoom = 12.0;
  
  // Images
  static const int maxTaskPhotos = 10;
  static const int maxPhotoSizeMB = 5;
}
