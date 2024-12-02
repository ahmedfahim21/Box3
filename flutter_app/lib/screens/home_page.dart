import 'package:flutter/material.dart';
import 'package:unfold_project/models.dart';

import 'package:unfold_project/screens/profile_page.dart';
import 'package:unfold_project/screens/sign_in_page.dart';
import 'package:unfold_project/smart_contract_services.dart';
import 'package:unfold_project/strings.dart';
import 'package:unfold_project/utils.dart';
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart';
import 'package:local_auth/local_auth.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Package>? packages;

  Client? httpClient;
  Web3Client? ethClient;

  bool isUpcomingSelected = true;

  @override
  void initState() {
    fetchPackages();
    super.initState();
  }

  List<Package> parsePackages(List<dynamic> packages) {
    print(packages);
    final List<Package> result = packages[0]
        .map<Package>((package) => Package(
              id: package[0],
              address: package[2].toString(),
              // Convert to bool using == true comparison instead of direct casting
              delivered: package[4] == true,
              name: package[7].toString(),
              description: package[8].toString(),
            ))
        .toList();
    return result.where((package) {
      return package.name != "ibibib";
    }).toList();
  }

  void fetchPackages() async {
    final response = await callFunction("trackAllPackages", []);
    setState(() {
      packages = parsePackages(response);
    });
  }

  deletePackage(int index) {
    setState(() {
      packages?[index].delivered = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        scrolledUnderElevation: 0.0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 12.0),
          child: Image.asset(
            "assets/box3-logo.png",
          ),
        ),
        leadingWidth: 40,
        title: const Text(
          'Box3',
          style: TextStyle(fontWeight: FontWeight.w600, color: primaryColor),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(
              Icons.person,
              color: primaryColor,
            ),
            onPressed: () async {
              // final address = await callFunction("getProfileDetails", []);
              // print(address);

              Navigator.of(context).push(MaterialPageRoute(
                builder: (context) {
                  return ProfilePage(
                    walletAddress: "0x04414c2006B22526872f04ac245dCD71959e753b",
                    imageUrl:
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Elon_Musk_Royal_Society_crop.jpg/440px-Elon_Musk_Royal_Society_crop.jpg",
                    onSignOut: () {
                      okto?.logout();
                      Navigator.of(context).pushAndRemoveUntil(
                        MaterialPageRoute(
                            builder: (context) => const SignInPage()),
                        (route) => false,
                      );
                    },
                  );
                },
              ));
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 12.0),
        child: RefreshIndicator(
          onRefresh: () async {
            fetchPackages();
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    HeadingCard(
                      imageUrl: "assets/upcoming.png",
                      title: "Upcoming",
                      isSelected: isUpcomingSelected,
                      onTap: () {
                        setState(() {
                          isUpcomingSelected = true;
                        });
                      },
                    ),
                    HeadingCard(
                      imageUrl: "assets/delivered.png",
                      title: "Delivered",
                      isSelected: !isUpcomingSelected,
                      onTap: () {
                        setState(() {
                          isUpcomingSelected = false;
                        });
                      },
                    )
                  ],
                ),
              ),
              const SizedBox(
                height: 10,
              ),
              Expanded(
                  child: PackageListPage(
                      deletePackage: (index) {
                        deletePackage(index);
                      },
                      packages: packages == null
                          ? packages
                          : isUpcomingSelected
                              ? packages!
                                  .where(
                                      (package) => package.delivered == false)
                                  .toList()
                              : packages!
                                  .where((package) => package.delivered == true)
                                  .toList(),
                      isUpcomingSelected: isUpcomingSelected)),
            ],
          ),
        ),
      ),
    );
  }
}

class PackageListPage extends StatelessWidget {
  final List<Package>? packages;
  final bool isUpcomingSelected;
  final Function(int) deletePackage;

  const PackageListPage(
      {super.key,
      required this.packages,
      required this.isUpcomingSelected,
      required this.deletePackage});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: packages?.isEmpty ?? true
          ? const Center(child: Text("No Packages"))
          : ListView.builder(
              itemCount: packages!.length,
              itemBuilder: (context, index) {
                return PackageCard(
                    deleteCard: () {
                      deletePackage(index);
                    },
                    id: packages![index].id,
                    notDelivered: isUpcomingSelected,
                    name: packages![index].name,
                    description: packages![index].description);
              },
            ),
    );
  }
}

class PackageCard extends StatefulWidget {
  final BigInt id;
  final String name;
  final String description;
  final String imageUrl;
  final bool notDelivered;
  final VoidCallback deleteCard;

  const PackageCard(
      {super.key,
      required this.id,
      required this.name,
      required this.deleteCard,
      required this.description,
      this.notDelivered = false,
      this.imageUrl = "assets/upcoming_box.png"});

  @override
  State<PackageCard> createState() => _PackageCardState();
}

class _PackageCardState extends State<PackageCard> {
  Future? openBoxFuture;
  bool isLoading = false;
  final LocalAuthentication auth = LocalAuthentication();

  Future<bool> authenticate() async {
    try {
      bool isAuthenticated = await auth.authenticate(
        localizedReason: 'Please authenticate to open the box',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      return isAuthenticated;
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Authentication error: ${e.toString()}'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return false;
    }
  }

  void openBox(BuildContext context, BigInt id) async {
    if (isLoading) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Box is already in process of opening/closing'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    bool isAuthenticated = await authenticate();
    if (!isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Authentication failed. Wrong fingerprint.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    openBoxFuture = dio.get("http://192.168.167.131:8000/api/servo/");
    openBoxFuture?.then((response) async {
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('The box has closed!'),
            behavior: SnackBarBehavior.floating,
          ),
        );
        widget.deleteCard();
        // final s = await callFunction("markAsDelivered", [id]);
        // print(s);
      } else {
        throw Exception('Failed to open box');
      }
    }).catchError((e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }).whenComplete(() {
      setState(() {
        isLoading = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2.0,
      color: Colors.white,
      shadowColor: primaryColor,
      margin: const EdgeInsets.symmetric(vertical: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.all(10.0),
        trailing: widget.notDelivered
            ? GestureDetector(
                onTap: () {
                  openBox(context, widget.id);
                },
                child: Chip(
                  backgroundColor: isLoading ? Colors.grey : Colors.green,
                  label: Text(
                    isLoading ? "Box Opened" : "Open Box",
                    style: const TextStyle(
                      color: Colors.white,
                    ),
                  ),
                ),
              )
            : null,
        leading: ClipRRect(
          borderRadius:
              BorderRadius.circular(8.0), // Rounded corners for the image
          child: Image.asset(
            widget.imageUrl,
            width: 60.0,
            height: 60.0,
            fit: BoxFit.cover,
          ),
        ),
        title: Text(
          widget.name,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          widget.description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        onTap: () {
          // Navigate to the package details page or show details
        },
      ),
    );
  }
}

class HeadingCard extends StatelessWidget {
  final String title;
  final String imageUrl;
  final bool isSelected;
  final VoidCallback? onTap;

  const HeadingCard({
    super.key,
    this.onTap,
    required this.isSelected,
    required this.title,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Material(
        elevation: 2.0,
        borderRadius: BorderRadius.circular(10),
        shadowColor: primaryColor,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border:
                Border.all(color: primaryColor, width: isSelected ? 1.8 : 1.0),
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
          child: Column(
            children: [
              Image.asset(
                imageUrl,
                height: 60,
                width: 60,
              ),
              const SizedBox(height: 10),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.w600),
              )
            ],
          ),
        ),
      ),
    );
  }
}
