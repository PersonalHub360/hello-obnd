import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { type Staff, type SessionData, type CallReport, type Deposit } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  TrendingUp,
  Phone,
  CheckCircle,
  Users,
  DollarSign,
  Percent,
  Award,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, startOfDay, startOfMonth, startOfYear, endOfMonth, endOfDay, isAfter, isBefore, isWithinInterval, subDays } from "date-fns";

interface PerformanceData {
  calls: CallReport[];
  deposits: Deposit[];
}

interface PerformanceMetrics {
  totalCalls: number;
  successfulCalls: number;
  totalFTD: number;
  totalDeposits: number;
  conversionRatio: number;
  bonusAmount: number;
  performanceStatus: "Good" | "Average" | "Bad";
}

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

export default function PerformanceCheck() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [dailyView, setDailyView] = useState<"today" | "yesterday">("today");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [, setLocation] = useLocation();

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const { data: staffList = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!session,
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery<PerformanceData>({
    queryKey: ["/api/performance", selectedStaff],
    enabled: !!session && !!selectedStaff,
  });

  useEffect(() => {
    if (sessionError || (!sessionLoading && !session)) {
      setLocation("/");
    }
  }, [sessionError, sessionLoading, session, setLocation]);

  // Filter staff list based on search term and role filter
  const filteredStaffList = staffList.filter(staff => {
    const matchesSearch = searchTerm === "" || 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.employeeId && staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "all" || staff.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter dropdown
  const uniqueRoles = Array.from(new Set(staffList.map(s => s.role).filter(Boolean)));
  uniqueRoles.sort();

  const calculateMetrics = (calls: CallReport[], deposits: Deposit[], filterFn?: (date: Date) => boolean): PerformanceMetrics => {
    const filteredCalls = filterFn 
      ? calls.filter(c => filterFn(new Date(c.dateTime)))
      : calls;
    
    const filteredDeposits = filterFn
      ? deposits.filter(d => filterFn(new Date(d.date)))
      : deposits;

    // Count calls from CallReport records
    const callReportCount = filteredCalls.length;
    const callReportSuccessful = filteredCalls.filter(c => 
      c.callStatus.toLowerCase() === "completed"
    ).length;

    // Sum up call counts from deposit records
    const depositTotalCalls = filteredDeposits.reduce((sum, d) => sum + (d.totalCalls || 0), 0);
    const depositSuccessfulCalls = filteredDeposits.reduce((sum, d) => sum + (d.successfulCalls || 0), 0);

    // Combine both sources
    const totalCalls = callReportCount + depositTotalCalls;
    const successfulCalls = callReportSuccessful + depositSuccessfulCalls;

    const totalFTD = filteredDeposits.filter(d => d.ftd === "Yes").length;
    const totalDeposits = filteredDeposits.filter(d => d.deposit === "Yes").length;

    const conversionRatio = totalCalls > 0
      ? (successfulCalls / totalCalls) * 100
      : 0;

    const ftdBonus = filteredDeposits.reduce((sum, d) => sum + (d.ftdCount || 0), 0);
    const depositBonus = filteredDeposits.reduce((sum, d) => sum + (d.depositCount || 0), 0);
    const bonusAmount = (ftdBonus * 1) + (depositBonus * 1.5);

    let performanceStatus: "Good" | "Average" | "Bad" = "Bad";
    if (conversionRatio >= 70) {
      performanceStatus = "Good";
    } else if (conversionRatio >= 40) {
      performanceStatus = "Average";
    }

    return {
      totalCalls,
      successfulCalls,
      totalFTD,
      totalDeposits,
      conversionRatio,
      bonusAmount,
      performanceStatus,
    };
  };

  const getPerformanceColor = (status: "Good" | "Average" | "Bad") => {
    switch (status) {
      case "Good":
        return "bg-green-500 hover:bg-green-600";
      case "Average":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Bad":
        return "bg-red-500 hover:bg-red-600";
    }
  };

  const renderMetricsCards = (metrics: PerformanceMetrics) => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-total-calls">{metrics.totalCalls}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All calls made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Calls</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-successful-calls">{metrics.successfulCalls}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FTD</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-total-ftd">{metrics.totalFTD}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique depositors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-total-deposits">{metrics.totalDeposits}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Deposit transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonus Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="metric-bonus-amount">
                ${metrics.bonusAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                FTD: $1 | Deposit: $1.5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Ratio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-conversion-ratio">
                {metrics.conversionRatio.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Status</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge 
                className={`${getPerformanceColor(metrics.performanceStatus)} text-white`}
                data-testid="metric-performance-status"
              >
                {metrics.performanceStatus}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.performanceStatus === "Good" && "Excellent performance!"}
                {metrics.performanceStatus === "Average" && "Room for improvement"}
                {metrics.performanceStatus === "Bad" && "Needs attention"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

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

  const dailyMetrics = performanceData 
    ? calculateMetrics(
        performanceData.calls,
        performanceData.deposits,
        (date) => {
          const targetDate = dailyView === "today" ? new Date() : subDays(new Date(), 1);
          const dayStart = startOfDay(targetDate);
          const dayEnd = endOfDay(targetDate);
          return isWithinInterval(date, { start: dayStart, end: dayEnd });
        }
      )
    : null;

  const getMonthMetrics = () => {
    if (!performanceData) return null;
    
    let monthStart: Date;
    let monthEnd: Date;

    if (customDate) {
      monthStart = startOfMonth(customDate);
      monthEnd = endOfMonth(customDate);
    } else {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      monthStart = new Date(year, month, 1);
      monthEnd = endOfMonth(monthStart);
    }

    return calculateMetrics(
      performanceData.calls,
      performanceData.deposits,
      (date) => isWithinInterval(date, { start: monthStart, end: monthEnd })
    );
  };

  const monthMetrics = getMonthMetrics();

  const yearlyMetrics = performanceData
    ? calculateMetrics(
        performanceData.calls,
        performanceData.deposits,
        (date) => isAfter(date, startOfYear(new Date())) || date.getTime() === startOfYear(new Date()).getTime()
      )
    : null;

  const selectedMonthName = MONTHS.find(m => m.value === selectedMonth)?.label || "Month";

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Staff Performance Check
              </h2>
              <p className="text-muted-foreground mt-1">
                View individual staff member performance metrics
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Staff Member</CardTitle>
              <CardDescription>
                Search and filter to find a staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by Name or ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-staff"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Role</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="pl-10" data-testid="select-filter-role">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {uniqueRoles.map((role) => (
                          <SelectItem key={role} value={role || ""}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Staff Member {filteredStaffList.length > 0 && `(${filteredStaffList.length} found)`}
                </label>
                <Select
                  value={selectedStaff}
                  onValueChange={setSelectedStaff}
                >
                  <SelectTrigger className="w-full" data-testid="select-staff-member">
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStaffList.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No staff members found
                      </div>
                    ) : (
                      filteredStaffList.map((staff) => (
                        <SelectItem 
                          key={staff.id} 
                          value={staff.name}
                        >
                          {staff.name} - {staff.role}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || filterRole !== "all") && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    {searchTerm && `Search: "${searchTerm}"`}
                    {searchTerm && filterRole !== "all" && " • "}
                    {filterRole !== "all" && `Role: ${filterRole}`}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterRole("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedStaff && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance for {selectedStaff}</CardTitle>
                    <CardDescription>View detailed metrics and deposit history</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setLocation(`/deposits?staff=${encodeURIComponent(selectedStaff)}`)}
                    data-testid="button-view-deposits"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Deposits
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {performanceLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading performance data...</p>
              </div>
            ) : performanceData && (dailyMetrics && monthMetrics && yearlyMetrics) ? (
              <Tabs defaultValue="daily" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly" data-testid="tab-monthly">By Month</TabsTrigger>
                  <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          {dailyView === "today" ? "Today's Performance" : "Yesterday's Performance"}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {format(dailyView === "today" ? new Date() : subDays(new Date(), 1), 'MMMM dd, yyyy')}
                        </span>
                      </div>
                      <ToggleGroup
                        type="single"
                        value={dailyView}
                        onValueChange={(value) => value && setDailyView(value as "today" | "yesterday")}
                        data-testid="toggle-daily-view"
                      >
                        <ToggleGroupItem value="today" aria-label="Today" data-testid="toggle-today">
                          Today
                        </ToggleGroupItem>
                        <ToggleGroupItem value="yesterday" aria-label="Yesterday" data-testid="toggle-yesterday">
                          Yesterday
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                  {renderMetricsCards(dailyMetrics)}
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Select Month</label>
                        <Select 
                          value={selectedMonth} 
                          onValueChange={(value) => {
                            setSelectedMonth(value);
                            setCustomDate(undefined);
                          }}
                          disabled={!!customDate}
                        >
                          <SelectTrigger data-testid="select-month">
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
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Select Year</label>
                        <Select 
                          value={selectedYear} 
                          onValueChange={(value) => {
                            setSelectedYear(value);
                            setCustomDate(undefined);
                          }}
                          disabled={!!customDate}
                        >
                          <SelectTrigger data-testid="select-year">
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
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">or</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !customDate && "text-muted-foreground"
                            )}
                            data-testid="button-custom-date"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {customDate ? format(customDate, "MMMM yyyy") : "Pick a custom date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={customDate}
                            onSelect={setCustomDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {customDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCustomDate(undefined)}
                          data-testid="button-clear-custom-date"
                        >
                          Clear
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        {customDate 
                          ? `${format(customDate, "MMMM yyyy")} Performance`
                          : `${selectedMonthName} ${selectedYear} Performance`
                        }
                      </h3>
                    </div>
                    {renderMetricsCards(monthMetrics)}
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">This Year's Performance</h3>
                    <span className="text-sm text-muted-foreground">
                      {currentYear}
                    </span>
                  </div>
                  {renderMetricsCards(yearlyMetrics)}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No performance data available for this staff member.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedStaff && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Select a staff member to begin</p>
              <p className="text-muted-foreground">
                Choose a staff member from the dropdown above to view their performance metrics
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
