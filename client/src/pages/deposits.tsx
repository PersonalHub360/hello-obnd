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
import { DollarSign, TrendingUp, Calendar, CheckCircle, Clock, XCircle, Upload, Download, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Deposits() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [depositor, setDepositor] = useState("");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  const [editAmount, setEditAmount] = useState("");
  const [editType, setEditType] = useState("");
  const [editDepositor, setEditDepositor] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
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

  const createDepositMutation = useMutation({
    mutationFn: async (data: { amount: string; type: string; depositor: string; reference: string; status: string }) => {
      return await apiRequest("POST", "/api/deposits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit created successfully",
      });
      setAmount("");
      setType("");
      setDepositor("");
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

  const updateImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/deposits/import/excel/update", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update from Excel file");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: data.message || "Deposits updated successfully",
      });
      if (updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update from Excel file",
        variant: "destructive",
      });
      if (updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      }
    },
  });

  const handleCreateDeposit = () => {
    if (!amount || !type || !depositor) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const reference = `REF-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    createDepositMutation.mutate({
      amount,
      type,
      depositor,
      reference,
      status: "pending",
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

  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          title: "Error",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
        if (updateFileInputRef.current) {
          updateFileInputRef.current.value = "";
        }
        return;
      }
      updateImportMutation.mutate(file);
    }
  };

  const updateDepositMutation = useMutation({
    mutationFn: async (data: { id: string; amount: string; type: string; depositor: string; status: string }) => {
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

  const handleViewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setViewDialogOpen(true);
  };

  const handleEditDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setEditAmount(deposit.amount);
    setEditType(deposit.type);
    setEditDepositor(deposit.depositor);
    setEditStatus(deposit.status);
    setEditDialogOpen(true);
  };

  const handleDeleteDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedDeposit) return;
    
    if (!editAmount || !editType || !editDepositor || !editStatus) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateDepositMutation.mutate({
      id: selectedDeposit.id,
      amount: editAmount,
      type: editType,
      depositor: editDepositor,
      status: editStatus,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedDeposit) return;
    deleteDepositMutation.mutate(selectedDeposit.id);
  };

  const handleDownloadSample = async () => {
    try {
      const response = await fetch("/api/deposits/sample/template", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download sample template");
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
        description: "Sample template downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download sample template",
        variant: "destructive",
      });
    }
  };

  const totalDeposits = deposits.reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
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

  if (sessionLoading || depositsLoading) {
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
            <h1 className="text-3xl font-semibold tracking-tight">Deposit Section</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all financial deposits
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadSample}
              data-testid="button-download-sample"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Sample
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
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpdateFileChange}
              className="hidden"
              data-testid="input-update-excel-file"
            />
            <Button
              variant="outline"
              onClick={() => updateFileInputRef.current?.click()}
              disabled={updateImportMutation.isPending}
              data-testid="button-update-import"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {updateImportMutation.isPending ? "Updating..." : "Update Import"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-deposit-amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" data-testid="select-deposit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                    <SelectItem value="ACH">ACH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depositor">Depositor</Label>
                <Input
                  id="depositor"
                  placeholder="Name"
                  value={depositor}
                  onChange={(e) => setDepositor(e.target.value)}
                  data-testid="input-depositor"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  onClick={handleCreateDeposit}
                  disabled={createDepositMutation.isPending}
                  data-testid="button-add-deposit"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  {createDepositMutation.isPending ? "Adding..." : "Add Deposit"}
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
            {deposits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deposits found. Add a deposit or import from Excel.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Depositor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                      <TableCell>{format(new Date(deposit.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{deposit.depositor}</TableCell>
                      <TableCell>{deposit.type}</TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(deposit.amount).toLocaleString()}
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
                      <TableCell>
                        <div className="flex gap-2">
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
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Details</DialogTitle>
              <DialogDescription>View complete deposit information</DialogDescription>
            </DialogHeader>
            {selectedDeposit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Reference</Label>
                    <p className="font-mono text-sm">{selectedDeposit.reference}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-medium">{format(new Date(selectedDeposit.date), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Depositor</Label>
                    <p className="font-medium">{selectedDeposit.depositor}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-medium">{selectedDeposit.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(selectedDeposit.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedDeposit.status === "completed"
                            ? "default"
                            : selectedDeposit.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="gap-1"
                      >
                        {getStatusIcon(selectedDeposit.status)}
                        {selectedDeposit.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deposit</DialogTitle>
              <DialogDescription>Update deposit information</DialogDescription>
            </DialogHeader>
            {selectedDeposit && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    data-testid="input-edit-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger id="edit-type" data-testid="select-edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                      <SelectItem value="ACH">ACH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-depositor">Depositor</Label>
                  <Input
                    id="edit-depositor"
                    value={editDepositor}
                    onChange={(e) => setEditDepositor(e.target.value)}
                    data-testid="input-edit-depositor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger id="edit-status" data-testid="select-edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <Label className="text-muted-foreground">Reference</Label>
                  <p className="font-mono text-sm">{selectedDeposit.reference}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={updateDepositMutation.isPending}
                data-testid="button-confirm-edit"
              >
                {updateDepositMutation.isPending ? "Updating..." : "Update Deposit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this deposit? This action cannot be undone.
                {selectedDeposit && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="font-semibold">{selectedDeposit.depositor}</p>
                    <p className="text-sm">Amount: ${parseFloat(selectedDeposit.amount).toLocaleString()}</p>
                    <p className="text-sm font-mono">Ref: {selectedDeposit.reference}</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteDepositMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
