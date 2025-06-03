/**
 * Wallet Integration Interface for External Applications
 * Allows other apps to integrate with the Personal Wallet
 */

import { WalletAccount, Transaction, createWalletIntegration } from './wallet-sdk';

// Event types for wallet integration
export type WalletEvent = 
  | { type: 'accountsChanged'; accounts: WalletAccount[] }
  | { type: 'transactionCompleted'; transaction: Transaction }
  | { type: 'connected'; connected: boolean }
  | { type: 'error'; error: string };

// Import the main interface from wallet-provider
import { PersonalWalletAPI, WalletConnection } from './wallet-provider';

class WalletIntegrationProvider {
  private connected = false;
  private selectedAccount: WalletAccount | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private integration = createWalletIntegration();

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<boolean> {
    try {
      this.connected = await this.integration.connect();
      if (this.connected) {
        const accounts = await this.integration.getAccounts();
        if (accounts.length > 0) {
          this.selectedAccount = accounts[0];
        }
        this.emit('connected', { connected: true });
        this.emit('accountsChanged', { accounts });
      }
      return this.connected;
    } catch (error) {
      this.emit('error', { error: error instanceof Error ? error.message : 'Connection failed' });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.integration.disconnect();
    this.connected = false;
    this.selectedAccount = null;
    this.emit('connected', { connected: false });
  }

  async getAccounts(): Promise<WalletAccount[]> {
    if (!this.connected) throw new Error('Wallet not connected');
    return this.integration.getAccounts();
  }

  async getSelectedAccount(): Promise<WalletAccount | null> {
    return this.selectedAccount;
  }

  async switchAccount(address: string): Promise<boolean> {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      this.selectedAccount = account;
      this.emit('accountsChanged', { accounts: [account] });
      return true;
    }
    return false;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    return this.integration.signTransaction({ type: 'message', data: message });
  }

  async signTransaction(transaction: any): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    return this.integration.signTransaction(transaction);
  }

  async sendTransaction(transaction: any): Promise<Transaction> {
    if (!this.connected) throw new Error('Wallet not connected');
    const result = await this.integration.sendTransaction(transaction);
    this.emit('transactionCompleted', { transaction: result });
    return result;
  }

  async sendBitcoin(to: string, amount: string, options?: { feeRate?: number }): Promise<Transaction> {
    return this.sendTransaction({
      type: 'bitcoin',
      to,
      amount,
      feeRate: options?.feeRate,
      network: 'bitcoin'
    });
  }

  async payLightningInvoice(invoice: string): Promise<Transaction> {
    return this.sendTransaction({
      type: 'lightning',
      invoice,
      network: 'lightning'
    });
  }

  async createLightningInvoice(amount: number, description: string): Promise<any> {
    // This would be implemented with the actual Lightning SDK
    return {
      paymentRequest: `lnbc${amount}u1pvjluez...`,
      amount,
      description,
      expiry: Date.now() + (24 * 60 * 60 * 1000)
    };
  }

  async callStarknetContract(call: any): Promise<Transaction> {
    return this.sendTransaction({
      type: 'starknet',
      ...call,
      network: 'starknet'
    });
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  getNetworks(): string[] {
    return ['bitcoin', 'lightning', 'starknet'];
  }

  getCurrentNetwork(): string {
    return this.selectedAccount?.network || 'bitcoin';
  }

  async switchNetwork(network: string): Promise<boolean> {
    const accounts = await this.getAccounts();
    const account = accounts.find(acc => acc.network === network);
    if (account) {
      this.selectedAccount = account;
      return true;
    }
    return false;
  }
}

// Global wallet provider instance
let walletProvider: PersonalWalletProvider | null = null;

// Export for external app integration
export function getWalletProvider(): WalletProvider {
  if (!walletProvider) {
    walletProvider = new PersonalWalletProvider();
  }
  return walletProvider;
}

// Window object extension for browser integration
declare global {
  interface Window {
    personalWallet?: WalletProvider;
  }
}

// Auto-inject into window for external apps
if (typeof window !== 'undefined') {
  window.personalWallet = getWalletProvider();
}

// Integration detection for external apps
export function detectWalletIntegration(): boolean {
  return typeof window !== 'undefined' && !!window.personalWallet;
}

// Connection helper for external apps
export async function connectPersonalWallet(): Promise<WalletProvider | null> {
  if (!detectWalletIntegration()) {
    return null;
  }
  
  const wallet = window.personalWallet!;
  const connected = await wallet.connect();
  
  return connected ? wallet : null;
}

// Example usage for external apps:
/*
// In an external app:
import { connectPersonalWallet } from './personal-wallet-integration';

async function usePersonalWallet() {
  const wallet = await connectPersonalWallet();
  if (!wallet) {
    console.log('Personal Wallet not available');
    return;
  }
  
  // Get accounts
  const accounts = await wallet.getAccounts();
  console.log('Available accounts:', accounts);
  
  // Send Bitcoin
  const tx = await wallet.sendBitcoin('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', '0.001');
  console.log('Transaction sent:', tx);
  
  // Listen for events
  wallet.on('transactionCompleted', (data) => {
    console.log('Transaction completed:', data.transaction);
  });
}
*/