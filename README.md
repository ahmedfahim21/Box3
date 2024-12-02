# **Box3**

**Box3** is a cutting-edge solution combining IoT, RFID technology, blockchain-powered smart contracts, and modern web/mobile applications to create a secure, decentralized package authentication system.

---

## **Overview**

**Box3** leverages RFID technology and blockchain to ensure package authenticity and traceability. By integrating IoT devices like Raspberry Pi, RFID cards/readers, and platforms like Sui for decentralized smart contracts, **Box3** provides an innovative approach to secure package management. The project also includes user-friendly web and mobile interfaces for seamless interactions.

---

## **System Architecture**

![WhatsApp Image 2024-12-02 at 06 55 03_67043e85](https://github.com/user-attachments/assets/07511f60-c2f1-480a-81ac-85d037859c5b)


### **Core Components**

1. **RFID Technology:**

   - Taps RFID cards to capture and store package information.
   - Enables secure data writing and reading.

2. **Raspberry Pi & Django Backend:**

   - Acts as the central hub for data processing and verification.
   - Communicates with RFID readers and external verification systems.

3. **Blockchain (Sui):**

   - Stores verification data immutably.
   - Executes decentralized smart contracts for package authentication.

4. **Web App (Next.js):**

   - Facilitates RFID and package verification.
   - Allows package image capture for demo purposes.

5. **Mobile App (Flutter):**

   - Provides a secure interface for users to interact with the system.
   - Supports execution of blockchain functions via the Node.js bridge.

6. **External Verification (Galadriel):**
   - Validates package authenticity through external checks.

---

## **Features**

- **Secure RFID Authentication:** Tamper-proof verification using RFID technology.
- **Decentralized Storage:** Immutability ensured through blockchain (Sui).
- **Cross-Platform Accessibility:** Web (Next.js) and mobile (Flutter) applications.
- **IoT Integration:** Seamless connection between hardware and software components.
- **Smart Contract Automation:** Decentralized logic for package tracking and validation.

---

## **Technologies Used**

| **Component**  | **Technology**     |
| -------------- | ------------------ |
| **Web3 Wallet**| Okto               |
| **IoT**        | RFID, Raspberry Pi |
| **Backend**    | Django             |
| **Web App**    | Next.js            |
| **Mobile App** | Flutter            |
| **Blockchain** | Crosschain across Base + Sui|
| **Middleware** | Node.js            |

---

## **Installation**

### **1. Prerequisites**

- **Hardware:** Raspberry Pi with an RFID receiver.
- **Software:**
  - Python, Node.js, npm
  - Flutter SDK
  - Sui account setup

### **2. Clone the Repository**

```bash
git clone https://github.com/imApoorva36/Box3.git
cd Box3
```

### **3. Backend Setup (Django)**

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Django server:
   ```bash
   python manage.py runserver
   ```

### **4. Web App Setup (Next.js)**

1. Navigate to the web folder:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### **5. Mobile App Setup (Flutter)**

1. Open the Flutter project in your preferred IDE.
2. Run the app:
   ```bash
   flutter run
   ```

### **6. Node.js Bridge**

1. Navigate to the bridge folder:
   ```bash
   cd node-bridge
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js bridge:
   ```bash
   node app.js
   ```

---

## **Usage**

1. **Tap RFID Cards:**

   - Use the RFID receiver to scan package information.

2. **Authenticate via Web/Mobile App:**

   - Access the web app or mobile app to verify package data in real-time.

3. **Blockchain Execution:**
   - Track verification status and execute smart contracts securely through the mobile app.

---

## **Contributing**

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository:
   ```bash
   git fork https://github.com/imApoorva36/Box3.git
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## **License**

This project is licensed under the [MIT License](LICENSE).
