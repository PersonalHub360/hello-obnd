import { LayoutDashboard, DollarSign, FileText, Users, BarChart3, Building2, TrendingUp } from "lucide-react";
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
    title: "Call Reports",
    url: "/call-reports",
    icon: FileText,
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
];

export function AppSidebar() {
  const [location] = useLocation();
  const { data: session } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
  });

  return (
    <Sidebar className="border-r-0">
      <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 h-full flex flex-col">
          <SidebarHeader className="border-b border-white/10 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">AuroraMY</h2>
                <p className="text-xs text-white/70">Staff Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/60 text-xs uppercase tracking-wider px-4">Navigation</SidebarGroupLabel>
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
                            text-white/90 hover:text-white 
                            hover:bg-white/10 
                            transition-all duration-200
                            ${isActive ? 'bg-white/20 text-white shadow-lg shadow-white/20 border-l-2 border-white' : ''}
                          `}
                        >
                          <Link href={item.url}>
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-white/80'}`} />
                            <span className="font-bold">{item.title}</span>
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
            <SidebarFooter className="border-t border-white/10 p-4 mt-auto">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <Avatar className="h-9 w-9 ring-2 ring-white/30">
                  <AvatarFallback className="bg-white/20 text-white text-sm font-medium backdrop-blur-sm">
                    {session.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate text-white">{session.name}</p>
                  <p className="text-xs truncate text-white/70">{session.email}</p>
                </div>
              </div>
            </SidebarFooter>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
