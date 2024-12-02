import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart';
import 'package:web3dart/web3dart.dart';

// Base Sepolia RPC URL
final alchemyApiKey = dotenv.get("ALCHEMY_API_KEY");
final String rpcUrl = "https://base-sepolia.g.alchemy.com/v2/$alchemyApiKey";

// Initialize Web3Client with the RPC URL
final Web3Client ethClient = Web3Client(rpcUrl, Client());

Future<DeployedContract> loadContract() async {
  // Load the ABI from the assets folder
  String abi = await rootBundle.loadString('assets/abi.json');
  String contractAddress = "0xcA568a06a345fCd4fA2dbCA4cf01AEcfea093A5a";

  // Return the deployed contract instance
  final contract = DeployedContract(
    ContractAbi.fromJson(abi, 'Box3'),
    EthereumAddress.fromHex(contractAddress),
  );
  return contract;
}

Future<dynamic> callFunction(String funcName, List<dynamic> args) async {
  // Wallet credentials using the private key
  // final credentials = EthPrivateKey.fromHex(privateKey);
  final contract = await loadContract(); // Load the deployed contract
  final ethFunction = contract.function(funcName); // Define the function

  // Send a transaction to call the smart contract function
  try {
    final result = await ethClient.call(
      sender: EthereumAddress.fromHex("0x5a4983927dCEe4aF40E5829Eb890698e63C9e3ce"),
      contract: contract,
      function: ethFunction,
      params: args,
    );
    return result;
  } catch (e) {
    print(e);
  }
  return null;
}

Future<void> checkBalance(String address) async {
  // Convert the provided address to EthereumAddress format
  EthereumAddress walletAddress = EthereumAddress.fromHex(address);

  // Fetch the wallet's balance
  EtherAmount balance = await ethClient.getBalance(walletAddress);

  // Print the balance in Ether
  print("Balance: ${balance.getValueInUnit(EtherUnit.ether)} ETH");
}
