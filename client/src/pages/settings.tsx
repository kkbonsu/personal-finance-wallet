import { useState } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Globe, 
  Palette, 
  Key, 
  Fingerprint, 
  Clock, 
  Eye,
  EyeOff,
  AlertTriangle,
  Copy,
  CheckCircle
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { enablePasscode, disablePasscode, passcodeEnabled } = useAuth();
  const { toast } = useToast();
  
  const [showSeedphrase, setShowSeedphrase] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);

  // Generate a demo seedphrase for non-custodial wallet
  const seedphrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const currencies = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "JPY", label: "Japanese Yen (JPY)" },
    { value: "CAD", label: "Canadian Dollar (CAD)" },
    { value: "AUD", label: "Australian Dollar (AUD)" },
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" }
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
    { value: "zh", label: "中文" },
    { value: "ko", label: "한국어" },
    { value: "pt", label: "Português" }
  ];

  const autoLockOptions = [
    { value: 1, label: "1 minute" },
    { value: 5, label: "5 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" }
  ];

  const handlePasscodeSetup = () => {
    if (newPasscode.length < 4) {
      toast({
        title: "Invalid Passcode",
        description: "Passcode must be at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      toast({
        title: "Passcode Mismatch",
        description: "Passcodes do not match",
        variant: "destructive",
      });
      return;
    }

    enablePasscode(newPasscode);
    setShowPasscodeSetup(false);
    setNewPasscode("");
    setConfirmPasscode("");
    toast({
      title: "Passcode Enabled",
      description: "Your wallet is now protected with a passcode",
    });
  };

  const handleDisablePasscode = () => {
    disablePasscode();
    toast({
      title: "Passcode Disabled",
      description: "Passcode protection has been removed",
    });
  };

  const copySeedphrase = () => {
    navigator.clipboard.writeText(seedphrase);
    toast({
      title: "Copied to Clipboard",
      description: "Recovery phrase copied successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        <section className="px-4 py-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary dark:text-white">Settings</h1>
              <p className="text-sm text-neutral dark:text-gray-400">Manage your wallet preferences</p>
            </div>
          </div>

          {/* Security Section */}
          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Passcode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Passcode</p>
                    <p className="text-sm text-neutral dark:text-gray-400">Protect your wallet with a passcode</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {passcodeEnabled && (
                    <Badge variant="secondary" className="text-xs">Enabled</Badge>
                  )}
                  <Switch
                    checked={passcodeEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setShowPasscodeSetup(true);
                      } else {
                        handleDisablePasscode();
                      }
                    }}
                  />
                </div>
              </div>

              {showPasscodeSetup && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium dark:text-white">New Passcode</label>
                      <input
                        type="password"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter 4-8 digits"
                        maxLength={8}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium dark:text-white">Confirm Passcode</label>
                      <input
                        type="password"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Confirm passcode"
                        maxLength={8}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handlePasscodeSetup} size="sm">
                        Enable Passcode
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowPasscodeSetup(false);
                          setNewPasscode("");
                          setConfirmPasscode("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Biometrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Fingerprint className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Biometric Login</p>
                    <p className="text-sm text-neutral dark:text-gray-400">Use fingerprint or face recognition</p>
                  </div>
                </div>
                <Switch
                  checked={settings.biometricsEnabled}
                  onCheckedChange={(checked) => updateSettings({ biometricsEnabled: checked })}
                />
              </div>

              {/* Auto Lock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Auto Lock</p>
                    <p className="text-sm text-neutral dark:text-gray-400">Lock wallet after inactivity</p>
                  </div>
                </div>
                <Select
                  value={settings.autoLockMinutes.toString()}
                  onValueChange={(value) => updateSettings({ autoLockMinutes: parseInt(value) })}
                >
                  <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {autoLockOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator className="dark:border-gray-600" />

              {/* Recovery Phrase */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium dark:text-white">Recovery Phrase</p>
                      <p className="text-sm text-neutral dark:text-gray-400">Backup your wallet</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSeedphrase(!showSeedphrase)}
                    >
                      {showSeedphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showSeedphrase ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                
                {showSeedphrase && (
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          ⚠️ Keep this phrase safe and private
                        </p>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                          <p className="text-sm font-mono break-all dark:text-white">{seedphrase}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={copySeedphrase} size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            updateSettings({ seedphraseBackedUp: true });
                            toast({
                              title: "Backup Confirmed",
                              description: "Recovery phrase backup confirmed",
                            });
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          I've Saved It
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Palette className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Dark Mode</p>
                  <p className="text-sm text-neutral dark:text-gray-400">Switch between light and dark theme</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>

              {/* Currency */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Display Currency</p>
                  <p className="text-sm text-neutral dark:text-gray-400">Primary currency for values</p>
                </div>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => updateSettings({ currency: value as any })}
                >
                  <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Language</p>
                    <p className="text-sm text-neutral dark:text-gray-400">App display language</p>
                  </div>
                </div>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSettings({ language: value as any })}
                >
                  <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold dark:text-white">Personal Wallet</h3>
                <p className="text-sm text-neutral dark:text-gray-400">Version 1.0.0</p>
                <p className="text-xs text-neutral dark:text-gray-400">
                  Non-custodial Lightning & DeFi wallet
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}