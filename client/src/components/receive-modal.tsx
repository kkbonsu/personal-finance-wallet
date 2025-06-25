import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Zap, Bitcoin, DollarSign, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletSDK } from "@/contexts/WalletSDKContext";
import { truncateAddress } from "@/lib/utils";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const [network, setNetwork] = useState<"bitcoin" | "lightning">("lightning");
  const [lightningAmount, setLightningAmount] = useState("");
  const [lightningDescription, setLightningDescription] = useState("");
  const [lightningInvoice, setLightningInvoice] = useState("");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const { toast } = useToast();
  const { sdk, bitcoinAccounts, lightningAccounts, createLightningInvoice } = useWalletSDK();

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case "lightning":
        return <Zap className="h-4 w-4" />;
      case "bitcoin":
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getReceiveAddress = () => {
    if (network === "bitcoin") {
      // Default to Segwit address for receiving
      const segwitAccount = bitcoinAccounts.find(acc => acc.derivationPath?.includes("84'"));
      return segwitAccount?.address || bitcoinAccounts[0]?.address || "No Bitcoin wallet found";
    }
    return "";
  };

  const handleGenerateLightningInvoice = async () => {
    if (!sdk || !lightningAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter an amount for the Lightning invoice",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      const invoice = await createLightningInvoice(
        parseInt(lightningAmount), 
        lightningDescription || "Payment request"
      );
      setLightningInvoice(invoice.invoice);
      toast({
        title: "Lightning Invoice Generated",
        description: "Invoice created successfully"
      });
    } catch (error) {
      toast({
        title: "Invoice Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate Lightning invoice",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${type} copied successfully`
    });
  };

  const resetLightningForm = () => {
    setLightningAmount("");
    setLightningDescription("");
    setLightningInvoice("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 dark:text-white">
            <QrCode className="h-5 w-5" />
            <span>Receive Crypto</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Network Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block dark:text-white">Select Network</Label>
            <div className="grid grid-cols-2 gap-2">
              {["lightning", "bitcoin"].map((net) => (
                <Card 
                  key={net}
                  className={`cursor-pointer transition-all ${
                    network === net 
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  } dark:bg-gray-700 dark:border-gray-600`}
                  onClick={() => {
                    setNetwork(net as any);
                    if (net !== "lightning") {
                      resetLightningForm();
                    }
                  }}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      {getNetworkIcon(net)}
                      <span className="text-xs font-medium dark:text-white">
                        {net === "lightning" ? "Lightning" : "Bitcoin"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Lightning Invoice Generation */}
          {network === "lightning" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="lightning-amount" className="text-sm font-medium mb-2 block dark:text-white">
                  Amount (sats)
                </Label>
                <Input
                  id="lightning-amount"
                  type="number"
                  placeholder="1000"
                  value={lightningAmount}
                  onChange={(e) => setLightningAmount(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="lightning-description" className="text-sm font-medium mb-2 block dark:text-white">
                  Description (optional)
                </Label>
                <Input
                  id="lightning-description"
                  placeholder="Payment for..."
                  value={lightningDescription}
                  onChange={(e) => setLightningDescription(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <Button 
                onClick={handleGenerateLightningInvoice}
                disabled={isGeneratingInvoice || !lightningAmount}
                className="w-full"
              >
                {isGeneratingInvoice ? "Generating..." : "Generate Lightning Invoice"}
              </Button>

              {lightningInvoice && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Lightning Invoice Generated
                      </span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border break-all">
                      <p className="text-xs font-mono dark:text-white">{lightningInvoice}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(lightningInvoice, "Lightning Invoice")}
                      className="mt-3 w-full dark:border-green-700 dark:text-green-200"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Invoice
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Address Display for Bitcoin */}
          {network === "bitcoin" && (
            <div>
              <Label className="text-sm font-medium mb-3 block dark:text-white">
                Your Bitcoin Address
              </Label>
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                      <p className="text-sm font-mono break-all dark:text-white">
                        {getReceiveAddress()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(getReceiveAddress(), "Address")}
                      className="w-full dark:border-gray-600 dark:text-gray-300"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>
                        {network === "bitcoin" ? "Bitcoin Network" : "TRON Network"} • 
                        {network === "bitcoin" ? " 1-6 confirmations" : " ~1 minute"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}