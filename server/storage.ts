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

  // DeFi operations
  getUserDefiPositions(userId: number): Promise<DefiPosition[]>;
  createDefiPosition(position: InsertDefiPosition): Promise<DefiPosition>;
  updateDefiPosition(id: number, amount: string, usdValue: string): Promise<void>;
  getActiveDefiProtocols(): Promise<DefiProtocol[]>;
  createDefiProtocol(protocol: InsertDefiProtocol): Promise<DefiProtocol>;

  // Vault operations
  getUserVaultDeposits(userId: number): Promise<VaultDeposit[]>;
  createVaultDeposit(deposit: InsertVaultDeposit): Promise<VaultDeposit>;
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

  async getUserDefiPositions(userId: number): Promise<DefiPosition[]> {
    return await db
      .select()
      .from(defiPositions)
      .where(eq(defiPositions.userId, userId));
  }

  async createDefiPosition(insertPosition: InsertDefiPosition): Promise<DefiPosition> {
    const [position] = await db
      .insert(defiPositions)
      .values(insertPosition)
      .returning();
    return position;
  }

  async updateDefiPosition(id: number, amount: string, usdValue: string): Promise<void> {
    await db
      .update(defiPositions)
      .set({ amount, usdValue })
      .where(eq(defiPositions.id, id));
  }

  async getActiveDefiProtocols(): Promise<DefiProtocol[]> {
    return await db
      .select()
      .from(defiProtocols)
      .where(eq(defiProtocols.isActive, true));
  }

  async createDefiProtocol(insertProtocol: InsertDefiProtocol): Promise<DefiProtocol> {
    const [protocol] = await db
      .insert(defiProtocols)
      .values(insertProtocol)
      .returning();
    return protocol;
  }

  async getUserVaultDeposits(userId: number): Promise<VaultDeposit[]> {
    return await db
      .select()
      .from(vaultDeposits)
      .where(eq(vaultDeposits.userId, userId));
  }

  async createVaultDeposit(insertDeposit: InsertVaultDeposit): Promise<VaultDeposit> {
    const [deposit] = await db
      .insert(vaultDeposits)
      .values(insertDeposit)
      .returning();
    return deposit;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private defiPositions: Map<number, DefiPosition>;
  private vaultDeposits: Map<number, VaultDeposit>;
  private defiProtocols: Map<number, DefiProtocol>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.defiPositions = new Map();
    this.vaultDeposits = new Map();
    this.defiProtocols = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create demo user
    const user: User = { id: 1, username: "demo", password: "demo" };
    this.users.set(1, user);

    // Create demo wallets
    const bitcoinWallet: Wallet = {
      id: 1,
      userId: 1,
      type: "bitcoin",
      network: "lightning",
      address: "lnbc1...",
      balance: "0.24851000",
      usdValue: "10234.56"
    };
    
    const usdtWallet: Wallet = {
      id: 2,
      userId: 1,
      type: "usdt",
      network: "lightning",
      address: "lnbc1...",
      balance: "2612.67000000",
      usdValue: "2612.67"
    };

    this.wallets.set(1, bitcoinWallet);
    this.wallets.set(2, usdtWallet);

    // Create demo DeFi protocols
    const starknetProtocol: DefiProtocol = {
      id: 1,
      name: "Starknet",
      poolName: "USDC Pool",
      network: "starknet",
      tokenSymbol: "USDC",
      apy: "8.20",
      tvl: "2400000.00",
      riskLevel: "low",
      isActive: true
    };

    const lightningProtocol: DefiProtocol = {
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

    this.defiProtocols.set(1, starknetProtocol);
    this.defiProtocols.set(2, lightningProtocol);

    // Create demo DeFi position
    const defiPosition: DefiPosition = {
      id: 1,
      userId: 1,
      protocolName: "Starknet",
      poolName: "USDC Pool",
      network: "starknet",
      tokenSymbol: "USDC",
      amount: "1250.00000000",
      usdValue: "1250.00",
      apy: "8.20",
      riskLevel: "low",
      isActive: true,
      createdAt: new Date()
    };

    this.defiPositions.set(1, defiPosition);

    // Create demo vault deposit
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + 3);
    
    const vaultDeposit: VaultDeposit = {
      id: 1,
      userId: 1,
      amount: "0.12000000",
      usdValue: "4500.00",
      lockPeriod: 90,
      unlockDate,
      currentYield: "4.20",
      isActive: true,
      createdAt: new Date()
    };

    this.vaultDeposits.set(1, vaultDeposit);

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

  async getUserDefiPositions(userId: number): Promise<DefiPosition[]> {
    return Array.from(this.defiPositions.values())
      .filter(position => position.userId === userId && position.isActive);
  }

  async createDefiPosition(insertPosition: InsertDefiPosition): Promise<DefiPosition> {
    const id = this.currentId++;
    const position: DefiPosition = { 
      ...insertPosition, 
      id, 
      createdAt: new Date() 
    };
    this.defiPositions.set(id, position);
    return position;
  }

  async updateDefiPosition(id: number, amount: string, usdValue: string): Promise<void> {
    const position = this.defiPositions.get(id);
    if (position) {
      position.amount = amount;
      position.usdValue = usdValue;
      this.defiPositions.set(id, position);
    }
  }

  async getActiveDefiProtocols(): Promise<DefiProtocol[]> {
    return Array.from(this.defiProtocols.values()).filter(protocol => protocol.isActive);
  }

  async createDefiProtocol(insertProtocol: InsertDefiProtocol): Promise<DefiProtocol> {
    const id = this.currentId++;
    const protocol: DefiProtocol = { ...insertProtocol, id };
    this.defiProtocols.set(id, protocol);
    return protocol;
  }

  async getUserVaultDeposits(userId: number): Promise<VaultDeposit[]> {
    return Array.from(this.vaultDeposits.values())
      .filter(deposit => deposit.userId === userId && deposit.isActive);
  }

  async createVaultDeposit(insertDeposit: InsertVaultDeposit): Promise<VaultDeposit> {
    const id = this.currentId++;
    const deposit: VaultDeposit = { 
      ...insertDeposit, 
      id, 
      createdAt: new Date() 
    };
    this.vaultDeposits.set(id, deposit);
    return deposit;
  }
}

export const storage = new DatabaseStorage();
