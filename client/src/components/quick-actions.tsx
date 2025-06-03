import { Send, QrCode, ArrowUpDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onOpenSwap: () => void;
  onOpenVault: () => void;
  onOpenBuy: () => void;
}

export function QuickActions({ onOpenSend, onOpenReceive, onOpenSwap, onOpenVault, onOpenBuy }: QuickActionsProps) {
  return (
    <section className="px-4 mb-6">
      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenSend}
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Send className="h-5 w-5 text-secondary dark:text-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Send</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenReceive}
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <QrCode className="h-5 w-5 text-accent dark:text-green-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Receive</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenSwap}
        >
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <ArrowUpDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Swap</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenBuy}
        >
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-accent dark:text-green-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Buy</span>
        </Button>
      </div>
    </section>
  );
}
