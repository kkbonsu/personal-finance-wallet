import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isLocked: boolean;
  lastActivity: number;
  unlock: (passcode?: string, biometric?: boolean) => Promise<boolean>;
  lock: () => void;
  updateActivity: () => void;
  enablePasscode: (passcode: string) => void;
  disablePasscode: () => void;
  passcodeEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [passcodeEnabled, setPasscodeEnabled] = useState(() => {
    return localStorage.getItem("passcodeEnabled") === "true";
  });

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const lock = () => {
    setIsLocked(true);
  };

  const unlock = async (passcode?: string, biometric?: boolean): Promise<boolean> => {
    if (biometric && "credentials" in navigator) {
      try {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            allowCredentials: [],
            userVerification: "required",
          }
        });
        if (credential) {
          setIsLocked(false);
          updateActivity();
          return true;
        }
      } catch (error) {
        console.error("Biometric authentication failed:", error);
        return false;
      }
    }

    if (passcode && passcodeEnabled) {
      const storedPasscode = localStorage.getItem("walletPasscode");
      if (storedPasscode && passcode === storedPasscode) {
        setIsLocked(false);
        updateActivity();
        return true;
      }
      return false;
    }

    setIsLocked(false);
    updateActivity();
    return true;
  };

  const enablePasscode = (passcode: string) => {
    localStorage.setItem("walletPasscode", passcode);
    localStorage.setItem("passcodeEnabled", "true");
    setPasscodeEnabled(true);
  };

  const disablePasscode = () => {
    localStorage.removeItem("walletPasscode");
    localStorage.setItem("passcodeEnabled", "false");
    setPasscodeEnabled(false);
  };

  useEffect(() => {
    const checkAutoLock = () => {
      const autoLockMinutes = parseInt(localStorage.getItem("autoLockMinutes") || "5");
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (passcodeEnabled && timeSinceActivity > autoLockMinutes * 60 * 1000) {
        setIsLocked(true);
      }
    };

    const interval = setInterval(checkAutoLock, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, passcodeEnabled]);

  return (
    <AuthContext.Provider value={{
      isLocked,
      lastActivity,
      unlock,
      lock,
      updateActivity,
      enablePasscode,
      disablePasscode,
      passcodeEnabled
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}