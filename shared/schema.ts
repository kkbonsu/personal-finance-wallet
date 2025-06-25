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

export const investPositions = pgTable("invest_positions", {
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

export const investProtocols = pgTable("invest_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  poolName: text("pool_name").notNull(),
  network: text("network").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  apy: decimal("apy", { precision: 5, scale: 2 }).notNull(),
  tvl: decimal("tvl", { precision: 18, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const insertInvestPositionSchema = createInsertSchema(investPositions).omit({
  id: true,
  createdAt: true,
});

export const insertInvestProtocolSchema = createInsertSchema(investProtocols).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InvestPosition = typeof investPositions.$inferSelect;
export type InvestProtocol = typeof investProtocols.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertInvestPosition = z.infer<typeof insertInvestPositionSchema>;
export type InsertInvestProtocol = z.infer<typeof insertInvestProtocolSchema>;
