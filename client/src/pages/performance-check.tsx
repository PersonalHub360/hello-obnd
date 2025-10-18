import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { type Staff, type SessionData, type CallReport, type Deposit } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Phone,
  CheckCircle,
  Users,
  DollarSign,
  Percent,
  Award,
} from "lucide-react";
import { format, startOfDay, startOfMonth, startOfYear, isAfter, isBefore } from "date-fns";

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
  performanceStatus: "Good" | "Average" | "Bad";
}

export default function PerformanceCheck() {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
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

  const calculateMetrics = (calls: CallReport[], deposits: Deposit[], filterFn?: (date: Date) => boolean): PerformanceMetrics => {
    const filteredCalls = filterFn 
      ? calls.filter(c => filterFn(new Date(c.dateTime)))
      : calls;
    
    const filteredDeposits = filterFn
      ? deposits.filter(d => filterFn(new Date(d.date)))
      : deposits;

    const totalCalls = filteredCalls.length;
    const successfulCalls = filteredCalls.filter(c => 
      c.callStatus.toLowerCase() === "completed"
    ).length;

    const uniqueDepositors = new Set(filteredDeposits.map(d => d.depositor.toLowerCase()));
    const totalFTD = uniqueDepositors.size;
    const totalDeposits = filteredDeposits.length;

    const conversionRatio = totalFTD + totalDeposits > 0
      ? (successfulCalls / (totalFTD + totalDeposits)) * 100
      : 0;

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
        (date) => isAfter(date, startOfDay(new Date())) || date.getTime() === startOfDay(new Date()).getTime()
      )
    : null;

  const monthlyMetrics = performanceData
    ? calculateMetrics(
        performanceData.calls,
        performanceData.deposits,
        (date) => isAfter(date, startOfMonth(new Date())) || date.getTime() === startOfMonth(new Date()).getTime()
      )
    : null;

  const yearlyMetrics = performanceData
    ? calculateMetrics(
        performanceData.calls,
        performanceData.deposits,
        (date) => isAfter(date, startOfYear(new Date())) || date.getTime() === startOfYear(new Date()).getTime()
      )
    : null;

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
                Choose a staff member to view their performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedStaff}
                onValueChange={setSelectedStaff}
              >
                <SelectTrigger className="w-full md:w-[400px]" data-testid="select-staff-member">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem 
                      key={staff.id} 
                      value={`${staff.firstName} ${staff.lastName}`}
                    >
                      {staff.firstName} {staff.lastName} - {staff.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {selectedStaff && (
          <>
            {performanceLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading performance data...</p>
              </div>
            ) : performanceData && (dailyMetrics && monthlyMetrics && yearlyMetrics) ? (
              <Tabs defaultValue="daily" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
                  <TabsTrigger value="monthly" data-testid="tab-monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" data-testid="tab-yearly">Yearly</TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Today's Performance</h3>
                  </div>
                  {renderMetricsCards(dailyMetrics)}
                </TabsContent>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">This Month's Performance</h3>
                  </div>
                  {renderMetricsCards(monthlyMetrics)}
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">This Year's Performance</h3>
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
