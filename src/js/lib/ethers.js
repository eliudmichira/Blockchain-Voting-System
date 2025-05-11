// Local ethers.js wrapper - simplified version
// No exports/imports - direct global assignment for browser compatibility

// Create global ethers object first
window.ethers = {};

// Add required components
window.ethers.providers = {
    Web3Provider: function(provider) {
        return {
            getSigner: function() {
                return {
                    getAddress: function() {
                        return Promise.resolve('0x0000000000000000000000000000000000000000');
                    }
                };
            },
            getNetwork: function() {
                return Promise.resolve({ name: 'unknown', chainId: 0 });
            }
        };
    },
    JsonRpcProvider: function() {
        return window.ethers.providers.Web3Provider();
    }
};

// Contract implementation
window.ethers.Contract = function(address, abi, signerOrProvider) {
    // Create a mock contract with the provided address
    const mockContract = {
        address: address || '0x0000000000000000000000000000000000000000',
        connect: function(signer) {
            return this;
        },
        deployed: function() {
            return Promise.resolve(this);
        },
        // Add basic function caller for contract methods
        callMethod: function(methodName, ...args) {
            console.log(`Mock call to contract method ${methodName} with args:`, args);
            return Promise.resolve(0);
        }
    };
    
    // Add mock methods based on the ABI
    if (Array.isArray(abi)) {
        abi.forEach(function(item) {
            if (item.name && item.type === 'function') {
                mockContract[item.name] = function(...args) {
                    console.log(`Mock call to ${item.name} with args:`, args);
                    if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
                        // Return appropriate default values based on output types
                        if (item.outputs && item.outputs.length > 0) {
                            if (item.outputs[0].type.includes('uint')) {
                                return Promise.resolve(0);
                            } else if (item.outputs[0].type.includes('string')) {
                                return Promise.resolve('');
                            } else if (item.outputs[0].type.includes('bool')) {
                                return Promise.resolve(false);
                            } else if (item.outputs[0].type.includes('[]')) {
                                return Promise.resolve([]);
                            }
                        }
                    }
                    // For non-view functions, just return a receipt-like object
                    return Promise.resolve({
                        hash: '0x' + '0'.repeat(64),
                        wait: function() { return Promise.resolve({ status: 1 }); }
                    });
                };
            }
        });
    }
    
    return mockContract;
};

// ContractFactory implementation
window.ethers.ContractFactory = function(abi, bytecode, signer) {
    return {
        deploy: function() {
            return {
                deployed: function() {
                    return Promise.resolve({
                        address: '0x0000000000000000000000000000000000000000'
                    });
                }
            };
        },
        estimateGas: {
            deploy: function() {
                return Promise.resolve('50000');
            }
        }
    };
};

// BrowserProvider implementation
window.ethers.BrowserProvider = function(provider) {
    // Check if the provider is valid
    const isValidProvider = provider && typeof provider.request === 'function';
    
    return {
        getSigner: function() {
            return new Promise(function(resolve) {
                if (isValidProvider) {
                    try {
                        // Try to get real accounts if possible
                        provider.request({ method: 'eth_accounts' }).then(function(accounts) {
                            const address = accounts && accounts.length > 0 ? 
                                accounts[0] : '0x0000000000000000000000000000000000000000';
                            
                            resolve({
                                address: address,
                                getAddress: function() {
                                    return Promise.resolve(address);
                                },
                                connect: function(contract) {
                                    return contract;
                                }
                            });
                        }).catch(function() {
                            // Fallback if accounts request fails
                            resolve(createFallbackSigner());
                        });
                    } catch (error) {
                        console.warn('Error getting signer:', error);
                        resolve(createFallbackSigner());
                    }
                } else {
                    resolve(createFallbackSigner());
                }
            });
        }
    };
};

// Helper for creating a fallback signer
function createFallbackSigner() {
    return {
        address: '0x0000000000000000000000000000000000000000',
        getAddress: function() {
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        },
        connect: function(contract) {
            return contract;
        }
    };
}

// Utils
window.ethers.utils = {
    formatEther: function(value) {
        return '0.0';
    },
    parseEther: function(value) {
        return value;
    }
};

console.log('Local ethers.js proxy initialized - browser compatible version'); 