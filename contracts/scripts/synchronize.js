require('dotenv').config();
const { ethers } = require("ethers");
const { exec } = require("child_process");

const alchemyProviderUrl = `https://eth-sepolia.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
const provider = new ethers.providers.JsonRpcProvider(alchemyProviderUrl);

// Ethereum Contract ABI and Address
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
        "internalType": "string",
        "name": "cid",
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
      },
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
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
];
const ethereumContractAddress = "0x50784CC39aCF4719864e616a181810d069D27970";

// Connect to Ethereum Contract
const contract = new ethers.Contract(ethereumContractAddress, contractABI, provider);

// Sui package ID for your contract
const suiPackageId = "0x94a24e29639c7ee96f736d23a7e0f72107c10bb17f12b8251903ccb18670b667";

// Listen for events on Ethereum
contract.on("PackageCreated", async (eventData) => {
  console.log("Event detected on Ethereum:", eventData);

  // Example action: Call the Sui contract when an event occurs on Ethereum
  await synchronizeWithSui(eventData);
});

// Function to interact with the Sui blockchain
async function synchronizeWithSui(eventData) {
  try {
    // Assuming you're using Sui CLI or SDK to invoke your Sui contract
    // This is an example of calling a Sui function after detecting an event on Ethereum

    const eventId = eventData.id; // Extracted from the Ethereum event.
    const value = eventData.value; // Extracted from the Ethereum event.

    // Construct the CLI command dynamically
    const command = `sui client call \
      --package ${suiPackageId} \
      --module SmartBox \
      --function sync_data \
      --args "${eventId}" ${value} \
      --gas-budget 1000000`;

    // Execute Sui CLI command
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing Sui command:", err);
        return;
      }
      if (stderr) {
        console.error("Sui CLI error:", stderr);
        return;
      }
      console.log("Sui CLI response:", stdout);
    });
  } catch (error) {
    console.error("Error synchronizing with Sui:", error);
  }
}

console.log("Synchronization script is running...");