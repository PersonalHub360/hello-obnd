import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { type SessionData } from "@shared/schema";
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
import { Phone, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface CallReport {
  id: string;
  date: string;
  clientName: string;
  phoneNumber: string;
  duration: number;
  callType: "incoming" | "outgoing";
  status: "completed" | "missed" | "follow-up";
  notes: string;
  assignedTo: string;
}

const sampleCallReports: CallReport[] = [
  {
    id: "CALL001",
    date: new Date().toISOString(),
    clientName: "Acme Corporation",
    phoneNumber: "+1 (555) 123-4567",
    duration: 15,
    callType: "outgoing",
    status: "completed",
    notes: "Discussed Q4 contract renewal. Client interested in premium package.",
    assignedTo: "James Bond",
  },
  {
    id: "CALL002",
    date: new Date(Date.now() - 3600000).toISOString(),
    clientName: "Tech Solutions Inc",
    phoneNumber: "+1 (555) 234-5678",
    duration: 8,
    callType: "incoming",
    status: "follow-up",
    notes: "Customer inquiry about new features. Schedule demo for next week.",
    assignedTo: "Sarah Johnson",
  },
  {
    id: "CALL003",
    date: new Date(Date.now() - 7200000).toISOString(),
    clientName: "Global Enterprises",
    phoneNumber: "+1 (555) 345-6789",
    duration: 0,
    callType: "incoming",
    status: "missed",
    notes: "Missed call - need to return",
    assignedTo: "Michael Chen",
  },
  {
    id: "CALL004",
    date: new Date(Date.now() - 86400000).toISOString(),
    clientName: "Innovation Labs",
    phoneNumber: "+1 (555) 456-7890",
    duration: 22,
    callType: "outgoing",
    status: "completed",
    notes: "Successful onboarding call. Customer satisfied with service setup.",
    assignedTo: "Emily Rodriguez",
  },
];

export default function CallReports() {
  const [, setLocation] = useLocation();
  const [reports] = useState<CallReport[]>(sampleCallReports);

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const totalCalls = reports.length;
  const completedCalls = reports.filter((r) => r.status === "completed").length;
  const followUpCalls = reports.filter((r) => r.status === "follow-up").length;
  const avgDuration =
    reports.reduce((sum, r) => sum + r.duration, 0) / reports.filter((r) => r.duration > 0).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "follow-up":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Follow-up
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Missed
          </Badge>
        );
      default:
        return null;
    }
  };

  if (sessionLoading) {
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
          <h1 className="text-3xl font-semibold tracking-tight">Call Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage customer call activities
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-calls">
                {completedCalls}
              </div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-followup-calls">
                {followUpCalls}
              </div>
              <p className="text-xs text-muted-foreground">Pending action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-duration">
                {avgDuration.toFixed(0)}m
              </div>
              <p className="text-xs text-muted-foreground">Per call</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Call Report</CardTitle>
            <CardDescription>Log a new customer call</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client Name</Label>
                  <Input
                    id="client"
                    placeholder="Company or individual name"
                    data-testid="input-client-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    data-testid="input-phone-number"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="callType">Call Type</Label>
                  <Select>
                    <SelectTrigger id="callType" data-testid="select-call-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="outgoing">Outgoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="0"
                    data-testid="input-duration"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger id="status" data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="follow-up">Follow-up Required</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Call Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter call details, outcomes, and next steps..."
                  className="min-h-[100px]"
                  data-testid="input-notes"
                />
              </div>
              <div className="flex justify-end">
                <Button data-testid="button-add-report">
                  <Phone className="mr-2 h-4 w-4" />
                  Add Call Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Call Reports</CardTitle>
            <CardDescription>View and manage call history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} data-testid={`row-call-${report.id}`}>
                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(new Date(report.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.date), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{report.clientName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {report.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {report.callType === "incoming" ? "↓ In" : "↑ Out"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.duration > 0 ? `${report.duration}m` : "-"}
                    </TableCell>
                    <TableCell className="text-sm">{report.assignedTo}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
