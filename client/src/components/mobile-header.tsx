import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <h1 className="text-lg font-semibold text-primary">LightningVault</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-gray-100">
            <Bell className="h-4 w-4 text-neutral" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 rounded-lg hover:bg-gray-100">
            <Settings className="h-4 w-4 text-neutral" />
          </Button>
        </div>
      </div>
    </header>
  );
}
