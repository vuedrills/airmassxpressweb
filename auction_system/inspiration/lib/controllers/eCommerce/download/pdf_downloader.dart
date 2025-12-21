import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_file_downloader/flutter_file_downloader.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:ready_ecommerce/config/app_color.dart';
import 'package:ready_ecommerce/utils/global_function.dart';

class DownloadState {
  final double progress;
  final String? filePath;
  final String? error;

  DownloadState({this.progress = 0, this.filePath, this.error});

  DownloadState copyWith({
    double? progress,
    String? filePath,
    String? error,
  }) {
    return DownloadState(
      progress: progress ?? this.progress,
      filePath: filePath ?? this.filePath,
      error: error ?? this.error,
    );
  }
}

class DownloadController extends StateNotifier<DownloadState> {
  DownloadController() : super(DownloadState());

  void downloadFile(String url, {String? fileName}) async {
    if (Platform.isAndroid) {
      // For Android: flutter_file_downloader
      FileDownloader.downloadFile(
        url: url,
        name: fileName,
        onProgress: (file, progress) {
          state = state.copyWith(progress: progress);
        },
        onDownloadCompleted: (path) {
          state = state.copyWith(filePath: path, progress: 100);
          _showSnackBar(path);
        },
        onDownloadError: (error) {
          state = state.copyWith(error: error.toString());
        },
      );
    } else if (Platform.isIOS) {
      // ForiOS: dio + path_provider
      try {
        final dio = Dio();
        final name = fileName ?? url.split('/').last;
        final dir = await getApplicationDocumentsDirectory();
        final filePath = "${dir.path}/$name";

        await dio.download(url, filePath, onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100);
            state = state.copyWith(progress: progress);
          }
        });

        state = state.copyWith(filePath: filePath, progress: 100);
        _showSnackBar(filePath);
      } catch (e) {
        state = state.copyWith(error: e.toString());
      }
    }
  }

  void _showSnackBar(String path) {
    final ctx = GlobalFunction.navigatorKey.currentContext;
    if (ctx != null) {
      ScaffoldMessenger.of(ctx).showSnackBar(
        SnackBar(
          backgroundColor: EcommerceAppColor.primary,
          content: const Text('Download completed'),
          action: SnackBarAction(
            label: 'Open',
            onPressed: () {
              OpenFile.open(path);
            },
          ),
        ),
      );
    }
  }
}

final downloadProvider =
    StateNotifierProvider<DownloadController, DownloadState>(
  (ref) => DownloadController(),
);
