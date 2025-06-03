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
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initializeWallet: (mnemonic?: string) => Promise<void>;
  sendBitcoin: (to: string, amount: string) => Promise<Transaction>;
  payLightningInvoice: (invoice: string) => Promise<Transaction>;
  createLightningInvoice: (amount: number, description: string) => Promise<any>;
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
      const walletAccounts = sdk.getAccounts();
      setAccounts(walletAccounts);
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

  const sendBitcoin = async (to: string, amount: string): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.sendBitcoin(to, amount);
  };

  const payLightningInvoice = async (invoice: string): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.payLightningInvoice(invoice);
  };

  const createLightningInvoice = async (amount: number, description: string) => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.createLightningInvoice(amount, description);
  };

  const sendStarknetTransaction = async (call: any): Promise<Transaction> => {
    if (!sdk) throw new Error('Wallet not initialized');
    return sdk.sendStarknetTransaction(call);
  };

  const refreshAccounts = async () => {
    if (!sdk) return;
    
    try {
      await sdk.deriveAccounts();
      const walletAccounts = sdk.getAccounts();
      setAccounts(walletAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh accounts');
    }
  };

  const value: WalletSDKContextType = {
    sdk,
    accounts,
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