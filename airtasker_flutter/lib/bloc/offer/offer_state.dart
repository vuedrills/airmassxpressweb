import 'package:equatable/equatable.dart';

enum OfferStatus { initial, submitting, success, failure }

class OfferState extends Equatable {
  final double amount;
  final String message;
  final OfferStatus status;
  final String? errorMessage;

  const OfferState({
    this.amount = 0,
    this.message = '',
    this.status = OfferStatus.initial,
    this.errorMessage,
  });

  OfferState copyWith({
    double? amount,
    String? message,
    OfferStatus? status,
    String? errorMessage,
  }) {
    return OfferState(
      amount: amount ?? this.amount,
      message: message ?? this.message,
      status: status ?? this.status,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [amount, message, status, errorMessage];
}
