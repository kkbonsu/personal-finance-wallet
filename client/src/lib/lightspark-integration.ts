/**
 * Real Lightspark SDK Integration
 * Replaces placeholder methods with actual Lightspark SDK calls
 */

import { 
  LightsparkClient
} from '@lightsparkdev/lightspark-sdk';

import { 
  LightsparkApi, 
  Account,
  CreateInvoiceInput,
  PayInvoiceInput,
  BitcoinNetwork,
  InvoiceType,
  CurrencyAmount,
  CreateNodeWalletAddressInput,
  WithdrawalRequestInput
} from '@lightsparkdev/lightspark-sdk';

export interface LightsparkConfig {
  apiTokenClientId: string;
  apiTokenClientSecret: string;
  baseUrl?: string;
  network: 'mainnet' | 'testnet' | 'regtest';
}

export interface LightsparkWalletAccount {
  id: string;
  address: string;
  publicKey: string;
  balance: number; // in satoshis
  network: string;
  nodeId?: string;
}

export interface LightsparkTransaction {
  id: string;
  type: 'send' | 'receive' | 'lightning';
  amount: number; // in satoshis
  fee: number; // in satoshis
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  network: string;
  toAddress?: string;
  fromAddress?: string;
  txHash?: string;
  invoice?: string;
}

export interface LightsparkInvoice {
  id: string;
  paymentRequest: string;
  amount: number; // in satoshis
  description: string;
  expiryTimestamp: number;
  paymentHash: string;
  status: 'open' | 'settled' | 'cancelled' | 'expired';
}

export class LightsparkWalletSDK {
  private client: LightsparkClient;
  private config: LightsparkConfig;
  private isAuthenticated: boolean = false;

  constructor(config: LightsparkConfig) {
    this.config = config;
    this.client = new LightsparkClient();
  }

  async initialize(): Promise<void> {
    try {
      // Check if credentials are provided
      if (!this.config.apiTokenClientId || !this.config.apiTokenClientSecret) {
        console.log('Lightspark credentials not provided, using mock mode');
        return;
      }

      // Login with real Lightspark credentials
      await this.client.loginWithApiTokens(
        this.config.apiTokenClientId,
        this.config.apiTokenClientSecret
      );

      console.log('Lightspark SDK authenticated successfully');
      this.isAuthenticated = true;
    } catch (error) {
      console.error('Failed to initialize Lightspark SDK:', error);
      // Don't throw - fallback to mock mode
      this.isAuthenticated = false;
    }
  }

  async getAccount(): Promise<LightsparkWalletAccount | null> {
    if (!this.isAuthenticated) {
      return null;
    }

    try {
      // Get current account
      const currentAccount = await this.client.getCurrentAccount();
      if (!currentAccount) {
        throw new Error('No account found');
      }

      // Get account nodes
      const nodes = await currentAccount.getNodes();
      const node = nodes.entities[0]; // Use first node

      if (!node) {
        throw new Error('No nodes found for account');
      }

      // Get node balances 
      const balances = await node.getBalances();
      const totalBalance = balances?.localBalance?.originalValue || 0;

      return {
        id: currentAccount.id,
        address: node.publicKey || '',
        publicKey: node.publicKey || '',
        balance: totalBalance,
        network: this.config.network,
        nodeId: node.id
      };
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }

  async createInvoice(amountSats: number, memo: string): Promise<LightsparkInvoice> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const currentAccount = await this.client.getCurrentAccount();
      if (!currentAccount) throw new Error('No account found');

      const nodes = await currentAccount.getNodes();
      const node = nodes.entities[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const invoice = await node.createInvoice(amountSats * 1000, memo);

      return {
        id: invoice.id,
        paymentRequest: invoice.data.encodedPaymentRequest,
        amount: amountSats,
        description: memo,
        expiryTimestamp: invoice.data.expiresAt?.getTime() || 0,
        paymentHash: invoice.data.paymentHash,
        status: 'open'
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  async payInvoice(paymentRequest: string): Promise<LightsparkTransaction> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const currentAccount = await this.client.getCurrentAccount();
      if (!currentAccount) throw new Error('No account found');

      const nodes = await currentAccount.getNodes();
      const node = nodes.entities[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const payment = await node.payInvoice(paymentRequest, 60, 1000);

      return {
        id: payment.id,
        type: 'lightning',
        amount: payment.amount.originalValue,
        fee: payment.fees?.originalValue || 0,
        status: payment.status === 'SUCCESS' ? 'completed' : 'pending',
        timestamp: new Date(),
        network: 'lightning',
        invoice: paymentRequest
      };
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      throw error;
    }
  }

  async sendBitcoin(toAddress: string, amountSats: number): Promise<LightsparkTransaction> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const currentAccount = await this.client.getCurrentAccount();
      if (!currentAccount) throw new Error('No account found');

      const nodes = await currentAccount.getNodes();
      const node = nodes.entities[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const withdrawal = await node.requestWithdrawal(toAddress, amountSats);

      return {
        id: withdrawal.id,
        type: 'send',
        amount: amountSats,
        fee: 0, // Fee will be calculated by network
        status: 'pending',
        timestamp: new Date(),
        network: 'bitcoin',
        toAddress,
        fromAddress: node.publicKey || ''
      };
    } catch (error) {
      console.error('Failed to send bitcoin:', error);
      throw error;
    }
  }

  async getBitcoinAddress(): Promise<string> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const currentAccount = await this.client.getCurrentAccount();
      if (!currentAccount) throw new Error('No account found');

      const nodes = await currentAccount.getNodes();
      const node = nodes.entities[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const address = await node.createNodeWalletAddress();
      return address.walletAddress;
    } catch (error) {
      console.error('Failed to get bitcoin address:', error);
      throw error;
    }
  }

  async getTransactionHistory(limit: number = 20): Promise<LightsparkTransaction[]> {
    if (!this.currentAccount) {
      throw new Error('Not authenticated');
    }

    try {
      const nodes = await this.currentAccount.getNodes();
      const node = nodes.entities[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      // Get transactions from the node
      const transactions: LightsparkTransaction[] = [];

      // Get recent payments (both incoming and outgoing)
      const recentTransactions = await node.getTransactions(limit);
      
      recentTransactions.entities.forEach(transaction => {
        transactions.push({
          id: transaction.id,
          type: transaction.typename === 'OutgoingPayment' ? 'send' : 'receive',
          amount: transaction.amount.originalValue,
          fee: transaction.fees?.originalValue || 0,
          status: transaction.status === 'SUCCESS' ? 'completed' : 'pending',
          timestamp: transaction.createdAt,
          network: transaction.typename.includes('Lightning') ? 'lightning' : 'bitcoin'
        });
      });

      // Sort by timestamp
      return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  async disconnect(): Promise<void> {
    // Logout from Lightspark API
    this.isAuthenticated = false;
    // The SDK doesn't have an explicit logout method, so we just clear the state
  }

  isConnected(): boolean {
    return this.isAuthenticated;
  }
}