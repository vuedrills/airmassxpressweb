import 'package:flutter_bloc/flutter_bloc.dart';
import 'offer_list_event.dart';
import 'offer_list_state.dart';
import '../../models/offer.dart';
import '../../services/mock_data_service.dart';

class OfferListBloc extends Bloc<OfferListEvent, OfferListState> {
  final MockDataService _dataService;
  
  OfferListBloc(this._dataService) : super(OfferListInitial()) {
    on<LoadOffers>(_onLoadOffers);
    on<AcceptOffer>(_onAcceptOffer);
  }

  Future<void> _onLoadOffers(LoadOffers event, Emitter<OfferListState> emit) async {
    emit(OfferListLoading());
    try {
      // Load actual offers from MockDataService
      final offers = await _dataService.getOffersForTask(event.taskId);
      emit(OfferListLoaded(offers: offers));
    } catch (e) {
      emit(OfferListFailure(message: e.toString()));
    }
  }

  Future<void> _onAcceptOffer(AcceptOffer event, Emitter<OfferListState> emit) async {
    final currentState = state;
    if (currentState is! OfferListLoaded) return;

    emit(OfferListLoading());
    try {
      // Accept the offer via data service
      await _dataService.acceptOffer(event.offerId, event.taskId);
      
      // Reload offers to show updated state
      final offers = await _dataService.getOffersForTask(event.taskId);
      emit(OfferListLoaded(offers: offers));
    } catch (e) {
      emit(OfferListFailure(message: e.toString()));
    }
  }
}
