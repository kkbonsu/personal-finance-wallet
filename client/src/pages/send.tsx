import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Zap, Bitcoin, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletSDK } from "@/contexts/WalletSDKContext";
import { formatCurrency } from "@/lib/utils";

export function SendPage() {
  const [, setLocation] = useLocation();
  
  // Get the 'from' parameter to determine where to navigate back
  const getBackLocation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    return from === 'wallet' ? '/wallet' : '/';
  };
  const [network, setNetwork] = useState<"bitcoin" | "lightning">("lightning");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [feeLevel, setFeeLevel] = useState("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { sdk, bitcoinAccounts, lightningAccounts, sendBitcoin, payLightningInvoice } = useWalletSDK();

  const handleSend = async () => {
    if (!amount || !toAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      if (network === "lightning") {
        // Handle Lightning invoice payment
        await payLightningInvoice(toAddress);
        toast({
          title: "Payment Sent",
          description: "Lightning payment completed successfully"
        });
      } else {
        // Handle Bitcoin transaction
        await sendBitcoin(toAddress, amount);
        toast({
          title: "Transaction Sent",
          description: "Bitcoin transaction broadcast successfully"
        });
      }
      
      // Navigate back to wallet after successful send
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getNetworkIcon = (network: string) => {
    return network === "lightning" ? <Zap className="h-4 w-4" /> : <Bitcoin className="h-4 w-4" />;
  };

  const getEstimatedFee = () => {
    if (network === "lightning") return "1-5 sats";
    
    const feeRates = {
      low: "10-20 sats/vB",
      medium: "30-50 sats/vB", 
      high: "80-120 sats/vB"
    };
    return feeRates[feeLevel as keyof typeof feeRates];
  };

  const getCurrentBalance = () => {
    if (network === "lightning") {
      const lightningAccount = lightningAccounts[0];
      return lightningAccount?.balance || "0.00000000";
    } else {
      const bitcoinAccount = bitcoinAccounts[0];
      return bitcoinAccount?.balance || "0.00000000";
    }
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
            <Send className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">Send</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Network Selection */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Select Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {["lightning", "bitcoin"].map((net) => (
                <Button
                  key={net}
                  variant={network === net ? "default" : "outline"}
                  onClick={() => setNetwork(net as any)}
                  className="flex items-center space-x-2 dark:border-gray-600"
                >
                  {getNetworkIcon(net)}
                  <span>{net === "lightning" ? "Lightning" : "Bitcoin"}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Balance Display */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold dark:text-white">{getCurrentBalance()} BTC</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(parseFloat(getCurrentBalance()) * 34000)} {/* Mock BTC price */}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Send Form */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">
              {network === "lightning" ? "Lightning Payment" : "Bitcoin Transaction"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Address */}
            <div>
              <Label htmlFor="address" className="dark:text-white">
                {network === "lightning" ? "Lightning Invoice or Address" : "Bitcoin Address"}
              </Label>
              <Input
                id="address"
                placeholder={network === "lightning" ? "lnbc1..." : "bc1..."}
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="dark:text-white">
                Amount ({network === "lightning" ? "sats" : "BTC"})
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={network === "lightning" ? "1000" : "0.001"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Description (optional) */}
            <div>
              <Label htmlFor="description" className="dark:text-white">
                Description (optional)
              </Label>
              <Input
                id="description"
                placeholder="Payment for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Fee Selection (Bitcoin only) */}
            {network === "bitcoin" && (
              <div>
                <Label className="dark:text-white">Transaction Fee</Label>
                <Select value={feeLevel} onValueChange={setFeeLevel}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority - {getEstimatedFee()}</SelectItem>
                    <SelectItem value="medium">Medium Priority - {getEstimatedFee()}</SelectItem>
                    <SelectItem value="high">High Priority - {getEstimatedFee()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transaction Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Network</span>
                <span className="dark:text-white">{network === "lightning" ? "Lightning" : "Bitcoin"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Estimated Fee</span>
                <span className="dark:text-white">{getEstimatedFee()}</span>
              </div>
              {network === "lightning" && (
                <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Instant settlement</span>
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isProcessing || !amount || !toAddress}
              className="w-full"
              size="lg"
            >
              {isProcessing ? "Processing..." : `Send ${network === "lightning" ? "Payment" : "Bitcoin"}`}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}