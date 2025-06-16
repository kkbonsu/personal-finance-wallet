import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bitcoin, Shield, Zap, DollarSign } from "lucide-react";

interface WalletTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

const walletTypes = [
  {
    type: "bitcoin",
    name: "Bitcoin Legacy",
    description: "P2PKH addresses starting with '1'",
    icon: Bitcoin,
    addressFormat: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    features: ["Widely supported", "Higher fees", "Legacy format"],
    recommended: false
  },
  {
    type: "bitcoin-segwit",
    name: "Native Segwit",
    description: "P2WPKH addresses starting with 'bc1q'",
    icon: Shield,
    addressFormat: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    features: ["Lower fees", "Faster confirmation", "Most popular"],
    recommended: true
  },
  {
    type: "bitcoin-taproot",
    name: "Taproot",
    description: "P2TR addresses starting with 'bc1p'",
    icon: Zap,
    addressFormat: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297",
    features: ["Enhanced privacy", "Smart contracts", "Latest technology"],
    recommended: false
  },
  {
    type: "usdt",
    name: "USDT (Tron)",
    description: "TRC-20 USDT on Tron network",
    icon: DollarSign,
    addressFormat: "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs",
    features: ["Stablecoin", "Low fees", "Fast transfers"],
    recommended: false
  }
];

export function WalletTypeModal({ isOpen, onClose, onSelectType }: WalletTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleCreate = () => {
    if (selectedType) {
      onSelectType(selectedType);
      onClose();
      setSelectedType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Select Wallet Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walletTypes.map((wallet) => {
              const IconComponent = wallet.icon;
              const isSelected = selectedType === wallet.type;
              
              return (
                <Card 
                  key={wallet.type}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  } dark:bg-gray-700 dark:border-gray-600`}
                  onClick={() => setSelectedType(wallet.type)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold dark:text-white">{wallet.name}</h3>
                            {wallet.recommended && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {wallet.description}
                      </p>

                      {/* Address Format */}
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                          {wallet.addressFormat}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {wallet.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!selectedType}
              className="flex-1"
            >
              Create Wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}