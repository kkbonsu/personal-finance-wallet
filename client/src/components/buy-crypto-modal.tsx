import { useState } from "react";
import { CreditCard, ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supportedCurrencies = [
  { 
    symbol: "BTC", 
    name: "Bitcoin", 
    icon: "₿", 
    color: "text-orange-600",
    network: "Lightning Network"
  },
  { 
    symbol: "USDT", 
    name: "Tether USD", 
    icon: "₮", 
    color: "text-green-600",
    network: "Lightning Network"
  },
  { 
    symbol: "STRK", 
    name: "Starknet Token", 
    icon: "🔺", 
    color: "text-purple-600",
    network: "Starknet"
  }
];

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "💳", fees: "3.5%" },
  { id: "bank", name: "Bank Transfer", icon: "🏦", fees: "1.5%" },
  { id: "apple", name: "Apple Pay", icon: "📱", fees: "3.5%" },
  { id: "google", name: "Google Pay", icon: "📱", fees: "3.5%" }
];

export function BuyCryptoModal({ isOpen, onClose }: BuyCryptoModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("BTC");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [step, setStep] = useState<"select" | "payment" | "processing">("select");

  const selectedCrypto = supportedCurrencies.find(c => c.symbol === selectedCurrency);
  const selectedPayment = paymentMethods.find(p => p.id === paymentMethod);

  const handlePurchase = () => {
    setStep("processing");
    // Simulate processing
    setTimeout(() => {
      onClose();
      setStep("select");
      setAmount("");
    }, 3000);
  };

  const estimatedReceive = amount ? (parseFloat(amount) * 0.97).toFixed(6) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-accent" />
            </div>
            <DialogTitle className="text-lg font-semibold text-primary">
              {step === "select" ? "Buy Cryptocurrency" : 
               step === "payment" ? "Payment Details" : 
               "Processing Purchase"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-6">
            {/* Currency Selection */}
            <div>
              <Label className="text-sm font-medium text-primary mb-3 block">
                Select Cryptocurrency
              </Label>
              <div className="grid gap-3">
                {supportedCurrencies.map((currency) => (
                  <Card 
                    key={currency.symbol}
                    className={`cursor-pointer transition-colors ${
                      selectedCurrency === currency.symbol 
                        ? "ring-2 ring-accent border-accent" 
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedCurrency(currency.symbol)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{currency.icon}</span>
                          <div>
                            <p className="font-semibold text-primary">{currency.name}</p>
                            <p className="text-xs text-neutral">{currency.network}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={currency.color}>
                          {currency.symbol}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-primary mb-2 block">
                Amount (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-neutral mt-1">
                Minimum: $20 • Maximum: $10,000
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium text-primary mb-3 block">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center space-x-2">
                        <span>{method.icon}</span>
                        <span>{method.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {method.fees}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purchase Summary */}
            {amount && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-primary mb-3">Purchase Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral">Amount</span>
                      <span className="font-medium">${amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral">Fees ({selectedPayment?.fees})</span>
                      <span className="font-medium">${(parseFloat(amount) * 0.035).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-neutral">You'll receive</span>
                      <span className="font-semibold text-accent">
                        ~{estimatedReceive} {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Cryptocurrency purchases are processed securely through our partner. 
                Your funds will appear in your wallet within 5-15 minutes.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-accent text-white hover:bg-green-600"
                onClick={() => setStep("payment")}
                disabled={!amount || parseFloat(amount) < 20}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral">Purchasing</span>
                  <span className="font-semibold">{estimatedReceive} {selectedCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral">Total</span>
                  <span className="font-semibold">${amount}</span>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                You'll be redirected to our secure payment partner to complete your purchase. 
                Your crypto will be automatically deposited to your wallet.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("select")}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-accent text-white hover:bg-green-600"
                onClick={handlePurchase}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${amount}
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
            </div>
            <h3 className="font-semibold text-primary mb-2">Processing Purchase</h3>
            <p className="text-sm text-neutral mb-4">
              Securely processing your {selectedCurrency} purchase...
            </p>
            <p className="text-xs text-neutral">
              This usually takes 30-60 seconds
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}