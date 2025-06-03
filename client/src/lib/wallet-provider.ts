/**
 * External Wallet Provider Interface
 * Allows other applications to integrate with the Personal Wallet
 */

export interface WalletConnection {
  address: string;
  network: string;
  balance: string;
  type: 'bitcoin' | 'lightning' | 'starknet';
}

export interface TransactionRequest {
  to: string;
  amount: string;
  network: string;
  fee?: string;
  data?: string;
}

export interface WalletEvent {
  type: 'accountChanged' | 'networkChanged' | 'transactionSent' | 'connected' | 'disconnected';
  data: any;
}

export interface PersonalWalletAPI {
  // Connection management
  connect(): Promise<WalletConnection[]>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Account management
  getAccounts(): Promise<WalletConnection[]>;
  getSelectedAccount(): Promise<WalletConnection | null>;
  switchAccount(address: string): Promise<boolean>;
  
  // Transaction methods
  signMessage(message: string): Promise<string>;
  signTransaction(request: TransactionRequest): Promise<string>;
  sendTransaction(request: TransactionRequest): Promise<{ txHash: string; status: string }>;
  
  // Network-specific methods
  sendBitcoin(to: string, amount: string, options?: { feeRate?: number }): Promise<{ txHash: string }>;
  createLightningInvoice(amount: number, description: string): Promise<{ invoice: string; paymentHash: string }>;
  payLightningInvoice(invoice: string): Promise<{ txHash: string }>;
  callStarknetContract(contractAddress: string, method: string, params: any[]): Promise<{ txHash: string }>;
  
  // Event handling
  on(event: string, callback: (event: WalletEvent) => void): void;
  off(event: string, callback: (event: WalletEvent) => void): void;
  
  // Utility
  getNetworks(): string[];
  getCurrentNetwork(): string;
  switchNetwork(network: string): Promise<boolean>;
}

class PersonalWalletProvider implements PersonalWalletAPI {
  private isConnectedState = false;
  private accounts: WalletConnection[] = [];
  private selectedAccount: WalletConnection | null = null;
  private eventListeners = new Map<string, ((event: WalletEvent) => void)[]>();

  async connect(): Promise<WalletConnection[]> {
    // Check if wallet context is available
    if (typeof window === 'undefined' || !window.location.origin.includes('replit')) {
      throw new Error('Personal Wallet not available in this environment');
    }

    // Simulate connection to actual wallet
    this.accounts = [
      {
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        network: 'bitcoin',
        balance: '0.00521847',
        type: 'bitcoin'
      },
      {
        address: '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd',
        network: 'lightning',
        balance: '15247',
        type: 'lightning'
      },
      {
        address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        network: 'starknet',
        balance: '2.847',
        type: 'starknet'
      }
    ];

    this.selectedAccount = this.accounts[0];
    this.isConnectedState = true;

    this.emit('connected', { accounts: this.accounts });
    return this.accounts;
  }

  async disconnect(): Promise<void> {
    this.isConnectedState = false;
    this.accounts = [];
    this.selectedAccount = null;
    this.emit('disconnected', {});
  }

  isConnected(): boolean {
    return this.isConnectedState;
  }

  async getAccounts(): Promise<WalletConnection[]> {
    if (!this.isConnectedState) {
      throw new Error('Wallet not connected');
    }
    return this.accounts;
  }

  async getSelectedAccount(): Promise<WalletConnection | null> {
    return this.selectedAccount;
  }

  async switchAccount(address: string): Promise<boolean> {
    const account = this.accounts.find(acc => acc.address === address);
    if (account) {
      this.selectedAccount = account;
      this.emit('accountChanged', { account });
      return true;
    }
    return false;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isConnectedState) {
      throw new Error('Wallet not connected');
    }

    // Simulate message signing with current account
    const account = this.selectedAccount;
    if (!account) {
      throw new Error('No account selected');
    }

    const signature = `0x${btoa(message)}_signed_by_${account.address.slice(0, 8)}`;
    return signature;
  }

  async signTransaction(request: TransactionRequest): Promise<string> {
    if (!this.isConnectedState) {
      throw new Error('Wallet not connected');
    }

    // Simulate transaction signing
    const signature = `signed_${Date.now()}_${request.to}_${request.amount}`;
    return signature;
  }

  async sendTransaction(request: TransactionRequest): Promise<{ txHash: string; status: string }> {
    if (!this.isConnectedState) {
      throw new Error('Wallet not connected');
    }

    const signature = await this.signTransaction(request);
    const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;
    
    this.emit('transactionSent', { txHash, request });
    
    return { txHash, status: 'pending' };
  }

  async sendBitcoin(to: string, amount: string, options?: { feeRate?: number }): Promise<{ txHash: string }> {
    const result = await this.sendTransaction({
      to,
      amount,
      network: 'bitcoin',
      fee: options?.feeRate?.toString()
    });
    return { txHash: result.txHash };
  }

  async createLightningInvoice(amount: number, description: string): Promise<{ invoice: string; paymentHash: string }> {
    const paymentHash = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoice = `lnbc${amount}u1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygspp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w`;
    
    return { invoice, paymentHash };
  }

  async payLightningInvoice(invoice: string): Promise<{ txHash: string }> {
    const result = await this.sendTransaction({
      to: 'lightning_payment',
      amount: '0.001',
      network: 'lightning',
      data: invoice
    });
    return { txHash: result.txHash };
  }

  async callStarknetContract(contractAddress: string, method: string, params: any[]): Promise<{ txHash: string }> {
    const result = await this.sendTransaction({
      to: contractAddress,
      amount: '0',
      network: 'starknet',
      data: JSON.stringify({ method, params })
    });
    return { txHash: result.txHash };
  }

  on(event: string, callback: (event: WalletEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (event: WalletEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(type: string, data: any): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const event: WalletEvent = { type: type as any, data };
      listeners.forEach(callback => callback(event));
    }
  }

  getNetworks(): string[] {
    return ['bitcoin', 'lightning', 'starknet'];
  }

  getCurrentNetwork(): string {
    return this.selectedAccount?.network || 'bitcoin';
  }

  async switchNetwork(network: string): Promise<boolean> {
    const account = this.accounts.find(acc => acc.network === network);
    if (account) {
      this.selectedAccount = account;
      this.emit('networkChanged', { network });
      return true;
    }
    return false;
  }
}

// Global instance for external access
let providerInstance: PersonalWalletProvider | null = null;

export function getPersonalWalletProvider(): PersonalWalletAPI {
  if (!providerInstance) {
    providerInstance = new PersonalWalletProvider();
  }
  return providerInstance;
}

// Auto-inject into window for external apps
declare global {
  interface Window {
    personalWallet?: PersonalWalletAPI;
  }
}

if (typeof window !== 'undefined') {
  window.personalWallet = getPersonalWalletProvider();
}

// Integration helper for external apps
export async function connectToPersonalWallet(): Promise<PersonalWalletAPI | null> {
  if (typeof window === 'undefined' || !window.personalWallet) {
    return null;
  }

  try {
    await window.personalWallet.connect();
    return window.personalWallet;
  } catch (error) {
    console.error('Failed to connect to Personal Wallet:', error);
    return null;
  }
}