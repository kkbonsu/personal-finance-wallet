import { Home, Wallet, TrendingUp, History, User, Vault } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/wallet", icon: Wallet, label: "Wallet" },
  { path: "/defi", icon: TrendingUp, label: "DeFi" },
  { path: "/vault", icon: Vault, label: "Vault" },
  { path: "/history", icon: History, label: "History" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <Button
                key={path}
                variant="ghost"
                className={`flex flex-col items-center py-2 px-1 h-auto ${
                  isActive 
                    ? "text-secondary dark:text-secondary" 
                    : "text-neutral dark:text-gray-400 hover:text-secondary dark:hover:text-secondary"
                }`}
                onClick={() => setLocation(path)}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
