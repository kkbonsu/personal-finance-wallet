import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  PersonalWalletSDK, 
  WalletConfig, 
  WalletAccount, 
  Transaction,
  initializeWalletSDK,
  getWalletSDK
} from '@/lib/wallet-sdk';

interface WalletSDKContextType {
  sdk: PersonalWalletSDK | null;
  accounts: WalletAccount[];
  bitcoinAccounts: WalletAccount[];
  lightningAccounts: WalletAccount[];
  starknetAccounts: WalletAccount[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initializeWallet: (mnemonic?: string) => Promise<void>;
  sendBitcoin: (to: string, amount: string, addressType?: 'legacy' | 'segwit' | 'taproot') => Promise<Transaction>;
  payLightningInvoice: (invoice: string, channelId?: string) => Promise<Transaction>;
  createLightningInvoice: (amount: number, description: string, channelId?: string) => Promise<any>;
  sendStarknetTransaction: (call: any) => Promise<Transaction>;
  refreshAccounts: () => Promise<void>;
}

const WalletSDKContext = createContext<WalletSDKContextType | undefined>(undefined);

interface WalletSDKProviderProps {
  children: ReactNode;
}

export function WalletSDKProvider({ children }: WalletSDKProviderProps) {
  const [sdk, setSdk] = useState<PersonalWalletSDK | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [bitcoinAccounts, setBitcoinAccounts] = useState<WalletAccount[]>([]);
  const [lightningAccounts, setLightningAccounts] = useState<WalletAccount[]>([]);
  const [starknetAccounts, setStarknetAccounts] = useState<WalletAccount[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize SDK with default config
    const config: WalletConfig = {
      network: 'testnet',
      sparkEndpoint: 'https://spark-testnet.buildonspark.com',
      starknetEndpoint: 'https://starknet-testnet.public.blastapi.io'
    };

    const walletSDK = initializeWalletSDK(config);
    setSdk(walletSDK);

    // Check if wallet was previously initialized
    const savedMnemonic = localStorage.getItem('wallet_mnemonic');
    if (savedMnemonic) {
      initializeWallet(savedMnemonic);
    }
  }, []);

  const initializeWallet = async (mnemonic?: string) => {
    if (!sdk) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await sdk.initialize(mnemonic);
      
      // Get all account types separately
      const allAccounts = sdk.getAccounts();
      const btcAccounts = sdk.getBitcoinAccounts();
      const lnAccounts = sdk.getLightningAccounts();
      const strkAccounts = sdk.getStarknetAccounts();
      
      setAccounts(allAccounts);
      setBitcoinAccounts(btcAccounts);
      setLightningAccounts(lnAccounts);
      setStarknetAccounts(strkAccounts);
      setIsInitialized(true);

      // Save mnemonic securely (in production, use more secure storage)
      if (mnemonic) {
        localStorage.setItem('wallet_mnemonic', mnemonic);
      } else {
        const generatedMnemonic = sdk.getMnemonic();
        if (generatedMnemonic) {
          localStorage.setItem('wallet_mnemonic', generatedMnemonic);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const sendBitcoin = async (to: string, amount: string, addressType: 'legacy' | 'segwit' | 'taproot' = 'segwit'): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.sendBitcoin(to, amount, addressType);
  };

  const payLightningInvoice = async (invoice: string, channelId: string = 'channel_1'): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    
    try {
      // Try to use real Lightspark API first
      if (lightsparkClient.isInitialized()) {
        const payment = await lightsparkClient.payInvoice(invoice);
        
        return {
          id: payment.id,
          type: 'send',
          amount: (payment.amount / 100000000).toString(), // Convert sats to BTC
          fee: (payment.fee / 100000000).toString(),
          status: payment.status.toLowerCase(),
          timestamp: new Date(),
          network: 'lightning',
          txHash: payment.paymentHash
        };
      }
      
      // Fallback to SDK implementation
      return sdk.payLightningInvoice(invoice, channelId);
    } catch (error) {
      console.error('Error paying Lightning invoice:', error);
      throw error;
    }
  };

  const createLightningInvoice = async (amount: number, description: string, channelId: string = 'channel_1') => {
    if (!sdk) throw new Error('Wallet not initialized');
    
    try {
      // Try to use real Lightspark API first
      if (lightsparkClient.isInitialized()) {
        const amountMsats = amount * 100000; // Convert sats to millisatoshis
        const invoice = await lightsparkClient.createInvoice(amountMsats, description);
        return invoice;
      }
      
      // Fallback to SDK implementation
      return sdk.createLightningInvoice(amount, description, channelId);
    } catch (error) {
      console.error('Error creating Lightning invoice:', error);
      throw error;
    }
  };

  const sendStarknetTransaction = async (call: any): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.sendStarknetTransaction(call);
  };

  const refreshAccounts = async () => {
    if (!sdk) return;
    
    try {
      await sdk.deriveAccounts();
      
      // Update all account types
      const allAccounts = sdk.getAccounts();
      const btcAccounts = sdk.getBitcoinAccounts();
      const lnAccounts = sdk.getLightningAccounts();
      const strkAccounts = sdk.getStarknetAccounts();
      
      setAccounts(allAccounts);
      setBitcoinAccounts(btcAccounts);
      setLightningAccounts(lnAccounts);
      setStarknetAccounts(strkAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh accounts');
    }
  };

  const value: WalletSDKContextType = {
    sdk,
    accounts,
    bitcoinAccounts,
    lightningAccounts,
    starknetAccounts,
    isInitialized,
    isLoading,
    error,
    initializeWallet,
    sendBitcoin,
    payLightningInvoice,
    createLightningInvoice,
    sendStarknetTransaction,
    refreshAccounts
  };

  return (
    <WalletSDKContext.Provider value={value}>
      {children}
    </WalletSDKContext.Provider>
  );
}

export function useWalletSDK() {
  const context = useContext(WalletSDKContext);
  if (context === undefined) {
    throw new Error('useWalletSDK must be used within a WalletSDKProvider');
  }
  return context;
}