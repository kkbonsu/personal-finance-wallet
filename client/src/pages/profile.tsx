import { useState } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Shield, 
  Bell, 
  Smartphone, 
  HelpCircle, 
  FileText, 
  LogOut,
  Settings,
  Moon,
  Globe,
  Lock,
  AlertTriangle,
  Key,
  Fingerprint,
  Clock,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Palette
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { enablePasscode, disablePasscode, passcodeEnabled } = useAuth();
  const { toast } = useToast();
  
  const [showSeedphrase, setShowSeedphrase] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "CAD", label: "CAD (C$)" },
    { value: "AUD", label: "AUD (A$)" },
    { value: "BTC", label: "BTC (₿)" },
    { value: "ETH", label: "ETH (Ξ)" }
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

  const demoSeedphrase = "abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual";

  const handlePasscodeSetup = () => {
    if (newPasscode.length < 4) {
      toast({
        title: "Invalid Passcode",
        description: "Passcode must be at least 4 digits long",
        variant: "destructive"
      });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      toast({
        title: "Passcode Mismatch",
        description: "Passcodes do not match",
        variant: "destructive"
      });
      return;
    }

    enablePasscode(newPasscode);
    setNewPasscode("");
    setConfirmPasscode("");
    setShowPasscodeSetup(false);
    toast({
      title: "Passcode Enabled",
      description: "Your wallet is now protected with a passcode"
    });
  };

  const handleDisablePasscode = () => {
    disablePasscode();
    toast({
      title: "Passcode Disabled",
      description: "Passcode protection has been removed"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Recovery phrase copied successfully"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileHeader />
      
      <main className="max-w-md mx-auto pb-20">
        {/* Profile Header */}
        <section className="px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">Demo User</h2>
                  <p className="text-sm text-neutral">demo@lightningvault.app</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">Verified</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">2</p>
                  <p className="text-xs text-neutral">Wallets</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">1</p>
                  <p className="text-xs text-neutral">DeFi Position</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">15</p>
                  <p className="text-xs text-neutral">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Settings Sections */}
        <section className="px-4 space-y-4">
          {/* Security */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base dark:text-white">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Passcode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Passcode Protection</p>
                    <p className="text-sm text-neutral dark:text-gray-400">
                      {passcodeEnabled ? "Wallet is protected" : "Set up passcode protection"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {passcodeEnabled && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant={passcodeEnabled ? "destructive" : "default"}
                    onClick={passcodeEnabled ? handleDisablePasscode : () => setShowPasscodeSetup(true)}
                  >
                    {passcodeEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>

              {showPasscodeSetup && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                  <Input
                    type="password"
                    placeholder="Enter new passcode (4-8 digits)"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    maxLength={8}
                    className="dark:bg-gray-600 dark:border-gray-500"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm passcode"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    maxLength={8}
                    className="dark:bg-gray-600 dark:border-gray-500"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handlePasscodeSetup}>
                      Set Passcode
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPasscodeSetup(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Separator className="dark:bg-gray-600" />

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

              <Separator className="dark:bg-gray-600" />

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

              <Separator className="dark:bg-gray-600" />

              {/* Recovery Phrase */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium dark:text-white">Recovery Phrase</p>
                      <p className="text-sm text-neutral dark:text-gray-400">Your wallet's backup phrase</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSeedphrase(!showSeedphrase)}
                  >
                    {showSeedphrase ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>

                {showSeedphrase && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start space-x-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Keep this phrase secure and never share it with anyone. Anyone with access to this phrase can access your wallet.
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm">
                      {demoSeedphrase}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => copyToClipboard(demoSeedphrase)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base dark:text-white">
                <Settings className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Palette className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Dark Mode</p>
                    <p className="text-sm text-neutral dark:text-gray-400">Switch between light and dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>

              <Separator className="dark:bg-gray-600" />

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

              <Separator className="dark:bg-gray-600" />

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

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-neutral dark:text-gray-400" />
                  <div>
                    <p className="font-medium dark:text-white">Notifications</p>
                    <p className="text-sm text-neutral dark:text-gray-400">Enable push notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Support & About */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base dark:text-white">
                <HelpCircle className="h-5 w-5" />
                <span>Support & About</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="ghost" className="w-full justify-start p-0 dark:text-white">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="h-4 w-4 text-neutral dark:text-gray-400" />
                  <span>Help Center</span>
                </div>
              </Button>
              
              <Separator className="dark:bg-gray-600" />
              
              <Button variant="ghost" className="w-full justify-start p-0 dark:text-white">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-neutral dark:text-gray-400" />
                  <span>Terms & Privacy</span>
                </div>
              </Button>
              
              <Button variant="destructive" className="w-full mt-4 dark:bg-red-700 dark:hover:bg-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
                    <p className="text-xs text-neutral">USD</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <HelpCircle className="h-5 w-5" />
                <span>Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start p-0">
                <HelpCircle className="h-4 w-4 text-neutral mr-3" />
                <span>Help Center</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start p-0">
                <FileText className="h-4 w-4 text-neutral mr-3" />
                <span>Terms of Service</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start p-0">
                <Shield className="h-4 w-4 text-neutral mr-3" />
                <span>Privacy Policy</span>
              </Button>
            </CardContent>
          </Card>

          {/* Risk Warning */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">Important Notice</h3>
                  <p className="text-sm text-yellow-700">
                    This is a demo version. All transactions and balances are simulated. 
                    Do not use real cryptocurrency or private keys.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="p-4">
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-3" />
                <span>Sign Out</span>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
}
