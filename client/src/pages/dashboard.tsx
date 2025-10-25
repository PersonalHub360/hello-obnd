import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { type SessionData, type Staff, type CallReport, type Deposit } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  Phone,
  TrendingUp,
  ArrowRight,
  Building2,
  UserCheck,
  CheckCircle2,
  Percent,
  Calendar,
  PhoneOff,
  XCircle,
  PhoneCall,
} from "lucide-react";
import { startOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, subWeeks, subMonths } from "date-fns";

type DateFilter = "today" | "yesterday" | "this-week" | "last-week" | "this-month" | "last-month" | "by-month" | "by-date" | "all-time";

const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => 2021 + i);

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const { data: staffList = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!session,
  });

  const { data: callReports = [], isLoading: callReportsLoading } = useQuery<CallReport[]>({
    queryKey: ["/api/call-reports"],
    enabled: !!session,
  });

  const { data: deposits = [], isLoading: depositsLoading } = useQuery<Deposit[]>({
    queryKey: ["/api/deposits"],
    enabled: !!session,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const getDateRange = (filter: DateFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    
    switch (filter) {
      case "today":
        return { start: startOfToday(), end: now };
      case "yesterday":
        return { start: startOfYesterday(), end: endOfYesterday() };
      case "this-week":
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
      case "last-week": {
        const lastWeek = subWeeks(now, 1);
        return { 
          start: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
          end: endOfWeek(lastWeek, { weekStartsOn: 1 }) 
        };
      }
      case "this-month":
        return { start: startOfMonth(now), end: now };
      case "last-month": {
        const lastMonth = subMonths(now, 1);
        return { 
          start: startOfMonth(lastMonth), 
          end: endOfMonth(lastMonth) 
        };
      }
      case "by-month": {
        const monthDate = new Date(selectedYear, parseInt(selectedMonth), 1);
        return {
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate)
        };
      }
      case "by-date": {
        const dateObj = new Date(selectedDate);
        return {
          start: startOfDay(dateObj),
          end: endOfDay(dateObj)
        };
      }
      case "all-time":
        return null;
      default:
        return null;
    }
  };

  const filterByDate = <T extends { dateTime?: Date; date?: Date }>(items: T[]): T[] => {
    const dateRange = getDateRange(dateFilter);
    if (!dateRange) return items;

    return items.filter(item => {
      const itemDate = item.dateTime || item.date;
      if (!itemDate) return false;
      
      const date = new Date(itemDate);
      return date >= dateRange.start && date <= dateRange.end;
    });
  };

  const filteredCallReports = filterByDate(callReports);
  const filteredDeposits = filterByDate(deposits);

  // Call metrics from deposits (connected to Deposit Section)
  const totalCalls = filteredDeposits.reduce((sum, d) => sum + (d.totalCalls || 0), 0);
  const successfulCalls = filteredDeposits.reduce((sum, d) => sum + (d.successfulCalls || 0), 0);
  const unsuccessfulCalls = filteredDeposits.reduce((sum, d) => sum + (d.unsuccessfulCalls || 0), 0);
  const failedCalls = filteredDeposits.reduce((sum, d) => sum + (d.failedCalls || 0), 0);

  // Bonus and deposit metrics
  const totalBonus = filteredDeposits.reduce((sum, deposit) => {
    const ftdBonus = (deposit.ftdCount || 0) * 1;
    const depositBonus = (deposit.depositCount || 0) * 1.5;
    return sum + ftdBonus + depositBonus;
  }, 0);

  const totalDepositsCount = filteredDeposits.reduce((sum, deposit) => {
    return sum + (deposit.depositCount || 0);
  }, 0);

  const getTotalFTD = (): number => {
    return filteredDeposits.reduce((sum, deposit) => {
      return sum + (deposit.ftdCount || 0);
    }, 0);
  };

  const totalFTD = getTotalFTD();

  // Conversion Rate: (Successful Calls / Total FTD) * 100%
  const conversionRate = totalFTD > 0
    ? (successfulCalls / totalFTD) * 100
    : 0;

  const activeStaff = staffList.filter((s) => s.status === "active").length;
  const totalDepartments = new Set(staffList.map((s) => s.department)).size;

  if (sessionLoading || staffLoading || callReportsLoading || depositsLoading) {
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
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back, {session.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {dateFilter === "by-month" 
                ? `${MONTHS[parseInt(selectedMonth)].label} ${selectedYear} Performance` 
                : dateFilter === "by-date"
                ? `Performance for ${new Date(selectedDate).toLocaleDateString()}`
                : "Here's an overview of your business performance"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <SelectTrigger className="w-[180px]" data-testid="select-date-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="by-date">By Date</SelectItem>
                <SelectItem value="by-month">By Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            {dateFilter === "by-date" && (
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[160px]"
                data-testid="input-selected-date"
              />
            )}
            
            {dateFilter === "by-month" && (
              <>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[140px]" data-testid="select-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-[120px]" data-testid="select-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Business Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-calls">
                  {totalCalls}
                </div>
                <p className="text-xs text-muted-foreground">
                  Call activities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-deposit">
                  {totalDepositsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deposit count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total FTD</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-total-ftd">
                  {totalFTD}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique depositors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Calls</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-successful-calls">
                  {successfulCalls}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsuccessful</CardTitle>
                <PhoneOff className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-unsuccessful-calls">
                  {unsuccessfulCalls}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unsuccessful calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-failed-calls">
                  {failedCalls}
                </div>
                <p className="text-xs text-muted-foreground">
                  Failed calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bonus</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-bonus">
                  ${totalBonus.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  FTD=$1 × Deposit=$1.5
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="text-conversion-rate">
                  {conversionRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Successful / Total FTD
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Staff Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalDepartments > 0 ? Math.round(staffList.length / totalDepartments) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per department
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used operations</CardDescription>
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
