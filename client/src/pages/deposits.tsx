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
import { DollarSign, TrendingUp, Calendar, Upload, Download, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  const [editStaffName, setEditStaffName] = useState("");
  const [editType, setEditType] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBrandName, setEditBrandName] = useState("");
  const [editFtdCount, setEditFtdCount] = useState<number>(0);
  const [editDepositCount, setEditDepositCount] = useState<number>(0);

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
    mutationFn: async (data: { staffName: string; type: string; date?: string; brandName: string; ftdCount?: number; depositCount?: number }) => {
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

    if (type !== "FTD" && type !== "Deposit") {
      toast({
        title: "Error",
        description: "Type must be either FTD or Deposit",
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
    mutationFn: async (data: { id: string; staffName: string; type: string; date?: string; brandName: string; ftdCount?: number; depositCount?: number }) => {
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
    setEditStaffName(deposit.staffName);
    setEditType(deposit.type);
    setEditDate(deposit.date ? format(new Date(deposit.date), "yyyy-MM-dd") : "");
    setEditBrandName(deposit.brandName);
    setEditFtdCount(deposit.ftdCount || 0);
    setEditDepositCount(deposit.depositCount || 0);
    setEditDialogOpen(true);
  };

  const handleUpdateDeposit = () => {
    if (!selectedDeposit) return;

    if (!editStaffName || !editType || !editBrandName) {
      toast({
        title: "Error",
        description: "Please fill in Staff Name, Type, and Brand Name",
        variant: "destructive",
      });
      return;
    }

    if (editType !== "FTD" && editType !== "Deposit") {
      toast({
        title: "Error",
        description: "Type must be either FTD or Deposit",
        variant: "destructive",
      });
      return;
    }

    updateDepositMutation.mutate({
      id: selectedDeposit.id,
      staffName: editStaffName,
      type: editType,
      date: editDate || undefined,
      brandName: editBrandName,
      ftdCount: editFtdCount,
      depositCount: editDepositCount,
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

  const totalDeposits = deposits.length;
  const totalFtdRecords = deposits.filter(d => d.type === "FTD").length;
  const totalDepositRecords = deposits.filter(d => d.type === "Deposit").length;
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
            <p className="text-xs text-muted-foreground">{totalFtdRecords} records • Total count</p>
          </CardContent>
        </Card>

        <Card data-testid="card-deposit-count">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposit Count</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-deposit-count">{totalDepositCount}</div>
            <p className="text-xs text-muted-foreground">{totalDepositRecords} records • Total count</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-new-deposit">
          <CardHeader>
            <CardTitle>New Deposit</CardTitle>
            <CardDescription>Add a new deposit record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Staff Name</Label>
              <Input
                id="staffName"
                data-testid="input-staff-name"
                placeholder="Enter staff name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" data-testid="select-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTD" data-testid="select-item-ftd">FTD</SelectItem>
                  <SelectItem value="Deposit" data-testid="select-item-deposit">Deposit</SelectItem>
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
                Upload .xlsx or .xls file with Staff Name, Type (FTD/Deposit), Date, Brand Name, FTD Count, and Deposit Count columns
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                      <TableCell className="font-medium" data-testid={`text-staff-name-${deposit.id}`}>
                        {deposit.staffName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={deposit.type === "FTD" ? "default" : "secondary"}
                          data-testid={`badge-type-${deposit.id}`}
                        >
                          {deposit.type}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-date-${deposit.id}`}>
                        {format(new Date(deposit.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell data-testid={`text-brand-name-${deposit.id}`}>
                        {deposit.brandName}
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
                  ))}
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
              <Input
                id="edit-staffName"
                data-testid="input-edit-staff-name"
                value={editStaffName}
                onChange={(e) => setEditStaffName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger id="edit-type" data-testid="select-edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FTD" data-testid="select-edit-item-ftd">FTD</SelectItem>
                  <SelectItem value="Deposit" data-testid="select-edit-item-deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
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
