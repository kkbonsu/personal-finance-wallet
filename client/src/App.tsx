import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WalletLockScreen } from "@/components/wallet-lock-screen";
import Home from "@/pages/home";
import Wallet from "@/pages/wallet";
import DeFi from "@/pages/defi";
import VaultPage from "@/pages/vault";
import History from "@/pages/history";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/defi" component={DeFi} />
      <Route path="/vault" component={VaultPage} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isLocked, updateActivity } = useAuth();

  const handleActivity = () => {
    updateActivity();
  };

  if (isLocked) {
    return <WalletLockScreen />;
  }

  return (
    <div onClick={handleActivity} onKeyDown={handleActivity}>
      <Router />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
