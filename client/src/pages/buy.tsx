import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Building2, Smartphone, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

export function BuyPage() {
  const [, setLocation] = useLocation();
  
  // Get the 'from' parameter to determine where to navigate back
  const getBackLocation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    return from === 'wallet' ? '/wallet' : '/';
  };
  const [asset, setAsset] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [currency, setCurrency] = useState("USD");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const assets = [
    { value: "bitcoin", label: "Bitcoin", symbol: "BTC", price: 34000 },
    { value: "lightning", label: "Lightning BTC", symbol: "BTC", price: 34000 },
    { value: "strk", label: "Starknet", symbol: "STRK", price: 0.52 }
  ];

  const paymentMethods = [
    { value: "card", label: "Credit/Debit Card", icon: CreditCard, fee: "3.5%" },
    { value: "bank", label: "Bank Transfer", icon: Building2, fee: "1.0%" },
    { value: "apple_pay", label: "Apple Pay", icon: Smartphone, fee: "3.0%" }
  ];

  const currencies = ["USD", "EUR", "GBP", "CAD"];

  const handleAmountChange = (value: string, type: "crypto" | "fiat") => {
    const selectedAsset = assets.find(a => a.value === asset);
    if (!selectedAsset) return;

    if (type === "crypto") {
      setAmount(value);
      const fiatVal = (parseFloat(value) * selectedAsset.price).toFixed(2);
      setFiatAmount(isNaN(parseFloat(fiatVal)) ? "" : fiatVal);
    } else {
      setFiatAmount(value);
      const cryptoVal = (parseFloat(value) / selectedAsset.price).toFixed(8);
      setAmount(isNaN(parseFloat(cryptoVal)) ? "" : cryptoVal);
    }
  };

  const handlePurchase = async () => {
    if (!amount || !fiatAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount to purchase",
        variant: "destructive"
      });
      return;
    }

    setIsPurchasing(true);
    try {
      // Simulate purchase operation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Purchase Completed",
        description: `Successfully purchased ${amount} ${assets.find(a => a.value === asset)?.symbol} for ${formatCurrency(parseFloat(fiatAmount))}`
      });
      
      setLocation("/wallet");
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to complete the purchase",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const calculateFees = () => {
    const selectedMethod = paymentMethods.find(m => m.value === paymentMethod);
    const feePercentage = parseFloat(selectedMethod?.fee.replace('%', '') || '0');
    const fee = (parseFloat(fiatAmount) * feePercentage) / 100;
    return fee.toFixed(2);
  };

  const getTotalCost = () => {
    const fee = parseFloat(calculateFees());
    const total = parseFloat(fiatAmount) + fee;
    return total.toFixed(2);
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
            <CreditCard className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">Buy Crypto</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Asset Selection */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Select Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {assets.map((a) => (
                <div
                  key={a.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    asset === a.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => setAsset(a.value)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium dark:text-white">{a.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{a.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium dark:text-white">{formatCurrency(a.price)}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">+2.34%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Purchase Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="fiat" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fiat">Fiat Amount</TabsTrigger>
                <TabsTrigger value="crypto">Crypto Amount</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fiat" className="space-y-3">
                <div className="flex space-x-2">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[100px] dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="100.00"
                    value={fiatAmount}
                    onChange={(e) => handleAmountChange(e.target.value, "fiat")}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {amount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ≈ {amount} {assets.find(a => a.value === asset)?.symbol}
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="crypto" className="space-y-3">
                <div className="flex space-x-2">
                  <div className="w-[100px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border text-sm dark:text-white">
                    {assets.find(a => a.value === asset)?.symbol}
                  </div>
                  <Input
                    type="number"
                    placeholder="0.001"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value, "crypto")}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                {fiatAmount && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ≈ {formatCurrency(parseFloat(fiatAmount))}
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <method.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium dark:text-white">{method.label}</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{method.fee}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Summary */}
        {fiatAmount && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="dark:text-white">{formatCurrency(parseFloat(fiatAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                <span className="dark:text-white">{formatCurrency(parseFloat(calculateFees()))}</span>
              </div>
              <hr className="dark:border-gray-600" />
              <div className="flex justify-between font-medium">
                <span className="dark:text-white">Total</span>
                <span className="dark:text-white">{formatCurrency(parseFloat(getTotalCost()))}</span>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                You will receive: {amount} {assets.find(a => a.value === asset)?.symbol}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Secure Purchase</p>
                <p className="text-xs mt-1">
                  All transactions are encrypted and processed through regulated financial partners.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || !amount || !fiatAmount}
          className="w-full"
          size="lg"
        >
          {isPurchasing ? "Processing Purchase..." : `Buy ${assets.find(a => a.value === asset)?.symbol}`}
        </Button>

        {/* Disclaimer */}
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Important Notice</p>
                <p className="mt-1">
                  Cryptocurrency investments carry risk. Only invest what you can afford to lose. 
                  Purchases may take 5-10 minutes to appear in your wallet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}