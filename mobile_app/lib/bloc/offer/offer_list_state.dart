import 'package:equatable/equatable.dart';
import '../../models/offer.dart';

abstract class OfferListState extends Equatable {
  const OfferListState();

  @override
  List<Object?> get props => [];
}

class OfferListInitial extends OfferListState {}

class OfferListLoading extends OfferListState {}

class OfferListLoaded extends OfferListState {
  final List<Offer> offers;
  const OfferListLoaded({required this.offers});

  @override
  List<Object?> get props => [offers];
}

class OfferListFailure extends OfferListState {
  final String message;
  const OfferListFailure({required this.message});

  @override
  List<Object?> get props => [message];
}
