import 'package:get_it/get_it.dart';
import '../services/mock_data_service.dart';
import '../bloc/auth/auth_bloc.dart';
import '../bloc/task/task_bloc.dart';
import '../bloc/create_task/create_task_bloc.dart';
import '../bloc/offer/offer_bloc.dart';
import '../bloc/offer/offer_list_bloc.dart';
import '../bloc/message/message_bloc.dart';
import '../bloc/profile/profile_bloc.dart';
import '../bloc/question/question_bloc.dart';
import '../bloc/browse/browse_bloc.dart';
import '../bloc/search/search_bloc.dart';
import '../bloc/filter/filter_bloc.dart';
import '../bloc/invoice/invoice_bloc.dart';

final getIt = GetIt.instance;

void setupServiceLocator() {
  // Register services
  getIt.registerLazySingleton<MockDataService>(() => MockDataService());
  
  // Register BLoCs
  getIt.registerSingleton<AuthBloc>(AuthBloc()); // Singleton for go_router
  getIt.registerLazySingleton<TaskBloc>(() => TaskBloc(getIt<MockDataService>())); // Singleton to preserve state
  getIt.registerFactory(() => CreateTaskBloc());
  getIt.registerFactory(() => OfferBloc());
  getIt.registerFactory(() => OfferListBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => MessageBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => ProfileBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => QuestionBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => BrowseBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => SearchBloc(getIt<MockDataService>()));
  getIt.registerFactory(() => FilterBloc());
  getIt.registerFactory(() => InvoiceBloc());
}
