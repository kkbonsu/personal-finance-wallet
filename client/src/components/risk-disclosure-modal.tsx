import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RiskDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function RiskDisclosureModal({ isOpen, onClose, onAccept }: RiskDisclosureModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold text-primary">Risk Disclosure</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-neutral rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-neutral">DeFi investments carry smart contract risks</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-neutral rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-neutral">Yields may fluctuate and principal may be at risk</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-neutral rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-neutral">Cross-chain operations may experience delays</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 py-3 rounded-xl font-semibold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-accent text-white py-3 rounded-xl font-semibold hover:bg-green-600"
            onClick={onAccept}
          >
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
