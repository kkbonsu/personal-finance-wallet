import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowUpDown, Zap, Bitcoin, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

export function SwapPage() {
  const [, setLocation] = useLocation();
  
  // Get the 'from' parameter to determine where to navigate back
  const getBackLocation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    return from === 'wallet' ? '/wallet' : '/';
  };
  const [fromAsset, setFromAsset] = useState("bitcoin");
  const [toAsset, setToAsset] = useState("lightning");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [isSwapping, setIsSwapping] = useState(false);
  const { toast } = useToast();

  const assets = [
    { value: "bitcoin", label: "Bitcoin", symbol: "BTC", icon: "₿" },
    { value: "lightning", label: "Lightning BTC", symbol: "BTC", icon: "⚡" },
    { value: "strk", label: "Starknet", symbol: "STRK", icon: "🔺" }
  ];

  const handleSwapAssets = () => {
    const tempFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(tempFrom);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const calculateToAmount = (amount: string) => {
    if (!amount) return "";
    
    // Mock exchange rates - in real app would fetch from API
    const rates: Record<string, Record<string, number>> = {
      bitcoin: { lightning: 0.998, strk: 2500 },
      lightning: { bitcoin: 1.002, strk: 2505 },
      strk: { bitcoin: 0.0004, lightning: 0.0004 }
    };
    
    const rate = rates[fromAsset]?.[toAsset] || 1;
    return (parseFloat(amount) * rate).toFixed(8);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount to swap",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    try {
      // Simulate swap operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Completed",
        description: `Successfully swapped ${fromAmount} ${assets.find(a => a.value === fromAsset)?.symbol} for ${toAmount} ${assets.find(a => a.value === toAsset)?.symbol}`
      });
      
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Failed to complete the swap transaction",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const getEstimatedFee = () => {
    if (fromAsset === "lightning" || toAsset === "lightning") {
      return "1-5 sats";
    }
    return "0.1-0.5%";
  };

  const getAssetBalance = (asset: string) => {
    // Mock balances - in real app would fetch from wallet
    const balances: Record<string, string> = {
      bitcoin: "1.24578932",
      lightning: "0.15247000", 
      strk: "450.75"
    };
    return balances[asset] || "0.00000000";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(getBackLocation())}
            className="dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">Swap</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Swap Interface */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Exchange Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Asset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="dark:text-white">From</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Balance: {getAssetBalance(fromAsset)} {assets.find(a => a.value === fromAsset)?.symbol}
                </span>
              </div>
              <div className="flex space-x-2">
                <Select value={fromAsset} onValueChange={setFromAsset}>
                  <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.value} value={asset.value} disabled={asset.value === toAsset}>
                        <div className="flex items-center space-x-2">
                          <span>{asset.icon}</span>
                          <span>{asset.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapAssets}
                className="rounded-full p-2 dark:border-gray-600"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Asset */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="dark:text-white">To</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Balance: {getAssetBalance(toAsset)} {assets.find(a => a.value === toAsset)?.symbol}
                </span>
              </div>
              <div className="flex space-x-2">
                <Select value={toAsset} onValueChange={setToAsset}>
                  <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.value} value={asset.value} disabled={asset.value === fromAsset}>
                        <div className="flex items-center space-x-2">
                          <span>{asset.icon}</span>
                          <span>{asset.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="flex-1 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Slippage Settings */}
            <div className="space-y-2">
              <Label className="dark:text-white">Slippage Tolerance</Label>
              <Select value={slippage} onValueChange={setSlippage}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1%</SelectItem>
                  <SelectItem value="0.5">0.5%</SelectItem>
                  <SelectItem value="1.0">1.0%</SelectItem>
                  <SelectItem value="3.0">3.0%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Swap Details */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Exchange Rate</span>
                <span className="dark:text-white">
                  1 {assets.find(a => a.value === fromAsset)?.symbol} = {calculateToAmount("1")} {assets.find(a => a.value === toAsset)?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
                <span className="dark:text-white">{getEstimatedFee()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Slippage Tolerance</span>
                <span className="dark:text-white">{slippage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        {(fromAsset === "lightning" || toAsset === "lightning") && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Lightning Network Swap</p>
                  <p className="text-xs mt-1">
                    Swaps involving Lightning Network are instant but require channel liquidity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount || !toAmount}
          className="w-full"
          size="lg"
        >
          {isSwapping ? "Swapping..." : "Swap Assets"}
        </Button>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Powered by Cross-Chain Bridges</p>
                <p className="text-xs mt-1">
                  Swaps are executed through secure atomic swaps and lightning channels for instant settlement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}