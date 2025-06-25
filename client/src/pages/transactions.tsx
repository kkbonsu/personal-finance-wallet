import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowDown, ArrowUp, ArrowUpDown, Coins, Filter } from "lucide-react";
import { formatCurrency, timeAgo, getNetworkIcon, formatDate } from "@/lib/utils";

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

export function TransactionsPage() {
  const [, setLocation] = useLocation();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "receive":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "swap":
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />;
      case "invest":
        return <Coins className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatAmount = (transaction: Transaction) => {
    const isReceive = transaction.type === "receive";
    const prefix = isReceive ? "+" : "-";
    const color = isReceive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    return `${prefix}${transaction.amount}`;
  };

  const filterTransactionsByType = (type: string) => {
    if (type === "all") return transactions || [];
    return transactions?.filter(tx => tx.type === type) || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MobileHeader />
        <main className="max-w-md mx-auto pb-20 px-4 py-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold dark:text-white">All Transactions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-20">
        <section className="px-4 py-6">
          {/* Transaction Filter Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="send">Send</TabsTrigger>
              <TabsTrigger value="receive">Receive</TabsTrigger>
              <TabsTrigger value="swap">Swap</TabsTrigger>
              <TabsTrigger value="invest">Invest</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterTransactionsByType("all").map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="send" className="space-y-4">
              {filterTransactionsByType("send").map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="receive" className="space-y-4">
              {filterTransactionsByType("receive").map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="swap" className="space-y-4">
              {filterTransactionsByType("swap").map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>

            <TabsContent value="invest" className="space-y-4">
              {filterTransactionsByType("invest").map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </TabsContent>
          </Tabs>

          {(!transactions || transactions.length === 0) && (
            <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your transaction history will appear here once you start using your wallet.
                </p>
                <Button onClick={() => setLocation("/")}>
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
}

function TransactionCard({ transaction }: TransactionCardProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "receive":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "swap":
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />;
      case "invest":
        return <Coins className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatAmount = (transaction: Transaction) => {
    const isReceive = transaction.type === "receive";
    const prefix = isReceive ? "+" : "-";
    return `${prefix}${transaction.amount}`;
  };

  const getAmountColor = (type: string) => {
    return type === "receive" 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {getTransactionIcon(transaction.type)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {transaction.type}
                </h3>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.description}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {transaction.network}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {formatDate(transaction.timestamp)} • Fee: {transaction.fee}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
              {formatAmount(transaction)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(parseFloat(transaction.usdAmount))}
            </p>
          </div>
        </div>
        
        {transaction.txHash && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              TX: {transaction.txHash.slice(0, 16)}...{transaction.txHash.slice(-8)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TransactionsPage;