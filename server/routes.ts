import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertDefiPositionSchema, insertVaultDepositSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Portfolio overview endpoint
  app.get("/api/portfolio", async (req, res) => {
    try {
      const userId = 1; // Demo user
      const wallets = await storage.getUserWallets(userId);
      const defiPositions = await storage.getUserDefiPositions(userId);
      const vaultDeposits = await storage.getUserVaultDeposits(userId);
      
      const totalWalletValue = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.usdValue), 0);
      const totalDefiValue = defiPositions.reduce((sum, position) => sum + parseFloat(position.usdValue), 0);
      const totalVaultValue = vaultDeposits.reduce((sum, deposit) => sum + parseFloat(deposit.usdValue), 0);
      const totalValue = totalWalletValue + totalDefiValue + totalVaultValue;

      res.json({
        totalValue: totalValue.toFixed(2),
        change24h: "+2.34", // Mock data for demo
        wallets: wallets.map(wallet => ({
          type: wallet.type,
          balance: wallet.balance,
          usdValue: wallet.usdValue,
          network: wallet.network
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio data" });
    }
  });

  // Wallet operations
  app.get("/api/wallets", async (req, res) => {
    try {
      const userId = 1;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallets" });
    }
  });

  // Transaction operations
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create transaction" });
      }
    }
  });

  // DeFi operations
  app.get("/api/defi/protocols", async (req, res) => {
    try {
      const protocols = await storage.getActiveDefiProtocols();
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DeFi protocols" });
    }
  });

  app.get("/api/defi/positions", async (req, res) => {
    try {
      const userId = 1;
      const positions = await storage.getUserDefiPositions(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DeFi positions" });
    }
  });

  app.post("/api/defi/invest", async (req, res) => {
    try {
      const { protocolId, amount, riskAccepted } = req.body;
      
      if (!riskAccepted) {
        return res.status(400).json({ error: "Risk disclosure must be accepted" });
      }

      const protocols = await storage.getActiveDefiProtocols();
      const protocol = protocols.find(p => p.id === protocolId);
      
      if (!protocol) {
        return res.status(404).json({ error: "Protocol not found" });
      }

      // Create investment position
      const position = await storage.createDefiPosition({
        userId: 1,
        protocolName: protocol.name,
        poolName: protocol.poolName,
        network: protocol.network,
        tokenSymbol: protocol.tokenSymbol,
        amount: amount.toString(),
        usdValue: amount.toString(),
        apy: protocol.apy,
        riskLevel: protocol.riskLevel,
        isActive: true
      });

      // Create transaction record
      await storage.createTransaction({
        userId: 1,
        walletId: 1, // Assume primary wallet
        type: "defi_deposit",
        amount: amount.toString(),
        usdAmount: amount.toString(),
        fee: "0",
        status: "confirmed",
        description: `Invested in ${protocol.name} ${protocol.poolName}`,
        network: protocol.network
      });

      res.json({ success: true, position });
    } catch (error) {
      res.status(500).json({ error: "Failed to process investment" });
    }
  });

  // Vault operations
  app.get("/api/vault/deposits", async (req, res) => {
    try {
      const userId = 1;
      const deposits = await storage.getUserVaultDeposits(userId);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vault deposits" });
    }
  });

  app.post("/api/vault/deposit", async (req, res) => {
    try {
      const { amount, lockPeriod } = req.body;
      
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + lockPeriod);
      
      const deposit = await storage.createVaultDeposit({
        userId: 1,
        amount: amount.toString(),
        usdValue: (amount * 40000).toString(), // Mock BTC price
        lockPeriod,
        unlockDate,
        currentYield: "4.20", // Mock yield
        isActive: true
      });

      // Create transaction record
      await storage.createTransaction({
        userId: 1,
        walletId: 1,
        type: "defi_deposit",
        amount: amount.toString(),
        usdAmount: (amount * 40000).toString(),
        fee: "0",
        status: "confirmed",
        description: "Bitcoin Vault Deposit",
        network: "lightning"
      });

      res.json({ success: true, deposit });
    } catch (error) {
      res.status(500).json({ error: "Failed to create vault deposit" });
    }
  });

  // Lightning Network operations (mocked for MVP)
  app.post("/api/lightning/send", async (req, res) => {
    try {
      const { amount, address, currency } = req.body;
      
      // Mock Lightning Network send
      const transaction = await storage.createTransaction({
        userId: 1,
        walletId: currency === "bitcoin" ? 1 : 2,
        type: "send",
        amount: amount.toString(),
        usdAmount: (currency === "bitcoin" ? amount * 40000 : amount).toString(),
        fee: "0.00001",
        status: "pending",
        description: `Sent ${currency.toUpperCase()}`,
        network: "lightning"
      });

      // Simulate confirmation after 2 seconds
      setTimeout(async () => {
        await storage.updateTransactionStatus(transaction.id, "confirmed", "ln_" + Math.random().toString(36).substr(2, 9));
      }, 2000);

      res.json({ success: true, transaction });
    } catch (error) {
      res.status(500).json({ error: "Failed to send payment" });
    }
  });

  app.post("/api/lightning/receive", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      
      // Generate mock Lightning invoice
      const invoice = "lnbc" + Math.random().toString(36).substr(2, 50);
      
      res.json({ 
        success: true, 
        invoice,
        amount,
        currency,
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  // Starknet operations (mocked for MVP)
  app.post("/api/starknet/connect", async (req, res) => {
    try {
      // Mock Starknet wallet connection
      res.json({ 
        success: true, 
        address: "0x" + Math.random().toString(16).substr(2, 40),
        network: "starknet-testnet"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to Starknet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
