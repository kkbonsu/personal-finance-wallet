import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { WalletTypeModal } from "@/components/wallet-type-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Send, QrCode, Eye, EyeOff, Plus } from "lucide-react";
import { formatCurrency, truncateAddress, getNetworkIcon } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [, setLocation] = useLocation();
  const [showWalletTypeModal, setShowWalletTypeModal] = useState(false);
  const { toast } = useToast();

  const { data: wallets, isLoading } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const createWalletMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", "/api/wallets", { type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Wallet Created",
        description: "New wallet has been successfully created"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive"
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
  };

  const handleCreateWallet = () => {
    setShowWalletTypeModal(true);
  };

  const handleWalletTypeSelect = (type: string) => {
    createWalletMutation.mutate(type);
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "bitcoin":
        return "₿";
      case "bitcoin-segwit":
        return "⚡";
      case "bitcoin-taproot":
        return "🟠";
      case "lightning":
        return "⚡";
      default:
        return "🪙";
    }
  };

  const getWalletColor = (type: string) => {
    switch (type) {
      case "bitcoin":
        return "from-orange-400 to-orange-600";
      case "bitcoin-segwit":
        return "from-blue-400 to-blue-600";
      case "bitcoin-taproot":
        return "from-purple-400 to-purple-600";
      case "lightning":
        return "from-yellow-400 to-yellow-600";
      default:
        return "from-gray-400 to-gray-600";
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
            <h1 className="text-2xl font-bold text-primary dark:text-white">My Wallets</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
              className="dark:hover:bg-gray-700"
            >
              {showBalances ? <EyeOff className="h-4 w-4 dark:text-gray-400" /> : <Eye className="h-4 w-4 dark:text-gray-400" />}
            </Button>
          </div>

          {/* Wallet Cards */}
          <div className="space-y-4">
            {wallets?.map((wallet) => (
              <Card key={wallet.id} className="border-0 shadow-md dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-0">
                  {/* Wallet Header */}
                  <div className={`bg-gradient-to-r ${getWalletColor(wallet.type)} p-4 rounded-t-xl text-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                        <div>
                          <h3 className="font-semibold capitalize">
                            {wallet.type === "bitcoin-segwit" 
                              ? "Bitcoin Segwit" 
                              : wallet.type === "bitcoin-taproot" 
                                ? "Bitcoin Taproot"
                                : wallet.type} Wallet
                          </h3>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                            {getNetworkIcon(wallet.network)} {wallet.network}
                            {wallet.type === "bitcoin-segwit" && " • Native Segwit"}
                            {wallet.type === "bitcoin-taproot" && " • Taproot"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm opacity-90">Balance</p>
                      {showBalances ? (
                        <>
                          <p className="text-2xl font-bold">
                            {wallet.type.startsWith("bitcoin") || wallet.type === "lightning"
                              ? `${parseFloat(wallet.balance).toFixed(8)} BTC`
                              : `${parseFloat(wallet.balance).toFixed(8)} ${wallet.type.toUpperCase()}`
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
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.address)}
                          className="h-6 px-2 dark:hover:bg-gray-700"
                        >
                          <Copy className="h-3 w-3 dark:text-gray-400" />
                        </Button>
                      </div>
                      <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 dark:text-white p-2 rounded">
                        {truncateAddress(wallet.address, 8, 8)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => setLocation("/send?from=wallet")}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" 
                        size="sm"
                        onClick={() => setLocation("/receive?from=wallet")}
                      >
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
          <Card className="mt-4 border-dashed border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl dark:text-white">+</span>
              </div>
              <h3 className="font-semibold text-primary dark:text-white mb-2">Add New Wallet</h3>
              <p className="text-sm text-neutral dark:text-gray-400 mb-4">Create a new blockchain wallet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCreateWallet}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Create Wallet
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />



      <WalletTypeModal
        isOpen={showWalletTypeModal}
        onClose={() => setShowWalletTypeModal(false)}
        onSelectType={handleWalletTypeSelect}
      />
    </div>
  );
}
