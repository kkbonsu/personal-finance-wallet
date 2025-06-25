export class LightsparkClient {
  private clientId: string;
  private clientSecret: string;
  private initialized: boolean = false;

  constructor() {
    this.clientId = import.meta.env.VITE_LIGHTSPARK_API_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_LIGHTSPARK_API_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Lightspark API credentials not found in environment variables');
    }
  }

  async initialize(): Promise<void> {
    try {
      if (!this.clientId || !this.clientSecret) {
        console.warn('Lightspark credentials not available, using fallback mode');
        return;
      }

      // Test the credentials with a simple GraphQL request
      const response = await fetch('https://api.lightspark.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: JSON.stringify({
          query: `
            query CurrentAccount {
              current_account {
                id
                name
              }
            }
          `
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.current_account) {
          this.initialized = true;
          console.log('Lightspark client initialized successfully');
        } else {
          console.warn('Lightspark API returned unexpected response');
        }
      } else {
        console.warn('Failed to authenticate with Lightspark API');
      }
    } catch (error) {
      console.error('Failed to initialize Lightspark client:', error);
    }
  }

  async createInvoice(amountMsats: number, memo: string = ''): Promise<{
    paymentRequest: string;
    paymentHash: string;
    amount: number;
    description: string;
    expiresAt: Date;
  }> {
    if (!this.initialized) {
      throw new Error('Lightspark client not initialized');
    }

    try {
      const response = await fetch('https://api.lightspark.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateInvoice($amount_msats: Long!, $memo: String, $expiry_secs: Int) {
              create_invoice(input: {
                amount_msats: $amount_msats
                memo: $memo
                expiry_secs: $expiry_secs
              }) {
                invoice {
                  id
                  encoded_payment_request
                  payment_hash
                  amount {
                    original_value
                  }
                  memo
                  expires_at
                }
              }
            }
          `,
          variables: {
            amount_msats: amountMsats,
            memo: memo,
            expiry_secs: 3600
          }
        })
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`Lightspark API error: ${data.errors[0].message}`);
      }

      const invoice = data.data.create_invoice.invoice;
      
      return {
        paymentRequest: invoice.encoded_payment_request,
        paymentHash: invoice.payment_hash,
        amount: amountMsats / 1000, // Convert back to sats
        description: memo,
        expiresAt: new Date(invoice.expires_at)
      };
    } catch (error) {
      console.error('Failed to create Lightspark invoice:', error);
      throw error;
    }
  }

  async payInvoice(encodedInvoice: string): Promise<{
    id: string;
    status: string;
    amount: number;
    fee: number;
    paymentHash: string;
  }> {
    if (!this.account) {
      throw new Error('Lightspark client not initialized');
    }

    try {
      const payment = await this.api.payInvoice({
        encodedInvoice,
        timeoutSecs: 60
      });

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount.originalValue / 1000, // Convert msats to sats
        fee: payment.fees?.originalValue || 0,
        paymentHash: payment.paymentHash || ''
      };
    } catch (error) {
      console.error('Failed to pay Lightspark invoice:', error);
      throw error;
    }
  }

  async getBalance(): Promise<{
    totalBalance: number;
    confirmedBalance: number;
    unconfirmedBalance: number;
  }> {
    if (!this.account) {
      throw new Error('Lightspark client not initialized');
    }

    try {
      const balances = await this.api.getAccountBalances();
      
      return {
        totalBalance: balances.ownedBalance?.originalValue || 0,
        confirmedBalance: balances.availableToSendBalance?.originalValue || 0,
        unconfirmedBalance: balances.availableToWithdrawBalance?.originalValue || 0
      };
    } catch (error) {
      console.error('Failed to get Lightspark balance:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Create a singleton instance
export const lightsparkClient = new LightsparkClient();