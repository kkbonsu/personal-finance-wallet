import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Coins } from "lucide-react";
import { formatCurrency, timeAgo, getNetworkIcon } from "@/lib/utils";

interface Transaction {
  id: number;
  type: string;
  amount: string;
  usdAmount: string;
  fee: string;
  status: string;
  description: string;
  network: string;
  timestamp: string;
}

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    select: (data) => data?.slice(0, 5) || [],
  });

  if (isLoading) {
    return (
      <section className="px-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

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
      default:
        return "bg-gray-100";
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case "receive":
      case "yield_earned":
        return "text-accent";
      case "send":
      case "defi_deposit":
        return "text-neutral";
      default:
        return "text-neutral";
    }
  };

  const formatAmount = (transaction: Transaction) => {
    const prefix = transaction.type === "receive" || transaction.type === "yield_earned" ? "+" : "-";
    return `${prefix}${formatCurrency(parseFloat(transaction.usdAmount))}`;
  };

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Recent Activity</h2>
        <button className="text-sm text-secondary font-medium">View All</button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {transactions?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral text-sm">No transactions yet</p>
          </div>
        ) : (
          transactions?.map((transaction) => (
            <div key={transaction.id} className="p-4 flex items-center space-x-3">
              <div className={`w-10 h-10 ${getTransactionBgColor(transaction.type)} rounded-xl flex items-center justify-center`}>
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary">{transaction.description}</p>
                <p className="text-xs text-neutral">
                  {getNetworkIcon(transaction.network)} {transaction.network} • {timeAgo(new Date(transaction.timestamp))}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {formatAmount(transaction)}
                </p>
                <p className="text-xs text-neutral">
                  {parseFloat(transaction.fee) > 0 && `${formatCurrency(parseFloat(transaction.fee), "BTC")} fee`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
