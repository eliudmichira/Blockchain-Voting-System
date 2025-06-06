/**
 * config.js - Blockchain Voting Application Configuration
 * 
 * This file contains all configuration parameters for the application,
 * including network settings, contract details, and UI preferences.
 */

const CONFIG = {
    // Blockchain Network Configuration
    NETWORK: {
        CHAIN_ID: 5777,  // Local Ganache Network
        NAME: 'Ganache Local',
        RPC_URL: 'http://127.0.0.1:7545',
        BLOCK_EXPLORER: ''
    },

    // Smart Contract Configuration
    CONTRACT: {
        ADDRESS: '0xd7bA4926e7BaD1848AfF6Ba881F8F937D82cf11f', // Updated to match actual deployed contract
        GAS_LIMIT: 500000,
        ABI: [
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
                        "name": "candidateId",
                        "type": "uint256"
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
                        "name": "party",
                        "type": "string"
                    }
                ],
                "name": "CandidateAdded",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "startTime",
                        "type": "uint256"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "endTime",
                        "type": "uint256"
                    }
                ],
                "name": "VotingPeriodSet",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "voter",
                        "type": "address"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint256",
                        "name": "candidateId",
                        "type": "uint256"
                    }
                ],
                "name": "VoteSubmitted",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_party",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_imageUrl",
                        "type": "string"
                    }
                ],
                "name": "addCandidate",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllCandidatesWithVotes",
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
                                "name": "name",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "party",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "imageUrl",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "voteCount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct VotingSystem.Candidate[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getVotingPeriod",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
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
                "name": "isVotingActive",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "isVotingPeriodSet",
                "outputs": [
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
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
                        "name": "_startTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_endTime",
                        "type": "uint256"
                    }
                ],
                "name": "setVotingPeriod",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_candidateId",
                        "type": "uint256"
                    }
                ],
                "name": "vote",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
    },

    // Admin Configuration
    ADMIN: {
        // We'll check ownership from the contract itself rather than hardcoding addresses
        USE_CONTRACT_OWNER: true
    },

    // UI Configuration
    UI: {
        DEFAULT_IMAGE: 'https://via.placeholder.com/150',
        THEME: {
            DARK_MODE_KEY: 'voting-dark-mode',
            DEFAULT_THEME: 'light'
        },
        REFRESH_INTERVAL: 30000 // Auto-refresh data every 30 seconds
    },

    // Logging and Debug Configuration
    DEBUG: {
        ENABLED: true,
        LEVEL: 'info',
        MAX_LOGS: 100
    }
};

// Define your configuration first
const ConfigService = {
  // Your existing ConfigService implementation
  getApiUrl: function() {
    return localStorage.getItem('apiUrl') || 'http://localhost:8000';
  },
  // ...other methods
};

// Export it for other modules
window.ConfigService = ConfigService;

export default CONFIG;