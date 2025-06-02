import { pgTable, text, serial, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'bitcoin', 'usdt'
  network: text("network").notNull(), // 'lightning', 'onchain', 'starknet'
  address: text("address").notNull(),
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("0"),
  usdValue: decimal("usd_value", { precision: 18, scale: 2 }).notNull().default("0"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(),
  type: text("type").notNull(), // 'send', 'receive', 'defi_deposit', 'defi_withdraw', 'yield_earned'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 18, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 18, scale: 8 }).default("0"),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'failed'
  txHash: text("tx_hash"),
  description: text("description").notNull(),
  network: text("network").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const defiPositions = pgTable("defi_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  protocolName: text("protocol_name").notNull(),
  poolName: text("pool_name").notNull(),
  network: text("network").notNull(), // 'starknet', 'lightning'
  tokenSymbol: text("token_symbol").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  usdValue: decimal("usd_value", { precision: 18, scale: 2 }).notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vaultDeposits = pgTable("vault_deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  usdValue: decimal("usd_value", { precision: 18, scale: 2 }).notNull(),
  lockPeriod: integer("lock_period").notNull(), // days
  unlockDate: timestamp("unlock_date").notNull(),
  currentYield: decimal("current_yield", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const defiProtocols = pgTable("defi_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  poolName: text("pool_name").notNull(),
  network: text("network").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  tvl: decimal("tvl", { precision: 18, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertDefiPositionSchema = createInsertSchema(defiPositions).omit({
  id: true,
  createdAt: true,
});

export const insertVaultDepositSchema = createInsertSchema(vaultDeposits).omit({
  id: true,
  createdAt: true,
});

export const insertDefiProtocolSchema = createInsertSchema(defiProtocols).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type DefiPosition = typeof defiPositions.$inferSelect;
export type VaultDeposit = typeof vaultDeposits.$inferSelect;
export type DefiProtocol = typeof defiProtocols.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertDefiPosition = z.infer<typeof insertDefiPositionSchema>;
export type InsertVaultDeposit = z.infer<typeof insertVaultDepositSchema>;
export type InsertDefiProtocol = z.infer<typeof insertDefiProtocolSchema>;
