import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { type SessionData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Deposit {
  id: string;
  date: string;
  amount: number;
  type: string;
  status: "pending" | "completed" | "cancelled";
  reference: string;
  depositor: string;
}

const sampleDeposits: Deposit[] = [
  {
    id: "DEP001",
    date: new Date().toISOString(),
    amount: 5000,
    type: "Cash",
    status: "completed",
    reference: "REF-2025-001",
    depositor: "James Bond",
  },
  {
    id: "DEP002",
    date: new Date(Date.now() - 86400000).toISOString(),
    amount: 12500,
    type: "Check",
    status: "pending",
    reference: "REF-2025-002",
    depositor: "Sarah Johnson",
  },
  {
    id: "DEP003",
    date: new Date(Date.now() - 172800000).toISOString(),
    amount: 8750,
    type: "Wire Transfer",
    status: "completed",
    reference: "REF-2025-003",
    depositor: "Michael Chen",
  },
];

export default function Deposits() {
  const [, setLocation] = useLocation();
  const [deposits] = useState<Deposit[]>(sampleDeposits);

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "pending").length;
  const completedToday = deposits.filter(
    (d) =>
      d.status === "completed" &&
      new Date(d.date).toDateString() === new Date().toDateString()
  ).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
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
          <h1 className="text-3xl font-semibold tracking-tight">Deposit Section</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all financial deposits
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-deposits">
                ${totalDeposits.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {deposits.length} total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-deposits">
                {pendingDeposits}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-today">
                {completedToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Processed successfully
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Deposit</CardTitle>
            <CardDescription>Record a new deposit transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  data-testid="input-deposit-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger id="type" data-testid="select-deposit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="ach">ACH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositor">Depositor</Label>
                <Input
                  id="depositor"
                  placeholder="Name"
                  data-testid="input-depositor"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" data-testid="button-add-deposit">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Add Deposit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
            <CardDescription>View and manage deposit transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Depositor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                    <TableCell className="font-mono text-sm">
                      {deposit.id}
                    </TableCell>
                    <TableCell>{format(new Date(deposit.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{deposit.depositor}</TableCell>
                    <TableCell>{deposit.type}</TableCell>
                    <TableCell className="font-semibold">
                      ${deposit.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {deposit.reference}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deposit.status === "completed"
                            ? "default"
                            : deposit.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="gap-1"
                      >
                        {getStatusIcon(deposit.status)}
                        {deposit.status}
                      </Badge>
                    </TableCell>
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
