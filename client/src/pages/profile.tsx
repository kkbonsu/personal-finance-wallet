import { MobileHeader } from "@/components/mobile-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  AlertTriangle
} from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="h-4 w-4 text-neutral" />
                  <div>
                    <p className="font-medium text-primary">Two-Factor Authentication</p>
                    <p className="text-xs text-neutral">Add an extra layer of security</p>
                  </div>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-neutral" />
                  <div>
                    <p className="font-medium text-primary">Biometric Login</p>
                    <p className="text-xs text-neutral">Use fingerprint or face ID</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <Button variant="ghost" className="w-full justify-start p-0">
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-neutral" />
                  <span>Backup Recovery Phrase</span>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">Transaction Alerts</p>
                  <p className="text-xs text-neutral">Get notified of all transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">DeFi Yield Updates</p>
                  <p className="text-xs text-neutral">APY changes and rewards</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">Security Alerts</p>
                  <p className="text-xs text-neutral">Suspicious activity warnings</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Settings className="h-5 w-5" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Moon className="h-4 w-4 text-neutral" />
                  <span className="font-medium text-primary">Dark Mode</span>
                </div>
                <Switch />
              </div>
              
              <Separator />
              
              <Button variant="ghost" className="w-full justify-start p-0">
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-neutral" />
                  <div className="text-left">
                    <p className="font-medium text-primary">Language</p>
                    <p className="text-xs text-neutral">English (US)</p>
                  </div>
                </div>
              </Button>
              
              <Separator />
              
              <Button variant="ghost" className="w-full justify-start p-0">
                <div className="flex items-center space-x-3">
                  <span className="text-neutral">$</span>
                  <div className="text-left">
                    <p className="font-medium text-primary">Currency</p>
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
