import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:okto_flutter_sdk/okto_flutter_sdk.dart';
import 'package:unfold_project/screens/home_page.dart';
import 'package:unfold_project/screens/sign_in_page.dart';
import 'package:unfold_project/utils.dart';

void main() async {
  await dotenv.load(fileName: ".env");
  WidgetsFlutterBinding.ensureInitialized();
  okto = Okto(globals.getOktoApiKey(), globals.getBuildType());
  runApp(const MyApp());
}

Future<bool> checkLoginStatus() async {
  return await okto!.isLoggedIn();
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Okto Flutter template app',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: FutureBuilder<bool>(
        future: checkLoginStatus(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          } else {
            bool isLoggedIn = snapshot.data ?? false;
            if (isLoggedIn) {
              return const HomePage();
            } else {
              return const SignInPage();
            }
          }
        },
      ),
    );
  }
}
