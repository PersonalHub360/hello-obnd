import { LayoutDashboard, DollarSign, Users, BarChart3, Building2, TrendingUp, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { type SessionData } from "@shared/schema";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Deposit Section",
    url: "/deposits",
    icon: DollarSign,
  },
  {
    title: "Staff Directory",
    url: "/staff-directory",
    icon: Users,
  },
  {
    title: "Staff Performance Check",
    url: "/performance-check",
    icon: TrendingUp,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { data: session } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
  });

  return (
    <Sidebar className="border-r-0">
      <div className="h-full bg-sidebar relative overflow-hidden">
        <div className="h-full flex flex-col">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">AuroraMY</h2>
                <p className="text-xs text-muted-foreground">Staff Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider px-4">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive} 
                          data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`
                            transition-all duration-200
                            ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-sidebar-primary' : ''}
                          `}
                        >
                          <Link href={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span className={isActive ? 'font-semibold' : ''}>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {session && (
            <SidebarFooter className="border-t border-sidebar-border p-4 mt-auto">
              <div className="flex items-center gap-3 bg-sidebar-accent rounded-lg p-3 border border-sidebar-border">
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-ring">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
                    {session.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">{session.name}</p>
                  <p className="text-xs truncate text-muted-foreground">{session.email}</p>
                </div>
              </div>
            </SidebarFooter>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
