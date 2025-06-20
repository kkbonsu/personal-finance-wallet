import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { QuickActions } from "@/components/quick-actions";
import { DefiOpportunities } from "@/components/defi-opportunities";
import { RecentTransactions } from "@/components/recent-transactions";
import { BottomNavigation } from "@/components/bottom-navigation";
import { RiskDisclosureModal } from "@/components/risk-disclosure-modal";
import { BuyCryptoModal } from "@/components/buy-crypto-modal";
import { SendModal } from "@/components/send-modal";
import { ReceiveModal } from "@/components/receive-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vault } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(null);
  const { toast } = useToast();

  const investMutation = useMutation({
    mutationFn: async ({ protocolId, amount, riskAccepted }: { protocolId: number; amount: number; riskAccepted: boolean }) => {
      const response = await apiRequest("POST", "/api/defi/invest", {
        protocolId,
        amount,
        riskAccepted
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/defi/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Investment Successful",
        description: "Your DeFi investment has been processed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Investment Failed",
        description: "There was an error processing your investment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShowRiskModal = (protocolId: number) => {
    setSelectedProtocolId(protocolId);
    setShowRiskModal(true);
  };

  const handleAcceptRisk = () => {
    if (selectedProtocolId) {
      investMutation.mutate({
        protocolId: selectedProtocolId,
        amount: 100, // Default investment amount
        riskAccepted: true
      });
    }
    setShowRiskModal(false);
    setSelectedProtocolId(null);
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} Feature`,
      description: `${action} functionality coming soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        <PortfolioOverview />
        
        <QuickActions
          onOpenSend={() => setShowSendModal(true)}
          onOpenReceive={() => setShowReceiveModal(true)}
          onOpenSwap={() => handleQuickAction("Swap")}
          onOpenVault={() => handleQuickAction("Vault")}
          onOpenBuy={() => setShowBuyModal(true)}
        />
        
        <DefiOpportunities onShowRiskModal={handleShowRiskModal} />
        
        <RecentTransactions />
        


        {/* Vault Section */}
        <section className="px-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <Vault className="h-5 w-5 text-warning dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary dark:text-white">Bitcoin Vault</h3>
                    <p className="text-xs text-neutral dark:text-gray-400">Secure long-term storage</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary dark:text-white">0.12 BTC</p>
                  <p className="text-xs text-neutral dark:text-gray-400">Deposited</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral dark:text-gray-400">Time-locked until:</span>
                  <span className="font-semibold text-primary dark:text-white">Dec 15, 2024</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-neutral dark:text-gray-400">Current yield:</span>
                  <span className="font-semibold text-accent dark:text-green-400">4.2% APY</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-warning text-white hover:bg-yellow-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                onClick={() => handleQuickAction("Add to Vault")}
              >
                Add to Vault
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
      
      <RiskDisclosureModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onAccept={handleAcceptRisk}
      />
      
      <BuyCryptoModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />

      <SendModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
      />

      <ReceiveModal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
      />
    </div>
  );
}
