import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Send, QrCode, Eye, EyeOff } from "lucide-react";
import { formatCurrency, truncateAddress, getNetworkIcon } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Wallet {
  id: number;
  type: string;
  network: string;
  address: string;
  balance: string;
  usdValue: string;
}

export default function Wallet() {
  const [showBalances, setShowBalances] = useState(true);
  const { toast } = useToast();

  const { data: wallets, isLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "bitcoin":
        return "₿";
      case "usdt":
        return "₮";
      default:
        return "🪙";
    }
  };

  const getWalletColor = (type: string) => {
    switch (type) {
      case "bitcoin":
        return "from-orange-400 to-orange-600";
      case "usdt":
        return "from-green-400 to-green-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader />
        <main className="max-w-md mx-auto pb-20 px-4 py-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        {/* Wallet Header */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary">My Wallets</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Wallet Cards */}
          <div className="space-y-4">
            {wallets?.map((wallet) => (
              <Card key={wallet.id} className="border-0 shadow-md">
                <CardContent className="p-0">
                  {/* Wallet Header */}
                  <div className={`bg-gradient-to-r ${getWalletColor(wallet.type)} p-4 rounded-t-xl text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                        <div>
                          <h3 className="font-semibold capitalize">{wallet.type} Wallet</h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {getNetworkIcon(wallet.network)} {wallet.network}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm opacity-90">Balance</p>
                      {showBalances ? (
                        <>
                          <p className="text-2xl font-bold">
                            {wallet.type === "bitcoin" 
                              ? `${parseFloat(wallet.balance).toFixed(8)} BTC`
                              : `${parseFloat(wallet.balance).toFixed(2)} USDT`
                            }
                          </p>
                          <p className="text-sm opacity-90">
                            {formatCurrency(parseFloat(wallet.usdValue))}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold">••••••</p>
                      )}
                    </div>
                  </div>

                  {/* Wallet Details */}
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Address</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.address)}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                        {truncateAddress(wallet.address, 8, 8)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button className="flex-1" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button variant="outline" className="flex-1" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        Receive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Wallet Button */}
          <Card className="mt-4 border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">+</span>
              </div>
              <h3 className="font-semibold text-primary mb-2">Add New Wallet</h3>
              <p className="text-sm text-neutral mb-4">Connect another blockchain network</p>
              <Button variant="outline" size="sm">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
