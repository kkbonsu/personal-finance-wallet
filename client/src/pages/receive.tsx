import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, QrCode, Copy, Zap, Bitcoin, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletSDK } from "@/contexts/WalletSDKContext";
import { truncateAddress } from "@/lib/utils";

interface Wallet {
  id: number;
  type: string;
  network: string;
  address: string;
  balance: string;
  usdValue: string;
}

export function ReceivePage() {
  const [, setLocation] = useLocation();
  
  // Get the 'from' parameter to determine where to navigate back
  const getBackLocation = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from');
    return from === 'wallet' ? '/wallet' : '/';
  };
  const [network, setNetwork] = useState<"bitcoin" | "lightning">("lightning");
  const [lightningAmount, setLightningAmount] = useState("");
  const [lightningDescription, setLightningDescription] = useState("");
  const [lightningInvoice, setLightningInvoice] = useState("");
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const { toast } = useToast();
  const { sdk, bitcoinAccounts, lightningAccounts, createLightningInvoice } = useWalletSDK();
  
  // Fetch wallets from API as fallback
  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const handleGenerateLightningInvoice = async () => {
    if (!lightningAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter an amount for the Lightning invoice",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      const invoice = await createLightningInvoice(
        parseInt(lightningAmount),
        lightningDescription
      );
      setLightningInvoice(invoice.bolt11);
      toast({
        title: "Invoice Generated",
        description: "Lightning invoice created successfully"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate invoice",
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

  const getReceiveAddress = () => {
    if (network === "bitcoin") {
      // Try SDK accounts first, then fallback to API data
      const segwitAccount = bitcoinAccounts.find(acc => acc.derivationPath?.includes("84'"));
      if (segwitAccount?.address) {
        return segwitAccount.address;
      }
      
      // Fallback to API wallet data
      const bitcoinWallet = wallets?.find(w => w.type === "bitcoin" || w.network === "bitcoin");
      return bitcoinWallet?.address || "No Bitcoin wallet found";
    }
    return "";
  };

  const getNetworkIcon = (network: string) => {
    return network === "lightning" ? <Zap className="h-4 w-4" /> : <Bitcoin className="h-4 w-4" />;
  };

  const resetLightningForm = () => {
    setLightningAmount("");
    setLightningDescription("");
    setLightningInvoice("");
  };

  // Generate QR code for the current address/invoice
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        let qrData = "";
        
        if (network === "bitcoin") {
          const address = getReceiveAddress();
          if (address && address !== "No Bitcoin wallet found") {
            qrData = address;
          }
        } else if (network === "lightning" && lightningInvoice) {
          qrData = lightningInvoice;
        }
        
        if (qrData) {
          const qrCodeUrl = await QRCode.toDataURL(qrData, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrCodeUrl);
        } else {
          setQrCodeDataUrl("");
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrCodeDataUrl("");
      }
    };

    generateQRCode();
  }, [network, lightningInvoice, bitcoinAccounts, wallets]);

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
            <QrCode className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">Receive</h1>
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
                  onClick={() => {
                    setNetwork(net as any);
                    if (net !== "lightning") {
                      resetLightningForm();
                    }
                  }}
                  className="flex items-center space-x-2 dark:border-gray-600"
                >
                  {getNetworkIcon(net)}
                  <span>{net === "lightning" ? "Lightning" : "Bitcoin"}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lightning Invoice Generation */}
        {network === "lightning" && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Lightning Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lightning-amount" className="dark:text-white">
                  Amount (sats)
                </Label>
                <Input
                  id="lightning-amount"
                  type="number"
                  placeholder="1000"
                  value={lightningAmount}
                  onChange={(e) => setLightningAmount(e.target.value)}
                  className="mt-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor="lightning-description" className="dark:text-white">
                  Description (optional)
                </Label>
                <Input
                  id="lightning-description"
                  placeholder="Payment for..."
                  value={lightningDescription}
                  onChange={(e) => setLightningDescription(e.target.value)}
                  className="mt-1 dark:bg-gray-700 dark:border-gray-600"
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
            </CardContent>
          </Card>
        )}

        {/* Bitcoin Address Display */}
        {network === "bitcoin" && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Your Bitcoin Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-4">
                  <QrCode className="h-24 w-24 mx-auto text-gray-400 dark:text-gray-500" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    QR Code would appear here
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Address</p>
                  <p className="font-mono text-sm break-all dark:text-white">
                    {getReceiveAddress()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(getReceiveAddress(), "Bitcoin Address")}
                  className="mt-3 w-full dark:border-gray-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </Button>
              </div>

              {/* Address Types Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  Address Type: SegWit (Bech32)
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Lower fees and improved security. Compatible with most wallets.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}