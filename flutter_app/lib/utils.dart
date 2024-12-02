import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:okto_flutter_sdk/okto_flutter_sdk.dart';

class Globals {
  String buildType = dotenv.get('BUILD_TYPE');
  String oktoClientApiKey = dotenv.get('OKTO_CLIENT_API_KEY');

  static final Globals _singleton = Globals._internal();

  factory Globals() {
    return _singleton;
  }

  Globals._internal();

  static Globals get instance => _singleton;

  BuildType getBuildType() {
    switch (buildType) {
      case 'sandbox':
        return BuildType.sandbox;
      case 'production':
        return BuildType.production;
      case 'staging':
        return BuildType.staging;
      default:
        return BuildType.sandbox;
    }
  }

  String getOktoApiKey() {
    return oktoClientApiKey;
  }
}

Globals globals = Globals.instance;
Okto? okto;

Future<void> _requestInterceptor(
    RequestOptions requestOptions, RequestInterceptorHandler handler) async {
  print("Requesting ${requestOptions.uri}");

  print("Headers : ${requestOptions.headers}");
  print("Data : ${requestOptions.data}");

  return handler.next(requestOptions);
}

final Dio dio = Dio()
  ..interceptors.add(InterceptorsWrapper(onRequest: _requestInterceptor));
