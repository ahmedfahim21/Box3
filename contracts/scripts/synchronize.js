require("dotenv").config();
const { getFullnodeUrl, SuiClient } = require('@mysten/sui/client');
const { bech32 } = require("bech32");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const { Transaction, coinWithBalance } = require("@mysten/sui/transactions");
const { ethers } = require("ethers");
const crypto = require("crypto"); // To help with address formatting
const { exec } = require("child_process");

// Sui Initialization
if (!process.env.SUI_RPC_URL || !process.env.SUI_PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

const bech32Key = process.env.SUI_PRIVATE_KEY;
const decodedKey = bech32.decode(bech32Key).words;
const privateKeyBytes = Uint8Array.from(bech32.fromWords(decodedKey)).slice(-32);
const keyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
// const client = new SuiClient({ url: process.env.SUI_RPC_URL });
const client = new SuiClient({ url: " https://rpc-testnet.suiscan.xyz" });
const suiPackageId = "0x663dc7eb80500f3d83c7ad22a83fc7f125bd15f711e447db54a15645647ba00e";

// Ethereum Initialization
const baseSepoliaConfig = {
  url: "https://sepolia.base.org",
  accounts: [process.env.SEPOLIA_PRIVATE_KEY],
  chainId: 84532,
};

const provider = new ethers.providers.JsonRpcProvider(baseSepoliaConfig.url);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const ethereumContractAddress = "0xcA568a06a345fCd4fA2dbCA4cf01AEcfea093A5a";
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      }
    ],
    "name": "OrderCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "OrderFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      }
    ],
    "name": "PackageCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "funds",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "PackageCreatedOnSui",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "deliveryAgent",
        "type": "address"
      }
    ],
    "name": "PackageDelivered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "PackageDeliveredOnSui",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum SmartBox.UserRole",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "addFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "deliveryAgent",
        "type": "address"
      }
    ],
    "name": "assignDeliveryAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "funds",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "createOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "createPackage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllOrders",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "customer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "funds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct SmartBox.Order[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getOrder",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "customer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "fulfilled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "funds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct SmartBox.Order",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "getPackage",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "customer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "delivered",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "fundsReleased",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "funds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "deliveryAgent",
            "type": "address"
          }
        ],
        "internalType": "struct SmartBox.Package",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getUser",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "rfidData",
            "type": "string"
          },
          {
            "internalType": "enum SmartBox.UserRole",
            "name": "role",
            "type": "uint8"
          }
        ],
        "internalType": "struct SmartBox.User",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "markAsDelivered",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextOrderId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPackageId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "orders",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "fulfilled",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "funds",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "packages",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "customer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "delivered",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "fundsReleased",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "funds",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "deliveryAgent",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "rfidData",
        "type": "string"
      },
      {
        "internalType": "enum SmartBox.UserRole",
        "name": "role",
        "type": "uint8"
      }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "packageId",
        "type": "uint256"
      }
    ],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "trackAllPackages",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "cid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "metadata",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "customer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "delivered",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "fundsReleased",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "funds",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "deliveryAgent",
            "type": "address"
          }
        ],
        "internalType": "struct SmartBox.Package[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userAddresses",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "string",
        "name": "metadata",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "rfidData",
        "type": "string"
      },
      {
        "internalType": "enum SmartBox.UserRole",
        "name": "role",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const contract = new ethers.Contract(ethereumContractAddress, contractABI, wallet);

// Helper Functions

function stringToHexBytes(input) {
  return Array.from(Buffer.from(input, 'utf-8')).map((byte) => `0x${byte.toString(16)}`);
}

function formatSuiAddress(address) {
  if (!address.startsWith("0x")) {
    throw new Error("Address must start with '0x'.");
  }

  const ethAddressWithoutPrefix = address.slice(2).toLowerCase();
  const paddedAddress = ethAddressWithoutPrefix.padStart(40, '0');
  const hash = crypto.createHash('sha256')
    .update(Buffer.from(paddedAddress, 'hex'))
    .digest('hex');
  return '0x' + hash.slice(0, 64);
}

// Event Synchronization for Ethereum & Sui

async function createSuiTransaction(eventDetails) {
  try {
    console.log("Creating SUI transaction with details:", eventDetails);

    const tx = new Transaction();
    const { metadata, cid, name, description, customer, funds } = eventDetails;

    const coin = await coinWithBalance({ balance: 100000000 }); // 100 SUI

    // Create a new package
    tx.moveCall({
      target: `${suiPackageId}::smartbox::create_package`,
      // typeArguments: ["0x2::sui::SUI"],
      arguments: [
        tx.object("0xd602cdc37422e359e0b0fe522fa74bf6436f4ac0420eaa0439b1bbef67307693"),
        tx.pure.string(metadata),
        tx.pure.string(cid),
        tx.pure.address(customer),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.u64(funds)
      ],
    });

    const response = await client.signAndExecuteTransaction({
      signer: keyPair,
      transaction: tx,
      options: {
        showEffects: true,
      },
    });

    console.log("Transaction Response:", response);
    console.log("Transaction Digest:", response.digest);
    console.log("Transaction Effects:", response.effects);
    console.log("Transaction Error (if any):", response.effects?.status?.error);
  } catch (error) {
    console.error("Error creating SUI transaction:", error);
  }
}

async function markPackageAsDeliveredOnSui(packageId) {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${suiPackageId}::smartbox::mark_as_delivered`,
      arguments: [
        tx.pure.u64(packageId),  // Package ID
      ],
    });

    const response = await client.signAndExecuteTransaction({
      signer: keyPair,
      transaction: tx,
      options: {
        showEffects: true,
      },
    });

    console.log(`Package ${packageId} marked as delivered on Sui. Transaction Response:`, response);
  } catch (error) {
    console.error(`Error marking package ${packageId} as delivered on Sui:`, error);
  }
}

async function releaseFundsOnSui(packageId, amount) {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${suiPackageId}::smartbox::release_funds`,
      arguments: [
        tx.pure.u64(packageId),  // Package ID
        tx.pure.u64(amount),      // Amount to release
      ],
    });

    const response = await client.signAndExecuteTransaction({
      signer: keyPair,
      transaction: tx,
      options: {
        showEffects: true,
      },
    });

    console.log(`Funds released for package ${packageId} on Sui. Transaction Response:`, response);
  } catch (error) {
    console.error(`Error releasing funds for package ${packageId} on Sui:`, error);
  }
}

// Synchronize Ethereum and Sui events
async function synchronizeWithSui(eventDetails) {
  console.log("Synchronizing with Sui for event:", eventDetails);
  
  // Handle PackageCreatedOnSui event
  await createSuiTransaction(eventDetails);
  
  // Handle PackageDelivered (Ethereum -> Sui)
  if (eventDetails.packageId && eventDetails.delivered) {
    await markPackageAsDeliveredOnSui(eventDetails.packageId);
  }

  // Handle FundsReleased (Ethereum -> Sui)
  if (eventDetails.packageId && eventDetails.fundsReleased) {
    await releaseFundsOnSui(eventDetails.packageId, eventDetails.funds);
  }
}

// Ethereum Event Listener for 'PackageCreatedOnSui' and other relevant events

async function initializeEventListeners() {
  try {
    console.log("Initializing event listeners...");

    contract.on("PackageCreatedOnSui", async (...args) => {
      console.log("PackageCreatedOnSui event detected!");
      try {
        const [packageId, metadata, customer, funds, cid, name, description] = args;

        const eventDetails = {
          packageId: packageId.toString(),
          metadata,
          cid,
          name,
          description,
          customer,
          funds,
        };

        await synchronizeWithSui(eventDetails);
      } catch (error) {
        console.error("Error processing PackageCreatedOnSui event:", error);
      }
    });

    contract.on("PackageDelivered", async (...args) => {
      console.log("PackageDelivered event detected!");
      try {
        const [packageId] = args;

        const eventDetails = {
          packageId: packageId.toString(),
          delivered: true,
        };

        await synchronizeWithSui(eventDetails);
      } catch (error) {
        console.error("Error processing PackageDelivered event:", error);
      }
    });

    contract.on("FundsReleased", async (...args) => {
      console.log("FundsReleased event detected!");
      try {
        const [packageId, amount] = args;

        const eventDetails = {
          packageId: packageId.toString(),
          fundsReleased: true,
          funds: amount.toString(),
        };

        await synchronizeWithSui(eventDetails);
      } catch (error) {
        console.error("Error processing FundsReleased event:", error);
      }
    });

    console.log("Event listeners initialized successfully.");
  } catch (error) {
    console.error("Error initializing event listeners:", error);
  }
}

// Start the listener
initializeEventListeners();
console.log("Cross-chain Synchronization Script is running...");