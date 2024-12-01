const { ethers } = require("ethers");
const { exec } = require('child_process');
require('dotenv').config();

// Base Sepolia configuration
const baseSepoliaConfig = {
  url: "https://sepolia.base.org",
  accounts: [process.env.SEPOLIA_PRIVATE_KEY],
  chainId: 84532,
};

const provider = new ethers.providers.JsonRpcProvider(baseSepoliaConfig.url);

// Initialize wallet with private key
const wallet = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY, provider);

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
];

const ethereumContractAddress = "0xF8f8a3fE22b3D06C99bF669A6Dc60D3a370deAa8";
const suiPackageId = "0x0c87abd602514a53138cb31f9551c24d1027c8b40be4398f6e23c8bba7238055";

// Initialize contract instance
const contract = new ethers.Contract(ethereumContractAddress, contractABI, wallet);

// Helper function to convert string to hex bytes
function stringToHex(str) {
  return Buffer.from(str).toString('hex');
}

// Helper function to format Sui address
function formatSuiAddress(address) {
  return '0x' + address.replace('0x', '').padStart(40, '0');
}

async function synchronizeWithSui(eventDetails) {
  try {
    const { packageId, metadata, cid, customer, name, description } = eventDetails;
    
    const metadataHex = stringToHex(metadata);
    const cidHex = stringToHex(cid);
    const nameHex = stringToHex(name);
    const descriptionHex = stringToHex(description);
    if (!customer) {
      throw new Error("Customer address is undefined");
    }
    const customerAddress = formatSuiAddress(customer);

    // console.log(`Synchronizing with Sui...
    //   Package ID: ${packageId}
    //   Customer: ${customerAddress}
    //   Metadata: ${metadataHex}
    //   CID: ${cidHex}
    //   Name: ${nameHex}
    //   Description: ${descriptionHex}`);

    // Modify the command construction to properly escape and format the type arguments
    const command = `sui client call \
      --package ${suiPackageId} \
      --module smartbox \
      --function create_package \
      --type-args ${suiPackageId}::smartbox::Package \
      --args \
        ${metadataHex} \
        ${cidHex} \
        ${customerAddress} \
        ${nameHex} \
        ${descriptionHex} \
      --gas-budget 1000000 \
      --json`;

    console.log("Executing command:", command);

    return new Promise((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        // if (stderr) {
        //   console.error("Sui CLI stderr:", stderr);
        // }
        
        // if (error) {
        //   // Handle specific error cases
        //   if (stderr.includes("version mismatch")) {
        //     console.warn("Version mismatch warning detected, continuing execution");
        //     try {
        //       const result = JSON.parse(stdout);
        //       console.log("Sui CLI output:", result);
        //       resolve(result);
        //       return;
        //     } catch (e) {
        //       console.error("Failed to parse Sui CLI output:", e);
        //     }
        //   }
        //   console.error("Error executing Sui CLI command:", error);
        //   reject(error);
        //   return;
        // }

        try {
          const result = JSON.parse(stdout);
          console.log("Sui CLI output:", result);
          resolve(result);
        } catch (e) {
          console.error("Failed to parse Sui CLI output:", e);
          reject(e);
        }
      });
    });
  } catch (error) {
    console.error("Error in synchronizeWithSui:", error);
    throw error;
  }
}

async function initializeEventListeners() {
  try {
    const network = await provider.getNetwork();
    console.log("Connected to network:", network);

    console.log("Verifying contract at address:", ethereumContractAddress);
    const code = await provider.getCode(ethereumContractAddress);
    if (code === "0x") {
      throw new Error("Contract not deployed at the specified address.");
    }
    console.log("Contract connected at address:", ethereumContractAddress);

    contract.on("PackageCreatedOnSui", async (...args) => {
      console.log("PackageCreatedOnSui event detected!");
      try {
        // console.log("Raw event args:", args);
        const [packageId, metadata, customer, funds, cid, name, description] = args;
        // const customer = event?.args?.customer || event?.customer;

        // console.log("Extracted event data:", {
        //   packageId: packageId.toString(),
        //   metadata,
        //   cid,
        //   name,
        //   description,
        //   customer,
        //   funds
        // });

        const eventDetails = {
          packageId: packageId.toString(),
          metadata,
          cid,
          name,
          description,
          customer, 
          funds
        };
        
        await synchronizeWithSui(eventDetails);
      } catch (error) {
        console.error("Error processing PackageCreatedOnSui event:", error);
      }
    });

    console.log("Event listeners initialized successfully.");
  } catch (error) {
    console.error("Contract Initialization Error:", error);
  }
}

// Error handling
provider.on("error", (error) => {
  console.error("WebSocket Provider Error:", error);
});

contract.on("error", (error) => {
  console.error("Contract Event Error:", error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  provider.removeAllListeners();
  process.exit(0);
});

initializeEventListeners();
console.log("Cross-chain Synchronization Script is running...");