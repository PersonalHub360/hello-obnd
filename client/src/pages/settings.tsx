import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SessionData, type AuthUser, insertAuthUserSchema, type InsertAuthUser } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Palette,
  Bell,
  Lock,
  User,
  Moon,
  Sun,
  Users,
  Edit,
  Check,
  X,
  Plus,
  Eye,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type UserWithoutPassword = Omit<AuthUser, 'password'>;

const USER_ROLES = [
  "User",
  "Manager",
  "Team Leader",
  "Assistant Leader",
  "Admin",
  "Senior Manager",
  "Department Head",
  "Supervisor",
] as const;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "deactivated">("active");
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [viewUserDialogOpen, setViewUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithoutPassword | null>(null);

  const addUserForm = useForm<InsertAuthUser>({
    resolver: zodResolver(insertAuthUserSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: "User",
      status: "active",
    },
  });

  const { data: session, isLoading: sessionLoading } = useQuery<SessionData>({
    queryKey: ["/api/auth/session"],
    retry: false,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/users"],
    enabled: !!session,
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: InsertAuthUser) => {
      const response = await apiRequest("POST", "/api/users", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setAddUserDialogOpen(false);
      addUserForm.reset();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role, status }: { id: string; role?: string; status?: "active" | "deactivated" }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, { role, status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUserId(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteUserDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!sessionLoading && !session) {
      setLocation("/");
    }
  }, [session, sessionLoading, setLocation]);

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
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="heading-settings">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your application preferences and settings
          </p>
        </div>

        <div className="grid gap-6">
          <Card data-testid="card-interface-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Interface</CardTitle>
              </div>
              <CardDescription>
                Customize the appearance and behavior of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Theme</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-light"
                    >
                      <Sun className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Light</div>
                        <div className="text-xs text-muted-foreground">
                          Bright and clear
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-dark"
                    >
                      <Moon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Dark</div>
                        <div className="text-xs text-muted-foreground">
                          Easy on the eyes
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={theme === "blue" ? "default" : "outline"}
                      onClick={() => setTheme("blue")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-blue"
                    >
                      <div className="h-4 w-4 rounded-full bg-blue-500" />
                      <div className="text-left">
                        <div className="font-medium">Blue</div>
                        <div className="text-xs text-muted-foreground">
                          Ocean breeze
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={theme === "green" ? "default" : "outline"}
                      onClick={() => setTheme("green")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-green"
                    >
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <div className="text-left">
                        <div className="font-medium">Green</div>
                        <div className="text-xs text-muted-foreground">
                          Nature fresh
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={theme === "purple" ? "default" : "outline"}
                      onClick={() => setTheme("purple")}
                      className="justify-start gap-2 h-auto py-3"
                      data-testid="button-theme-purple"
                    >
                      <div className="h-4 w-4 rounded-full bg-purple-500" />
                      <div className="text-left">
                        <div className="font-medium">Purple</div>
                        <div className="text-xs text-muted-foreground">
                          Royal elegance
                        </div>
                      </div>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current theme: <span className="font-medium capitalize">{theme}</span>
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode" className="text-base">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing for more content density
                      </p>
                    </div>
                    <Switch id="compact-mode" data-testid="switch-compact-mode" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations" className="text-base">
                        Animations
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and effects
                      </p>
                    </div>
                    <Switch id="animations" defaultChecked data-testid="switch-animations" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebar-collapsed" className="text-base">
                        Collapse Sidebar by Default
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Start with sidebar minimized
                      </p>
                    </div>
                    <Switch id="sidebar-collapsed" data-testid="switch-sidebar-collapsed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-notifications-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked data-testid="switch-email-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-base">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get browser notifications for important events
                  </p>
                </div>
                <Switch id="push-notifications" data-testid="switch-push-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-base">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch id="sound-enabled" data-testid="switch-sound-enabled" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-account-settings">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account</CardTitle>
              </div>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-sm font-medium" data-testid="text-user-name">{session.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm font-medium font-mono" data-testid="text-user-email">{session.email}</p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" data-testid="button-change-password">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-user-management">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage user roles and access permissions
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-user">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-add-user">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with access credentials
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...addUserForm}>
                      <form onSubmit={addUserForm.handleSubmit((data) => addUserMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={addUserForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" data-testid="input-add-user-username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addUserForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" data-testid="input-add-user-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addUserForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" data-testid="input-add-user-email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addUserForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter password" data-testid="input-add-user-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addUserForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-add-user-role">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {USER_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addUserForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-add-user-status">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="deactivated">Deactivated</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAddUserDialogOpen(false)}
                            disabled={addUserMutation.isPending}
                            data-testid="button-cancel-add-user"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addUserMutation.isPending} data-testid="button-submit-add-user">
                            {addUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                            <TableCell className="font-mono text-xs" data-testid={`user-id-${user.id}`}>
                              {user.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell data-testid={`user-name-${user.id}`}>
                              {user.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm" data-testid={`user-email-${user.id}`}>
                              {user.email}
                            </TableCell>
                            <TableCell data-testid={`user-role-${user.id}`}>
                              {editingUserId === user.id ? (
                                <Select
                                  value={editRole}
                                  onValueChange={setEditRole}
                                >
                                  <SelectTrigger className="h-8 max-w-[150px]" data-testid={`select-role-${user.id}`}>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {USER_ROLES.map((role) => (
                                      <SelectItem key={role} value={role}>
                                        {role}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant="secondary">{user.role}</Badge>
                              )}
                            </TableCell>
                            <TableCell data-testid={`user-status-${user.id}`}>
                              {editingUserId === user.id ? (
                                <Select
                                  value={editStatus}
                                  onValueChange={(value: "active" | "deactivated") => setEditStatus(value)}
                                >
                                  <SelectTrigger className="h-8 max-w-[130px]" data-testid={`select-status-${user.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="deactivated">Deactivated</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge 
                                  variant={user.status === "active" ? "default" : "secondary"}
                                  className={user.status === "active" ? "bg-green-600" : ""}
                                >
                                  {user.status === "active" ? "Active" : "Deactivated"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingUserId === user.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => {
                                      updateUserMutation.mutate({
                                        id: user.id,
                                        role: editRole,
                                        status: editStatus,
                                      });
                                    }}
                                    disabled={updateUserMutation.isPending}
                                    data-testid={`button-save-${user.id}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingUserId(null)}
                                    disabled={updateUserMutation.isPending}
                                    data-testid={`button-cancel-${user.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setViewUserDialogOpen(true);
                                    }}
                                    data-testid={`button-view-${user.id}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingUserId(user.id);
                                      setEditRole(user.role);
                                      setEditStatus(user.status as "active" | "deactivated");
                                    }}
                                    data-testid={`button-edit-${user.id}`}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteUserDialogOpen(true);
                                    }}
                                    data-testid={`button-delete-${user.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* View User Dialog */}
        <Dialog open={viewUserDialogOpen} onOpenChange={setViewUserDialogOpen}>
          <DialogContent data-testid="dialog-view-user">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View user information and access details
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono" data-testid="view-user-id">{selectedUser.id}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-sm font-medium" data-testid="view-user-name">{selectedUser.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm font-mono" data-testid="view-user-email">{selectedUser.email}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <div>
                    <Badge variant="secondary" data-testid="view-user-role">{selectedUser.role}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div>
                    <Badge 
                      variant={selectedUser.status === "active" ? "default" : "secondary"}
                      className={selectedUser.status === "active" ? "bg-green-600" : ""}
                      data-testid="view-user-status"
                    >
                      {selectedUser.status === "active" ? "Active" : "Deactivated"}
                    </Badge>
                  </div>
                </div>
                {selectedUser.createdAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                      <p className="text-sm" data-testid="view-user-created-at">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setViewUserDialogOpen(false)}
                    data-testid="button-close-view-user"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
          <AlertDialogContent data-testid="dialog-delete-user">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for{" "}
                <span className="font-semibold">{userToDelete?.name}</span> ({userToDelete?.email}).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete-user">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (userToDelete) {
                    deleteUserMutation.mutate(userToDelete.id);
                  }
                }}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete-user"
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
