import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:unfold_project/screens/home_page.dart';
import 'package:unfold_project/strings.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:unfold_project/utils.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({super.key});

  @override
  State<SignInPage> createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _showOtp =
      false; // To toggle between the sign-in form and OTP input widget
  String? token;

  bool _isEmailValid(String email) {
    final regex = RegExp(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
    return regex.hasMatch(email);
  }

  void _handleSignIn() async {
    if (_formKey.currentState?.validate() ?? false) {
      try {
        // Define headers
        final Map<String, String> headers = {
          'Content-Type': 'application/json',
          'X-Api-Key': globals.oktoClientApiKey,
        };

        // Make POST request
        final Response response = await dio.post(
          'https://sandbox-api.okto.tech/api/v1/authenticate/email',
          options: Options(headers: headers),
          data: {
            'email': _emailController.text,
          },
        );

        // Handle response
        if (response.statusCode == 200) {
          print('Success: ${response.data}');
          token = response.data['data']['token'];

          setState(() {
            _showOtp = true;
          });

          // Show a snackbar indicating OTP sent
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('OTP sent!'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        } else {
          print('Error: ${response.statusCode} - ${response.data}');
        }
      } catch (e) {
        print('Exception: $e');
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Error sending OTP!'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        });
      }
    }
  }

  Widget _getOtpEditor(BuildContext context) {
    return PinCodeTextField(
      appContext: context,
      length: 6,
      controller: _otpController,
      autoDisposeControllers: false,
      cursorColor: Colors.transparent,
      pinTheme: PinTheme(
          inactiveColor: Colors.grey[600],
          inactiveBorderWidth: 1,
          activeColor: primaryColor,
          selectedColor: Colors.black,
          activeBorderWidth: 2),
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onCompleted: (otp) {
        // widget.newScreen();
      },
    );
  }

  void _verifyOtp(BuildContext context) async {
    try {
      // Define headers
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
        'X-Api-Key': globals.oktoClientApiKey,
      };

      final Map<String, String> body = {
        'email': _emailController.text.trim(), // Ensure no trailing spaces
        'otp': _otpController.text.trim(), // Ensure no trailing spaces
        'token': token ?? '', // Ensure token is not null
      };
      print(body);

      // Make POST request
      final Response response = await dio.post(
          'https://sandbox-api.okto.tech/api/v1/authenticate/email/verify',
          options: Options(headers: headers),
          data: body);

      // Handle response
      if (response.statusCode == 200) {
        print('Success: ${response.data}');
        if (response.data['status'] == "success") {
          await okto?.tokenManager.storeTokens(
              response.data['data']['auth_token'],
              response.data['data']['refresh_auth_token'],
              response.data['data']['device_token']);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.of(context).push(MaterialPageRoute(builder: (context) {
              return const HomePage();
            }));
          });
        } else {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Incorrect OTP!'),
                behavior: SnackBarBehavior.floating,
              ),
            );
          });
        }
      } else if (response.statusCode == 422) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Incorrect OTP!'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        });
        print(response);
      }
    } catch (e) {
      print(e);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error verifying OTP!'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Image.asset('assets/box3-logo.png', height: 150)),
                const SizedBox(height: 20),
                AnimatedSwitcher(
                  duration: const Duration(seconds: 1),
                  child: _showOtp
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  "Enter your OTP",
                                  style: TextStyle(
                                      color: primaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 26,
                                      letterSpacing: 1),
                                ),
                                Row(
                                  mainAxisSize: MainAxisSize
                                      .min, // Ensures the row takes only as much space as needed
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Icon(Icons.arrow_left_rounded),
                                    GestureDetector(
                                      onTap: () {
                                        _otpController.clear();
                                        setState(() {
                                          _showOtp = false;
                                        });
                                      },
                                      child: const Text(
                                        'Back',
                                        style: TextStyle(
                                          color: Colors.black,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            _getOtpEditor(context),
                            const SizedBox(height: 30),
                            CustomButton(
                              onTap: () {
                                _verifyOtp(context);
                              },
                              title: 'Verify OTP',
                            ),
                          ],
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Login into Box3",
                              style: TextStyle(
                                  color: primaryColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 30,
                                  letterSpacing: 1),
                            ),
                            const SizedBox(height: 20),
                            Text(
                              "Secure & Decentralised Delivery Platform",
                              style: TextStyle(
                                  color: Colors.grey[600],
                                  fontWeight: FontWeight.w600,
                                  fontSize: 18,
                                  fontFeatures: [
                                    FontFeature.stylisticSet(6),
                                  ]),
                            ),
                            const SizedBox(height: 26),
                            Form(
                              key: _formKey,
                              child: TextFormField(
                                controller: _emailController,
                                cursorColor: primaryColor,
                                decoration: InputDecoration(
                                  labelText: 'Email',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(15),
                                    borderSide: const BorderSide(
                                        color:
                                            primaryColor), // Set your custom color here
                                  ),
                                ),
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter an email';
                                  } else if (!_isEmailValid(value)) {
                                    return 'Please enter a valid email';
                                  }
                                  return null;
                                },
                              ),
                            ),
                            const SizedBox(height: 30),
                            CustomButton(
                              onTap: () {
                                _handleSignIn();
                              },
                              title: 'Sign In',
                            ),
                          ],
                        ), // Empty container when OTP is not shown
                ),
              ],
            ),

            // OTP Input (shown after email is valid)
          ],
        ),
      ),
    );
  }
}

class CustomButton extends StatelessWidget {
  final VoidCallback onTap;
  final String title;
  final IconData? icon;
  const CustomButton(
      {super.key, required this.onTap, required this.title, this.icon});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: MediaQuery.of(context).size.width * 0.4,
        child: RawMaterialButton(
          onPressed: () {
            onTap();
          },
          fillColor: primaryColor,
          textStyle: const TextStyle(color: Colors.white),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) Icon(icon),
              if (icon != null) const SizedBox(width: 10),
              Text(
                title,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
