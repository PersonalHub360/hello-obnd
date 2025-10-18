import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { type SessionData, type Staff } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  Phone,
  TrendingUp,
  ArrowRight,
  Building2,
  UserCheck,
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const { data: staffList = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!session,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const activeStaff = staffList.filter((s) => s.status === "active").length;
  const totalDepartments = new Set(staffList.map((s) => s.department)).size;

  if (sessionLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {session.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your staff management system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-staff">
                {staffList.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Employees in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-active-staff">
                {activeStaff}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-departments">
                {totalDepartments}
              </div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <Link href="/staff-directory">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Staff Directory</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage team members
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View, add, edit, and manage all staff members in the organization
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <Link href="/deposits">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Deposits</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Financial transactions
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track and manage all deposit transactions and financial records
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
            <Link href="/call-reports">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Call Reports</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customer communications
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Log and review customer call activities and follow-ups
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/staff-directory">
              <Button data-testid="button-add-staff">
                <Users className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </Link>
            <Link href="/deposits">
              <Button variant="outline" data-testid="button-new-deposit">
                <DollarSign className="mr-2 h-4 w-4" />
                Record Deposit
              </Button>
            </Link>
            <Link href="/call-reports">
              <Button variant="outline" data-testid="button-new-call">
                <Phone className="mr-2 h-4 w-4" />
                Log Call Report
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" data-testid="button-view-analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
