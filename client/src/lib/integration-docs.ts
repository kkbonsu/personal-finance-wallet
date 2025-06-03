/**
 * Personal Wallet Integration Documentation
 * Complete guide for external applications to integrate with the Personal Wallet
 */

export const INTEGRATION_EXAMPLES = {
  // Basic connection example
  basicConnection: `
// Connect to Personal Wallet
async function connectWallet() {
  if (typeof window.personalWallet === 'undefined') {
    throw new Error('Personal Wallet not available');
  }
  
  const accounts = await window.personalWallet.connect();
  console.log('Connected accounts:', accounts);
  return accounts;
}
`,

  // Send Bitcoin transaction
  sendBitcoin: `
// Send Bitcoin transaction
async function sendBTC(recipientAddress, amount) {
  const wallet = window.personalWallet;
  
  if (!wallet.isConnected()) {
    await wallet.connect();
  }
  
  const result = await wallet.sendBitcoin(recipientAddress, amount, {
    feeRate: 10 // satoshis per byte
  });
  
  console.log('Transaction hash:', result.txHash);
  return result;
}
`,

  // Lightning Network operations
  lightning: `
// Create Lightning invoice
async function createInvoice(amount, description) {
  const wallet = window.personalWallet;
  
  const invoice = await wallet.createLightningInvoice(amount, description);
  console.log('Payment request:', invoice.invoice);
  return invoice;
}

// Pay Lightning invoice
async function payInvoice(paymentRequest) {
  const wallet = window.personalWallet;
  
  const result = await wallet.payLightningInvoice(paymentRequest);
  console.log('Payment hash:', result.txHash);
  return result;
}
`,

  // Starknet contract interaction
  starknet: `
// Call Starknet contract
async function callContract(contractAddress, method, params) {
  const wallet = window.personalWallet;
  
  const result = await wallet.callStarknetContract(
    contractAddress,
    method,
    params
  );
  
  console.log('Transaction hash:', result.txHash);
  return result;
}
`,

  // Event handling
  events: `
// Listen for wallet events
function setupWalletListeners() {
  const wallet = window.personalWallet;
  
  // Account changes
  wallet.on('accountChanged', (event) => {
    console.log('Account changed:', event.data.account);
    updateUI(event.data.account);
  });
  
  // Transaction completion
  wallet.on('transactionSent', (event) => {
    console.log('Transaction sent:', event.data.txHash);
    showTransactionStatus(event.data.txHash);
  });
  
  // Connection status
  wallet.on('connected', (event) => {
    console.log('Wallet connected:', event.data.accounts);
    enableWalletFeatures();
  });
  
  wallet.on('disconnected', () => {
    console.log('Wallet disconnected');
    disableWalletFeatures();
  });
}
`,

  // Complete integration example
  fullExample: `
class WalletIntegration {
  constructor() {
    this.wallet = null;
    this.isConnected = false;
  }
  
  async initialize() {
    if (typeof window.personalWallet === 'undefined') {
      throw new Error('Personal Wallet not detected');
    }
    
    this.wallet = window.personalWallet;
    this.setupEventListeners();
    
    // Auto-connect if previously connected
    if (localStorage.getItem('wallet_connected') === 'true') {
      await this.connect();
    }
  }
  
  async connect() {
    try {
      const accounts = await this.wallet.connect();
      this.isConnected = true;
      localStorage.setItem('wallet_connected', 'true');
      return accounts;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }
  
  async disconnect() {
    await this.wallet.disconnect();
    this.isConnected = false;
    localStorage.removeItem('wallet_connected');
  }
  
  async sendTransaction(type, params) {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }
    
    switch (type) {
      case 'bitcoin':
        return await this.wallet.sendBitcoin(params.to, params.amount, params.options);
      case 'lightning':
        return await this.wallet.payLightningInvoice(params.invoice);
      case 'starknet':
        return await this.wallet.callStarknetContract(
          params.contract,
          params.method,
          params.params
        );
      default:
        throw new Error('Unsupported transaction type');
    }
  }
  
  setupEventListeners() {
    this.wallet.on('accountChanged', this.handleAccountChange.bind(this));
    this.wallet.on('transactionSent', this.handleTransaction.bind(this));
    this.wallet.on('connected', this.handleConnection.bind(this));
    this.wallet.on('disconnected', this.handleDisconnection.bind(this));
  }
  
  handleAccountChange(event) {
    console.log('Account changed:', event.data.account);
    // Update your app's state
  }
  
  handleTransaction(event) {
    console.log('Transaction sent:', event.data.txHash);
    // Update transaction status in your app
  }
  
  handleConnection(event) {
    console.log('Wallet connected:', event.data.accounts);
    this.isConnected = true;
    // Enable wallet features in your app
  }
  
  handleDisconnection() {
    console.log('Wallet disconnected');
    this.isConnected = false;
    // Disable wallet features in your app
  }
}

// Usage
const walletIntegration = new WalletIntegration();
await walletIntegration.initialize();
`
};

export const INTEGRATION_GUIDE = {
  title: "Personal Wallet Integration Guide",
  description: "Integrate Bitcoin, Lightning Network, and Starknet functionality into your application",
  
  quickStart: {
    title: "Quick Start",
    steps: [
      "Check if Personal Wallet is available: `window.personalWallet`",
      "Connect to the wallet: `await window.personalWallet.connect()`",
      "Get available accounts: `await window.personalWallet.getAccounts()`",
      "Send transactions using network-specific methods",
      "Listen for events to update your UI"
    ]
  },
  
  api: {
    title: "API Reference",
    methods: [
      {
        name: "connect()",
        description: "Connect to the Personal Wallet",
        returns: "Promise<WalletConnection[]>",
        example: "const accounts = await wallet.connect();"
      },
      {
        name: "disconnect()",
        description: "Disconnect from the wallet",
        returns: "Promise<void>",
        example: "await wallet.disconnect();"
      },
      {
        name: "isConnected()",
        description: "Check connection status",
        returns: "boolean",
        example: "const connected = wallet.isConnected();"
      },
      {
        name: "getAccounts()",
        description: "Get all wallet accounts",
        returns: "Promise<WalletConnection[]>",
        example: "const accounts = await wallet.getAccounts();"
      },
      {
        name: "sendBitcoin(to, amount, options?)",
        description: "Send Bitcoin transaction",
        parameters: "to: string, amount: string, options?: { feeRate?: number }",
        returns: "Promise<{ txHash: string }>",
        example: "const tx = await wallet.sendBitcoin('bc1q...', '0.001', { feeRate: 10 });"
      },
      {
        name: "createLightningInvoice(amount, description)",
        description: "Create Lightning Network invoice",
        parameters: "amount: number, description: string",
        returns: "Promise<{ invoice: string; paymentHash: string }>",
        example: "const invoice = await wallet.createLightningInvoice(1000, 'Payment');"
      },
      {
        name: "payLightningInvoice(invoice)",
        description: "Pay Lightning Network invoice",
        parameters: "invoice: string",
        returns: "Promise<{ txHash: string }>",
        example: "const result = await wallet.payLightningInvoice('lnbc...');"
      },
      {
        name: "callStarknetContract(contract, method, params)",
        description: "Call Starknet smart contract",
        parameters: "contract: string, method: string, params: any[]",
        returns: "Promise<{ txHash: string }>",
        example: "const tx = await wallet.callStarknetContract('0x...', 'transfer', [to, amount]);"
      }
    ]
  },
  
  events: {
    title: "Event System",
    description: "Listen for wallet events to keep your app synchronized",
    eventTypes: [
      {
        name: "connected",
        description: "Fired when wallet connects",
        data: "{ accounts: WalletConnection[] }"
      },
      {
        name: "disconnected",
        description: "Fired when wallet disconnects",
        data: "{}"
      },
      {
        name: "accountChanged",
        description: "Fired when active account changes",
        data: "{ account: WalletConnection }"
      },
      {
        name: "networkChanged",
        description: "Fired when network switches",
        data: "{ network: string }"
      },
      {
        name: "transactionSent",
        description: "Fired when transaction is sent",
        data: "{ txHash: string; request: TransactionRequest }"
      }
    ]
  },
  
  typeDefinitions: {
    title: "TypeScript Definitions",
    types: `
interface WalletConnection {
  address: string;
  network: string;
  balance: string;
  type: 'bitcoin' | 'lightning' | 'starknet';
}

interface TransactionRequest {
  to: string;
  amount: string;
  network: string;
  fee?: string;
  data?: string;
}

interface PersonalWalletAPI {
  connect(): Promise<WalletConnection[]>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getAccounts(): Promise<WalletConnection[]>;
  sendBitcoin(to: string, amount: string, options?: { feeRate?: number }): Promise<{ txHash: string }>;
  createLightningInvoice(amount: number, description: string): Promise<{ invoice: string; paymentHash: string }>;
  payLightningInvoice(invoice: string): Promise<{ txHash: string }>;
  callStarknetContract(contract: string, method: string, params: any[]): Promise<{ txHash: string }>;
  on(event: string, callback: (event: WalletEvent) => void): void;
  off(event: string, callback: (event: WalletEvent) => void): void;
}

declare global {
  interface Window {
    personalWallet?: PersonalWalletAPI;
  }
}
`
  },
  
  bestPractices: {
    title: "Best Practices",
    practices: [
      "Always check if the wallet is available before attempting to connect",
      "Handle connection errors gracefully and provide user feedback",
      "Listen for disconnection events and update your UI accordingly",
      "Cache connection status in localStorage for better UX",
      "Validate transaction parameters before sending",
      "Show transaction confirmations and status updates",
      "Implement proper error handling for all wallet operations",
      "Use event listeners to keep your app state synchronized"
    ]
  }
};

export function generateIntegrationSnippet(network: 'bitcoin' | 'lightning' | 'starknet'): string {
  switch (network) {
    case 'bitcoin':
      return INTEGRATION_EXAMPLES.sendBitcoin;
    case 'lightning':
      return INTEGRATION_EXAMPLES.lightning;
    case 'starknet':
      return INTEGRATION_EXAMPLES.starknet;
    default:
      return INTEGRATION_EXAMPLES.basicConnection;
  }
}