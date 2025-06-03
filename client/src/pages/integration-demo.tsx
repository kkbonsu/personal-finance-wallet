import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Zap, Bitcoin, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  PersonalWalletAPI, 
  WalletConnection, 
  getPersonalWalletProvider
} from "@/lib/wallet-provider";
import {
  INTEGRATION_EXAMPLES,
  INTEGRATION_GUIDE 
} from "@/lib/integration-docs";

export default function IntegrationDemo() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<PersonalWalletAPI | null>(null);
  const [accounts, setAccounts] = useState<WalletConnection[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const walletProvider = getPersonalWalletProvider();
    setWallet(walletProvider);
    setIsConnected(walletProvider.isConnected());
  }, []);

  const connectWallet = async () => {
    if (!wallet) return;
    
    try {
      const connectedAccounts = await wallet.connect();
      setAccounts(connectedAccounts);
      setIsConnected(true);
      addTestResult("✅ Wallet connected successfully");
      toast({
        title: "Connected",
        description: `Connected to ${connectedAccounts.length} accounts`
      });
    } catch (error) {
      addTestResult(`❌ Connection failed: ${error}`);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const testBitcoinTransaction = async () => {
    if (!wallet || !isConnected) return;
    
    try {
      const result = await wallet.sendBitcoin(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '0.001'
      );
      addTestResult(`✅ Bitcoin transaction sent: ${result.txHash}`);
      toast({
        title: "Bitcoin Transaction",
        description: "Transaction sent successfully"
      });
    } catch (error) {
      addTestResult(`❌ Bitcoin transaction failed: ${error}`);
    }
  };

  const testLightningInvoice = async () => {
    if (!wallet || !isConnected) return;
    
    try {
      const invoice = await wallet.createLightningInvoice(1000, "Test payment");
      addTestResult(`✅ Lightning invoice created: ${invoice.invoice.slice(0, 50)}...`);
      toast({
        title: "Lightning Invoice",
        description: "Invoice created successfully"
      });
    } catch (error) {
      addTestResult(`❌ Lightning invoice failed: ${error}`);
    }
  };

  const testStarknetContract = async () => {
    if (!wallet || !isConnected) return;
    
    try {
      const result = await wallet.callStarknetContract(
        '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
        'transfer',
        ['0x123...', '1000000']
      );
      addTestResult(`✅ Starknet contract call: ${result.txHash}`);
      toast({
        title: "Starknet Contract",
        description: "Contract called successfully"
      });
    } catch (error) {
      addTestResult(`❌ Starknet contract failed: ${error}`);
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Personal Wallet Integration</h1>
          <p className="text-muted-foreground">
            Complete SDK for Bitcoin, Lightning Network, and Starknet integration
          </p>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="guide">Integration Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  
                  {!isConnected ? (
                    <Button onClick={connectWallet} className="w-full">
                      Connect Wallet
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {accounts.length} accounts connected
                      </p>
                      {accounts.map((account, index) => (
                        <div key={index} className="p-2 border rounded text-xs">
                          <div className="font-medium">{account.type.toUpperCase()}</div>
                          <div className="text-muted-foreground truncate">
                            {account.address}
                          </div>
                          <div>{account.balance} {account.type === 'lightning' ? 'sats' : account.type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={testBitcoinTransaction}
                    disabled={!isConnected}
                    className="w-full"
                    variant="outline"
                  >
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Test Bitcoin Transaction
                  </Button>
                  
                  <Button 
                    onClick={testLightningInvoice}
                    disabled={!isConnected}
                    className="w-full"
                    variant="outline"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Test Lightning Invoice
                  </Button>
                  
                  <Button 
                    onClick={testStarknetContract}
                    disabled={!isConnected}
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Starknet Contract
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md h-48 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-muted-foreground">No test results yet. Run some tests above.</p>
                  ) : (
                    <div className="space-y-1">
                      {testResults.map((result, index) => (
                        <div key={index} className="text-sm font-mono">
                          {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{INTEGRATION_EXAMPLES.basicConnection}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(INTEGRATION_EXAMPLES.basicConnection)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bitcoin Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{INTEGRATION_EXAMPLES.sendBitcoin}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(INTEGRATION_EXAMPLES.sendBitcoin)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lightning Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{INTEGRATION_EXAMPLES.lightning}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(INTEGRATION_EXAMPLES.lightning)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Starknet Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                      <code>{INTEGRATION_EXAMPLES.starknet}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(INTEGRATION_EXAMPLES.starknet)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {INTEGRATION_GUIDE.api.methods.map((method, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                      {method.parameters && (
                        <p className="text-xs"><strong>Parameters:</strong> {method.parameters}</p>
                      )}
                      <p className="text-xs"><strong>Returns:</strong> {method.returns}</p>
                      <pre className="bg-muted p-2 rounded text-xs mt-2">
                        <code>{method.example}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Integration Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quick Start</h3>
                  <ol className="space-y-2">
                    {INTEGRATION_GUIDE.quickStart.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
                  <ul className="space-y-2">
                    {INTEGRATION_GUIDE.bestPractices.practices.map((practice, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-green-500">•</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">TypeScript Definitions</h3>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                    <code>{INTEGRATION_GUIDE.typeDefinitions.types}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}