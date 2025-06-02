import { createContext, useContext, useState } from "react";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "BTC" | "ETH";
export type Language = "en" | "es" | "fr" | "de" | "ja" | "zh" | "ko" | "pt";

interface Settings {
  currency: Currency;
  language: Language;
  biometricsEnabled: boolean;
  passcodeEnabled: boolean;
  autoLockMinutes: number;
  seedphraseBackedUp: boolean;
  notificationsEnabled: boolean;
  theme: "light" | "dark";
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  currency: "USD",
  language: "en",
  biometricsEnabled: false,
  passcodeEnabled: false,
  autoLockMinutes: 5,
  seedphraseBackedUp: false,
  notificationsEnabled: true,
  theme: "light"
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem("walletSettings");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("walletSettings", JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("walletSettings", JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}