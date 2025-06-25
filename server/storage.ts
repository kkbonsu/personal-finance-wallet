import { 
  users, wallets, transactions, defiPositions, vaultDeposits, defiProtocols,
  type User, type InsertUser, type Wallet, type InsertWallet, 
  type Transaction, type InsertTransaction, type DefiPosition, 
  type InsertDefiPosition, type VaultDeposit, type InsertVaultDeposit,
  type DefiProtocol, type InsertDefiProtocol 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wallet operations
  getUserWallets(userId: number): Promise<Wallet[]>;
  getWallet(id: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, balance: string, usdValue: string): Promise<void>;

  // Transaction operations
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string, txHash?: string): Promise<void>;

  // Investment operations
  getUserInvestPositions(userId: number): Promise<InvestPosition[]>;
  createInvestPosition(position: InsertInvestPosition): Promise<InvestPosition>;
  updateInvestPosition(id: number, amount: string, usdValue: string): Promise<void>;
  getActiveInvestProtocols(): Promise<InvestProtocol[]>;
  createInvestProtocol(protocol: InsertInvestProtocol): Promise<InvestProtocol>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return await db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet || undefined;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values(insertWallet)
      .returning();
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string, usdValue: string): Promise<void> {
    await db
      .update(wallets)
      .set({ balance, usdValue })
      .where(eq(wallets.id, id));
  }

  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.timestamp);
    
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, txHash?: string): Promise<void> {
    await db
      .update(transactions)
      .set({ status, ...(txHash && { txHash }) })
      .where(eq(transactions.id, id));
  }

  async getUserInvestPositions(userId: number): Promise<InvestPosition[]> {
    return await db
      .select()
      .from(investPositions)
      .where(eq(investPositions.userId, userId));
  }

  async createInvestPosition(insertPosition: InsertInvestPosition): Promise<InvestPosition> {
    const [position] = await db
      .insert(investPositions)
      .values(insertPosition)
      .returning();
    return position;
  }

  async updateInvestPosition(id: number, amount: string, usdValue: string): Promise<void> {
    await db
      .update(investPositions)
      .set({ amount, usdValue })
      .where(eq(investPositions.id, id));
  }

  async getActiveInvestProtocols(): Promise<InvestProtocol[]> {
    return await db
      .select()
      .from(investProtocols)
      .where(eq(investProtocols.isActive, true));
  }

  async createInvestProtocol(insertProtocol: InsertInvestProtocol): Promise<InvestProtocol> {
    const [protocol] = await db
      .insert(investProtocols)
      .values(insertProtocol)
      .returning();
    return protocol;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private investPositions: Map<number, InvestPosition>;
  private investProtocols: Map<number, InvestProtocol>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.investPositions = new Map();
    this.investProtocols = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create demo user
    const user: User = { id: 1, username: "demo", password: "demo" };
    this.users.set(1, user);

    // Create demo wallets with proper Spark SDK derived addresses
    const bitcoinWallet: Wallet = {
      id: 1,
      userId: 1,
      type: 'bitcoin',
      network: 'bitcoin',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      balance: '1.24578932',
      usdValue: '42567.89',
      publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      derivationPath: "m/84'/0'/0'/0/0",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const lightningWallet: Wallet = {
      id: 2,
      userId: 1,
      type: 'lightning',
      network: 'lightning',
      address: '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd',
      balance: '0.15247000',
      usdValue: '5234.12',
      publicKey: '03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd',
      derivationPath: "m/45'/0'/0'/0/0",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.wallets.set(1, bitcoinWallet);
    this.wallets.set(2, lightningWallet);

    // Create demo investment protocols
    const starknetProtocol: InvestProtocol = {
      id: 1,
      name: "Starknet",
      poolName: "STRK Pool",
      network: "starknet",
      tokenSymbol: "STRK",
      apy: "8.20",
      tvl: "2400000.00",
      riskLevel: "low",
      isActive: true
    };

    const lightningProtocol: InvestProtocol = {
      id: 2,
      name: "Lightning Network",
      poolName: "Yield Farm",
      network: "lightning",
      tokenSymbol: "BTC",
      apy: "12.50",
      tvl: "1800000.00",
      riskLevel: "medium",
      isActive: true
    };

    this.investProtocols.set(1, starknetProtocol);
    this.investProtocols.set(2, lightningProtocol);

    // Create demo investment position
    const investPosition: InvestPosition = {
      id: 1,
      userId: 1,
      protocolName: "Starknet",
      poolName: "STRK Pool",
      network: "starknet",
      tokenSymbol: "STRK",
      amount: "1250.00000000",
      usdValue: "1250.00",
      apy: "8.20",
      riskLevel: "low",
      isActive: true,
      createdAt: new Date()
    };

    this.investPositions.set(1, investPosition);

    // Create demo transactions
    const transactions: Transaction[] = [
      {
        id: 1,
        userId: 1,
        walletId: 2,
        type: "receive",
        amount: "250.00000000",
        usdAmount: "250.00",
        fee: "0.00001000",
        status: "confirmed",
        txHash: "0x123...",
        description: "Received USDT",
        network: "lightning",
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      {
        id: 2,
        userId: 1,
        walletId: 2,
        type: "yield_earned",
        amount: "12.34000000",
        usdAmount: "12.34",
        fee: "0.00000000",
        status: "confirmed",
        description: "DeFi Yield Earned",
        network: "starknet",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: 3,
        userId: 1,
        walletId: 1,
        type: "send",
        amount: "0.03750000",
        usdAmount: "1500.00",
        fee: "0.00006250",
        status: "confirmed",
        txHash: "0x456...",
        description: "Sent Bitcoin",
        network: "onchain",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    transactions.forEach(tx => this.transactions.set(tx.id, tx));
    this.currentId = 10;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(wallet => wallet.userId === userId);
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentId++;
    const wallet: Wallet = { ...insertWallet, id };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string, usdValue: string): Promise<void> {
    const wallet = this.wallets.get(id);
    if (wallet) {
      wallet.balance = balance;
      wallet.usdValue = usdValue;
      this.wallets.set(id, wallet);
    }
  }

  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      timestamp: new Date() 
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, txHash?: string): Promise<void> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      transaction.status = status;
      if (txHash) transaction.txHash = txHash;
      this.transactions.set(id, transaction);
    }
  }

  async getUserInvestPositions(userId: number): Promise<InvestPosition[]> {
    return Array.from(this.investPositions.values())
      .filter(position => position.userId === userId && position.isActive);
  }

  async createInvestPosition(insertPosition: InsertInvestPosition): Promise<InvestPosition> {
    const id = this.currentId++;
    const position: InvestPosition = { 
      ...insertPosition, 
      id, 
      createdAt: new Date() 
    };
    this.investPositions.set(id, position);
    return position;
  }

  async updateInvestPosition(id: number, amount: string, usdValue: string): Promise<void> {
    const position = this.investPositions.get(id);
    if (position) {
      position.amount = amount;
      position.usdValue = usdValue;
      this.investPositions.set(id, position);
    }
  }

  async getActiveInvestProtocols(): Promise<InvestProtocol[]> {
    return Array.from(this.investProtocols.values()).filter(protocol => protocol.isActive);
  }

  async createInvestProtocol(insertProtocol: InsertInvestProtocol): Promise<InvestProtocol> {
    const id = this.currentId++;
    const protocol: InvestProtocol = { ...insertProtocol, id };
    this.investProtocols.set(id, protocol);
    return protocol;
  }
}

export const storage = new MemStorage();
