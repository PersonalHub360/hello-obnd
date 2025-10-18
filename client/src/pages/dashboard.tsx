import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  Building2,
  Search,
  LogOut,
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
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    },
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
      staff.firstName.toLowerCase().includes(searchLower) ||
      staff.lastName.toLowerCase().includes(searchLower) ||
      staff.email.toLowerCase().includes(searchLower) ||
      staff.department.toLowerCase().includes(searchLower) ||
      staff.role.toLowerCase().includes(searchLower);

    const matchesDepartment =
      departmentFilter === "all" || staff.department === departmentFilter;
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const departments = Array.from(new Set(staffList.map((s) => s.department))).sort();
  const roles = Array.from(new Set(staffList.map((s) => s.role))).sort();

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AuroraMY</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Staff Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {session.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {session.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-6">
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

            <Button onClick={handleAddStaff} data-testid="button-add-staff">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
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
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
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
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {staff.avatar ? (
                                <AvatarImage src={staff.avatar} alt={`${staff.firstName} ${staff.lastName}`} />
                              ) : null}
                              <AvatarFallback
                                className={`${getAvatarColor(staff.firstName)} text-white font-medium`}
                              >
                                {getInitials(staff.firstName, staff.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {staff.firstName} {staff.lastName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{staff.role}</span>
                          </div>
                        </TableCell>
                        <TableCell>{staff.department}</TableCell>
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
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {staff.phone}
                            </span>
                          </div>
                        </TableCell>
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
                <Card
                  key={staff.id}
                  className="p-4"
                  data-testid={`card-staff-${staff.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      {staff.avatar ? (
                        <AvatarImage src={staff.avatar} alt={`${staff.firstName} ${staff.lastName}`} />
                      ) : null}
                      <AvatarFallback
                        className={`${getAvatarColor(staff.firstName)} text-white font-medium`}
                      >
                        {getInitials(staff.firstName, staff.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {staff.firstName} {staff.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {staff.role}
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
                          <span>{staff.department}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="font-mono">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span className="font-mono">{staff.phone}</span>
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
              ))}
            </div>
          </>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredStaff.length} of {staffList.length} staff members
        </div>
      </main>

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
