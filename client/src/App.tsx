import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WalletSDKProvider } from "@/contexts/WalletSDKContext";
import { WalletLockScreen } from "@/components/wallet-lock-screen";
import Home from "@/pages/home";
import Wallet from "@/pages/wallet";
import Invest from "@/pages/invest";
import History from "@/pages/history";
import Settings from "@/pages/settings";
import IntegrationDemo from "@/pages/integration-demo";
import NotFound from "@/pages/not-found";
import { SendPage } from "@/pages/send";
import { ReceivePage } from "@/pages/receive";
import { SwapPage } from "@/pages/swap";
import { BuyPage } from "@/pages/buy";
import { TransactionsPage } from "@/pages/transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/invest" component={Invest} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/integration-demo" component={IntegrationDemo} />
      <Route path="/send" component={SendPage} />
      <Route path="/receive" component={ReceivePage} />
      <Route path="/swap" component={SwapPage} />
      <Route path="/buy" component={BuyPage} />
      <Route path="/transactions" component={TransactionsPage} />
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
          <WalletSDKProvider>
            <AuthProvider>
              <TooltipProvider>
                <AppContent />
              </TooltipProvider>
            </AuthProvider>
          </WalletSDKProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
