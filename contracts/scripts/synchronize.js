require("dotenv").config();
const { getFullnodeUrl, SuiClient } = require('@mysten/sui/client');
const { bech32 } = require("bech32");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const { Transaction, coinWithBalance } = require("@mysten/sui/transactions");
const { ethers } = require("ethers");
const crypto = require("crypto");  // To help with address formatting
const { exec } = require("child_process");

// Sui Initialization
if (!process.env.SUI_RPC_URL || !process.env.SUI_PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

const bech32Key = process.env.SUI_PRIVATE_KEY;
const decodedKey = bech32.decode(bech32Key).words;
const privateKeyBytes = Uint8Array.from(bech32.fromWords(decodedKey)).slice(-32);
const keyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
const client = new SuiClient({ url: "https://rpc-testnet.suiscan.xyz" });
const suiPackageId = "0x0ae7ef0dad09ed127b537e3d4ed573493d0cf4e26c8b6cc97c2933343a54e737";

// Ethereum Initialization
const baseSepoliaConfig = {
  url: "https://sepolia.base.org",
  accounts: [process.env.SEPOLIA_PRIVATE_KEY],
  chainId: 84532,
};

const provider = new ethers.providers.JsonRpcProvider(baseSepoliaConfig.url);
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

const ethereumContractAddress = "0x7472BD1694994Fc8053Cc167a8fB582034766d17";
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
    "name": "createPackage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyPackageDetails",
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
]; // Use the provided contract ABI
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

    tx.moveCall({
      target: `${suiPackageId}::smartbox::create_package`,
      typeArguments: ["0x2::sui::SUI"],
      arguments: [
        tx.object("0x92eb2d3514419130345df81275c94f11bf2b7057794d34ee659546c726b6658b"),
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

async function synchronizeWithSui(eventDetails) {
  console.log("Synchronizing with Sui for event:", eventDetails);
  await createSuiTransaction(eventDetails);
}

// Ethereum Event Listener for 'PackageCreatedOnSui'

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

    console.log("Event listeners initialized successfully.");
  } catch (error) {
    console.error("Error initializing event listeners:", error);
  }
}

// Start the listener
initializeEventListeners();
console.log("Cross-chain Synchronization Script is running...");

// Example Transaction Trigger (for testing)
async function triggerSuiTransaction() {
  try {
    const tx = new Transaction();
    const coin = await coinWithBalance({ balance: 100000000 }); // 100 SUI

    // Define constants
    const PACKAGE_ID = "0x0ae7ef0dad09ed127b537e3d4ed573493d0cf4e26c8b6cc97c2933343a54e737";
    const recipientAddress = "0xd7640d3951cf2de4c6eaecd5aff577bd063871d8853b5904579b0c0a95d63e50";

    tx.moveCall({
      target: `${PACKAGE_ID}::smartbox::create_package`,
      arguments: [
        tx.object("0x92eb2d3514419130345df81275c94f11bf2b7057794d34ee659546c726b6658b"),
        tx.pure.string("PackageMetadata"),
        tx.pure.string("PackageCID"),
        tx.pure.address(recipientAddress),
        tx.pure.string("PackageName"),
        tx.pure.string("PackageDescription"),
        tx.pure.u64(100000000),
      ],
    });

    const response = await client.signAndExecuteTransaction({
      signer: keyPair,
      transaction: tx,
      options: {
        showEffects: true,
      },
    });

    console.log({ response });
    console.log((await response).digest);
    console.log((await response).effects);
    console.log((await response).effects?.status.error);

  } catch (error) {
    console.error("Error executing transaction:", error);
  }
}

// Uncomment to test transaction
triggerSuiTransaction().catch(console.error);