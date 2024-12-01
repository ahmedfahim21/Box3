# Box3 - Unfold 2024
## Overview

Unfold24 is a blockchain-based delivery solution that integrates cryptocurrency payments, smart contracts, and RFID technology to ensure secure and seamless package delivery. Users pay via cryptocurrency, and delivery agents access the delivery box using RFID. Funds are securely released only upon package confirmation.

---

## Tech Stack

- **Backend**: Django
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contracts**: Solidity + Hardhat
- **Deployment**: Hardhat for contracts, Django for APIs

---

## Repository Structure

```
Unfold24/
├── backend/                     # Django Backend
│   ├── manage.py                # Django entry point
│   ├── api/                     # API application
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API views
│   │   ├── urls.py              # API endpoints
│   │   └── serializers.py       # DRF serializers
│   ├── contracts/               # Smart contract utilities
│   │   ├── abi/                 # Contract ABIs
│   │   │   └── SmartBox.json
│   │   └── contract_utils.py    # Web3 utilities
├── contracts/                   # Hardhat for smart contracts
│   ├── contracts/               # Solidity contracts
│   │   └── SmartBox.sol
│   ├── scripts/                 # Deployment scripts
│   │   └── deploy.js
│   ├── hardhat.config.js        # Hardhat configuration
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
└── README.md                    # Project documentation
```

---

## Installation and Setup

### Prerequisites

- Python 3.8 or higher
- Node.js v16.x or higher
- npm (or Yarn)
- MetaMask or another Ethereum-compatible wallet

---

### 1. Clone the Repository

```bash
git clone https://github.com/imApoorva36/Box3.git
cd Box3
```

---

### 2. Backend Setup

Navigate to the `backend` folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv env
source env/bin/activate
```

Install dependencies:

```bash
pip install -r ../requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

---

### 3. Smart Contracts Setup

Navigate to the `contracts` folder:

```bash
cd contracts
```

Initialize Hardhat (if not already initialized):

```bash
npx hardhat
```

Install dependencies:

```bash
npm install
```

Write your smart contract in `contracts/SmartBox.sol`. Update the deployment script in `scripts/deploy.js` to deploy the contract to the Sepolia Testnet.

#### Compile the contract:

```bash
npx hardhat compile
```

#### Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Note the contract address and place the ABI file in `backend/contracts/abi/`.

---

### 4. Environment Variables

Create a `.env` file in the root directory with the following keys:

```
ALCHEMY_API_KEY=your-alchemy-api-key
SEPOLIA_PRIVATE_KEY=your-private-key
```

Replace `your-alchemy-api-key` with the API key from Alchemy, and `your-private-key` with your Sepolia wallet's private key.

---

### 5. Running the Project

Start the Django backend server:

```bash
cd backend
python manage.py runserver
```

Use tools like Postman or integrate with a frontend to interact with the backend and smart contracts.

---

## Deployment

- **Smart Contracts**: Deployed using Hardhat on the Ethereum Sepolia Testnet
- **Backend**: Django development server

---

## Acknowledgments

This project was built as part of the Unfold24 Hackathon to showcase the potential of blockchain in secure package delivery systems.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
