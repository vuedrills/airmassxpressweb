import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:gap/gap.dart';
import 'package:ready_ecommerce/config/app_color.dart';
import 'package:ready_ecommerce/config/app_text_style.dart';
import 'package:ready_ecommerce/config/theme.dart';
import 'package:ready_ecommerce/controllers/eCommerce/download/pdf_downloader.dart';
import 'package:ready_ecommerce/generated/l10n.dart';
import 'package:ready_ecommerce/models/eCommerce/order/order_details_model.dart';
import 'package:ready_ecommerce/utils/global_function.dart';
import 'package:ready_ecommerce/views/eCommerce/order_details/components/product_review_dialog.dart';
import 'package:tuple/tuple.dart';

class OrderProductCard extends ConsumerStatefulWidget {
  final Products product;
  final String orderStatus;
  final int orderId;
  final int index;
  final bool? isSelected;
  final bool? showCheckbox;
  final bool? addPadding;
  EdgeInsetsGeometry? padding;
  bool hideReviewButton;

  OrderProductCard({
    super.key,
    required this.orderId,
    required this.product,
    required this.index,
    required this.orderStatus,
    this.isSelected,
    this.showCheckbox = false,
    this.addPadding = true,
    this.padding,
    this.hideReviewButton = false,
  });

  @override
  ConsumerState<OrderProductCard> createState() => _OrderProductCardState();
}

class _OrderProductCardState extends ConsumerState<OrderProductCard> {
  String selectedValue = '';
  @override
  Widget build(BuildContext context) {
    debugPrint("isSelected: ${widget.isSelected}");
    final downloadState = ref.watch(downloadProvider);
    return Padding(
      padding: widget.addPadding == false
          ? widget.padding ?? EdgeInsets.zero
          : EdgeInsets.only(top: 5.h, left: 20.w, right: 20.w, bottom: 10.h),
      child: Material(
        color: widget.showCheckbox == true
            ? Colors.transparent
            : GlobalFunction.getContainerColor(),
        child: Container(
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(
                color: colors(context).accentColor!,
                width: 2.0,
              ),
            ),
          ),
          padding: EdgeInsets.symmetric(vertical: 12.h).copyWith(bottom: 0.h),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  widget.showCheckbox == false
                      ? SizedBox.shrink()
                      : _buildSelectedIndicator(widget.isSelected ?? false),
                  _buildProductImage(
                    productImage: widget.product.thumbnail,
                  ),
                  Gap(16.w),
                  _buildProductInfo(
                    context: context,
                    hideReviewButton: widget.hideReviewButton,
                  ),
                  Gap(16.w),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductImage({required String productImage}) {
    return Flexible(
      flex: 1,
      child: Container(
        width: 70.w,
        height: 60.h,
        decoration: BoxDecoration(
          image: DecorationImage(
            image: CachedNetworkImageProvider(
              productImage,
              errorListener: (error) => debugPrint(error.toString()),
            ),
            fit: BoxFit.cover,
          ),
        ),
      ),
    );
  }

  Widget _buildProductInfo({
    required BuildContext context,
    bool hideReviewButton = false,
  }) {
    return Flexible(
      flex: 5,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  widget.product.name,
                  style: AppTextStyle(context)
                      .bodyText
                      .copyWith(fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Gap(10.h),
          _buildProductBottomRow(
            context: context,
          ),
          Gap(10.h),
          _buildProductBottomRow1(hideReviewButton)
        ],
      ),
    );
  }

  Widget _buildProductBottomRow({
    required BuildContext context,
  }) {
    return Consumer(builder: (context, ref, _) {
      return Row(
        children: [
          Text(
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            "${widget.product.orderQty} x  ${GlobalFunction.price(
              ref: ref,
              price: widget.product.discountPrice != 0
                  ? widget.product.discountPrice.toString()
                  : widget.product.price.toString(),
            )} ",
            style: AppTextStyle(context).subTitle.copyWith(
                color: colors(context).primaryColor,
                fontSize: widget.product.discountPrice != 0 &&
                        widget.orderStatus.toLowerCase() == 'delivered'
                    ? 14.sp
                    : 14.sp),
          ),
          if (widget.product.discountPrice != 0) ...[
            Gap(2.w),
            Text(
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              GlobalFunction.price(
                  ref: ref, price: widget.product.price.toString()),
              style: AppTextStyle(context).bodyText.copyWith(
                    color: EcommerceAppColor.lightGray,
                    decoration: TextDecoration.lineThrough,
                    decorationColor: EcommerceAppColor.lightGray,
                  ),
            ),
          ],
        ],
      );
    });
  }

  Widget _buildProductBottomRow1(bool hideReviewButton) {
    return Consumer(
      builder: (context, ref, child) {
        final downloadState = ref.watch(downloadProvider);

        final licenseAttachment = Attachment(
          id: -1,
          url: widget.product.licenseDownloadUrl ?? '',
          extension: "LICENSE",
        );

        final List<Attachment> allItems = [
          ...widget.product.attachments!,
          licenseAttachment,
        ];

        return Row(
          children: [
            Row(
              children: [
                Visibility(
                  visible: widget.product.color != null,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 5.w,
                      vertical: 3.h,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.r),
                      color: colors(context).accentColor,
                    ),
                    child: Center(
                      child: Text(
                          widget.product.color != null
                              ? capitalize(widget.product.color!)
                              : '',
                          style: AppTextStyle(context).bodyTextSmall),
                    ),
                  ),
                ),
                Visibility(
                  visible: widget.product.color != null &&
                      widget.product.size != null,
                  child: Gap(8.w),
                ),
                Visibility(
                  visible: widget.product.size != null,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 5.w,
                      vertical: 3.h,
                    ),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.r),
                      color: colors(context).accentColor,
                    ),
                    child: Center(
                      child: Text(
                          widget.product.size != null
                              ? capitalize(widget.product.size!)
                              : '',
                          style: AppTextStyle(context).bodyTextSmall),
                    ),
                  ),
                ),
              ],
            ),
            const Spacer(),
            if (widget.orderStatus.toLowerCase() == 'delivered') ...[
              if (widget.product.rating != null) ...[
                _buildRatingBar(),
              ] else ...[
                if (!hideReviewButton) _buildReviewButton(context: context),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      margin: EdgeInsets.only(left: 8.w),
                      decoration: BoxDecoration(
                        color: colors(context)
                            .primaryColor!
                            .withValues(alpha: 0.12),
                        border:
                            Border.all(color: colors(context).primaryColor!),
                        borderRadius: BorderRadius.circular(5.r),
                      ),
                      child: Theme(
                        data: Theme.of(context).copyWith(
                          highlightColor: Colors.transparent,
                          splashColor: Colors.transparent,
                          focusColor: Colors.transparent,
                        ),
                        child: DropdownButton(
                          padding: EdgeInsets.zero,
                          underline: SizedBox(),
                          elevation: 2,
                          isDense: true,
                          iconEnabledColor: colors(context).primaryColor!,
                          focusColor: Colors.transparent,
                          style: AppTextStyle(context).bodyTextSmall.copyWith(
                              color: colors(context).bodyTextColor!,
                              backgroundColor: Colors.transparent),
                          items: allItems.map((e) {
                            return DropdownMenuItem(
                              value: e.url,
                              child: Text(
                                e.extension.toUpperCase(),
                              ),
                            );
                          }).toList(),
                          onChanged: (url) {
                            if (url != null) {
                              ref
                                  .read(downloadProvider.notifier)
                                  .downloadFile(url);
                            }
                          },
                          hint: Row(
                            children: [
                              Icon(
                                Icons.download,
                                size: 16.sp,
                                color: EcommerceAppColor.primary,
                              ),
                              Gap(5.w),
                              Text("Download",
                                  style: AppTextStyle(context)
                                      .bodyTextSmall
                                      .copyWith(
                                          color: EcommerceAppColor.primary)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (downloadState.progress > 0 &&
                        downloadState.progress < 100)
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: SizedBox(
                          width: 100.w,
                          height: 5.h,
                          child: LinearProgressIndicator(
                            value: downloadState.progress / 100,
                            backgroundColor: EcommerceAppColor.lightGray,
                            valueColor: AlwaysStoppedAnimation<Color>(
                                EcommerceAppColor.primary),
                          ),
                        ),
                      ),
                  ],
                ),
              ]
            ]
          ],
        );
      },
    );
  }

  Widget _buildReviewButton({
    required BuildContext context,
  }) {
    return Material(
      color: EcommerceAppColor.carrotOrange,
      borderRadius: BorderRadius.circular(3.r),
      child: InkWell(
        borderRadius: BorderRadius.circular(3.r),
        onTap: () {
          showDialog(
            context: context,
            builder: (context) => ProductReviewDialog(
              arugument: Tuple2(widget.orderId, widget.product.id),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(3.r),
          ),
          child: Text(
            S.of(context).review,
            style: AppTextStyle(context)
                .bodyTextSmall
                .copyWith(color: EcommerceAppColor.white),
          ),
        ),
      ),
    );
  }

  Widget _buildRatingBar() {
    return RatingBar.builder(
      ignoreGestures: true,
      tapOnlyMode: false,
      itemSize: 18.sp,
      initialRating: widget.product.rating ?? 0,
      minRating: 1,
      direction: Axis.horizontal,
      allowHalfRating: true,
      itemCount: 5,
      unratedColor: EcommerceAppColor.offWhite,
      itemBuilder: (context, _) => Icon(
        Icons.star_rounded,
        size: 16.sp,
        color: EcommerceAppColor.carrotOrange,
      ),
      onRatingUpdate: (rating) => debugPrint(rating.toString()),
    );
  }

  String capitalize(String s) =>
      s[0].toUpperCase() + s.substring(1).toLowerCase();

  _buildSelectedIndicator(bool isSelected) {
    return Padding(
      padding: EdgeInsets.only(right: 10.0.w),
      child: isSelected
          ? Image.asset("assets/png/return_selected.png",
              width: 24.w, height: 24.w)
          : Container(
              width: 20.w,
              height: 20.w,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey, width: 1.0),
                shape: BoxShape.circle,
              ),
            ),
    );
  }
}
