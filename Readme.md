# MindMesh QuizCraft - AI-Enhanced Blockchain Quiz Platform

A revolutionary quiz platform that combines AI-generated content with blockchain technology, featuring Verifiable Random Functions (VRF), IPFS storage, and advanced encryption systems.

## Features

- **AI-Generated Quizzes**: Dynamic quiz creation with AI-powered content generation
- **Blockchain Integration**: VRF-based randomness for fair quiz set selection
- **IPFS Storage**: Decentralized storage of quiz attempts and data
- **Advanced Encryption**: Blocklock + AES-256-GCM encryption for data security
- **Real-time VRF**: On-chain randomness generation using Base Sepolia network
- **Fallback Systems**: Robust fallback mechanisms for reliability
- **Modern UI/UX**: Beautiful, responsive interface with dark theme

## Demo

[![Mindmesh AI (YouTube)](https://img.youtube.com/vi/sah-6cwlvy0/0.jpg)](https://youtu.be/sah-6cwlvy0)

## Snaps

<img width="670" alt="Screenshot 2025-09-01 at 2 53 27 AM" src="https://github.com/user-attachments/assets/9346356b-011e-41f5-9298-f23778ae9a5c" />

<img width="670" alt="Screenshot 2025-09-01 at 2 36 47 AM" src="https://github.com/user-attachments/assets/f23cb4bb-eb7b-43c2-b1fa-bb938c6681f1" />

<img width="670" alt="Screenshot 2025-09-01 at 2 37 17 AM" src="https://github.com/user-attachments/assets/ce30a509-0f07-4525-95b1-5c8b71a206c0" />

<img width="670" alt="Screenshot 2025-09-01 at 2 37 36 AM" src="https://github.com/user-attachments/assets/a2fda726-288b-4a75-8c96-822227f11e23" />

<img width="670" alt="Screenshot 2025-09-01 at 2 37 43 AM" src="https://github.com/user-attachments/assets/6c2f6500-67ed-4f30-92aa-eff4f28322b6" />


## Architecture Overview

### Frontend (React + Vite + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Shadcn/ui with Tailwind CSS
- **State Management**: React hooks and context API
- **Wallet Integration**: Wagmi + RainbowKit for Web3 connectivity
- **Blockchain**: Ethers.js for VRF interactions

### Backend (Node.js + Express + Prisma)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth system
- **Encryption**: AES-256-GCM + Blocklock encryption
- **API**: RESTful API with comprehensive endpoints
- **VRF Integration**: Randomness-js library integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Base Sepolia testnet wallet with ETH
- Pinata IPFS account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mindmesh
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mindmesh"

# JWT
JWT_SECRET="your-jwt-secret"

# Blockchain
ALCHEMY_KEY="your-alchemy-key"
RANDOMNESS_CONTRACT_ADDRESS="your-contract-address"

# IPFS
PINATA_API_KEY="your-pinata-api-key"
PINATA_SECRET_KEY="your-pinata-secret-key"
IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs/"
IPFS_API="https://api.pinata.cloud"

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```bash
# API
VITE_API_URL="http://localhost:5000"

# Blockchain
VITE_ALCHEMY_KEY="your-alchemy-key"
VITE_RANDOMNESS_CONTRACT_ADDRESS="your-contract-address"

# Wallet Connect
VITE_WALLET_CONNECT_PROJECT_ID="your-project-id"

# IPFS
VITE_PINATA_API_KEY="your-pinata-api-key"
VITE_PINATA_SECRET_KEY="your-pinata-secret-key"
VITE_IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs/"
VITE_IPFS_API="https://api.pinata.cloud"
```

### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Servers
```bash
# Backend (Terminal 1)
cd server
npm run dev

# Frontend (Terminal 2)
cd client
npm run dev
```

## 🔄 Complete Workflow

### 1. User Authentication & Setup
1. **Wallet Connection**: User connects MetaMask/Rainbow wallet
2. **Authentication**: JWT token generated and stored
3. **Profile Creation**: User profile linked to wallet address
4. **Balance Check**: Verify user has sufficient ETH for VRF transactions

### 2. Quiz Creation Process
1. **AI Content Generation**: 
   - AI generates quiz questions and answers
   - Content is validated and formatted
   - Multiple choice options are created

2. **Question Set Generation**:
   - Server generates 7 question sets (A-G)
   - Each set contains 10 random question indices
   - Sets are stored in database for fallback scenarios

3. **Encryption Process**:
   - Questions encrypted using AES-256-GCM
   - Encryption key managed by Blocklock system
   - Encrypted data stored in database
   - Original questions stored separately (without answers)

4. **Blockchain Integration**:
   - Target block number calculated
   - Quiz scheduled for specific blockchain block
   - VRF contract address and ABI configured

### 3. Quiz Attempt Workflow
1. **User Selection**: User selects quiz from QuizPool
2. **Block Readiness Check**:
   - System verifies if target block has been mined
   - Prevents wasted transaction fees
   - Real-time block status monitoring

3. **VRF Generation**:
   - User initiates VRF transaction
   - Gas fees paid for randomness generation
   - Blockchain contract generates cryptographically secure random number
   - Random number determines question set (A-G)

4. **Quiz Decryption**:
   - Blocklock system decrypts questions
   - Selected question set retrieved
   - Questions presented to user without answers

5. **Fallback System** (if VRF fails):
   - Database fallback: Uses stored question sets
   - Math.random fallback: Generates random questions
   - Ensures quiz availability even if blockchain fails

### 4. Quiz Taking Experience
1. **Question Display**: 
   - Questions shown one at a time
   - Multiple choice options with radio buttons
   - Progress bar and navigation controls
   - 30-minute countdown timer

2. **Answer Tracking**:
   - User answers stored in local state
   - Navigation between questions
   - Answer validation and completion check

3. **Auto-submission**: 
   - Timer-based automatic submission
   - Prevents incomplete quiz attempts

### 5. Submission & Storage
1. **IPFS Upload**:
   - Quiz attempt data prepared
   - Includes: questions, user answers, metadata
   - Data uploaded to Pinata IPFS
   - IPFS hash received and stored

2. **Score Calculation**:
   - User answers compared with correct answers
   - Score calculated as percentage
   - Performance metrics recorded

3. **Database Storage**:
   - Attempt record created in database
   - Links to original quiz and IPFS data
   - User wallet address and metadata stored

### 6. Results & Analytics
1. **Immediate Results**:
   - Score displayed with visual feedback
   - IPFS hash shown with clickable link
   - Performance breakdown available

2. **Dashboard Integration**:
   - Attempted quizzes tab shows all attempts
   - Score history and performance trends
   - IPFS data accessible for verification

## Security Features

### Encryption Layers
- **AES-256-GCM**: Military-grade encryption for quiz data
- **Blocklock**: Advanced key management system
- **JWT Tokens**: Secure authentication
- **Wallet Verification**: Blockchain-based identity verification

### Data Protection
- **No Answer Exposure**: Correct answers never sent to frontend
- **IPFS Privacy**: Encrypted data storage on decentralized network
- **Database Security**: Prisma ORM with parameterized queries
- **Environment Variables**: Sensitive data protected from exposure

## Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
vercel --prod
```

### Backend (Vercel)
```bash
cd server
npm run build
vercel --prod
```

### Environment Variables Setup
1. **Vercel Dashboard**: Add all environment variables
2. **Database**: Use Vercel Postgres or external PostgreSQL
3. **IPFS**: Configure Pinata API keys
4. **Blockchain**: Set Alchemy API key and contract addresses

## Performance Metrics

- **VRF Response Time**: ~2-3 blocks (Base Sepolia)
- **Quiz Loading**: <500ms average
- **IPFS Upload**: <2s for typical quiz data
- **Database Queries**: <100ms response time
- **Frontend Build**: <60s optimized build time

## Troubleshooting

### Common Issues
1. **VRF Transaction Fails**:
   - Check wallet balance
   - Verify network (Base Sepolia)
   - Check contract address

2. **Quiz Decryption Fails**:
   - Verify Blocklock configuration
   - Check encryption keys
   - Use fallback system

3. **IPFS Upload Issues**:
   - Verify Pinata API keys
   - Check network connectivity
   - Validate data format

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge


## Acknowledgments

- **Randomness-js**: For VRF implementation
- **Pinata**: For IPFS storage services
- **Base Network**: For blockchain infrastructure
- **Shadcn/ui**: For beautiful UI components
- **Vercel**: For deployment platform

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Twitter**: [Mithabhashi__](https://x.com/Mithabhashi__)

---

**Built with ❤️ BY Pavan**
