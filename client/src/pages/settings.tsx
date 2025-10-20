import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { type SessionData } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Bell,
  Lock,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="heading-settings">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your application preferences and settings
          </p>
        </div>

        <div className="grid gap-6">
          <Card data-testid="card-interface-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Interface</CardTitle>
              </div>
              <CardDescription>
                Customize the appearance and behavior of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-light"
                    >
                      <Sun className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Light</div>
                        <div className="text-xs text-muted-foreground">
                          Bright and clear
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-dark"
                    >
                      <Moon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Dark</div>
                        <div className="text-xs text-muted-foreground">
                          Easy on the eyes
                        </div>
                      </div>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current theme: <span className="font-medium capitalize">{theme}</span>
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode" className="text-base">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing for more content density
                      </p>
                    </div>
                    <Switch id="compact-mode" data-testid="switch-compact-mode" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations" className="text-base">
                        Animations
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and effects
                      </p>
                    </div>
                    <Switch id="animations" defaultChecked data-testid="switch-animations" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebar-collapsed" className="text-base">
                        Collapse Sidebar by Default
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Start with sidebar minimized
                      </p>
                    </div>
                    <Switch id="sidebar-collapsed" data-testid="switch-sidebar-collapsed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-notifications-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked data-testid="switch-email-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get browser notifications for important events
                  </p>
                </div>
                <Switch id="push-notifications" data-testid="switch-push-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-base">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch id="sound-enabled" data-testid="switch-sound-enabled" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-account-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-sm font-medium" data-testid="text-user-name">{session.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm font-medium font-mono" data-testid="text-user-email">{session.email}</p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" data-testid="button-change-password">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
