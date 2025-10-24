import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { type Staff, type SessionData, type Deposit, type CallReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  Building2,
  UserCheck,
  UserX,
  DollarSign,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { format, subMonths } from "date-fns";

export default function Analytics() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const {
    data: staffList = [],
    isLoading: staffLoading,
  } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!session,
  });

  const {
    data: deposits = [],
    isLoading: depositsLoading,
  } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits"],
    enabled: !!session,
  });

  const {
    data: callReports = [],
    isLoading: callReportsLoading,
  } = useQuery<CallReport[]>({
    queryKey: ["/api/call-reports"],
    enabled: !!session,
  });

  const countryData = Object.entries(
    staffList.reduce((acc, staff) => {
      acc[staff.country] = (acc[staff.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusData = [
    {
      name: "Active",
      value: staffList.filter((s) => s.status === "active").length,
    },
    {
      name: "Inactive",
      value: staffList.filter((s) => s.status === "inactive").length,
    },
  ];

  const threeMonthsAgo = subMonths(new Date(), 3);
  const recentHires = staffList.filter(
    (s) => s.joinDate && new Date(s.joinDate) >= threeMonthsAgo
  );

  const monthlyHires = Object.entries(
    staffList.reduce((acc, staff) => {
      if (staff.joinDate) {
        const month = format(new Date(staff.joinDate), "MMM yyyy");
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  const totalFTD = deposits.filter(d => d.ftd === "Yes").length;
  const totalDeposits = deposits.filter(d => d.deposit === "Yes").length;
  const totalCalls = callReports.length;
  const successfulCalls = callReports.filter(c => c.callStatus === "Completed").length;
  
  const totalBonusAmount = deposits.reduce((sum, d) => {
    const ftdBonus = (d.ftdCount || 0) * 1;
    const depositBonus = (d.depositCount || 0) * 1.5;
    return sum + ftdBonus + depositBonus;
  }, 0);

  const brandData = Object.entries(
    deposits.reduce((acc, deposit) => {
      acc[deposit.brandName] = (acc[deposit.brandName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const roleData = Object.entries(
    staffList.reduce((acc, staff) => {
      const role = staff.role || "Unassigned";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const monthlyDeposits = Object.entries(
    deposits.reduce((acc, deposit) => {
      const month = format(new Date(deposit.date), "MMM yyyy");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  const COLORS = [
    "hsl(221, 83%, 53%)",
    "hsl(142, 71%, 45%)",
    "hsl(48, 96%, 53%)",
    "hsl(280, 65%, 60%)",
    "hsl(340, 82%, 52%)",
    "hsl(199, 89%, 48%)",
    "hsl(25, 95%, 53%)",
    "hsl(165, 84%, 39%)",
  ];

  if (sessionLoading || staffLoading || depositsLoading || callReportsLoading) {
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
          <h1 className="text-3xl font-semibold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive business analytics and insights
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-staff">
                {staffList.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active members in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-staff">
                {statusData.find((s) => s.name === "Active")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Employees
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-inactive-staff">
                {statusData.find((s) => s.name === "Inactive")?.value || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Not currently working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Hires
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-recent-hires">
                {recentHires.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 3 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Countries
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-countries">
                {countryData.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active countries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total FTD
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-ftd">
                {totalFTD}
              </div>
              <p className="text-xs text-muted-foreground">
                First time deposits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Calls
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-calls">
                {totalCalls}
              </div>
              <p className="text-xs text-muted-foreground">
                {successfulCalls} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bonuses
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-total-bonus">
                ${totalBonusAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalDeposits} deposits
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Country Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {countryData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="hsl(142, 71%, 45%)" />
                    <Cell fill="hsl(0, 0%, 60%)" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hiring Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyHires}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(221, 83%, 53%)" name="New Hires" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Brand Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {brandData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${value}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyDeposits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(142, 71%, 45%)" 
                  strokeWidth={2}
                  name="Deposits" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
