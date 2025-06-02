import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Fingerprint, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function WalletLockScreen() {
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { unlock } = useAuth();
  const { toast } = useToast();

  const handlePasscodeSubmit = async () => {
    if (passcode.length < 4) {
      toast({
        title: "Invalid Passcode",
        description: "Passcode must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    const success = await unlock(passcode);
    
    if (!success) {
      toast({
        title: "Incorrect Passcode",
        description: "Please try again",
        variant: "destructive",
      });
      setPasscode("");
    }
    setIsAuthenticating(false);
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    const success = await unlock(undefined, true);
    
    if (!success) {
      toast({
        title: "Biometric Authentication Failed",
        description: "Please use your passcode instead",
        variant: "destructive",
      });
    }
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary dark:text-white">
            Wallet Locked
          </CardTitle>
          <p className="text-neutral dark:text-gray-400">
            Enter your passcode to unlock your wallet
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPasscode ? "text" : "password"}
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasscodeSubmit()}
                className="text-lg text-center tracking-widest"
                maxLength={8}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPasscode(!showPasscode)}
              >
                {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button
              onClick={handlePasscodeSubmit}
              disabled={passcode.length < 4 || isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? "Unlocking..." : "Unlock Wallet"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-neutral dark:text-gray-400">
                Or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleBiometricAuth}
            disabled={isAuthenticating}
            className="w-full"
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            Use Biometric Authentication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}