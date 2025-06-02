import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Vault, AlertTriangle } from "lucide-react";
import { formatCurrency, formatPercentage, getRiskColor } from "@/lib/utils";

interface DefiProtocol {
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

interface DefiPosition {
  id: number;
  protocolName: string;
  poolName: string;
  amount: string;
  usdValue: string;
  apy: string;
  riskLevel: string;
  isActive: boolean;
}

export default function DeFi() {
  const { data: protocols, isLoading: protocolsLoading } = useQuery<DefiProtocol[]>({
    queryKey: ["/api/defi/protocols"],
  });

  const { data: positions, isLoading: positionsLoading } = useQuery<DefiPosition[]>({
    queryKey: ["/api/defi/positions"],
  });

  const totalInvested = positions?.reduce((sum, pos) => sum + parseFloat(pos.usdValue), 0) || 0;
  const averageAPY = positions?.length 
    ? positions.reduce((sum, pos) => sum + parseFloat(pos.apy), 0) / positions.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        {/* DeFi Overview */}
        <section className="px-4 py-6">
          <h1 className="text-2xl font-bold text-primary mb-6">DeFi Dashboard</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalInvested)}</p>
                <p className="text-sm text-neutral">Total Invested</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Vault className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{formatPercentage(averageAPY)}</p>
                <p className="text-sm text-neutral">Avg. APY</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Warning */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">DeFi Risk Notice</h3>
                  <p className="text-sm text-yellow-700">
                    DeFi investments carry inherent risks including smart contract vulnerabilities, 
                    impermanent loss, and market volatility. Only invest what you can afford to lose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <section className="px-4">
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="positions">My Positions</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="positions" className="mt-6">
              {positionsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
              ) : positions?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Vault className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-primary mb-2">No Active Positions</h3>
                    <p className="text-sm text-neutral mb-4">Start earning yield by investing in DeFi protocols</p>
                    <Button size="sm">Explore Opportunities</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {positions?.map((position) => (
                    <Card key={position.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-primary">{position.protocolName}</h3>
                            <p className="text-sm text-neutral">{position.poolName}</p>
                          </div>
                          <Badge className={getRiskColor(position.riskLevel)}>
                            {position.riskLevel} risk
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-neutral">Invested</p>
                            <p className="font-semibold">{formatCurrency(parseFloat(position.usdValue))}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral">APY</p>
                            <p className="font-semibold text-accent">{formatPercentage(parseFloat(position.apy))}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral">Status</p>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs font-medium text-accent">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Add More
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Withdraw
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="opportunities" className="mt-6">
              {protocolsLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                  <div className="h-32 bg-gray-200 rounded-xl"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {protocols?.map((protocol) => (
                    <Card key={protocol.id}>
                      <CardContent className="p-4">
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
                              <h3 className="font-semibold text-primary">{protocol.name}</h3>
                              <p className="text-sm text-neutral">{protocol.poolName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent">{formatPercentage(parseFloat(protocol.apy))}</p>
                            <p className="text-xs text-neutral">APY</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-xs text-neutral">TVL</p>
                              <p className="text-sm font-semibold">{formatCurrency(parseFloat(protocol.tvl))}</p>
                            </div>
                            <Badge className={getRiskColor(protocol.riskLevel)}>
                              {protocol.riskLevel} risk
                            </Badge>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {protocol.network}
                          </Badge>
                        </div>
                        
                        <Button className="w-full bg-accent text-white hover:bg-green-600">
                          Invest Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
