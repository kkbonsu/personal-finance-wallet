import { useQuery } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PortfolioData {
  totalValue: string;
  change24h: string;
  wallets: Array<{
    type: string;
    balance: string;
    usdValue: string;
    network: string;
  }>;
}

export function PortfolioOverview() {
  const { data: portfolio, isLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });

  if (isLoading) {
    return (
      <section className="px-4 py-6">
        <div className="bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl p-6 text-white animate-pulse">
          <div className="h-20 bg-white/10 rounded-lg mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white/10 rounded-xl"></div>
            <div className="h-16 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  const bitcoinWallet = portfolio?.wallets.find(w => w.type === "bitcoin");
  const lightningWallet = portfolio?.wallets.find(w => w.type === "lightning");

  return (
    <section className="px-4 py-6">
      <div className="bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Portfolio Value</p>
            <p className="text-3xl font-bold">{formatCurrency(parseFloat(portfolio?.totalValue || "0"))}</p>
          </div>
          <div className="text-right">
            <p className="text-green-300 text-sm font-medium flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>{portfolio?.change24h || "+0.00%"}</span>
            </p>
            <p className="text-blue-100 text-xs">24h change</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-bitcoin">₿</span>
              <span className="text-sm font-medium">Bitcoin</span>
            </div>
            <p className="text-lg font-semibold">{bitcoinWallet?.balance || "0.00000000"} BTC</p>
            <p className="text-xs text-blue-100">{formatCurrency(parseFloat(bitcoinWallet?.usdValue || "0"))}</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium">Lightning</span>
            </div>
            <p className="text-lg font-semibold">{parseFloat(lightningWallet?.balance || "0").toFixed(8)} BTC</p>
            <p className="text-xs text-blue-100">{formatCurrency(parseFloat(lightningWallet?.usdValue || "0"))}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
