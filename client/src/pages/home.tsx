import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { PortfolioOverview } from "@/components/portfolio-overview";
import { QuickActions } from "@/components/quick-actions";
import { InvestOpportunities } from "@/components/invest-opportunities";
import { RecentTransactions } from "@/components/recent-transactions";
import { BottomNavigation } from "@/components/bottom-navigation";
import { RiskDisclosureModal } from "@/components/risk-disclosure-modal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showRiskModal, setShowRiskModal] = useState(false);

  const [selectedProtocolId, setSelectedProtocolId] = useState<number | null>(null);
  const { toast } = useToast();

  const investMutation = useMutation({
    mutationFn: async ({ protocolId, amount, riskAccepted }: { protocolId: number; amount: number; riskAccepted: boolean }) => {
      const response = await apiRequest("POST", "/api/invest/invest", {
        protocolId,
        amount,
        riskAccepted
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invest/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Investment Successful",
        description: "Your investment has been processed successfully.",
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
        
        <QuickActions />
        
        <InvestOpportunities onShowRiskModal={handleShowRiskModal} />
        
        <RecentTransactions />
        



      </main>

      <BottomNavigation />
      
      <RiskDisclosureModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onAccept={handleAcceptRisk}
      />
    </div>
  );
}
