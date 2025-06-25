/**
 * Real Lightspark SDK Integration
 * Replaces placeholder methods with actual Lightspark SDK calls
 */

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
  private client: LightsparkApi;
  private config: LightsparkConfig;
  private currentAccount: Account | null = null;

  constructor(config: LightsparkConfig) {
    this.config = config;
    this.client = new LightsparkApi(undefined, config.baseUrl);
  }

  async initialize(): Promise<void> {
    try {
      // Login with API credentials
      await this.client.loginWithApiTokens(
        this.config.apiTokenClientId,
        this.config.apiTokenClientSecret
      );

      // Get current account
      this.currentAccount = await this.client.getCurrentAccount();
      
      if (!this.currentAccount) {
        throw new Error('Failed to get current account');
      }
    } catch (error) {
      console.error('Failed to initialize Lightspark SDK:', error);
      throw error;
    }
  }

  async getAccount(): Promise<LightsparkWalletAccount | null> {
    if (!this.currentAccount) {
      return null;
    }

    try {
      // Get account balances and node information
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0]; // Use first node

      if (!node) {
        throw new Error('No nodes found for account');
      }

      // Get node balance
      const balances = await this.client.getNodeBalances(node.id);
      const totalBalance = balances.ownedBalance?.originalValue || 0;

      return {
        id: this.currentAccount.id,
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
    if (!this.currentAccount) {
      throw new Error('Not authenticated');
    }

    try {
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const input: CreateInvoiceInput = {
        nodeId: node.id,
        amountMsats: amountSats * 1000, // Convert sats to millisats
        memo,
        invoiceType: InvoiceType.STANDARD
      };

      const invoice = await this.client.createInvoice(input);

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
    if (!this.currentAccount) {
      throw new Error('Not authenticated');
    }

    try {
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const input: PayInvoiceInput = {
        nodeId: node.id,
        encodedInvoice: paymentRequest,
        timeoutSecs: 60,
        maximumFeesMsats: 1000 // 1 sat max fee
      };

      const payment = await this.client.payInvoice(input);

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
    if (!this.currentAccount) {
      throw new Error('Not authenticated');
    }

    try {
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const input: WithdrawalRequestInput = {
        nodeId: node.id,
        bitcoinAddress: toAddress,
        amountSats: amountSats,
        withdrawalMode: 'WALLET_ONLY' // Use wallet funds only
      };

      const withdrawal = await this.client.requestWithdrawal(input);

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
    if (!this.currentAccount) {
      throw new Error('Not authenticated');
    }

    try {
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      const input: CreateNodeWalletAddressInput = {
        nodeId: node.id
      };

      const address = await this.client.createNodeWalletAddress(input);
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
      const nodes = await this.client.getAccountNodes(this.currentAccount.id);
      const node = nodes[0];

      if (!node) {
        throw new Error('No nodes found');
      }

      // Get both payments and withdrawals
      const payments = await this.client.getNodePayments(node.id, limit);
      const withdrawals = await this.client.getNodeWithdrawals(node.id, limit);

      const transactions: LightsparkTransaction[] = [];

      // Convert payments to transactions
      payments.forEach(payment => {
        transactions.push({
          id: payment.id,
          type: 'lightning',
          amount: payment.amount.originalValue,
          fee: payment.fees?.originalValue || 0,
          status: payment.status === 'SUCCESS' ? 'completed' : 'pending',
          timestamp: payment.createdAt,
          network: 'lightning'
        });
      });

      // Convert withdrawals to transactions
      withdrawals.forEach(withdrawal => {
        transactions.push({
          id: withdrawal.id,
          type: 'send',
          amount: withdrawal.amount.originalValue,
          fee: withdrawal.fees?.originalValue || 0,
          status: withdrawal.status === 'SUCCESS' ? 'completed' : 'pending',
          timestamp: withdrawal.createdAt,
          network: 'bitcoin',
          toAddress: withdrawal.bitcoinAddress
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
    this.currentAccount = null;
    // The SDK doesn't have an explicit logout method, so we just clear the state
  }

  isConnected(): boolean {
    return this.currentAccount !== null;
  }
}