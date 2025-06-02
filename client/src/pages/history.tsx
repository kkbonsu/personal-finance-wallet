import { useQuery } from "@tanstack/react-query";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, Coins, Filter } from "lucide-react";
import { formatCurrency, timeAgo, getNetworkIcon, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  usdAmount: string;
  fee: string;
  status: string;
  txHash?: string;
  description: string;
  network: string;
  timestamp: string;
}

export default function History() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "receive":
        return <ArrowDown className="h-4 w-4 text-accent" />;
      case "send":
        return <ArrowUp className="h-4 w-4 text-warning" />;
      case "yield_earned":
        return <Coins className="h-4 w-4 text-purple-600" />;
      case "defi_deposit":
        return <ArrowUp className="h-4 w-4 text-blue-600" />;
      case "defi_withdraw":
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      default:
        return <ArrowDown className="h-4 w-4 text-neutral" />;
    }
  };

  const getTransactionBgColor = (type: string) => {
    switch (type) {
      case "receive":
        return "bg-green-100";
      case "send":
        return "bg-orange-100";
      case "yield_earned":
        return "bg-purple-100";
      case "defi_deposit":
        return "bg-blue-100";
      case "defi_withdraw":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "receive":
      case "yield_earned":
      case "defi_withdraw":
        return "text-accent";
      case "send":
      case "defi_deposit":
        return "text-neutral";
      default:
        return "text-neutral";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAmount = (transaction: Transaction) => {
    const prefix = transaction.type === "receive" || transaction.type === "yield_earned" || transaction.type === "defi_withdraw" ? "+" : "-";
    return `${prefix}${formatCurrency(parseFloat(transaction.usdAmount))}`;
  };

  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: { [date: string]: Transaction[] } = {};
    
    transactions.forEach(tx => {
      const date = formatDate(new Date(tx.timestamp));
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });
    
    return groups;
  };

  const allTransactions = transactions || [];
  const sendReceiveTransactions = allTransactions.filter(tx => 
    tx.type === "send" || tx.type === "receive"
  );
  const defiTransactions = allTransactions.filter(tx => 
    tx.type === "defi_deposit" || tx.type === "defi_withdraw" || tx.type === "yield_earned"
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader />
        <main className="max-w-md mx-auto pb-20 px-4 py-6">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
    const groupedTransactions = groupTransactionsByDate(transactions);
    
    if (transactions.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpDown className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-primary mb-2">No Transactions</h3>
            <p className="text-sm text-neutral">Your transaction history will appear here</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-neutral mb-3 px-1">{date}</h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {dayTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center space-x-3">
                      <div className={`w-10 h-10 ${getTransactionBgColor(transaction.type)} rounded-xl flex items-center justify-center`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-primary truncate">{transaction.description}</p>
                          <p className={`font-semibold ${getAmountColor(transaction.type)} text-sm`}>
                            {formatAmount(transaction)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-neutral">
                            <span>{getNetworkIcon(transaction.network)} {transaction.network}</span>
                            <span>•</span>
                            <span>{timeAgo(new Date(transaction.timestamp))}</span>
                            {transaction.txHash && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{transaction.txHash.slice(0, 8)}...</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {parseFloat(transaction.fee) > 0 && (
                              <span className="text-xs text-neutral">
                                {formatCurrency(parseFloat(transaction.fee), "BTC")} fee
                              </span>
                            )}
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary">Transaction History</h1>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="defi">DeFi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <TransactionList transactions={allTransactions} />
            </TabsContent>
            
            <TabsContent value="wallet" className="mt-6">
              <TransactionList transactions={sendReceiveTransactions} />
            </TabsContent>
            
            <TabsContent value="defi" className="mt-6">
              <TransactionList transactions={defiTransactions} />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
