/**
 * Wallet Integration Interface for External Applications
 * Allows other apps to integrate with the Personal Wallet
 */

export { 
  PersonalWalletAPI, 
  WalletConnection, 
  getPersonalWalletProvider, 
  connectToPersonalWallet 
} from './wallet-provider';

export { 
  INTEGRATION_EXAMPLES, 
  INTEGRATION_GUIDE, 
  generateIntegrationSnippet 
} from './integration-docs';