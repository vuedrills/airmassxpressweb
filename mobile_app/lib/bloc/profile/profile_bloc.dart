import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/mock_data_service.dart';
import 'profile_event.dart';
import 'profile_state.dart';

/// Profile BLoC - Handles profile-related state management
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final MockDataService _dataService;

  ProfileBloc(this._dataService) : super(ProfileInitial()) {
    on<LoadProfile>(_onLoadProfile);
    on<UpdateProfile>(_onUpdateProfile);
    on<UpdateAvatar>(_onUpdateAvatar);
    on<UpdateNotificationSettings>(_onUpdateNotificationSettings);
    on<LoadPaymentMethods>(_onLoadPaymentMethods);
    on<AddPaymentMethod>(_onAddPaymentMethod);
    on<RemovePaymentMethod>(_onRemovePaymentMethod);
    on<SetDefaultPaymentMethod>(_onSetDefaultPaymentMethod);
    on<LoadPaymentHistory>(_onLoadPaymentHistory);
  }

  Future<void> _onLoadProfile(
    LoadProfile event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      final profile = await _dataService.getUserProfile();
      final settings = await _dataService.getNotificationSettings();
      emit(ProfileLoaded(profile: profile, notificationSettings: settings));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onUpdateProfile(
    UpdateProfile event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileUpdating());
    try {
      await Future.delayed(const Duration(milliseconds: 800));
      await _dataService.updateUserProfile(event.profile);
      final settings = await _dataService.getNotificationSettings();
      emit(ProfileLoaded(profile: event.profile, notificationSettings: settings));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onUpdateAvatar(
    UpdateAvatar event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      emit(ProfileUpdating());
      try {
        await Future.delayed(const Duration(milliseconds: 500));
        final updatedProfile = currentState.profile.copyWith(
          profileImage: event.imagePath,
        );
        await _dataService.updateUserProfile(updatedProfile);
        emit(ProfileLoaded(
          profile: updatedProfile,
          notificationSettings: currentState.notificationSettings,
        ));
      } catch (e) {
        emit(ProfileError(e.toString()));
      }
    }
  }

  Future<void> _onUpdateNotificationSettings(
    UpdateNotificationSettings event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      try {
        await Future.delayed(const Duration(milliseconds: 300));
        await _dataService.updateNotificationSettings(event.settings);
        emit(ProfileLoaded(
          profile: currentState.profile,
          notificationSettings: event.settings,
        ));
      } catch (e) {
        emit(ProfileError(e.toString()));
      }
    }
  }

  Future<void> _onLoadPaymentMethods(
    LoadPaymentMethods event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final methods = await _dataService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onAddPaymentMethod(
    AddPaymentMethod event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      await _dataService.addPaymentMethod(event.method);
      final methods = await _dataService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onRemovePaymentMethod(
    RemovePaymentMethod event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      await _dataService.removePaymentMethod(event.methodId);
      final methods = await _dataService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onSetDefaultPaymentMethod(
    SetDefaultPaymentMethod event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      await _dataService.setDefaultPaymentMethod(event.methodId);
      final methods = await _dataService.getPaymentMethods();
      emit(PaymentMethodsLoaded(methods));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onLoadPaymentHistory(
    LoadPaymentHistory event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      await Future.delayed(const Duration(milliseconds: 300));
      final transactions = await _dataService.getPaymentHistory();
      emit(PaymentHistoryLoaded(transactions));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }
}
