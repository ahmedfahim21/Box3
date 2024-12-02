import 'package:flutter/material.dart';
import 'package:unfold_project/screens/sign_in_page.dart';
import 'package:unfold_project/strings.dart';

class ProfilePage extends StatelessWidget {
  final String walletAddress;
  final String? imageUrl;
  final VoidCallback onSignOut;

  const ProfilePage({
    super.key,
    required this.walletAddress,
    this.imageUrl,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: GestureDetector(
            onTap: () {
              Navigator.pop(context);
            },
            child: const Icon(
              Icons.arrow_back_ios,
              size: 20.0,
            ),
          ),
        ),
        // actions: [
        //   if (imageUrl != null)
        //     ClipRRect(
        //       borderRadius: BorderRadius.circular(100.0), // Rounded corners
        //       child: Image.network(
        //         imageUrl!,
        //         width: 60.0,
        //         height: 60.0,
        //         fit: BoxFit.cover, // Ensures the image covers the circle
        //         errorBuilder: (context, error, stackTrace) {
        //           return const Icon(Icons.error,
        //               size: 50.0); // Error icon if image fails to load
        //         },
        //       ),
        //     ),
        // ],
        title: const Text(
          'Profile',
          style: TextStyle(fontWeight: FontWeight.w600, color: primaryColor),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            Center(child: Image.asset('assets/box3-logo.png', height: 150)),
            const SizedBox(height: 20),
            const Text(
              'Box3 ... v1.0.0',
              style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 16.0),
            ),

            const SizedBox(height: 50.0),
            // Wallet Address Section
            ListTile(
              leading:
                  const Icon(Icons.account_balance_wallet, color: primaryColor),
              title: Text(
                walletAddress,
                style: const TextStyle(
                    fontSize: 14.0, fontWeight: FontWeight.w500),
              ),
            ),
            const Spacer(),
            // Sign Out Button
            CustomButton(
              icon: Icons.logout,
              title: 'Sign Out',
              onTap: onSignOut,
            ),
          ],
        ),
      ),
    );
  }
}
