/**
 * Contract Loader
 * 
 * This module dynamically loads the latest Voting contract deployed with Truffle.
 * It reads the contract information from the build files to get the latest address.
 */

// Hardcoded contract address to use if available
const HARDCODED_CONTRACT_ADDRESS = "0x1f7b499e6d2059593f00b3E2b1FcB9DdB4282336";  // Latest deployment on network 5777

// Function to check if a contract exists at the specified address
async function verifyContract(address) {
  try {
    console.log(`Verifying contract at address: ${address}`);
    
    // Create a Web3 instance
    const web3 = new Web3(window.ethereum);
    
    // Check if address has code (if it's a contract)
    const code = await web3.eth.getCode(address);
    
    // If no code is deployed at this address (it's not a contract)
    if (code === '0x' || code === '0x0') {
      console.error(`No contract found at address: ${address}`);
      return false;
    }
    
    console.log(`Contract verified at address: ${address}`);
    return true;
  } catch (error) {
    console.error(`Error verifying contract: ${error.message}`);
    return false;
  }
}

// Function to load the latest contract address
async function loadContractAddress() {
  try {
    // First try connecting to local blockchain (like Ganache)
    try {
      console.log('Checking for local blockchain deployment...');
      
      // Check if Web3 is available
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        
        // Get network ID
        const networkId = await web3.eth.net.getId();
        console.log(`Connected to network ID: ${networkId}`);
        
        // Try to fetch the Voting.json file from the build directory
        const response = await fetch('/build/contracts/Voting.json');
        if (response.ok) {
          const contractData = await response.json();
          
          // Check if contract is deployed to this network
          if (contractData.networks && contractData.networks[networkId] && contractData.networks[networkId].address) {
            const localAddress = contractData.networks[networkId].address;
            console.log(`Found contract address on local network: ${localAddress}`);
            
            // Verify the contract exists
            if (await verifyContract(localAddress)) {
              return localAddress;
            } else {
              console.warn('Contract not found at local address, will try fallback');
            }
          }
        }
        
        console.log('No local deployment found in build files');
      }
    } catch (localError) {
      console.warn('Error checking local blockchain:', localError);
    }
    
    // If local check fails, fall back to hardcoded address
    console.log('Falling back to hardcoded contract address for deployment');
    
    // Verify the hardcoded contract exists before returning it
    if (HARDCODED_CONTRACT_ADDRESS) {
      console.log(`Using hardcoded contract address: ${HARDCODED_CONTRACT_ADDRESS}`);
      
      // Verify the contract exists
      if (await verifyContract(HARDCODED_CONTRACT_ADDRESS)) {
        return HARDCODED_CONTRACT_ADDRESS;
      } else {
        throw new Error('Contract not found at hardcoded address');
      }
    }
    
    throw new Error('No contract address found: neither local nor hardcoded');
  } catch (error) {
    console.error('Error loading contract address:', error);
    
    // Create a dummy contract address that will show the error in UI
    alert('No valid contract found. Please deploy a contract first or update the hardcoded address.');
    return '0x0000000000000000000000000000000000000000';
  }
}

// Load the contract ABI (minimal version for when the full ABI isn't available)
const CONTRACT_ABI = [
  // Admin functions
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingPeriod",
    "outputs": [
      {"name": "startTime", "type": "uint256"},
      {"name": "endTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}, {"type": "uint256"}],
    "name": "setVotingPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCandidates",
    "outputs": [{"type": "tuple[]", "components": [
      {"name": "id", "type": "uint256"},
      {"name": "name", "type": "string"},
      {"name": "party", "type": "string"},
      {"name": "voteCount", "type": "uint256"}
    ]}],
    "stateMutability": "view",
    "type": "function"
  },
  // Basic ERC functions
  {
    "inputs": [],
    "name": "getCandidateCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingStatus",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "getCandidate",
    "outputs": [
      {"type": "string"},
      {"type": "string"},
      {"type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "string"}, {"type": "string"}],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResults",
    "outputs": [{"type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalVotes",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Export the loader function and ABI
window.contractLoader = {
  loadContractAddress,
  CONTRACT_ABI
}; 