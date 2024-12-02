require("dotenv").config();
const { getFullnodeUrl, SuiClient } = require('@mysten/sui/client');
const { bech32 } = require("bech32");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");
const { Transaction, coinWithBalance } = require("@mysten/sui/transactions");

// Validate environment variables
if (!process.env.SUI_RPC_URL || !process.env.SUI_PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

// Decode the Bech32 private key
const bech32Key = process.env.SUI_PRIVATE_KEY;
const decodedKey = bech32.decode(bech32Key).words;
const privateKeyBytes = Uint8Array.from(bech32.fromWords(decodedKey)).slice(-32);

// Create the Ed25519 keypair from the private key bytes
const keyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

// Initialize the Sui client for Testnet
// const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const client = new SuiClient({ url: " https://rpc-testnet.suiscan.xyz" });

const trigger = async () => {
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

    const response = client.signAndExecuteTransaction({
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
    throw error;
  }
};

// Execute the function
trigger().catch(console.error);