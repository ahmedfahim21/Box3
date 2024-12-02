class Package {
  BigInt id; // Corresponds to uint256
  String address;
  String name;
  String description;
  bool delivered;

  Package({
    required this.id,
    required this.address,
    required this.name,
    required this.description,
    required this.delivered,
  });
}