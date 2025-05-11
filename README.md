# Blockchain-Based Electoral Management System (BBEMS)

A secure, transparent, and efficient electoral management system built for the Independent Electoral and Boundaries Commission of Kenya, leveraging blockchain technology.

## Key Features

- **Secure Voter Authentication**: National ID verification with blockchain-backed identity validation
- **Immutable Vote Recording**: Blockchain-based voting ensures tamper-proof and transparent elections
- **Real-time Results Tabulation**: Automated counting with verifiable blockchain records
- **Administrative Dashboard**: Comprehensive election management interface for officials
- **Vote Verification**: Individual vote verification through transaction receipts
- **Decentralized Architecture**: Prevents single points of failure and enhances security

## Technology Stack

- **Frontend**: HTML5, CSS3 with Tailwind CSS for responsive design
- **Backend**: Node.js with Express.js for RESTful API services
- **Blockchain**: Ethereum-compatible network (configurable for private or public deployment)
- **Smart Contracts**: Solidity 0.8.17 with secure voting protocols
- **Web3 Integration**: Web3.js for blockchain interaction
- **Authentication**: JWT with National ID verification
- **Database**: Secure storage for non-sensitive data and configuration

## System Requirements

- **Server Requirements**:
  - Modern CPU with 8+ cores
  - 16GB RAM minimum (32GB recommended)
  - 1TB SSD storage
  - 100Mbps+ dedicated network connection

- **Client Requirements**:
  - Modern web browser (Chrome 88+, Firefox 85+, Edge 88+)
  - MetaMask extension (or compatible Web3 wallet)
  - Stable internet connection (1Mbps+)

## Quick Start Guide

1. Install dependencies:
   ```
   npm install
   ```

2. Configure the environment (create a .env file):
   ```
   API_URL=http://localhost:8000
   CONTRACT_ADDRESS=0x1f7b499e6d2059593f00b3E2b1FcB9DdB4282336
   ADMIN_ADDRESS=0x920EF2D034e63705a87830AF873F9256DBFee3FF
   ```

3. Start the full application:
   ```
   npm run start-all
   ```
   
   Or start individual components:
   ```
   npm run start-db-api       # Start the Database API
   npm run deploy-contracts   # Compile and deploy smart contracts
   npm run start-server       # Start the web server
   ```

4. Access the application:
   - Voter Interface: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin.html

## Blockchain Configuration

### Local Development Network

1. Start a local Ethereum node:
   ```
   npx ganache-cli
   ```

2. Deploy contracts to local network:
   ```
   npx truffle migrate --network development
   ```

3. Configure MetaMask:
   - **Network Name**: IEBC Development
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

### Production Deployment

1. Deploy contracts to the production network:
   ```
   npx truffle migrate --network production
   ```

2. Configure MetaMask:
   - **Network Name**: IEBC Voting Network
   - **RPC URL**: [Provided by administrator]
   - **Chain ID**: [Provided by administrator]
   - **Currency Symbol**: ETH
   
## System Architecture

BBEMS employs a three-tier architecture:

1. **Presentation Tier**: Web-based interfaces for voters and administrators
2. **Application Tier**: Node.js backend services and business logic
3. **Data Tier**: Ethereum blockchain for vote storage with database for authentication

The system ensures:
- End-to-end security through encryption and blockchain immutability
- Scalability through optimized smart contracts and load-balanced services
- Redundancy and fault tolerance at each architectural level

## Documentation

Comprehensive documentation is available in the `/documentation` directory:

- **User Guide**: Complete instructions for voters
- **Administrator Guide**: Detailed guide for election officials
- **System Overview**: Technical architecture and design documents
- **Test Plan**: Comprehensive testing methodology and procedures

### Viewing Documentation

For the best experience, navigate to the `/documentation/html_output` directory and open `index.html` in your web browser for a complete listing of all available documentation.

### Converting Documentation to PDF

To convert the documentation to PDF format:

1. Navigate to the `/documentation/scripts` directory
2. Run the appropriate conversion script:
   - Windows: `convert_to_pdf.bat`
   - Linux/macOS: `./convert_to_pdf.sh`

This will generate HTML and PDF versions of all documentation files (requires Pandoc and wkhtmltopdf for PDF generation).

## Support and Contact

For technical support or inquiries:
- Email: eliudsamwels7@gmail.com
- Phone: +254 705893137

## License

This system is proprietary and is licensed exclusively to the Independent Electoral and Boundaries Commission of Kenya.

© 2025 Independent Electoral and Boundaries Commission of Kenya. All rights reserved.