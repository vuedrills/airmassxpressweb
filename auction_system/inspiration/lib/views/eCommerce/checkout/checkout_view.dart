import 'package:flutter/material.dart';
import 'package:ready_ecommerce/views/eCommerce/checkout/layouts/checkout_layout.dart';

class EcommerceCheckoutView extends StatelessWidget {
  final bool? isDigital;
  final bool? isBuyNow;
  final double payableAmount;
  final String? couponCode;

  const EcommerceCheckoutView({
    super.key,
    required this.payableAmount,
    required this.couponCode,
    this.isBuyNow = false,
    this.isDigital = false,
  });

  @override
  Widget build(BuildContext context) {
    return EcommerceCheckoutLayout(
      payableAmount: payableAmount,
      couponCode: couponCode,
      isBuyNow: isBuyNow,
      isDigital: isDigital,
    );
  }
}
