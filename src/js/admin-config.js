// Configuration Management and Contract Deployment Handler
// import { ethers } from 'ethers';
// import VotingContract from '../../contracts/Voting.sol';

// Use the global ethers object instead
// And define a minimal VotingContract object for development
const VotingContract = {
    abi: [], // This would normally be filled with the contract ABI
    bytecode: '0x' // This would normally be filled with the contract bytecode
};

class AdminConfigManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.config = {};
        
        // Initialize event listeners
        this.initializeEventListeners();
        this.loadCurrentConfig();
    }

    async initializeEventListeners() {
        // Configuration form handling
        document.getElementById('configForm').addEventListener('submit', this.handleConfigSubmit.bind(this));
        document.getElementById('resetConfig').addEventListener('click', this.handleConfigReset.bind(this));
        
        // Contract deployment handling
        document.getElementById('deploymentNetwork').addEventListener('change', this.handleNetworkChange.bind(this));
        document.getElementById('estimateGas').addEventListener('click', this.handleGasEstimate.bind(this));
        document.getElementById('deployContract').addEventListener('click', this.handleContractDeploy.bind(this));
        
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', this.handleTabSwitch.bind(this));
        });
    }

    async loadCurrentConfig() {
        try {
            // Mock configuration data instead of fetching from server
            this.config = {
                server: {
                    port: 8080,
                    host: 'localhost'
                },
                blockchain: {
                    provider: 'http://localhost:8545',
                    gas: {
                        limit: 3000000
                    }
                },
                app: {
                    theme: {
                        defaultTheme: 'light'
                    }
                }
            };
            this.populateConfigForm();
            debugLog('Using mock configuration data');
        } catch (error) {
            this.showNotification('Error loading configuration', 'error');
        }
    }

    populateConfigForm() {
        // Populate server settings
        document.getElementById('serverPort').value = this.config.server?.port || '';
        document.getElementById('serverHost').value = this.config.server?.host || '';
        
        // Populate blockchain settings
        document.getElementById('networkProvider').value = this.config.blockchain?.provider || '';
        document.getElementById('gasLimit').value = this.config.blockchain?.gas?.limit || '';
        
        // Populate theme settings
        document.getElementById('defaultTheme').value = this.config.app?.theme?.defaultTheme || 'light';
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
            // Mock successful API response
            this.showNotification('Configuration updated successfully', 'success');
            localStorage.setItem('appConfig', JSON.stringify(config));
            this.config = config;
            debugLog('Updated configuration:', config);
        } catch (error) {
            console.error('Error updating configuration:', error);
            this.showNotification('Error updating configuration', 'error');
        }
    }

    async handleConfigReset() {
        if (!confirm('Are you sure you want to reset to default configuration?')) return;

        try {
            // Reset to default mock configuration
            this.config = {
                server: {
                    port: 8080,
                    host: 'localhost'
                },
                blockchain: {
                    provider: 'http://localhost:8545',
                    gas: {
                        limit: 3000000
                    }
                },
                app: {
                    theme: {
                        defaultTheme: 'light'
                    }
                }
            };
            this.populateConfigForm();
            localStorage.removeItem('appConfig');
            this.showNotification('Configuration reset to defaults', 'success');
            debugLog('Configuration reset to defaults');
        } catch (error) {
            console.error('Error resetting configuration:', error);
            this.showNotification('Error resetting configuration', 'error');
        }
    }

    async handleNetworkChange(event) {
        const network = event.target.value;
        const provider = this.getProviderForNetwork(network);
        this.provider = provider;
        
        try {
            const signer = provider.getSigner();
            this.signer = signer;
            const address = await signer.getAddress();
            document.getElementById('adminAddress').value = address;
        } catch (error) {
            this.showNotification('Error connecting to network: ' + error.message, 'error');
        }
    }

    getProviderForNetwork(network) {
        switch (network) {
            case 'development':
                return new ethers.providers.JsonRpcProvider('http://localhost:8545');
            case 'testnet':
                return new ethers.providers.JsonRpcProvider(this.config.blockchain.testnetProvider);
            case 'mainnet':
                return new ethers.providers.JsonRpcProvider(this.config.blockchain.mainnetProvider);
            default:
                throw new Error('Invalid network selected');
        }
    }

    async handleGasEstimate() {
        try {
            const factory = new ethers.ContractFactory(
                VotingContract.abi,
                VotingContract.bytecode,
                this.signer
            );

            const adminAddress = document.getElementById('adminAddress').value;
            const votingDuration = parseInt(document.getElementById('votingDuration').value) * 24 * 60 * 60; // Convert days to seconds

            const estimatedGas = await factory.estimateGas.deploy(adminAddress, votingDuration);
            this.showNotification(`Estimated gas: ${estimatedGas.toString()} units`, 'info');
        } catch (error) {
            this.showNotification('Error estimating gas: ' + error.message, 'error');
        }
    }

    async handleContractDeploy() {
        try {
            this.updateDeploymentProgress(1);
            
            // Compile contract (in production this would be done during build)
            this.updateDeploymentProgress(2);
            
            const factory = new ethers.ContractFactory(
                VotingContract.abi,
                VotingContract.bytecode,
                this.signer
            );

            const adminAddress = document.getElementById('adminAddress').value;
            const votingDuration = parseInt(document.getElementById('votingDuration').value) * 24 * 60 * 60;

            const contract = await factory.deploy(adminAddress, votingDuration);
            await contract.deployed();
            
            this.updateDeploymentProgress(3);
            
            // Save the contract address
            await this.saveContractAddress(contract.address);
            
            this.showNotification(`Contract deployed successfully at ${contract.address}`, 'success');
        } catch (error) {
            this.showNotification('Error deploying contract: ' + error.message, 'error');
        }
    }

    async saveContractAddress(address) {
        try {
            // Mock saving contract address
            console.log('Contract address saved (mock):', address);
            this.showNotification(`Contract address saved: ${address}`, 'success');
        } catch (error) {
            console.error('Error saving contract address:', error);
        }
    }

    updateDeploymentProgress(step) {
        const steps = document.querySelectorAll('#content-deployment ol li');
        steps.forEach((stepElement, index) => {
            if (index + 1 === step) {
                stepElement.classList.remove('opacity-50');
                stepElement.querySelector('span:first-child').classList.add('bg-primary-100', 'dark:bg-primary-900', 'text-primary-600', 'dark:text-primary-400');
                stepElement.querySelector('span:first-child').classList.remove('bg-gray-200', 'dark:bg-gray-800');
            }
        });
    }

    handleTabSwitch(event) {
        const targetId = event.currentTarget.getAttribute('aria-controls');
        
        // Update button states
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('text-primary-600', 'dark:text-primary-400', 'border-primary-500', 'dark:border-primary-400');
            button.classList.add('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        });
        
        event.currentTarget.classList.remove('text-gray-500', 'dark:text-gray-400', 'border-transparent');
        event.currentTarget.classList.add('text-primary-600', 'dark:text-primary-400', 'border-primary-500', 'dark:border-primary-400');
        
        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(targetId).classList.remove('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' :
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async switchEnvironment(e) {
        const environment = e.target.value;
        try {
            // Mock environment switch
            const envConfig = {
                server: {
                    port: environment === 'production' ? 80 : 8080,
                    host: environment === 'production' ? 'voting.app' : 'localhost'
                },
                blockchain: {
                    provider: environment === 'production' ? 'https://mainnet.infura.io' : 'http://localhost:8545',
                    gas: {
                        limit: 3000000
                    }
                },
                app: {
                    theme: {
                        defaultTheme: 'light'
                    }
                }
            };
            
            this.config = envConfig;
            this.populateConfigForm();
            localStorage.setItem('currentEnvironment', environment);
            this.showNotification(`Switched to ${environment} environment`, 'success');
            debugLog(`Switched to ${environment} environment`);
        } catch (error) {
            console.error('Error switching environment:', error);
            this.showNotification('Error switching environment', 'error');
        }
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

            // Mock successful import
            localStorage.setItem('appConfig', JSON.stringify(parsedConfig));
            this.config = parsedConfig;
            this.populateConfigForm();
            this.showNotification('Configuration imported successfully', 'success');
            debugLog('Configuration imported successfully');
        } catch (error) {
            console.error('Error importing configuration:', error);
            this.showNotification('Error importing configuration', 'error');
        }
    }
}

// Initialize the admin configuration manager
document.addEventListener('DOMContentLoaded', () => {
    window.adminConfigManager = new AdminConfigManager();
}); 