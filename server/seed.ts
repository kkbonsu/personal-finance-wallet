import { db } from "./db";
import { users, wallets, transactions, defiPositions, vaultDeposits, defiProtocols } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create demo user
    const [user] = await db
      .insert(users)
      .values({
        username: "demo",
        password: "demo"
      })
      .returning();

    // Create demo wallets
    const [bitcoinWallet] = await db
      .insert(wallets)
      .values({
        userId: user.id,
        type: "bitcoin",
        network: "lightning",
        address: "lnbc1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs68x6gv",
        balance: "0.24851000",
        usdValue: "10234.56"
      })
      .returning();
    
    const [usdtWallet] = await db
      .insert(wallets)
      .values({
        userId: user.id,
        type: "usdt",
        network: "lightning",
        address: "lnbc1pvjluezsp5zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs68x6gv",
        balance: "2612.67000000",
        usdValue: "2612.67"
      })
      .returning();

    // Create demo DeFi protocols
    await db
      .insert(defiProtocols)
      .values([
        {
          name: "Starknet",
          poolName: "USDC Pool",
          network: "starknet",
          tokenSymbol: "USDC",
          apy: "8.20",
          tvl: "2400000.00",
          riskLevel: "low",
          isActive: true
        },
        {
          name: "Lightning Network",
          poolName: "Yield Farm",
          network: "lightning",
          tokenSymbol: "BTC",
          apy: "12.50",
          tvl: "1800000.00",
          riskLevel: "medium",
          isActive: true
        }
      ]);

    // Create demo DeFi position
    await db
      .insert(defiPositions)
      .values({
        userId: user.id,
        protocolName: "Starknet",
        poolName: "USDC Pool",
        network: "starknet",
        tokenSymbol: "USDC",
        amount: "1250.00000000",
        usdValue: "1250.00",
        apy: "8.20",
        riskLevel: "low",
        isActive: true
      });

    // Create demo vault deposit
    const unlockDate = new Date();
    unlockDate.setMonth(unlockDate.getMonth() + 3);
    
    await db
      .insert(vaultDeposits)
      .values({
        userId: user.id,
        amount: "0.12000000",
        usdValue: "4500.00",
        lockPeriod: 90,
        unlockDate,
        currentYield: "4.20",
        isActive: true
      });

    // Create demo transactions
    await db
      .insert(transactions)
      .values([
        {
          userId: user.id,
          walletId: usdtWallet.id,
          type: "receive",
          amount: "250.00000000",
          usdAmount: "250.00",
          fee: "0.00001000",
          status: "confirmed",
          txHash: "0x123abc456def789",
          description: "Received USDT",
          network: "lightning"
        },
        {
          userId: user.id,
          walletId: usdtWallet.id,
          type: "yield_earned",
          amount: "12.34000000",
          usdAmount: "12.34",
          fee: "0.00000000",
          status: "confirmed",
          txHash: null,
          description: "DeFi Yield Earned",
          network: "starknet"
        },
        {
          userId: user.id,
          walletId: bitcoinWallet.id,
          type: "send",
          amount: "0.03750000",
          usdAmount: "1500.00",
          fee: "0.00006250",
          status: "confirmed",
          txHash: "0x456def789abc123",
          description: "Sent Bitcoin",
          network: "onchain"
        }
      ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };