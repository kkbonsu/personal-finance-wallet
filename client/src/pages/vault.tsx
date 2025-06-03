import { useQuery, useMutation } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vault, Clock, Shield, TrendingUp, Plus, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface VaultDeposit {
  id: number;
  amount: string;
  usdValue: string;
  lockPeriod: number;
  unlockDate: string;
  currentYield: string;
  isActive: boolean;
  createdAt: string;
}

export default function VaultPage() {
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [lockPeriod, setLockPeriod] = useState<string>("30");
  const { toast } = useToast();

  const { data: vaultDeposits, isLoading } = useQuery<VaultDeposit[]>({
    queryKey: ["/api/vault/deposits"],
  });

  const depositMutation = useMutation({
    mutationFn: async ({ amount, lockPeriod }: { amount: number; lockPeriod: number }) => {
      const response = await apiRequest("POST", "/api/vault/deposit", {
        amount,
        lockPeriod
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setDepositAmount("");
      toast({
        title: "Deposit Successful",
        description: "Your Bitcoin has been deposited to the vault successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount: parseFloat(depositAmount),
      lockPeriod: parseInt(lockPeriod)
    });
  };

  const totalDeposited = vaultDeposits?.reduce((sum, deposit) => 
    sum + parseFloat(deposit.amount), 0
  ) || 0;

  const totalValue = vaultDeposits?.reduce((sum, deposit) => 
    sum + parseFloat(deposit.usdValue), 0
  ) || 0;

  const activeDeposits = vaultDeposits?.filter(deposit => deposit.isActive) || [];

  const lockPeriodOptions = [
    { value: "30", label: "30 Days", apy: "3.5%" },
    { value: "90", label: "90 Days", apy: "4.2%" },
    { value: "180", label: "180 Days", apy: "5.1%" },
    { value: "365", label: "1 Year", apy: "6.8%" }
  ];

  const selectedOption = lockPeriodOptions.find(option => option.value === lockPeriod);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        {/* Vault Header */}
        <section className="px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Vault className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Bitcoin Vault</h1>
              <p className="text-sm text-neutral">Secure long-term storage</p>
            </div>
          </div>

          {/* Vault Overview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Vault className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{totalDeposited.toFixed(8)} BTC</p>
                <p className="text-sm text-neutral">Total Deposited</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-neutral">Total Value</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs */}
        <section className="px-4">
          <Tabs defaultValue="deposits" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposits">My Deposits</TabsTrigger>
              <TabsTrigger value="new">New Deposit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposits" className="mt-6">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                  <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
              ) : activeDeposits.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Vault className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-primary mb-2">No Active Deposits</h3>
                    <p className="text-sm text-neutral mb-4">Start earning yield by depositing Bitcoin</p>
                    <Button size="sm">Make First Deposit</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeDeposits.map((deposit) => (
                    <Card key={deposit.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-primary">{parseFloat(deposit.amount).toFixed(8)} BTC</h3>
                            <p className="text-sm text-neutral">{formatCurrency(parseFloat(deposit.usdValue))}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 mb-1">
                              {deposit.currentYield}% APY
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs font-medium text-accent">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-neutral" />
                              <span className="text-neutral">Lock Period:</span>
                            </div>
                            <span className="font-semibold text-primary">{deposit.lockPeriod} days</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-neutral" />
                              <span className="text-neutral">Unlocks on:</span>
                            </div>
                            <span className="font-semibold text-primary">
                              {formatDate(new Date(deposit.unlockDate))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" disabled>
                            Withdraw (Locked)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>New Vault Deposit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-primary mb-2 block">
                      Amount (BTC)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.00000001"
                      placeholder="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-neutral mt-1">
                      Minimum: 0.001 BTC • Available: 0.24851 BTC
                    </p>
                  </div>

                  {/* Lock Period Selection */}
                  <div>
                    <Label className="text-sm font-medium text-primary mb-3 block">
                      Lock Period
                    </Label>
                    <Select value={lockPeriod} onValueChange={setLockPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lockPeriodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{option.label}</span>
                              <Badge variant="outline" className="ml-2">
                                {option.apy} APY
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deposit Summary */}
                  {depositAmount && (
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-primary mb-3">Deposit Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral">Amount</span>
                            <span className="font-medium">{depositAmount} BTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral">Lock Period</span>
                            <span className="font-medium">{selectedOption?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral">APY</span>
                            <span className="font-medium text-accent">{selectedOption?.apy}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-neutral">Estimated Value</span>
                            <span className="font-semibold text-accent">
                              {formatCurrency(parseFloat(depositAmount) * 40000)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Security Notice */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-800 mb-1">Security Features</h3>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Multi-signature cold storage</li>
                            <li>• Time-locked smart contracts</li>
                            <li>• Insurance coverage up to $1M</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full bg-warning text-white hover:bg-yellow-600"
                    onClick={handleDeposit}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0 || depositMutation.isPending}
                  >
                    {depositMutation.isPending ? "Processing..." : "Deposit to Vault"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}