import { Send, QrCode, ArrowUpDown, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onOpenSwap: () => void;
  onOpenVault: () => void;
}

export function QuickActions({ onOpenSend, onOpenReceive, onOpenSwap, onOpenVault }: QuickActionsProps) {
  return (
    <section className="px-4 mb-6">
      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenSend}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Send className="h-5 w-5 text-secondary" />
          </div>
          <span className="text-xs font-medium text-gray-700">Send</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenReceive}
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <QrCode className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-medium text-gray-700">Receive</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenSwap}
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ArrowUpDown className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-gray-700">Swap</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow h-auto"
          onClick={onOpenVault}
        >
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Vault className="h-5 w-5 text-warning" />
          </div>
          <span className="text-xs font-medium text-gray-700">Vault</span>
        </Button>
      </div>
    </section>
  );
}
