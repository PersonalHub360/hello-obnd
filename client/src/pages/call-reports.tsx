import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { type SessionData, type CallReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, TrendingUp, Clock, CheckCircle2, AlertCircle, Upload, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CallReports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userName, setUserName] = useState("");
  const [callAgentName, setCallAgentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [duration, setDuration] = useState("");
  const [callType, setCallType] = useState("");
  const [remarks, setRemarks] = useState("");

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const { data: callReports = [], isLoading: reportsLoading } = useQuery<CallReport[]>({
    queryKey: ["/api/call-reports"],
    enabled: !!session,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const createCallReportMutation = useMutation({
    mutationFn: async (data: {
      userName: string;
      callAgentName: string;
      phoneNumber: string;
      callStatus: string;
      duration?: string;
      callType?: string;
      remarks?: string;
    }) => {
      return await apiRequest("POST", "/api/call-reports", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-reports"] });
      toast({
        title: "Success",
        description: "Call report created successfully",
      });
      setUserName("");
      setCallAgentName("");
      setPhoneNumber("");
      setCallStatus("");
      setDuration("");
      setCallType("");
      setRemarks("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create call report",
        variant: "destructive",
      });
    },
  });

  const importExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/call-reports/import/excel", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import Excel file");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-reports"] });
      toast({
        title: "Success",
        description: data.message || "Call reports imported successfully",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import Excel file",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleCreateCallReport = () => {
    if (!userName || !callAgentName || !phoneNumber || !callStatus) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCallReportMutation.mutate({
      userName,
      callAgentName,
      phoneNumber,
      callStatus,
      duration: duration || undefined,
      callType: callType || undefined,
      remarks: remarks || undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "Error",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      importExcelMutation.mutate(file);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/call-reports/sample/template", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "call-reports-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const totalCalls = callReports.length;
  const completedCalls = callReports.filter((r) => r.callStatus === "Completed").length;
  const followUpCalls = callReports.filter(
    (r) => r.callStatus === "Follow-up Required" || r.callStatus === "Follow-up"
  ).length;
  const avgDuration = callReports.length > 0
    ? callReports
        .filter((r) => r.duration)
        .reduce((sum, r) => {
          const match = r.duration?.match(/(\d+)/);
          return sum + (match ? parseInt(match[1]) : 0);
        }, 0) / Math.max(callReports.filter((r) => r.duration).length, 1)
    : 0;

  const getStatusBadge = (status: string) => {
    if (status === "Completed") {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed
        </Badge>
      );
    } else if (status === "Follow-up Required" || status === "Follow-up") {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Follow-up
        </Badge>
      );
    } else if (status === "Missed") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Missed
        </Badge>
      );
    }
    return <Badge>{status}</Badge>;
  };

  if (sessionLoading || reportsLoading) {
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Call Reports</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage customer call activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              data-testid="button-download-template"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              data-testid="input-excel-file"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importExcelMutation.isPending}
              data-testid="button-import-excel"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importExcelMutation.isPending ? "Importing..." : "Import Excel"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-calls">
                {totalCalls}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-calls">
                {completedCalls}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-followup-calls">
                {followUpCalls}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-duration">
                {Math.round(avgDuration)} min
              </div>
              <p className="text-xs text-muted-foreground">Per call</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log New Call</CardTitle>
            <CardDescription>Record a customer call activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="userName">
                  User Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="userName"
                  placeholder="Customer name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  data-testid="input-user-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callAgentName">
                  Call Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="callAgentName"
                  placeholder="Agent name"
                  value={callAgentName}
                  onChange={(e) => setCallAgentName(e.target.value)}
                  data-testid="input-agent-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="+1-555-0100"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  data-testid="input-phone-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callStatus">
                  Call Status <span className="text-destructive">*</span>
                </Label>
                <Select value={callStatus} onValueChange={setCallStatus}>
                  <SelectTrigger id="callStatus" data-testid="select-call-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Follow-up Required">Follow-up Required</SelectItem>
                    <SelectItem value="Missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="15 mins"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  data-testid="input-duration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callType">Call Type</Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger id="callType" data-testid="select-call-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Add any notes about this call..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                data-testid="input-remarks"
                rows={3}
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={handleCreateCallReport}
                disabled={createCallReportMutation.isPending}
                data-testid="button-log-call"
              >
                <Phone className="mr-2 h-4 w-4" />
                {createCallReportMutation.isPending ? "Logging..." : "Log Call Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
            <CardDescription>View and manage all call reports</CardDescription>
          </CardHeader>
          <CardContent>
            {callReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No call reports found. Log a call or import from Excel.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callReports.map((report) => (
                    <TableRow key={report.id} data-testid={`row-call-report-${report.id}`}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(report.dateTime), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{report.userName}</TableCell>
                      <TableCell>{report.callAgentName}</TableCell>
                      <TableCell className="font-mono text-xs">{report.phoneNumber}</TableCell>
                      <TableCell>{getStatusBadge(report.callStatus)}</TableCell>
                      <TableCell>{report.duration || "-"}</TableCell>
                      <TableCell>{report.callType || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
