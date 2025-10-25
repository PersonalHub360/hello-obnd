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
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Deposit Section",
    url: "/deposits",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Staff Directory",
    url: "/staff-directory",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Staff Performance Check",
    url: "/performance-check",
    icon: TrendingUp,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Building2 className="h-6 w-6" />
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
                          <Link href={item.url} className="flex items-center gap-3">
                            <div className={`flex items-center justify-center h-8 w-8 rounded-lg ${item.bgColor}`}>
                              <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
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
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                <Avatar className="h-9 w-9 ring-2 ring-blue-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
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
