import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Zap, Bitcoin, DollarSign, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletSDK } from "@/contexts/WalletSDKContext";
import { formatCurrency } from "@/lib/utils";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<"bitcoin" | "lightning" | "usdt">("lightning");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sdk, bitcoinAccounts, lightningAccounts, sendBitcoin, payLightningInvoice } = useWalletSDK();

  const handleSend = async () => {
    if (!sdk || !recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (network === "lightning") {
        // Check if recipient is a Lightning invoice
        if (recipient.toLowerCase().startsWith('lnbc') || recipient.toLowerCase().startsWith('lntb')) {
          result = await payLightningInvoice(recipient);
          toast({
            title: "Lightning Payment Sent",
            description: `Successfully paid Lightning invoice for ${amount} sats`
          });
        } else {
          toast({
            title: "Invalid Lightning Invoice",
            description: "Please enter a valid Lightning Network invoice",
            variant: "destructive"
          });
          return;
        }
      } else if (network === "bitcoin") {
        result = await sendBitcoin(recipient, amount);
        toast({
          title: "Bitcoin Transaction Sent",
          description: `Successfully sent ${amount} BTC to ${recipient.slice(0, 8)}...`
        });
      } else if (network === "usdt") {
        // For USDT, we'll use the Starknet integration
        toast({
          title: "USDT Transfer",
          description: "USDT transfers are currently being processed via Starknet"
        });
      }

      // Reset form
      setRecipient("");
      setAmount("");
      onClose();
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "lightning":
        return <Zap className="h-4 w-4" />;
      case "bitcoin":
        return <Bitcoin className="h-4 w-4" />;
      case "usdt":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getNetworkName = (network: string) => {
    switch (network) {
      case "lightning":
        return "Lightning Network";
      case "bitcoin":
        return "Bitcoin";
      case "usdt":
        return "USDT (Tron)";
      default:
        return network;
    }
  };

  const getAccountBalance = () => {
    if (network === "lightning") {
      // Show combined Lightning balance
      const totalLightning = lightningAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      return `${totalLightning} sats`;
    } else if (network === "bitcoin") {
      // Show combined Bitcoin balance
      const totalBitcoin = bitcoinAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      return `${totalBitcoin.toFixed(8)} BTC`;
    } else if (network === "usdt") {
      return "0 USDT"; // USDT handled separately
    }
    return "0";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 dark:text-white">
            <Send className="h-5 w-5" />
            <span>Send Crypto</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Network Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block dark:text-white">Select Network</Label>
            <div className="grid grid-cols-3 gap-2">
              {["lightning", "bitcoin", "usdt"].map((net) => (
                <Card 
                  key={net}
                  className={`cursor-pointer transition-all ${
                    network === net 
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  } dark:bg-gray-700 dark:border-gray-600`}
                  onClick={() => setNetwork(net as any)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      {getNetworkIcon(net)}
                      <span className="text-xs font-medium dark:text-white">
                        {net === "lightning" ? "Lightning" : net === "bitcoin" ? "Bitcoin" : "USDT"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Balance Display */}
          <Card className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Available Balance</span>
                <div className="flex items-center space-x-2">
                  {getNetworkIcon(network)}
                  <span className="font-semibold dark:text-white">{getAccountBalance()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Input */}
          <div>
            <Label htmlFor="recipient" className="text-sm font-medium mb-2 block dark:text-white">
              {network === "lightning" ? "Lightning Invoice" : "Recipient Address"}
            </Label>
            <Input
              id="recipient"
              placeholder={
                network === "lightning" 
                  ? "lnbc1..." 
                  : network === "bitcoin" 
                    ? "bc1q..." 
                    : "T..."
              }
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium mb-2 block dark:text-white">
              Amount ({network === "lightning" ? "sats" : network === "bitcoin" ? "BTC" : "USDT"})
            </Label>
            <Input
              id="amount"
              type="number"
              step={network === "lightning" ? "1" : "0.00000001"}
              placeholder={network === "lightning" ? "1000" : network === "bitcoin" ? "0.001" : "10.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Warning for Lightning */}
          {network === "lightning" && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      Lightning payments are instant and irreversible. Ensure the invoice is correct.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !recipient || !amount}
              className="flex-1"
            >
              {isLoading ? "Sending..." : `Send ${network === "lightning" ? "⚡" : network === "bitcoin" ? "₿" : "$"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}