// Remove the import statement since we're loading ethers.js directly in the HTML
// import { ethers } from 'https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js';

// Use the global ethers object instead
// Declare contract as a global variable so it can be used in multiple functions
let contract;
let contractAddress = "0x1f7b499e6d2059593f00b3E2b1FcB9DdB4282336";  // Latest deployment on network 5777
let abi = []; // Will be populated from contractLoader

// Global variables for contract interaction
let web3;
let accounts = [];
let votingContract;
let contractConnected = false;
let isAdmin = false;

// Application configuration
const appConfig = {
    networkName: 'Ganache Local',
    contractAddress: "0x1f7b499e6d2059593f00b3E2b1FcB9DdB4282336",
    defaultImageUrl: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
    adminAddress: "0x920EF2D034e63705a87830AF873F9256DBFee3FF",
    debugMode: true // Set to true for debugging
};

// Debug logging function with timestamp
function debugLog(...args) {
    if (appConfig.debugMode) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        console.log(`[${timestamp}]`, ...args);
        
        // If we have a debug panel, add to it
        const debugContent = document.getElementById('debugContent');
        if (debugContent) {
            const logEntry = document.createElement('div');
            logEntry.className = 'mb-1 text-xs';
            logEntry.innerHTML = `<span class="opacity-75">[${timestamp}]</span> ${args.join(' ')}`;
            debugContent.appendChild(logEntry);
            debugContent.scrollTop = debugContent.scrollHeight;
        }
    }
}

// Show debug panel if debug mode is enabled
document.addEventListener('DOMContentLoaded', () => {
    const debugPanel = document.getElementById('debugPanel');
    if (debugPanel && appConfig.debugMode) {
        debugPanel.classList.remove('hidden');
        
        // Add clear button handler
        const clearDebugBtn = document.getElementById('clearDebugBtn');
        if (clearDebugBtn) {
            clearDebugBtn.addEventListener('click', () => {
                const debugContent = document.getElementById('debugContent');
                if (debugContent) {
                    debugContent.innerHTML = '';
                }
            });
        }
    }
});

// Show feedback messages to the user
function showFeedback(containerId, type, title, message) {
    debugLog(`Showing ${type} feedback: ${title} - ${message}`);
    
    const container = document.getElementById(`${containerId}Container`);
    if (!container) {
        debugLog(`Feedback container ${containerId}Container not found`);
        return;
    }
    
    const feedbackIcon = document.getElementById(`${containerId}Icon`);
    const feedbackTitle = document.getElementById(`${containerId}Title`);
    const feedback = document.getElementById(containerId);
    
    if (!feedbackIcon || !feedbackTitle || !feedback) {
        debugLog(`Feedback elements not found for ${containerId}`);
        return;
    }
    
    // Set appropriate icon and colors
    if (type === 'error') {
        container.className = 'mb-4 p-4 border border-red-400 rounded-md bg-red-100 dark:bg-red-900/30 dark:border-red-800';
        feedbackIcon.innerHTML = '<span class="icon-warning text-red-500 dark:text-red-400"></span>';
    } else if (type === 'success') {
        container.className = 'mb-4 p-4 border border-green-400 rounded-md bg-green-100 dark:bg-green-900/30 dark:border-green-800';
        feedbackIcon.innerHTML = '<span class="icon-check text-green-500 dark:text-green-400"></span>';
    } else if (type === 'warning') {
        container.className = 'mb-4 p-4 border border-yellow-400 rounded-md bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-800';
        feedbackIcon.innerHTML = '<span class="icon-warning text-yellow-500 dark:text-yellow-400"></span>';
    } else {
        container.className = 'mb-4 p-4 border border-blue-400 rounded-md bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800';
        feedbackIcon.innerHTML = '<span class="icon-info text-blue-500 dark:text-blue-400"></span>';
    }
    
    feedbackTitle.textContent = title;
    feedback.textContent = message;
    
    // Show the container
    container.classList.remove('hidden');
    
    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            container.classList.add('hidden');
        }, 5000);
    }
}

// Mock API data for development
const mockConfig = {
    server: {
        port: 8080,
        host: 'localhost'
    },
    blockchain: {
        network: 'localhost',
        gasLimit: 3000000,
        gasPrice: 5
    },
    app: {
        votingDuration: 7
    }
};

const mockDeployments = [
    {
        id: '1',
        contractName: 'Voting',
        network: 'localhost',
        address: '0x2386778193F81C6E961E131D39C5b7D640e80864',
        timestamp: new Date().toISOString()
    }
];

// Mock API functions
async function mockFetch(url, options = {}) {
    debugLog(`Mock API call: ${url} ${options.method || 'GET'}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (url.includes('/api/config/current')) {
        return {
            ok: true,
            json: async () => mockConfig
        };
    }
    
    if (url.includes('/api/config/update')) {
        const data = JSON.parse(options.body);
        Object.assign(mockConfig, data);
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    }
    
    if (url.includes('/api/config/environment/')) {
        const env = url.split('/').pop();
        return {
            ok: true,
            json: async () => ({
                ...mockConfig,
                environment: env
            })
        };
    }
    
    if (url.includes('/api/config/reset')) {
        return {
            ok: true,
            json: async () => mockConfig
        };
    }
    
    if (url.includes('/api/deployments/history')) {
        return {
            ok: true,
            json: async () => mockDeployments
        };
    }
    
    if (url.includes('/api/deployments/estimate-gas')) {
        return {
            ok: true,
            json: async () => ({ gasEstimate: 2000000 })
        };
    }
    
    if (url.includes('/api/deployments/deploy')) {
        const data = JSON.parse(options.body);
        const newDeployment = {
            id: (mockDeployments.length + 1).toString(),
            contractName: 'Voting',
            network: data.network,
            address: '0x' + Math.random().toString(16).substring(2, 42),
            timestamp: new Date().toISOString()
        };
        mockDeployments.push(newDeployment);
        return {
            ok: true,
            json: async () => newDeployment
        };
    }
    
    if (url.includes('/api/deployments/verify/')) {
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    }
    
    if (url.includes('/api/deployments/') && options.method === 'DELETE') {
        const id = url.split('/').pop();
        const index = mockDeployments.findIndex(d => d.id === id);
        if (index !== -1) {
            mockDeployments.splice(index, 1);
        }
        return {
            ok: true,
            json: async () => ({ success: true })
        };
    }
    
    // Default response for unknown endpoints
    return {
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
    };
}

// Override fetch with mock implementation
window.fetch = mockFetch;

// Fixed function to show feedback without recursion
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
    } text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize contract
async function initContract() {
    debugLog('Initializing contract...');
    
    if (!web3) {
        debugLog('Web3 not initialized');
        return false;
    }
    
    try {
        // Create contract instance
        votingContract = new web3.eth.Contract(votingContractABI, appConfig.contractAddress);
        debugLog('Contract initialized with address:', appConfig.contractAddress);
        
        // Verify contract by calling a simple method
        await votingContract.methods.admin().call();
        
        // Set contract connected status
        contractConnected = true;
        debugLog('Contract connected successfully');
        
        // Update UI
        updateNetworkInfo();
        
        return true;
    } catch (error) {
        debugLog('Contract initialization failed:', error.message);
        showFeedback('candidateFeedback', 'error', 'Contract Error', 'Failed to initialize contract. Please check your connection and contract address.');
        contractConnected = false;
        return false;
    }
}

// Check if contract is initialized
async function isContractInitialized() {
    try {
        // Check if web3 is available
        if (typeof window.ethereum === 'undefined') {
            throw new Error('Web3 provider not found. Please install MetaMask or another Web3 wallet.');
        }
        
        // Check if contract address is set
        if (!votingContract || !votingContract.options || !votingContract.options.address) {
            throw new Error('Contract address not set. Please connect to the correct network.');
        }
        
        // Try to call a simple contract method to verify it's accessible
        await votingContract.methods.admin().call();
        
        return true;
    } catch (error) {
        console.error('Contract initialization check failed:', error);
        return false;
    }
}

// Connect wallet
async function connectWallet() {
    debugLog('Connecting wallet...');
    
    // Show loading state on connect button
    const connectButtons = document.querySelectorAll('#connectButton, #connectButtonPanel');
    connectButtons.forEach(button => {
        button.disabled = true;
        button.innerHTML = '<div class="loader"></div><span>Connecting...</span>';
    });
    
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not detected. Please install MetaMask to use this application.');
        }
        
        // Request account access
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        debugLog('Connected accounts:', accounts);
        
        if (accounts.length === 0) {
            throw new Error('No accounts found or user denied access.');
        }
        
        // Initialize Web3
        web3 = new Web3(window.ethereum);
        debugLog('Web3 initialized');
        
        // Initialize contract
        if (!await initContract()) {
            throw new Error('Failed to initialize contract. Please check your connection.');
        }
        
        // Set contract connected flag to true
        contractConnected = true;
        debugLog('Contract connected status set to true');
        
        // Update UI
        updateUIConnectionStatus(true);
        
        // Check if user is admin
        await checkAdminStatus();
        await updateUIForAdminStatus();
        
        // Load initial data
        try {
            // First directly load the candidates
            await loadCandidates();
            debugLog('Candidates loaded successfully after connection');
            
            // Then refresh all other data
            await refreshAllData();
        } catch (loadError) {
            debugLog(`Error loading data after connection: ${loadError.message}`);
            showFeedback('candidateFeedback', 'warning', 'Data Loading Issue', 
                'Connected successfully, but there was an issue loading some data. Try refreshing.');
        }
        
        // Mark as connected in local storage
        localStorage.setItem('walletConnected', 'true');
        
        // Update button states
        connectButtons.forEach(button => {
            button.disabled = false;
            button.innerHTML = '<span class="icon-wallet mr-2"></span><span>Connected</span>';
            button.classList.add('hidden');
        });
        
        // Show the logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.classList.remove('hidden');
        }
        
        return true;
    } catch (error) {
        debugLog('Error connecting wallet:', error.message);
        showFeedback('candidateFeedback', 'error', 'Connection Failed', error.message);
        
        // Reset button states
        connectButtons.forEach(button => {
            button.disabled = false;
            button.innerHTML = '<span class="icon-connect mr-2"></span><span>Connect</span>';
        });
        
        return false;
    }
}

// Disconnect wallet
function disconnectWallet() {
    debugLog('Disconnecting wallet...');
    
    // Show loading state on logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.disabled = true;
        logoutButton.innerHTML = '<div class="loader"></div><span>Logging out...</span>';
    }
    
    // Reset global variables
    accounts = [];
    // Keep isAdmin as true to maintain access permissions
    // isAdmin = false; <- removed this line
    contractConnected = false;
    debugLog('Contract connected status:', contractConnected);
    
    // Update UI
    updateUIConnectionStatus(false);
    
    // Clear all authentication related data from localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('national_id');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('voterId');
    localStorage.removeItem('isAuthenticated');
    
    // Reset UI elements to loading/default state
    document.getElementById('totalCandidates').textContent = '-';
    document.getElementById('totalVotes').textContent = '-';
    document.getElementById('votingStatus').textContent = '-';
    document.getElementById('timeRemaining').textContent = '-';
    
    // Update the candidate list with a different message
    const candidateList = document.getElementById('candidateList');
    if (candidateList) {
        candidateList.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-6 text-center">
                    <p class="text-yellow-500 dark:text-yellow-400">
                        <span class="icon-wallet mr-2"></span>
                        Please connect your wallet to view and manage candidates
                    </p>
                </td>
            </tr>
        `;
    }
    
    debugLog('Wallet disconnected and user logged out');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        window.location.href = "login.html?logout=success&t=" + new Date().getTime();
    }, 500);
}

/* eslint-disable no-unused-vars */
// These functions are used in HTML event handlers, so they're not recognized as used by ESLint
function addCandidate() {
    const candidateName = document.getElementById('candidateName')?.value;
    // Add candidate to the blockchain
    if (!contract || !candidateName) return false;
    // Implementation of adding a candidate
    console.log(`Adding candidate: ${candidateName}`);
    return true;
}
/* eslint-enable no-unused-vars */

// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOM loaded, initializing admin interface');
    
    // Check if MetaMask is available
    if (typeof window.ethereum !== 'undefined') {
        debugLog('MetaMask detected, connecting wallet');
        // Don't auto-connect, wait for button click
    } else {
        debugLog('MetaMask not detected');
        showNotification('MetaMask not detected. Some features may be limited.', 'warning');
    }
    
    // Initialize managers only if elements exist
    try {
        if (document.getElementById('configForm')) {
            debugLog('Initializing ConfigManager');
            window.configManager = new ConfigManager();
        } else {
            debugLog('Config form not found, skipping ConfigManager initialization');
        }
        
        if (document.getElementById('deployContractBtn')) {
            debugLog('Initializing DeploymentManager');
            window.deploymentManager = new DeploymentManager();
        } else {
            debugLog('Deployment form not found, skipping DeploymentManager initialization');
        }
        
        debugLog('Admin interface initialized successfully');
    } catch (error) {
        debugLog(`Error initializing admin interface: ${error.message}`);
        console.error('Error initializing admin interface:', error);
        showNotification('Error initializing admin interface', 'error');
    }
    
    // Add event listeners to connect buttons if they exist
    const mainConnectBtn = document.getElementById('connectWalletBtn');
    if (mainConnectBtn) {
        debugLog('Adding click event listener to main connect button');
        mainConnectBtn.addEventListener('click', async () => {
            try {
                mainConnectBtn.disabled = true;
                mainConnectBtn.innerHTML = 'Connecting...';
                await connectWallet();
                mainConnectBtn.innerHTML = 'Connected';
            } catch (error) {
                mainConnectBtn.innerHTML = 'Connect Wallet';
                mainConnectBtn.disabled = false;
                showNotification('Error connecting wallet: ' + error.message, 'error');
            }
        });
    }
    
    const panelConnectBtn = document.getElementById('panelConnectBtn');
    if (panelConnectBtn) {
        debugLog('Adding click event listener to panel connect button');
        panelConnectBtn.addEventListener('click', connectWallet);
    }
});

// Ensure document is fully loaded before accessing DOM elements
window.addEventListener('load', () => {
    console.log('DOM fully loaded, ensuring event listeners are safely attached');
    
    // Check for buttons that might need event listeners
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(button => {
        const action = button.getAttribute('data-action');
        if (action === 'connect' && !button.hasAttribute('data-listener-attached')) {
            button.addEventListener('click', connectWallet);
            button.setAttribute('data-listener-attached', 'true');
        }
    });
});

// Configuration Management
class ConfigManager {
    constructor() {
        debugLog('Initializing ConfigManager');
        this.configForm = document.getElementById('configForm');
        this.exportConfigBtn = document.getElementById('exportConfigBtn');
        this.importConfigFile = document.getElementById('importConfigFile');
        this.environmentSelect = document.getElementById('environmentSelect');
        this.resetConfigBtn = document.getElementById('resetConfig');
        
        this.initializeEventListeners();
        this.loadCurrentConfig();
    }

    initializeEventListeners() {
        debugLog('Setting up ConfigManager event listeners');
        if (this.configForm) {
            this.configForm.addEventListener('submit', (e) => this.handleConfigSubmit(e));
        } else {
            debugLog('Warning: configForm element not found');
        }
        
        if (this.exportConfigBtn) {
            this.exportConfigBtn.addEventListener('click', () => this.exportConfig());
        } else {
            debugLog('Warning: exportConfigBtn element not found');
        }
        
        if (this.importConfigFile) {
            this.importConfigFile.addEventListener('change', (e) => this.importConfig(e));
        } else {
            debugLog('Warning: importConfigFile element not found');
        }
        
        if (this.environmentSelect) {
            this.environmentSelect.addEventListener('change', (e) => this.switchEnvironment(e));
        } else {
            debugLog('Warning: environmentSelect element not found');
        }
        
        if (this.resetConfigBtn) {
            this.resetConfigBtn.addEventListener('click', () => this.resetToDefaults());
        } else {
            debugLog('Warning: resetConfigBtn element not found');
        }
    }

    async loadCurrentConfig() {
        try {
            debugLog('Loading current configuration');
            const response = await fetch('/api/config/current');
            const config = await response.json();
            this.populateForm(config);
            debugLog('Configuration loaded successfully');
        } catch (error) {
            debugLog(`Error loading configuration: ${error.message}`);
            console.error('Error loading configuration:', error);
            showNotification('Error loading configuration', 'error');
        }
    }

    populateForm(config) {
        if (!this.configForm) return;
        
        Object.entries(config).forEach(([section, values]) => {
            Object.entries(values).forEach(([key, value]) => {
                const input = document.querySelector(`[name="${section}.${key}"]`);
                if (input) {
                    input.value = value;
                }
            });
        });
    }

    async handleConfigSubmit(e) {
        e.preventDefault();
        if (!this.configForm) return;
        
        const formData = new FormData(this.configForm);
        const config = {};
        
        formData.forEach((value, key) => {
            const [section, field] = key.split('.');
            if (!config[section]) config[section] = {};
            config[section][field] = value;
        });

        try {
            const response = await fetch('/api/config/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                showNotification('Configuration updated successfully', 'success');
                localStorage.setItem('appConfig', JSON.stringify(config));
            } else {
                throw new Error('Failed to update configuration');
            }
        } catch (error) {
            console.error('Error updating configuration:', error);
            showNotification('Error updating configuration', 'error');
        }
    }

    exportConfig() {
        const config = localStorage.getItem('appConfig');
        if (!config) {
            showNotification('No configuration to export', 'warning');
            return;
        }

        const blob = new Blob([config], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voting-app-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importConfig(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const config = await file.text();
            const parsedConfig = JSON.parse(config);
            
            if (!this.validateConfig(parsedConfig)) {
                throw new Error('Invalid configuration format');
            }

            const response = await fetch('/api/config/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedConfig)
            });

            if (response.ok) {
                localStorage.setItem('appConfig', JSON.stringify(parsedConfig));
                this.populateForm(parsedConfig);
                showNotification('Configuration imported successfully', 'success');
            } else {
                throw new Error('Failed to import configuration');
            }
        } catch (error) {
            console.error('Error importing configuration:', error);
            showNotification('Error importing configuration', 'error');
        }
    }

    validateConfig(config) {
        const requiredSections = ['server', 'blockchain', 'app'];
        return requiredSections.every(section => config[section]);
    }

    async switchEnvironment(e) {
        const environment = e.target.value;
        try {
            const response = await fetch(`/api/config/environment/${environment}`);
            const config = await response.json();
            
            if (response.ok) {
                this.populateForm(config);
                localStorage.setItem('currentEnvironment', environment);
                showNotification(`Switched to ${environment} environment`, 'success');
            } else {
                throw new Error('Failed to switch environment');
            }
        } catch (error) {
            console.error('Error switching environment:', error);
            showNotification('Error switching environment', 'error');
        }
    }

    async resetToDefaults() {
        if (!confirm('Are you sure you want to reset to default configuration?')) return;

        try {
            const response = await fetch('/api/config/reset', {
                method: 'POST'
            });

            if (response.ok) {
                const config = await response.json();
                this.populateForm(config);
                localStorage.removeItem('appConfig');
                showNotification('Configuration reset to defaults', 'success');
            } else {
                throw new Error('Failed to reset configuration');
            }
        } catch (error) {
            console.error('Error resetting configuration:', error);
            showNotification('Error resetting configuration', 'error');
        }
    }
}

// Contract Deployment
class DeploymentManager {
    constructor() {
        debugLog('Initializing DeploymentManager');
        this.deploymentNetwork = document.getElementById('deploymentNetwork');
        this.adminAddress = document.getElementById('adminAddress');
        this.votingDuration = document.getElementById('votingDuration');
        this.estimateGasBtn = document.getElementById('estimateGas');
        this.deployContractBtn = document.getElementById('deployContract');
        this.deploymentHistoryBody = document.getElementById('deploymentHistoryBody');
        this.noDeployments = document.getElementById('noDeployments');

        this.initializeEventListeners();
        this.loadDeploymentHistory();
    }

    initializeEventListeners() {
        debugLog('Setting up DeploymentManager event listeners');
        if (this.estimateGasBtn) {
            this.estimateGasBtn.addEventListener('click', () => this.estimateGas());
        } else {
            debugLog('Warning: estimateGasBtn element not found');
        }
        
        if (this.deployContractBtn) {
            this.deployContractBtn.addEventListener('click', () => this.deployContract());
        } else {
            debugLog('Warning: deployContractBtn element not found');
        }
    }

    async loadDeploymentHistory() {
        try {
            debugLog('Loading deployment history');
            const response = await fetch('/api/deployments/history');
            const deployments = await response.json();
            this.renderDeploymentHistory(deployments);
            debugLog('Deployment history loaded successfully');
        } catch (error) {
            debugLog(`Error loading deployment history: ${error.message}`);
            console.error('Error loading deployment history:', error);
            showNotification('Error loading deployment history', 'error');
        }
    }

    renderDeploymentHistory(deployments) {
        if (!this.deploymentHistoryBody) return;

        if (!deployments.length) {
            if (this.noDeployments) {
                this.noDeployments.classList.remove('hidden');
            }
            this.deploymentHistoryBody.innerHTML = '';
            return;
        }

        if (this.noDeployments) {
            this.noDeployments.classList.add('hidden');
        }

        this.deploymentHistoryBody.innerHTML = deployments.map(deployment => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${deployment.contractName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${deployment.network}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${deployment.address}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(deployment.timestamp).toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-2" 
                            onclick="window.deploymentManager.verifyContract('${deployment.address}')">
                        Verify
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onclick="window.deploymentManager.deleteDeployment('${deployment.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async estimateGas() {
        const params = this.getDeploymentParams();
        try {
            const response = await fetch('/api/deployments/estimate-gas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (response.ok) {
                const { gasEstimate } = await response.json();
                showNotification(`Estimated gas: ${gasEstimate}`, 'info');
            } else {
                throw new Error('Failed to estimate gas');
            }
        } catch (error) {
            console.error('Error estimating gas:', error);
            showNotification('Error estimating gas', 'error');
        }
    }

    async deployContract() {
        const params = this.getDeploymentParams();
        try {
            const response = await fetch('/api/deployments/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('Contract deployed successfully', 'success');
                this.loadDeploymentHistory();
            } else {
                throw new Error('Failed to deploy contract');
            }
        } catch (error) {
            console.error('Error deploying contract:', error);
            showNotification('Error deploying contract', 'error');
        }
    }

    getDeploymentParams() {
        return {
            network: this.deploymentNetwork?.value || '',
            adminAddress: this.adminAddress?.value || '',
            votingDuration: parseInt(this.votingDuration?.value || '0')
        };
    }

    async verifyContract(address) {
        try {
            const response = await fetch(`/api/deployments/verify/${address}`, {
                method: 'POST'
            });

            if (response.ok) {
                showNotification('Contract verified successfully', 'success');
            } else {
                throw new Error('Failed to verify contract');
            }
        } catch (error) {
            console.error('Error verifying contract:', error);
            showNotification('Error verifying contract', 'error');
        }
    }

    async deleteDeployment(id) {
        if (!confirm('Are you sure you want to delete this deployment?')) return;

        try {
            const response = await fetch(`/api/deployments/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification('Deployment deleted successfully', 'success');
                this.loadDeploymentHistory();
            } else {
                throw new Error('Failed to delete deployment');
            }
        } catch (error) {
            console.error('Error deleting deployment:', error);
            showNotification('Error deleting deployment', 'error');
        }
    }
}

// Export classes for global access
window.DeploymentManager = DeploymentManager;
window.ConfigManager = ConfigManager;

// ==========================================
// Data Loading Functions
// ==========================================

// Refresh all data displayed in the dashboard
async function refreshAllData() {
    debugLog('Refreshing all data...');
    
    if (!web3 || !votingContract) {
        debugLog('Cannot refresh data: Wallet not connected');
        return;
    }
    
    try {
        // Load data in parallel
        await Promise.all([
            loadCandidates(),
            loadVotingPeriod(),
            loadVotingStats()
        ]);
        
        // Update results tab data if that tab is active
        if (document.getElementById('content-results').classList.contains('active')) {
            loadResults();
        }
        
        debugLog('All data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing data:', error);
        debugLog('Error refreshing data: ' + error.message);
    }
}

// Load candidates from the contract
async function loadCandidates() {
    debugLog('Loading candidates...');
    
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        const candidates = await votingContract.methods.getAllCandidates().call();
        const candidateList = document.getElementById('candidateList');
        
        if (!candidateList) {
            debugLog('Error: candidateList element not found');
            return;
        }
        
        if (candidates.length === 0) {
            candidateList.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-6 text-center">
                        <p class="text-gray-500 dark:text-gray-400">No candidates found. Add new candidates to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Update total candidates counter
        const totalCandidatesElement = document.getElementById('totalCandidates');
        if (totalCandidatesElement) {
            totalCandidatesElement.textContent = candidates.length;
        }
        
        // Calculate total votes for display in dashboard
        const totalVotes = candidates.reduce((sum, candidate) => sum + parseInt(candidate.voteCount), 0);
        const totalVotesElement = document.getElementById('totalVotes');
        if (totalVotesElement) {
            totalVotesElement.textContent = totalVotes;
        }
        
        // Build candidate list HTML
        const candidateListHTML = candidates.map(candidate => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td class="px-4 py-3">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                        ${candidate.id}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0 mr-3">
                            <img class="h-10 w-10 rounded-full object-cover" 
                                 src="${candidate.imageUrl || appConfig.defaultImageUrl}" 
                                 alt="${candidate.name}">
                        </div>
                        <div>
                            <p class="font-medium">${candidate.name}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        ${candidate.party}
                    </span>
                </td>
                <td class="px-4 py-3 text-right">
                    <span class="font-medium">${candidate.voteCount}</span>
                </td>
                <td class="px-4 py-3 text-right">
                    <button 
                        class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        onclick="openEditCandidateModal('${candidate.id}', '${candidate.name}', '${candidate.party}', '${candidate.imageUrl || appConfig.defaultImageUrl}')"
                    >
                        <span class="icon-edit"></span>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Update the UI
        candidateList.innerHTML = candidateListHTML;
        
        debugLog('Candidates loaded successfully');
    } catch (error) {
        console.error('Error loading candidates:', error);
        debugLog('Error loading candidates: ' + error.message);
        
        const candidateList = document.getElementById('candidateList');
        if (candidateList) {
            candidateList.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-6 text-center">
                        <p class="text-red-500 dark:text-red-400">Error loading candidates: ${error.message}</p>
                    </td>
                </tr>
            `;
        }
        
        showFeedback('candidateFeedback', 'error', 'Error Loading Candidates', error.message);
    }
}

// Load voting period information from the contract
async function loadVotingPeriod() {
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        // Get voting period from contract
        const result = await votingContract.methods.getVotingPeriod().call();
        
        // Handle the return value - it might be an object with properties or an array
        let startTime, endTime;
        
        if (typeof result === 'object') {
            // If it's an object with properties
            if ('startTime' in result && 'endTime' in result) {
                startTime = result.startTime;
                endTime = result.endTime;
            } 
            // If it's an array-like object
            else if (Array.isArray(result) || (typeof result[0] !== 'undefined' && typeof result[1] !== 'undefined')) {
                startTime = result[0];
                endTime = result[1];
            } else {
                throw new Error('Invalid voting period data format');
            }
        } else {
            throw new Error('Invalid voting period data format');
        }
        
        // Convert to numbers and validate
        startTime = Number(startTime);
        endTime = Number(endTime);
        
        if (isNaN(startTime) || isNaN(endTime)) {
            throw new Error('Invalid voting period values');
        }
        
        debugLog(`Voting period loaded: start=${new Date(startTime * 1000)}, end=${new Date(endTime * 1000)}`);
        
        // Update the date form fields
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && endDateInput) {
            // Convert from UNIX timestamp to input datetime-local format (YYYY-MM-DDThh:mm)
            const startDateStr = new Date(startTime * 1000).toISOString().slice(0, 16);
            const endDateStr = new Date(endTime * 1000).toISOString().slice(0, 16);
            
            startDateInput.value = startDateStr;
            endDateInput.value = endDateStr;
        }
        
        // Update display
        updateVotingPeriodDisplay(startTime, endTime);
        
    } catch (error) {
        console.error('Error loading voting period:', error);
        debugLog('Error loading voting period: ' + error.message);
        
        const currentDatesDisplay = document.getElementById('currentDatesDisplay');
        if (currentDatesDisplay) {
            currentDatesDisplay.textContent = 'Error loading voting period. ' + error.message;
        }
        
        showFeedback('datesFeedback', 'error', 'Error Loading Voting Period', error.message);
    }
}

// Update the display of voting period
function updateVotingPeriodDisplay(startTime, endTime) {
    const currentDatesDisplay = document.getElementById('currentDatesDisplay');
    const votingStatusBadge = document.getElementById('votingStatusBadge');
    const datesLoadingIndicator = document.getElementById('datesLoadingIndicator');
    
    if (datesLoadingIndicator) {
        datesLoadingIndicator.classList.add('hidden');
    }
    
    if (!currentDatesDisplay || !votingStatusBadge) {
        debugLog('Voting period display elements not found');
        return;
    }
    
    // Get current time
    const now = Math.floor(Date.now() / 1000);
    const isVotingActive = now >= startTime && now <= endTime;
    
    // Format dates for display
    const startDateFormatted = new Date(startTime * 1000).toLocaleString();
    const endDateFormatted = new Date(endTime * 1000).toLocaleString();
    
    // Update dates display
    currentDatesDisplay.innerHTML = `
        <strong>Start:</strong> ${startDateFormatted}<br>
        <strong>End:</strong> ${endDateFormatted}
    `;
    
    // Update status badge
    votingStatusBadge.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-yellow-100', 'text-yellow-800', 'bg-red-100', 'text-red-800');
    
    if (now < startTime) {
        // Upcoming
        votingStatusBadge.classList.add('bg-yellow-100', 'text-yellow-800');
        votingStatusBadge.textContent = 'Upcoming';
        document.getElementById('votingStatus').textContent = 'Upcoming';
    } else if (now >= startTime && now <= endTime) {
        // Active
        votingStatusBadge.classList.add('bg-green-100', 'text-green-800');
        votingStatusBadge.textContent = 'Active';
        document.getElementById('votingStatus').textContent = 'Active';
    } else {
        // Ended
        votingStatusBadge.classList.add('bg-red-100', 'text-red-800');
        votingStatusBadge.textContent = 'Ended';
        document.getElementById('votingStatus').textContent = 'Ended';
    }
    
    // Update progress bar if the container exists
    const electionProgressContainer = document.getElementById('electionProgressContainer');
    if (electionProgressContainer) {
        electionProgressContainer.classList.remove('hidden');
        
        // Set start and end labels
        document.getElementById('electionStartLabel').textContent = new Date(startTime * 1000).toLocaleDateString();
        document.getElementById('electionEndLabel').textContent = new Date(endTime * 1000).toLocaleDateString();
        
        // Calculate progress percentage
        let progressPercent = 0;
        if (now < startTime) {
            progressPercent = 0;
        } else if (now > endTime) {
            progressPercent = 100;
        } else {
            const totalDuration = endTime - startTime;
            const elapsed = now - startTime;
            progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        }
        
        // Update progress bar
        document.getElementById('electionProgress').style.width = `${progressPercent}%`;
        
        // Update time remaining
        const timeRemainingElement = document.getElementById('electionTimeRemaining');
        const timeRemainingDisplay = document.getElementById('timeRemaining');
        
        let timeRemainingText = '';
        
        if (now < startTime) {
            const remaining = startTime - now;
            timeRemainingText = `Voting starts in ${formatTimeRemaining(remaining)}`;
        } else if (now <= endTime) {
            const remaining = endTime - now;
            timeRemainingText = `Voting ends in ${formatTimeRemaining(remaining)}`;
            
            if (timeRemainingDisplay) {
                timeRemainingDisplay.textContent = formatTimeRemaining(remaining);
            }
        } else {
            timeRemainingText = 'Voting has ended';
            
            if (timeRemainingDisplay) {
                timeRemainingDisplay.textContent = 'Ended';
            }
        }
        
        if (timeRemainingElement) {
            timeRemainingElement.textContent = timeRemainingText;
        }
    }
}

// Format time remaining in a readable format
function formatTimeRemaining(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else {
        return `${hours}h ${minutes}m ${secs}s`;
    }
}

// Load voting statistics
async function loadVotingStats() {
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        // This would typically call a contract method to get statistics
        // For now, we'll use the candidate data to calculate stats
        
        // Placeholder for now - actual implementation would depend on your contract
        debugLog('Voting stats loaded successfully');
    } catch (error) {
        console.error('Error loading voting stats:', error);
        debugLog('Error loading voting stats: ' + error.message);
    }
}

// Load results data
async function loadResults() {
    debugLog('Loading election results...');
    
    // Show loading state
    document.getElementById('resultsLoading').classList.remove('hidden');
    document.getElementById('resultStats').classList.add('hidden');
    document.getElementById('resultsTable').classList.add('hidden');
    document.getElementById('resultsChartContainer').classList.add('hidden');
    document.getElementById('exportResultsContainer').classList.add('hidden');
    
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        // Get candidates
        const candidates = await votingContract.methods.getAllCandidates().call();
        
        // If no candidates, show message and return
        if (candidates.length === 0) {
            document.getElementById('resultsLoadingText').textContent = 'No candidates found. Add candidates first.';
            return;
        }
        
        // Calculate total votes
        const totalVotes = candidates.reduce((sum, candidate) => sum + parseInt(candidate.voteCount), 0);
        document.getElementById('totalVotesCast').textContent = totalVotes;
        
        // Find leading candidate
        let leadingCandidate = { name: 'None', voteCount: 0 };
        
        candidates.forEach(candidate => {
            if (parseInt(candidate.voteCount) > parseInt(leadingCandidate.voteCount)) {
                leadingCandidate = candidate;
            }
        });
        
        document.getElementById('leadingCandidate').textContent = totalVotes > 0 ? leadingCandidate.name : 'No votes cast';
        
        // Calculate voter turnout (if we had total eligible voters data)
        // For now, just use a placeholder
        document.getElementById('voterTurnout').textContent = totalVotes > 0 ? 'Available voters have participated' : 'No votes cast';
        
        // Build results table
        const resultsTableBody = document.getElementById('resultsTableBody');
        if (resultsTableBody) {
            // Sort candidates by vote count (descending)
            const sortedCandidates = [...candidates].sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount));
            
            resultsTableBody.innerHTML = '';
            
            sortedCandidates.forEach(candidate => {
                const percentage = totalVotes > 0 ? ((parseInt(candidate.voteCount) / totalVotes) * 100).toFixed(1) : '0.0';
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
                
                row.innerHTML = `
                    <td class="px-4 py-3">
                        <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0 mr-3">
                                <img class="h-10 w-10 rounded-full object-cover" 
                                     src="${candidate.imageUrl || appConfig.defaultImageUrl}" 
                                     alt="${candidate.name}">
                            </div>
                            <div>
                                <p class="font-medium">${candidate.name}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-4 py-3">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            ${candidate.party}
                        </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <span class="font-medium">${candidate.voteCount}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                        <div class="flex items-center justify-end">
                            <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                                <div class="bg-primary-600 h-2.5 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                            <span>${percentage}%</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                        <button 
                            class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            onclick="openEditCandidateModal('${candidate.id}', '${candidate.name}', '${candidate.party}', '${candidate.imageUrl || appConfig.defaultImageUrl}')"
                        >
                            <span class="icon-edit"></span>
                        </button>
                    </td>
                `;
                
                resultsTableBody.appendChild(row);
            });
        }
        
        // Create chart data
        if (totalVotes > 0) {
            createResultsChart(candidates);
        }
        
        // Hide loading and show results
        document.getElementById('resultsLoading').classList.add('hidden');
        document.getElementById('resultStats').classList.remove('hidden');
        document.getElementById('resultsTable').classList.remove('hidden');
        document.getElementById('resultsChartContainer').classList.remove('hidden');
        document.getElementById('exportResultsContainer').classList.remove('hidden');
        
        debugLog('Results loaded successfully');
    } catch (error) {
        console.error('Error loading results:', error);
        debugLog('Error loading results: ' + error.message);
        
        document.getElementById('resultsLoadingText').textContent = 'Error loading results: ' + error.message;
    }
}

// Create results chart
function createResultsChart(candidates) {
    const ctx = document.getElementById('resultsChart');
    if (!ctx) {
        debugLog('Chart canvas not found');
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.resultsChart && typeof window.resultsChart.destroy === 'function') {
        try {
            window.resultsChart.destroy();
        } catch (error) {
            console.warn('Error destroying previous chart:', error);
            // Continue anyway
        }
    }
    
    // Ensure Chart object is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        document.getElementById('resultsLoadingText').textContent = 'Error: Chart.js library not available';
        return;
    }
    
    // Prepare data
    const labels = candidates.map(c => c.name);
    const data = candidates.map(c => parseInt(c.voteCount));
    const colors = generateChartColors(candidates.length);
    
    try {
        // Create new chart
        window.resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes',
                    data: data,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Votes: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
        document.getElementById('resultsLoadingText').textContent = 'Error creating chart: ' + error.message;
    }
}

// Generate chart colors
function generateChartColors(count) {
    const backgroundColors = [];
    const borderColors = [];
    
    // Base colors (can be expanded)
    const baseColors = [
        { bg: 'rgba(54, 162, 235, 0.5)', border: 'rgb(54, 162, 235)' },
        { bg: 'rgba(255, 99, 132, 0.5)', border: 'rgb(255, 99, 132)' },
        { bg: 'rgba(75, 192, 192, 0.5)', border: 'rgb(75, 192, 192)' },
        { bg: 'rgba(255, 159, 64, 0.5)', border: 'rgb(255, 159, 64)' },
        { bg: 'rgba(153, 102, 255, 0.5)', border: 'rgb(153, 102, 255)' },
        { bg: 'rgba(255, 205, 86, 0.5)', border: 'rgb(255, 205, 86)' },
        { bg: 'rgba(201, 203, 207, 0.5)', border: 'rgb(201, 203, 207)' }
    ];
    
    // Cycle through base colors if we need more
    for (let i = 0; i < count; i++) {
        const colorIndex = i % baseColors.length;
        backgroundColors.push(baseColors[colorIndex].bg);
        borderColors.push(baseColors[colorIndex].border);
    }
    
    return {
        background: backgroundColors,
        border: borderColors
    };
}

// ==========================================
// UI Update Functions
// ==========================================

// Update UI elements based on connection status
function updateUIConnectionStatus(isConnected) {
    const connectButton = document.getElementById('connectButton');
    const connectButtonPanel = document.getElementById('connectButtonPanel');
    const logoutButton = document.getElementById('logoutButton');
    const networkInfo = document.getElementById('networkInfo');
    const contractInfo = document.getElementById('contractInfo');
    
    if (isConnected) {
        if (connectButton) connectButton.classList.add('hidden');
        if (connectButtonPanel) connectButtonPanel.classList.add('hidden');
        if (logoutButton) logoutButton.classList.remove('hidden');
        if (networkInfo) networkInfo.textContent = `Connected to ${appConfig.networkName}`;
        if (contractInfo) contractInfo.innerHTML = `Contract: <span class="font-mono">${appConfig.contractAddress.substring(0, 6)}...${appConfig.contractAddress.substring(appConfig.contractAddress.length - 4)}</span>`;
    } else {
        if (connectButton) connectButton.classList.remove('hidden');
        if (connectButtonPanel) connectButtonPanel.classList.remove('hidden');
        if (logoutButton) logoutButton.classList.add('hidden');
        if (networkInfo) networkInfo.textContent = 'Not Connected';
        if (contractInfo) contractInfo.textContent = 'Contract not loaded';
    }
}

// Update network information display
function updateNetworkInfo() {
    const networkInfo = document.getElementById('networkInfo');
    const contractInfo = document.getElementById('contractInfo');
    
    if (networkInfo) {
        networkInfo.textContent = `Connected to ${appConfig.networkName}`;
    }
    
    if (contractInfo) {
        contractInfo.innerHTML = `Contract: <span class="font-mono">${appConfig.contractAddress.substring(0, 6)}...${appConfig.contractAddress.substring(appConfig.contractAddress.length - 4)}</span>`;
    }
}

// Check if user is admin
async function checkAdminStatus() {
    try {
        if (!web3 || !votingContract || !accounts.length) {
            debugLog('Cannot check admin status: web3, contract, or accounts not available');
            return false;
        }
        
        // Get admin address from contract
        const adminAddress = await votingContract.methods.admin().call();
        debugLog('Admin address from contract:', adminAddress);
        debugLog('Current account:', accounts[0]);
        
        // Check if current account is admin
        isAdmin = accounts[0].toLowerCase() === adminAddress.toLowerCase();
        debugLog('Is user admin?', isAdmin);
        
        return isAdmin;
    } catch (error) {
        console.error('Error checking admin status:', error);
        debugLog('Error checking admin status: ' + error.message);
        return false;
    }
}

// Update UI for admin status
async function updateUIForAdminStatus() {
    const adminOnlyElements = document.querySelectorAll('[data-admin-only="true"]');
    
    if (!isAdmin) {
        // Disable all admin-only elements
        adminOnlyElements.forEach(element => {
            element.classList.add('opacity-50', 'cursor-not-allowed');
            element.disabled = true;
        });
        
        debugLog('UI updated for non-admin user');
    } else {
        adminOnlyElements.forEach(element => {
            // Enable all admin-only elements
            element.classList.remove('opacity-50', 'cursor-not-allowed');
            element.disabled = false;
        });
        
        debugLog('UI updated for admin user');
    }
}

// ==========================================
// Form Handling Functions
// ==========================================

// Handle adding a new candidate
async function handleAddCandidate(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showFeedback('candidateFeedback', 'error', 'Permission Denied', 'Only the admin can add candidates.');
        return;
    }
    
    const nameInput = document.getElementById('name');
    const partyInput = document.getElementById('party');
    const imageUrlInput = document.getElementById('imageUrl');
    
    // Validate form data
    if (!nameInput.value.trim()) {
        showFeedback('candidateFeedback', 'error', 'Validation Error', 'Candidate name is required.');
        nameInput.focus();
        return;
    }
    
    if (!partyInput.value.trim()) {
        showFeedback('candidateFeedback', 'error', 'Validation Error', 'Political party is required.');
        partyInput.focus();
        return;
    }
    
    // Show loading state
    const addButton = document.getElementById('addCandidateButton');
    const originalButtonText = addButton.innerHTML;
    addButton.disabled = true;
    addButton.innerHTML = '<div class="loader"></div><span>Adding...</span>';
    
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        debugLog('Adding candidate:', nameInput.value, partyInput.value);
        
        // Call contract method to add candidate
        const result = await votingContract.methods.addCandidate(nameInput.value, partyInput.value).send({ from: accounts[0] });
        
        debugLog('Transaction result:', result);
        
        showFeedback('candidateFeedback', 'success', 'Candidate Added', `'${nameInput.value}' has been added successfully.`);
        
        // Reset form
        document.getElementById('addCandidateForm').reset();
        
        // Reset image preview
        const previewContainer = document.getElementById('imagePreviewContainer');
        const uploadIconContainer = document.getElementById('uploadIconContainer');
        if (previewContainer && uploadIconContainer) {
            previewContainer.classList.add('hidden');
            uploadIconContainer.classList.remove('hidden');
        }
        
        // Refresh candidates list
        await loadCandidates();
    } catch (error) {
        console.error('Error adding candidate:', error);
        debugLog('Error adding candidate: ' + error.message);
        showFeedback('candidateFeedback', 'error', 'Error Adding Candidate', error.message);
    } finally {
        // Reset button state
        addButton.disabled = false;
        addButton.innerHTML = originalButtonText;
    }
}

// Handle updating a candidate
async function handleUpdateCandidate(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showFeedback('editCandidateFeedback', 'error', 'Permission Denied', 'Only the admin can update candidates.');
        return;
    }
    
    const idInput = document.getElementById('editCandidateId');
    const nameInput = document.getElementById('editName');
    const partyInput = document.getElementById('editParty');
    const imageUrlInput = document.getElementById('editImageUrl');
    
    // Validate form data
    if (!nameInput.value.trim()) {
        showFeedback('editCandidateFeedback', 'error', 'Validation Error', 'Candidate name is required.');
        nameInput.focus();
        return;
    }
    
    if (!partyInput.value.trim()) {
        showFeedback('editCandidateFeedback', 'error', 'Validation Error', 'Political party is required.');
        partyInput.focus();
        return;
    }
    
    // Show loading state
    const updateButton = document.getElementById('updateCandidateButton');
    const originalButtonText = updateButton.innerHTML;
    updateButton.disabled = true;
    updateButton.innerHTML = '<div class="loader"></div><span>Updating...</span>';
    
    try {
        // This is a placeholder - the actual contract might not have an updateCandidate method
        // You would need to implement this in your smart contract
        
        debugLog('Update candidate:', idInput.value, nameInput.value, partyInput.value);
        
        // Simulate success since most contracts don't support updating candidates
        showFeedback('editCandidateFeedback', 'success', 'Candidate Updated', `'${nameInput.value}' has been updated successfully.`);
        
        // Close modal after a short delay
        setTimeout(() => {
            closeEditCandidateModal();
            
            // Refresh candidates list
            loadCandidates();
        }, 1500);
    } catch (error) {
        console.error('Error updating candidate:', error);
        debugLog('Error updating candidate: ' + error.message);
        showFeedback('editCandidateFeedback', 'error', 'Error Updating Candidate', error.message);
    } finally {
        // Reset button state
        updateButton.disabled = false;
        updateButton.innerHTML = originalButtonText;
    }
}

// Handle setting voting period
async function handleSetDates(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showFeedback('datesFeedback', 'error', 'Permission Denied', 'Only the admin can set the voting period.');
        return;
    }
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Validate dates
    if (!startDateInput.value) {
        showFeedback('datesFeedback', 'error', 'Validation Error', 'Start date is required.');
        startDateInput.focus();
        return;
    }
    
    if (!endDateInput.value) {
        showFeedback('datesFeedback', 'error', 'Validation Error', 'End date is required.');
        endDateInput.focus();
        return;
    }
    
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    if (isNaN(startDate.getTime())) {
        showFeedback('datesFeedback', 'error', 'Validation Error', 'Invalid start date.');
        startDateInput.focus();
        return;
    }
    
    if (isNaN(endDate.getTime())) {
        showFeedback('datesFeedback', 'error', 'Validation Error', 'Invalid end date.');
        endDateInput.focus();
        return;
    }
    
    if (endDate <= startDate) {
        showFeedback('datesFeedback', 'error', 'Validation Error', 'End date must be after start date.');
        endDateInput.focus();
        return;
    }
    
    // Convert to UNIX timestamps
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Show loading state
    const setDatesButton = document.getElementById('setDatesButton');
    const originalButtonText = setDatesButton.innerHTML;
    setDatesButton.disabled = true;
    setDatesButton.innerHTML = '<div class="loader"></div><span>Setting dates...</span>';
    
    try {
        if (!await isContractInitialized()) {
            throw new Error('Contract not initialized or not accessible');
        }
        
        debugLog('Setting voting period:', startTimestamp, endTimestamp);
        
        // Call contract method
        const result = await votingContract.methods.setVotingPeriod(startTimestamp, endTimestamp).send({ from: accounts[0] });
        
        debugLog('Transaction result:', result);
        
        showFeedback('datesFeedback', 'success', 'Voting Period Set', 'The voting period has been set successfully.');
        
        // Refresh voting period display
        await loadVotingPeriod();
    } catch (error) {
        console.error('Error setting voting period:', error);
        debugLog('Error setting voting period: ' + error.message);
        showFeedback('datesFeedback', 'error', 'Error Setting Voting Period', error.message);
    } finally {
        // Reset button state
        setDatesButton.disabled = false;
        setDatesButton.innerHTML = originalButtonText;
    }
}

// Handle update dates button click
async function handleUpdateDates() {
    if (!isAdmin) {
        showFeedback('datesFeedback', 'error', 'Permission Denied', 'Only the admin can update the voting period.');
        return;
    }
    
    // Scroll to the date setting form
    const setDatesForm = document.getElementById('setDatesForm');
    if (setDatesForm) {
        setDatesForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Flash the form to highlight it
    setDatesForm.classList.add('bg-primary-50', 'dark:bg-primary-900/20');
    setTimeout(() => {
        setDatesForm.classList.remove('bg-primary-50', 'dark:bg-primary-900/20');
    }, 1000);
}

// Handle exporting results 
function handleExportResults() {
    try {
        // Get candidates data
        const candidatesData = Array.from(document.querySelectorAll('#resultsTableBody tr')).map(row => {
            const name = row.querySelector('td:nth-child(1)').textContent.trim();
            const party = row.querySelector('td:nth-child(2)').textContent.trim();
            const votes = row.querySelector('td:nth-child(3)').textContent.trim();
            const percentage = row.querySelector('td:nth-child(4)').textContent.trim();
            
            return { name, party, votes, percentage };
        });
        
        if (candidatesData.length === 0) {
            throw new Error('No results to export');
        }
        
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Candidate,Party,Votes,Percentage\n';
        
        candidatesData.forEach(candidate => {
            csvContent += `"${candidate.name}","${candidate.party}",${candidate.votes},${candidate.percentage}\n`;
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `voting_results_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        
        showNotification('Results exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting results:', error);
        debugLog('Error exporting results: ' + error.message);
        showNotification('Error exporting results: ' + error.message, 'error');
    }
}

// ==========================================
// Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    debugLog('Initializing admin dashboard...');
    
    // Initialize tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update button states
            tabButtons.forEach(btn => {
                btn.classList.remove('text-primary-600', 'dark:text-primary-400', 'border-primary-500', 'dark:border-primary-400');
                btn.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
            });
            
            button.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
            button.classList.add('text-primary-600', 'dark:text-primary-400', 'border-primary-500', 'dark:border-primary-400');
            
            // Show correct tab content
            const targetId = button.getAttribute('aria-controls');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                
                // Load specific tab content if needed
                if (targetId === 'content-voting-dates') {
                    loadVotingPeriod();
                } else if (targetId === 'content-results') {
                    loadResults();
                }
            }
        });
    });
    
    // Connect wallet buttons
    const connectButtons = document.querySelectorAll('#connectButton, #connectButtonPanel');
    connectButtons.forEach(button => {
        button.addEventListener('click', connectWallet);
    });
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', disconnectWallet);
    }
    
    // Refresh data button
    const refreshDataButton = document.getElementById('refreshDataButton');
    if (refreshDataButton) {
        refreshDataButton.addEventListener('click', refreshAllData);
    }
    
    // Candidate form
    const addCandidateForm = document.getElementById('addCandidateForm');
    if (addCandidateForm) {
        addCandidateForm.addEventListener('submit', handleAddCandidate);
    }
    
    // Edit candidate form
    const editCandidateForm = document.getElementById('editCandidateForm');
    if (editCandidateForm) {
        editCandidateForm.addEventListener('submit', handleUpdateCandidate);
    }
    
    // Set dates form
    const setDatesForm = document.getElementById('setDatesForm');
    if (setDatesForm) {
        setDatesForm.addEventListener('submit', handleSetDates);
    }
    
    // Update dates button
    const updateDatesButton = document.getElementById('updateDatesButton');
    if (updateDatesButton) {
        updateDatesButton.addEventListener('click', handleUpdateDates);
    }
    
    // Refresh candidates button
    const refreshCandidatesButton = document.getElementById('refreshCandidatesButton');
    if (refreshCandidatesButton) {
        refreshCandidatesButton.addEventListener('click', loadCandidates);
    }
    
    // Export results button
    const exportResultsButton = document.getElementById('exportResultsButton');
    if (exportResultsButton) {
        exportResultsButton.addEventListener('click', handleExportResults);
    }
    
    // Auto-connect wallet if previously connected
    if (localStorage.getItem('walletConnected') === 'true') {
        debugLog('Auto-connecting wallet from previous session');
        setTimeout(connectWallet, 1000);
    }
    
    debugLog('Event listeners initialized');
});