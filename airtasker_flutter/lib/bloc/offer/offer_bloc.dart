import 'package:flutter_bloc/flutter_bloc.dart';
import 'offer_event.dart';
import 'offer_state.dart';

class OfferBloc extends Bloc<OfferEvent, OfferState> {
  OfferBloc() : super(const OfferState()) {
    on<OfferAmountChanged>(_onAmountChanged);
    on<OfferMessageChanged>(_onMessageChanged);
    on<OfferSubmitted>(_onSubmitted);
  }

  void _onAmountChanged(OfferAmountChanged event, Emitter<OfferState> emit) {
    emit(state.copyWith(amount: event.amount));
  }

  void _onMessageChanged(OfferMessageChanged event, Emitter<OfferState> emit) {
    emit(state.copyWith(message: event.message));
  }

  Future<void> _onSubmitted(OfferSubmitted event, Emitter<OfferState> emit) async {
    if (state.amount <= 0) {
      emit(state.copyWith(status: OfferStatus.failure, errorMessage: 'Please enter a valid amount'));
      return;
    }
    if (state.message.isEmpty) {
      emit(state.copyWith(status: OfferStatus.failure, errorMessage: 'Please enter a message'));
      return;
    }

    emit(state.copyWith(status: OfferStatus.submitting));
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));
      emit(state.copyWith(status: OfferStatus.success));
    } catch (e) {
      emit(state.copyWith(status: OfferStatus.failure, errorMessage: 'Failed to submit offer'));
    }
  }
}
