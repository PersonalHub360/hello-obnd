import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { type Staff, type SessionData, type InsertStaff } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building2,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StaffFormDialog } from "@/components/staff-form-dialog";
import { DeleteStaffDialog } from "@/components/delete-staff-dialog";

export default function StaffDetail() {
  const [, params] = useRoute("/staff/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

  const {
    data: staff,
    isLoading: staffLoading,
    error,
  } = useQuery<Staff>({
    queryKey: ["/api/staff", params?.id],
    enabled: !!params?.id && !!session,
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
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete employee. Please try again.",
      });
    },
  });

  const handleFormSubmit = (data: InsertStaff) => {
    if (staff) {
      updateStaffMutation.mutate({ id: staff.id, data });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingStaff) {
      deleteStaffMutation.mutate(deletingStaff.id);
    }
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

  if (sessionLoading || staffLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !staff) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Employee Not Found</h2>
            <p className="text-muted-foreground">
              The employee you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button
              onClick={() => setIsFormOpen(true)}
              data-testid="button-edit-staff"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeletingStaff(staff)}
              data-testid="button-delete-staff"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                {staff.avatar ? (
                  <AvatarImage
                    src={staff.avatar}
                    alt={`${staff.firstName} ${staff.lastName}`}
                  />
                ) : null}
                <AvatarFallback
                  className={`${getAvatarColor(staff.firstName)} text-white text-2xl font-medium`}
                >
                  {getInitials(staff.firstName, staff.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h1
                    className="text-3xl font-semibold"
                    data-testid="text-staff-name"
                  >
                    {staff.firstName} {staff.lastName}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    {staff.role}
                  </p>
                </div>

                <Badge
                  variant={staff.status === "active" ? "default" : "secondary"}
                  className={
                    staff.status === "active"
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20"
                      : ""
                  }
                  data-testid="badge-status"
                >
                  {staff.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p
                        className="font-medium font-mono text-sm"
                        data-testid="text-email"
                      >
                        {staff.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p
                        className="font-medium font-mono text-sm"
                        data-testid="text-phone"
                      >
                        {staff.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Work Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium" data-testid="text-department">
                        {staff.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium" data-testid="text-role">
                        {staff.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Join Date</p>
                      <p className="font-medium" data-testid="text-join-date">
                        {format(new Date(staff.joinDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StaffFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        staff={staff}
        onSubmit={handleFormSubmit}
        isPending={updateStaffMutation.isPending}
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
