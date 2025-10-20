import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { type Staff, type SessionData, type InsertStaff } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Search,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Filter,
  X,
  Download,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StaffFormDialog } from "@/components/staff-form-dialog";
import { DeleteStaffDialog } from "@/components/delete-staff-dialog";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>();
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (sessionError || (!sessionLoading && !session)) {
      setLocation("/");
    }
  }, [sessionError, sessionLoading, session, setLocation]);

  const { data: staffList = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
    enabled: !!session,
  });


  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      return await apiRequest("POST", "/api/staff", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Employee added successfully.",
      });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add employee. Please try again.",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertStaff }) => {
      return await apiRequest("PATCH", `/api/staff/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Employee updated successfully.",
      });
      setIsFormOpen(false);
      setEditingStaff(undefined);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee. Please try again.",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/staff/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: "Employee deleted successfully.",
      });
      setDeletingStaff(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee. Please try again.",
      });
    },
  });

  const importStaffMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/staff/import/excel", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({
        title: "Success",
        description: `Imported ${data.imported} employees from Excel file.`,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import Excel file. Please try again.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleAddStaff = () => {
    setEditingStaff(undefined);
    setIsFormOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  const handleDeleteStaff = (staff: Staff) => {
    setDeletingStaff(staff);
  };

  const handleFormSubmit = (data: InsertStaff) => {
    if (editingStaff) {
      updateStaffMutation.mutate({ id: editingStaff.id, data });
    } else {
      createStaffMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingStaff) {
      deleteStaffMutation.mutate(deletingStaff.id);
    }
  };

  const filteredStaff = staffList.filter((staff) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      staff.name.toLowerCase().includes(searchLower) ||
      staff.email.toLowerCase().includes(searchLower) ||
      staff.employeeId.toLowerCase().includes(searchLower) ||
      staff.position.toLowerCase().includes(searchLower) ||
      staff.country.toLowerCase().includes(searchLower);

    const matchesDepartment =
      departmentFilter === "all" || staff.country === departmentFilter;
    const matchesRole = roleFilter === "all" || staff.position === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const departments = Array.from(new Set(staffList.map((s) => s.country))).sort();
  const roles = Array.from(new Set(staffList.map((s) => s.position))).sort();

  const activeFiltersCount = [
    departmentFilter !== "all",
    roleFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setDepartmentFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/staff/export/csv", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staff-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Staff data exported successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data. Please try again.",
      });
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await fetch("/api/staff/sample/template", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "staff-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Sample template downloaded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download sample template. Please try again.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload an Excel file (.xlsx or .xls)",
        });
        return;
      }
      importStaffMutation.mutate(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(/\s+/);
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Staff Directory
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage and view all team members
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadSample}
                data-testid="button-download-sample"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Sample
              </Button>
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={importStaffMutation.isPending}
                data-testid="button-import-excel"
              >
                <Upload className="mr-2 h-4 w-4" />
                {importStaffMutation.isPending ? "Importing..." : "Import Excel"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                variant="outline"
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handleAddStaff} data-testid="button-add-staff">
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters:</span>
          </div>

          <Select
            value={departmentFilter}
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger className="w-[180px]" data-testid="select-department-filter">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-role-filter">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4" />
              Clear {activeFiltersCount} {activeFiltersCount === 1 ? "filter" : "filters"}
            </Button>
          )}
        </div>

        {staffLoading ? (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading staff data...</p>
            </div>
          </Card>
        ) : filteredStaff.length === 0 ? (
          <Card className="p-12">
            <div className="text-center space-y-2">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No staff found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "No staff members in the system yet"}
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="hidden md:block">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Employee ID</TableHead>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow
                        key={staff.id}
                        data-testid={`row-staff-${staff.id}`}
                      >
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            {staff.employeeId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/staff/${staff.id}`}>
                            <div className="flex items-center gap-3 hover-elevate cursor-pointer rounded-md p-2 -m-2">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback
                                  className={`${getAvatarColor(staff.name)} text-white font-medium`}
                                >
                                  {getInitials(staff.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {staff.name}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {staff.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{staff.position}</span>
                          </div>
                        </TableCell>
                        <TableCell>{staff.country}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              staff.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              staff.status === "active"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20"
                                : ""
                            }
                            data-testid={`badge-status-${staff.id}`}
                          >
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {format(new Date(staff.joinDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                data-testid={`button-actions-${staff.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditStaff(staff)}
                                data-testid={`button-edit-${staff.id}`}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStaff(staff)}
                                className="text-destructive"
                                data-testid={`button-delete-${staff.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredStaff.map((staff) => (
                <Link key={staff.id} href={`/staff/${staff.id}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer"
                    data-testid={`card-staff-${staff.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback
                          className={`${getAvatarColor(staff.name)} text-white font-medium`}
                        >
                          {getInitials(staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {staff.name}
                              </h3>
                              <span className="text-xs font-mono text-muted-foreground">
                                {staff.employeeId}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {staff.position}
                            </p>
                          </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              staff.status === "active" ? "default" : "secondary"
                            }
                            className={
                              staff.status === "active"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : ""
                            }
                          >
                            {staff.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditStaff(staff)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStaff(staff)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          <span>{staff.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="font-mono">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Joined {format(new Date(staff.joinDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredStaff.length} of {staffList.length} staff members
        </div>
      </div>

      <StaffFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        staff={editingStaff}
        onSubmit={handleFormSubmit}
        isPending={createStaffMutation.isPending || updateStaffMutation.isPending}
      />

      <DeleteStaffDialog
        open={!!deletingStaff}
        onOpenChange={(open) => !open && setDeletingStaff(null)}
        staff={deletingStaff}
        onConfirm={handleConfirmDelete}
        isPending={deleteStaffMutation.isPending}
      />
    </div>
  );
}
