import 'package:flutter/material.dart';
import 'package:ready_ecommerce/views/eCommerce/my_order/layouts/my_order_layout.dart';

class MyOrderView extends StatelessWidget {
  final String? orderStatus;
  const MyOrderView({super.key, this.orderStatus});
 

  @override
  Widget build(BuildContext context) {
    return MyOrderLayout(orderStatus: orderStatus);
  }
}
