import { useQuery, useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatPercentage, getRiskColor, formatTVL } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface InvestProtocol {
  id: number;
  name: string;
  poolName: string;
  network: string;
  tokenSymbol: string;
  apy: string;
  tvl: string;
  riskLevel: string;
  isActive: boolean;
}

interface InvestPosition {
  id: number;
  protocolName: string;
  poolName: string;
  usdValue: string;
  isActive: boolean;
}

interface InvestOpportunitiesProps {
  onShowRiskModal: (protocolId: number) => void;
}

export function InvestOpportunities({ onShowRiskModal }: InvestOpportunitiesProps) {
  const { data: protocols, isLoading: protocolsLoading } = useQuery<InvestProtocol[]>({
    queryKey: ["/api/invest/protocols"],
  });

  const { data: positions } = useQuery<InvestPosition[]>({
    queryKey: ["/api/invest/positions"],
  });

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
    },
  });

  if (protocolsLoading) {
    return (
      <section className="px-4 mb-6">
        <div className="animate-pulse space-y-3">
          <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
        </div>
      </section>
    );
  }

  const handleOneClickInvest = (protocolId: number) => {
    onShowRiskModal(protocolId);
  };

  const getUserPosition = (protocolName: string, poolName: string) => {
    return positions?.find(p => p.protocolName === protocolName && p.poolName === poolName && p.isActive);
  };

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary dark:text-white">Investment Opportunities</h2>
        <div className="flex items-center space-x-1">
          <Info className="h-4 w-4 text-neutral dark:text-gray-400" />
          <span className="text-xs text-neutral dark:text-gray-400">Learn more</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {protocols?.map((protocol) => {
          const userPosition = getUserPosition(protocol.name, protocol.poolName);
          const isHighRisk = protocol.riskLevel === "medium" || protocol.riskLevel === "high";
          
          return (
            <div key={protocol.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    protocol.network === "starknet" 
                      ? "bg-gradient-to-br from-purple-400 to-purple-600" 
                      : "bg-gradient-to-br from-blue-400 to-blue-600"
                  }`}>
                    {protocol.network === "starknet" ? (
                      <span className="text-white font-semibold text-sm">ST</span>
                    ) : (
                      <span className="text-white">⚡</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary dark:text-white">{protocol.name} {protocol.poolName}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getRiskColor(protocol.riskLevel)}>
                        {protocol.riskLevel} risk
                      </Badge>
                      <span className="text-xs text-neutral dark:text-gray-400">• {protocol.network}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent dark:text-green-400">{formatPercentage(parseFloat(protocol.apy))}</p>
                  <p className="text-xs text-neutral dark:text-gray-400">APY</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-xs text-neutral dark:text-gray-400">TVL</p>
                    <p className="text-sm font-semibold dark:text-white">{formatTVL(protocol.tvl)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral dark:text-gray-400">Your stake</p>
                    <p className="text-sm font-semibold dark:text-white">
                      {userPosition ? formatCurrency(parseFloat(userPosition.usdValue)) : "$0"}
                    </p>
                  </div>
                </div>
                {userPosition && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs font-medium text-accent dark:text-green-400">Active</span>
                  </div>
                )}
              </div>
              
              {isHighRisk && (
                <Alert className="mb-3 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Higher yield involves increased risk. Review carefully.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  isHighRisk 
                    ? "bg-white border-2 border-accent text-accent hover:bg-green-50"
                    : "bg-accent text-white hover:bg-green-600"
                }`}
                onClick={() => isHighRisk ? null : handleOneClickInvest(protocol.id)}
                disabled={investMutation.isPending}
              >
                {isHighRisk ? "Learn More" : "One-Click Invest"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
