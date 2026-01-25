# Blockchain-Based Vehicle Service History Verification

A decentralized solution for maintaining tamper-proof vehicle service records using Ethereum blockchain technology.

## 🎯 Problem Statement

In the used car market, buyers face significant challenges:
- **Odometer fraud** - Mileage tampering costs billions annually
- **Hidden service history** - Sellers can conceal poor maintenance
- **Document forgery** - Paper records are easily manipulated
- **Lack of trust** - No reliable way to verify service claims

**Our Solution:** Blockchain-based immutable service history that prevents fraud and builds trust.

---

## 🏗️ System Architecture

### Components

1. **Smart Contract** - `VehicleServiceHistory.sol`
   - Stores service records on-chain
   - Manages authorized service centers
   - Enforces access control

2. **Service Centers** - Authorized entities that add records
3. **Buyers/Public** - Anyone can verify vehicle history

### Key Features

 **Immutability** - Records cannot be modified or deleted  
 **Transparency** - Anyone can verify service history  
 **Access Control** - Only authorized centers can add records  
 **Decentralization** - No single point of failure  
 **Fraud Prevention** - Cryptographic validation prevents tampering  

---

## 🔒 Cybersecurity Benefits

### 1. Data Integrity
- **Cryptographic Hashing** - Each record is hashed and stored on blockchain
- **Immutability** - Once written, data cannot be altered
- **Merkle Tree Structure** - Tampering with any record invalidates the chain

### 2. Access Control
- **Role-Based Permissions** - Only owner can authorize service centers
- **Authentication** - Blockchain addresses provide identity verification
- **Authorization** - Smart contract enforces who can write data

### 3. Fraud Prevention
- **Tamper-Proof Records** - Blockchain consensus prevents unauthorized changes
- **Audit Trail** - All transactions are permanently logged with timestamps
- **Public Verification** - Anyone can independently verify authenticity

### 4. Decentralized Trust
- **No Central Authority** - Distributed network eliminates single point of control
- **Byzantine Fault Tolerance** - System works even if some nodes fail
- **Transparency** - All operations are visible on the blockchain

---

## 🛠️ Technology Stack

- **Blockchain Platform:** Ethereum
- **Smart Contract Language:** Solidity ^0.8.19
- **Development Framework:** Hardhat
- **Testing Framework:** Mocha + Chai
- **JavaScript Library:** Ethers.js
- **Node.js:** v20+

---

## 📦 Installation & Setup

### Prerequisites

```bash
node --version  # v20 or higher
npm --version   # v10 or higher
```

### Install Dependencies

```bash
npm install
```

### Compile Smart Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

Expected output: `22 passing`

---

## 🚀 Usage

### Step 1: Start Local Blockchain

In Terminal 1:
```bash
npx hardhat node
```

This starts a local Ethereum network with 20 funded test accounts.

### Step 2: Deploy Contract

In Terminal 2:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Output:
```
✅ Contract deployed successfully!
📍 Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 3: Run Demo

```bash
npx hardhat run scripts/interact.js --network localhost
```

This demonstrates:
1. Adding authorized service centers
2. Creating service records
3. Retrieving vehicle history
4. Testing security features

---


The project includes comprehensive tests covering:

### Deployment Tests
-  Owner initialization
-  Initial state verification

### Service Center Management
-  Adding service centers
-  Removing service centers
-  Event emissions
-  Access control (only owner)
-  Validation (empty names, duplicates)

### Service Records
-  Adding records by authorized centers
-  Blocking unauthorized centers
-  Data validation (empty IDs, zero mileage)
-  Correct data storage
-  Multiple records per vehicle

### Service History Retrieval
-  Public access to history
-  Complete history retrieval
-  Empty vehicle queries
-  Record counting
-  Index-based access
-  Bounds checking

### Security & Immutability
-  Record immutability verification
-  Service center tracking
-  Timestamp validation

**Total: 22 Tests - All Passing **

---

## 🔐 Security Features Demonstrated

### 1. Access Control
```
🚫 Test: Unauthorized service center tries to add record
✅ BLOCKED: Unauthorized access prevented
```

### 2. Data Validation
```
🚫 Test: Trying to add record with zero mileage
✅ BLOCKED: Invalid data rejected
```

### 3. Immutability
```
✅ Records are immutable - cannot be modified once written
✅ All changes are permanently recorded on blockchain
```

---

## 📈 Use Cases

### 1. Used Car Purchase
- **Buyer** verifies complete service history before purchase
- **Seller** proves vehicle maintenance with tamper-proof records
- **Trust** established without intermediaries

### 2. Insurance Claims
- **Insurance companies** verify accident/repair history
- **Fraud detection** becomes easier with transparent records
- **Claims processing** faster with verified data

### 3. Fleet Management
- **Companies** track maintenance across vehicle fleets
- **Compliance** with service schedules automatically verified
- **Resale value** increased with proven maintenance records

### 4. Warranty Verification
- **Manufacturers** verify authorized service work
- **Warranty claims** processed faster with blockchain proof
- **Service quality** tracked across service centers

---


## 🎓 Learning Outcomes

This project demonstrates understanding of:

1. **Blockchain Fundamentals**
   - Distributed ledger technology
   - Consensus mechanisms
   - Cryptographic security

2. **Smart Contract Development**
   - Solidity programming
   - State management
   - Event handling

3. **Cybersecurity Principles**
   - Access control
   - Data integrity
   - Fraud prevention
   - Decentralized trust

4. **Software Development**
   - Testing methodologies
   - Deployment strategies
   - Documentation practices

---



