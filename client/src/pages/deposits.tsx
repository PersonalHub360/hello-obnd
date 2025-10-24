import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { type SessionData, type Deposit } from "@shared/schema";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, TrendingUp, Calendar, Upload, Download, Eye, Edit, Trash2, Link2, RefreshCw, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StaffCombobox } from "@/components/staff-combobox";

export default function Deposits() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [staffName, setStaffName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [brandName, setBrandName] = useState("");
  const [ftdCount, setFtdCount] = useState<number>(0);
  const [depositCount, setDepositCount] = useState<number>(0);
  const [totalCalls, setTotalCalls] = useState<number>(0);
  const [successfulCalls, setSuccessfulCalls] = useState<number>(0);
  const [unsuccessfulCalls, setUnsuccessfulCalls] = useState<number>(0);
  const [failedCalls, setFailedCalls] = useState<number>(0);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  const [editStaffName, setEditStaffName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBrandName, setEditBrandName] = useState("");
  const [editFtdCount, setEditFtdCount] = useState<number>(0);
  const [editDepositCount, setEditDepositCount] = useState<number>(0);
  const [editTotalCalls, setEditTotalCalls] = useState<number>(0);
  const [editSuccessfulCalls, setEditSuccessfulCalls] = useState<number>(0);
  const [editUnsuccessfulCalls, setEditUnsuccessfulCalls] = useState<number>(0);
  const [editFailedCalls, setEditFailedCalls] = useState<number>(0);

  // Google Sheets link state
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  // Google Sheets integration state
  const { data: googleSheetsStatus, isLoading: sheetsStatusLoading } = useQuery<{
    connected: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    lastSyncAt?: string;
  }>({
    queryKey: ["/api/google-sheets/status"],
    enabled: !!session && session.role === "admin",
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

  // Sync edit form state when selectedDeposit changes or edit dialog opens
  useEffect(() => {
    if (editDialogOpen && selectedDeposit) {
      setEditStaffName(selectedDeposit.staffName);
      setEditDate(selectedDeposit.date ? format(new Date(selectedDeposit.date), "yyyy-MM-dd") : "");
      setEditBrandName(selectedDeposit.brandName);
      setEditFtdCount(selectedDeposit.ftdCount || 0);
      setEditDepositCount(selectedDeposit.depositCount || 0);
      setEditTotalCalls(selectedDeposit.totalCalls || 0);
      setEditSuccessfulCalls(selectedDeposit.successfulCalls || 0);
      setEditUnsuccessfulCalls(selectedDeposit.unsuccessfulCalls || 0);
      setEditFailedCalls(selectedDeposit.failedCalls || 0);
    }
  }, [editDialogOpen, selectedDeposit]);

  // Auto-link pending spreadsheet after OAuth
  useEffect(() => {
    if (googleSheetsStatus?.connected && !googleSheetsStatus.spreadsheetUrl) {
      const pendingUrl = localStorage.getItem("pending_spreadsheet_url");
      if (pendingUrl) {
        localStorage.removeItem("pending_spreadsheet_url");
        linkSpreadsheetMutation.mutate(pendingUrl);
      }
    }
  }, [googleSheetsStatus?.connected, googleSheetsStatus?.spreadsheetUrl]);

  const createDepositMutation = useMutation({
    mutationFn: async (data: { staffName: string; type: string; date?: string; brandName: string; ftdCount?: number; depositCount?: number; totalCalls?: number; successfulCalls?: number; unsuccessfulCalls?: number; failedCalls?: number }) => {
      return await apiRequest("POST", "/api/deposits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit created successfully",
      });
      setStaffName("");
      setType("");
      setDate("");
      setBrandName("");
      setFtdCount(0);
      setDepositCount(0);
      setTotalCalls(0);
      setSuccessfulCalls(0);
      setUnsuccessfulCalls(0);
      setFailedCalls(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deposit",
        variant: "destructive",
      });
    },
  });

  const importExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/deposits/import/excel", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: data.message || "Deposits imported successfully",
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

  const handleCreateDeposit = () => {
    if (!staffName || !type || !brandName) {
      toast({
        title: "Error",
        description: "Please fill in Staff Name, Type, and Brand Name",
        variant: "destructive",
      });
      return;
    }

    createDepositMutation.mutate({
      staffName,
      type,
      date: date || undefined,
      brandName,
      ftdCount,
      depositCount,
      totalCalls,
      successfulCalls,
      unsuccessfulCalls,
      failedCalls,
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

  const updateDepositMutation = useMutation({
    mutationFn: async (data: { id: string; staffName: string; date?: string; brandName: string; ftdCount?: number; depositCount?: number; totalCalls?: number; successfulCalls?: number; unsuccessfulCalls?: number; failedCalls?: number }) => {
      const { id, ...updateData } = data;
      return await apiRequest("PATCH", `/api/deposits/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedDeposit(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deposit",
        variant: "destructive",
      });
    },
  });

  const deleteDepositMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/deposits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedDeposit(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deposit",
        variant: "destructive",
      });
    },
  });

  // Google Sheets mutations
  const connectGoogleSheetsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/google-sheets/auth-url", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to get auth URL");
      return await response.json() as { authUrl: string };
    },
    onSuccess: (data) => {
      window.location.href = data.authUrl;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to connect to Google Sheets",
        variant: "destructive",
      });
    },
  });

  const createSpreadsheetMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/google-sheets/create-spreadsheet", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/status"] });
      toast({
        title: "Success",
        description: "Spreadsheet created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create spreadsheet",
        variant: "destructive",
      });
    },
  });

  const linkSpreadsheetMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest("POST", "/api/google-sheets/link-spreadsheet", { spreadsheetUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/status"] });
      toast({
        title: "Success",
        description: "Spreadsheet linked successfully",
      });
      setSpreadsheetUrl("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to link spreadsheet",
        variant: "destructive",
      });
    },
  });

  const syncGoogleSheetsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/google-sheets/sync", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/status"] });
      toast({
        title: "Success",
        description: `Synced ${data.counts?.deposits || 0} deposits to Google Sheets`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      });
    },
  });

  const disconnectGoogleSheetsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/google-sheets/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/google-sheets/status"] });
      toast({
        title: "Success",
        description: "Disconnected from Google Sheets",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    },
  });

  const handleViewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setViewDialogOpen(true);
  };

  const handleEditDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditStaffName(deposit.staffName);
    setEditDate(deposit.date ? format(new Date(deposit.date), "yyyy-MM-dd") : "");
    setEditBrandName(deposit.brandName);
    setEditFtdCount(deposit.ftdCount || 0);
    setEditDepositCount(deposit.depositCount || 0);
    setEditTotalCalls(deposit.totalCalls || 0);
    setEditSuccessfulCalls(deposit.successfulCalls || 0);
    setEditUnsuccessfulCalls(deposit.unsuccessfulCalls || 0);
    setEditFailedCalls(deposit.failedCalls || 0);
    setEditDialogOpen(true);
  };

  const handleUpdateDeposit = () => {
    if (!selectedDeposit) return;

    if (!editStaffName || !editBrandName) {
      toast({
        title: "Error",
        description: "Please fill in Staff Name and Brand Name",
        variant: "destructive",
      });
      return;
    }

    updateDepositMutation.mutate({
      id: selectedDeposit.id,
      staffName: editStaffName,
      date: editDate || undefined,
      brandName: editBrandName,
      ftdCount: editFtdCount,
      depositCount: editDepositCount,
      totalCalls: editTotalCalls,
      successfulCalls: editSuccessfulCalls,
      unsuccessfulCalls: editUnsuccessfulCalls,
      failedCalls: editFailedCalls,
    });
  };

  const handleDeleteDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDeposit) {
      deleteDepositMutation.mutate(selectedDeposit.id);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/deposits/sample/template", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "deposits-template.xlsx";
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

  const handleLinkSpreadsheet = () => {
    if (!spreadsheetUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a spreadsheet URL",
        variant: "destructive",
      });
      return;
    }

    if (!spreadsheetUrl.includes("docs.google.com/spreadsheets")) {
      toast({
        title: "Error",
        description: "Please enter a valid Google Sheets URL",
        variant: "destructive",
      });
      return;
    }

    linkSpreadsheetMutation.mutate(spreadsheetUrl);
  };

  const totalDeposits = deposits.length;
  const totalFtdCount = deposits.reduce((sum, d) => sum + (d.ftdCount || 0), 0);
  const totalDepositCount = deposits.reduce((sum, d) => sum + (d.depositCount || 0), 0);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-deposits-title">Deposit Section</h1>
          <p className="text-muted-foreground">Manage and track deposits</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-total-deposits">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-deposits">{totalDeposits}</div>
            <p className="text-xs text-muted-foreground">All deposit records</p>
          </CardContent>
        </Card>

        <Card data-testid="card-ftd-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FTD Count</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ftd-count">{totalFtdCount}</div>
            <p className="text-xs text-muted-foreground">Total FTD count across all deposits</p>
          </CardContent>
        </Card>

        <Card data-testid="card-deposit-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposit Count</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-deposit-count">{totalDepositCount}</div>
            <p className="text-xs text-muted-foreground">Total deposit count across all records</p>
          </CardContent>
        </Card>
      </div>

      {session.role === "admin" && (
        <Card data-testid="card-google-sheets" className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                <CardTitle>Google Sheets Integration</CardTitle>
              </div>
              {googleSheetsStatus?.connected ? (
                <Badge variant="default" className="gap-1" data-testid="badge-connected">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1" data-testid="badge-not-connected">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              Automatically sync deposit data to Google Sheets for reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!googleSheetsStatus?.connected ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-sheet-url">Google Sheets URL</Label>
                  <Input
                    id="google-sheet-url"
                    data-testid="input-google-sheet-url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={spreadsheetUrl}
                    onChange={(e) => setSpreadsheetUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste your Google Sheet link, then click Connect to authorize
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (!spreadsheetUrl.trim()) {
                      toast({
                        title: "Error",
                        description: "Please enter a Google Sheets URL first",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!spreadsheetUrl.includes("docs.google.com/spreadsheets")) {
                      toast({
                        title: "Error",
                        description: "Please enter a valid Google Sheets URL",
                        variant: "destructive",
                      });
                      return;
                    }
                    // Store URL in localStorage before OAuth
                    localStorage.setItem("pending_spreadsheet_url", spreadsheetUrl);
                    connectGoogleSheetsMutation.mutate();
                  }}
                  disabled={connectGoogleSheetsMutation.isPending}
                  data-testid="button-connect-google-sheets"
                  className="w-full"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  {connectGoogleSheetsMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {googleSheetsStatus.spreadsheetUrl ? (
                  <>
                    <div className="space-y-2">
                      <Label>Connected Spreadsheet</Label>
                      <div className="flex gap-2">
                        <Input
                          value={googleSheetsStatus.spreadsheetUrl}
                          readOnly
                          className="font-mono text-sm"
                          data-testid="input-spreadsheet-url-connected"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          data-testid="button-open-spreadsheet"
                        >
                          <a
                            href={googleSheetsStatus.spreadsheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                      {googleSheetsStatus.lastSyncAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {format(new Date(googleSheetsStatus.lastSyncAt), "PPp")}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => syncGoogleSheetsMutation.mutate()}
                        disabled={syncGoogleSheetsMutation.isPending}
                        data-testid="button-sync-now"
                        className="flex-1"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncGoogleSheetsMutation.isPending ? "animate-spin" : ""}`} />
                        {syncGoogleSheetsMutation.isPending ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => disconnectGoogleSheetsMutation.mutate()}
                        disabled={disconnectGoogleSheetsMutation.isPending}
                        data-testid="button-disconnect"
                      >
                        {disconnectGoogleSheetsMutation.isPending ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {linkSpreadsheetMutation.isPending 
                        ? "Linking your spreadsheet..." 
                        : "Please wait while we link your spreadsheet..."}
                    </p>
                    {linkSpreadsheetMutation.isPending && (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-new-deposit">
          <CardHeader>
            <CardTitle>New Deposit</CardTitle>
            <CardDescription>Add a new deposit record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Staff Name</Label>
              <StaffCombobox
                value={staffName}
                onChange={setStaffName}
                placeholder="Type or select staff..."
                testId="input-staff-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deposit" data-testid="select-option-deposit">Deposit</SelectItem>
                  <SelectItem value="Withdrawal" data-testid="select-option-withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="Bonus" data-testid="select-option-bonus">Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date (Optional)</Label>
              <Input
                id="date"
                data-testid="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Select value={brandName} onValueChange={setBrandName}>
                <SelectTrigger id="brandName" data-testid="select-brand-name">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JB BDT" data-testid="select-option-jb-bdt">JB BDT</SelectItem>
                  <SelectItem value="BJ BDT" data-testid="select-option-bj-bdt">BJ BDT</SelectItem>
                  <SelectItem value="BJ PKR" data-testid="select-option-bj-pkr">BJ PKR</SelectItem>
                  <SelectItem value="JB PKR" data-testid="select-option-jb-pkr">JB PKR</SelectItem>
                  <SelectItem value="NPR" data-testid="select-option-npr">NPR</SelectItem>
                  <SelectItem value="SIX6'S BDT" data-testid="select-option-six6s-bdt">SIX6'S BDT</SelectItem>
                  <SelectItem value="SIX6'S PKR" data-testid="select-option-six6s-pkr">SIX6'S PKR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ftdCount">FTD Count</Label>
                <Input
                  id="ftdCount"
                  data-testid="input-ftd-count"
                  type="number"
                  min="0"
                  placeholder="Enter FTD count"
                  value={ftdCount}
                  onChange={(e) => setFtdCount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositCount">Deposit Count</Label>
                <Input
                  id="depositCount"
                  data-testid="input-deposit-count"
                  type="number"
                  min="0"
                  placeholder="Enter deposit count"
                  value={depositCount}
                  onChange={(e) => setDepositCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalCalls">Total Calls</Label>
                <Input
                  id="totalCalls"
                  data-testid="input-total-calls"
                  type="number"
                  min="0"
                  placeholder="Enter total calls"
                  value={totalCalls}
                  onChange={(e) => setTotalCalls(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successfulCalls">Successful Calls</Label>
                <Input
                  id="successfulCalls"
                  data-testid="input-successful-calls"
                  type="number"
                  min="0"
                  placeholder="Enter successful calls"
                  value={successfulCalls}
                  onChange={(e) => setSuccessfulCalls(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unsuccessfulCalls">Unsuccessful Calls</Label>
                <Input
                  id="unsuccessfulCalls"
                  data-testid="input-unsuccessful-calls"
                  type="number"
                  min="0"
                  placeholder="Enter unsuccessful calls"
                  value={unsuccessfulCalls}
                  onChange={(e) => setUnsuccessfulCalls(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="failedCalls">Failed Calls</Label>
                <Input
                  id="failedCalls"
                  data-testid="input-failed-calls"
                  type="number"
                  min="0"
                  placeholder="Enter failed calls"
                  value={failedCalls}
                  onChange={(e) => setFailedCalls(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Button 
              onClick={handleCreateDeposit} 
              className="w-full"
              disabled={createDepositMutation.isPending}
              data-testid="button-create-deposit"
            >
              {createDepositMutation.isPending ? "Creating..." : "Create Deposit"}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-import-export">
          <CardHeader>
            <CardTitle>Import & Export</CardTitle>
            <CardDescription>Manage deposits in bulk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Import from Excel</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={importExcelMutation.isPending}
                  data-testid="input-import-file"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importExcelMutation.isPending}
                  data-testid="button-trigger-import"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload .xlsx or .xls file with Staff Name, Date, Brand Name, FTD Count, Deposit Count, Total Calls, Successful Calls, Unsuccessful Calls, and Failed Calls columns
              </p>
            </div>

            <div className="space-y-2">
              <Label>Download Sample Template</Label>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full"
                data-testid="button-download-template"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-deposits-list">
        <CardHeader>
          <CardTitle>Deposits List</CardTitle>
          <CardDescription>View and manage all deposit records</CardDescription>
        </CardHeader>
        <CardContent>
          {depositsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading deposits...</p>
              </div>
            </div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No deposits found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Brand Name</TableHead>
                    <TableHead className="text-center">FTD Count</TableHead>
                    <TableHead className="text-center">Deposit Count</TableHead>
                    <TableHead className="text-center">Total Calls</TableHead>
                    <TableHead className="text-center">Successful</TableHead>
                    <TableHead className="text-center">Unsuccessful</TableHead>
                    <TableHead className="text-center">Failed</TableHead>
                    <TableHead className="text-right">Bonus Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => {
                    const ftdCount = deposit.ftdCount || 0;
                    const depositCount = deposit.depositCount || 0;
                    const bonusAmount = (ftdCount * 1) + (depositCount * 1.5);
                    
                    return (
                      <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                        <TableCell className="font-medium" data-testid={`text-staff-name-${deposit.id}`}>
                          {deposit.staffName}
                        </TableCell>
                        <TableCell data-testid={`text-type-${deposit.id}`}>
                          <Badge variant="outline">{deposit.type}</Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${deposit.id}`}>
                          {format(new Date(deposit.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell data-testid={`text-brand-name-${deposit.id}`}>
                          {deposit.brandName}
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-ftd-count-${deposit.id}`}>
                          <Badge variant="outline">{ftdCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-deposit-count-${deposit.id}`}>
                          <Badge variant="outline">{depositCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-total-calls-${deposit.id}`}>
                          <Badge variant="outline">{deposit.totalCalls || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-successful-calls-${deposit.id}`}>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">{deposit.successfulCalls || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-unsuccessful-calls-${deposit.id}`}>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">{deposit.unsuccessfulCalls || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center" data-testid={`text-failed-calls-${deposit.id}`}>
                          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">{deposit.failedCalls || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400" data-testid={`text-bonus-${deposit.id}`}>
                          ${bonusAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDeposit(deposit)}
                              data-testid={`button-view-${deposit.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditDeposit(deposit)}
                              data-testid={`button-edit-${deposit.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDeposit(deposit)}
                              data-testid={`button-delete-${deposit.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent data-testid="dialog-view-deposit">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>View deposit information</DialogDescription>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Staff Name</Label>
                <p className="font-medium" data-testid="text-view-staff-name">{selectedDeposit.staffName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p className="font-medium" data-testid="text-view-type">{selectedDeposit.type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="font-medium" data-testid="text-view-date">
                  {format(new Date(selectedDeposit.date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Brand Name</Label>
                <p className="font-medium" data-testid="text-view-brand-name">{selectedDeposit.brandName}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">FTD Count</Label>
                  <p className="font-medium" data-testid="text-view-ftd-count">{selectedDeposit.ftdCount || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Deposit Count</Label>
                  <p className="font-medium" data-testid="text-view-deposit-count">{selectedDeposit.depositCount || 0}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Total Calls</Label>
                  <p className="font-medium" data-testid="text-view-total-calls">{selectedDeposit.totalCalls || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Successful Calls</Label>
                  <p className="font-medium" data-testid="text-view-successful-calls">{selectedDeposit.successfulCalls || 0}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Unsuccessful Calls</Label>
                  <p className="font-medium" data-testid="text-view-unsuccessful-calls">{selectedDeposit.unsuccessfulCalls || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Failed Calls</Label>
                  <p className="font-medium" data-testid="text-view-failed-calls">{selectedDeposit.failedCalls || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)} data-testid="button-close-view">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-deposit">
          <DialogHeader>
            <DialogTitle>Edit Deposit</DialogTitle>
            <DialogDescription>Update deposit information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-staffName">Staff Name</Label>
              <StaffCombobox
                value={editStaffName}
                onChange={setEditStaffName}
                placeholder="Type or select staff..."
                testId="input-edit-staff-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                data-testid="input-edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-brandName">Brand Name</Label>
              <Select value={editBrandName} onValueChange={setEditBrandName}>
                <SelectTrigger id="edit-brandName" data-testid="select-edit-brand-name">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JB BDT" data-testid="select-option-jb-bdt">JB BDT</SelectItem>
                  <SelectItem value="BJ BDT" data-testid="select-option-bj-bdt">BJ BDT</SelectItem>
                  <SelectItem value="BJ PKR" data-testid="select-option-bj-pkr">BJ PKR</SelectItem>
                  <SelectItem value="JB PKR" data-testid="select-option-jb-pkr">JB PKR</SelectItem>
                  <SelectItem value="NPR" data-testid="select-option-npr">NPR</SelectItem>
                  <SelectItem value="SIX6'S BDT" data-testid="select-option-six6s-bdt">SIX6'S BDT</SelectItem>
                  <SelectItem value="SIX6'S PKR" data-testid="select-option-six6s-pkr">SIX6'S PKR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-ftdCount">FTD Count</Label>
                <Input
                  id="edit-ftdCount"
                  data-testid="input-edit-ftd-count"
                  type="number"
                  min="0"
                  value={editFtdCount}
                  onChange={(e) => setEditFtdCount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-depositCount">Deposit Count</Label>
                <Input
                  id="edit-depositCount"
                  data-testid="input-edit-deposit-count"
                  type="number"
                  min="0"
                  value={editDepositCount}
                  onChange={(e) => setEditDepositCount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-totalCalls">Total Calls</Label>
                <Input
                  id="edit-totalCalls"
                  data-testid="input-edit-total-calls"
                  type="number"
                  min="0"
                  value={editTotalCalls}
                  onChange={(e) => setEditTotalCalls(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-successfulCalls">Successful Calls</Label>
                <Input
                  id="edit-successfulCalls"
                  data-testid="input-edit-successful-calls"
                  type="number"
                  min="0"
                  value={editSuccessfulCalls}
                  onChange={(e) => setEditSuccessfulCalls(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-unsuccessfulCalls">Unsuccessful Calls</Label>
                <Input
                  id="edit-unsuccessfulCalls"
                  data-testid="input-edit-unsuccessful-calls"
                  type="number"
                  min="0"
                  value={editUnsuccessfulCalls}
                  onChange={(e) => setEditUnsuccessfulCalls(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-failedCalls">Failed Calls</Label>
                <Input
                  id="edit-failedCalls"
                  data-testid="input-edit-failed-calls"
                  type="number"
                  min="0"
                  value={editFailedCalls}
                  onChange={(e) => setEditFailedCalls(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDeposit}
              disabled={updateDepositMutation.isPending}
              data-testid="button-update-deposit"
            >
              {updateDepositMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-deposit">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deposit record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteDepositMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteDepositMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
