import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Users,
  BookOpen,
  FileText,
  Video,
  Bell,
  Plus,
  Image as ImageIcon,
  Shield,
  Loader2,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Calendar,
  Eye,
  EyeOff,
  X,
  Search,
  ClipboardList,
  CheckCircle,
  XCircle,
  Download,
  KeyRound,
} from "lucide-react";
import type { User, Course, MockTest, Class, Resource, Notice, TeamMember, HeroBanner } from "@shared/schema";
import { MOCK_TAGS, CLASS_TAGS, RESOURCE_TAGS, ACCESS_LEVELS, USER_ROLES, NOTICE_TAGS } from "@shared/schema";
import { Redirect } from "wouter";
import { ImageUploader } from "@/components/image-uploader";
import { useSEO } from "@/hooks/use-seo";

export default function AdminDashboard() {
  useSEO({ title: "Admin Panel", description: "Crack-CU administration dashboard.", path: "/admin", noIndex: true });

  const { user } = useAuth();

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-admin">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
          <TabsTrigger value="mock-tests" data-testid="tab-mock-tests">Mock Tests</TabsTrigger>
          <TabsTrigger value="classes" data-testid="tab-classes">Classes</TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
          <TabsTrigger value="notices" data-testid="tab-notices">Notices</TabsTrigger>
          <TabsTrigger value="reg-form" data-testid="tab-reg-form">Reg Form</TabsTrigger>
          <TabsTrigger value="banners" data-testid="tab-banners">Banners</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="reg-form"><RegFormTab /></TabsContent>
        <TabsContent value="courses"><CoursesTab /></TabsContent>
        <TabsContent value="mock-tests"><MockTestsTab /></TabsContent>
        <TabsContent value="classes"><ClassesTab /></TabsContent>
        <TabsContent value="resources"><ResourcesTab /></TabsContent>
        <TabsContent value="notices"><NoticesTab /></TabsContent>
        <TabsContent value="banners"><BannersTab /></TabsContent>
        <TabsContent value="team"><TeamTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/admin/stats"] });

  const cards = [
    { label: "Users", value: stats?.users ?? 0, icon: Users },
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen },
    { label: "Mock Tests", value: stats?.mockTests ?? 0, icon: FileText },
    { label: "Classes", value: stats?.classes ?? 0, icon: Video },
    { label: "Resources", value: stats?.resources ?? 0, icon: FileText },
    { label: "Notices", value: stats?.notices ?? 0, icon: Bell },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6 text-center">
            <card.icon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold" data-testid={`stat-${card.label.toLowerCase()}`}>
              {isLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : card.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const { data: allUsers, isLoading } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated" });
    },
  });

  const toggleRestriction = useMutation({
    mutationFn: async ({ userId, isRestricted }: { userId: number; isRestricted: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { isRestricted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User restriction updated" });
    },
  });

  const togglePremium = useMutation({
    mutationFn: async ({ userId, isPremium }: { userId: number; isPremium: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${userId}`, { isPremium });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Premium status updated" });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/reset-password`, { newPassword });
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      setResetPasswordUserId(null);
      setNewPassword("");
      setShowPassword(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  const filtered = allUsers?.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.fullName.toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || u.whatsapp.includes(s) || u.email.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by name, username, email, or whatsapp..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
        data-testid="input-search-users"
      />
      <p className="text-xs text-muted-foreground">{filtered?.length ?? 0} users found</p>
      {filtered?.map((u) => (
        <Card key={u.id} data-testid={`card-user-${u.id}`}>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{u.fullName}</p>
                  <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                  {u.isPremium && <Badge className="bg-success text-success-foreground text-xs">Premium</Badge>}
                  {u.isRestricted && <Badge variant="destructive" className="text-xs">Restricted</Badge>}
                  {(u as any).isSecondTimer && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">2nd Timer</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">@{u.username} | {u.email} | {u.whatsapp} | HSC {u.hscYear} | SSC {u.sscYear}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={u.role}
                  onValueChange={(role) => updateRole.mutate({ userId: u.id, role })}
                >
                  <SelectTrigger className="w-32" data-testid={`select-role-${u.id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Premium</Label>
                  <Switch checked={u.isPremium} onCheckedChange={(v) => togglePremium.mutate({ userId: u.id, isPremium: v })} data-testid={`switch-premium-${u.id}`} />
                </div>
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Restricted</Label>
                  <Switch checked={u.isRestricted} onCheckedChange={(v) => toggleRestriction.mutate({ userId: u.id, isRestricted: v })} data-testid={`switch-restrict-${u.id}`} />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                  data-testid={`button-expand-user-${u.id}`}
                >
                  {expandedUser === u.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {expandedUser === u.id && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{u.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{u.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{u.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="font-medium font-mono">{u.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">HSC Roll</p>
                    <p className="font-medium">{u.hscRoll}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">HSC Reg</p>
                    <p className="font-medium">{u.hscReg}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">HSC Group</p>
                    <p className="font-medium">{u.hscGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">HSC Board</p>
                    <p className="font-medium">{u.hscBoard}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SSC Roll</p>
                    <p className="font-medium">{u.sscRoll}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SSC Reg</p>
                    <p className="font-medium">{u.sscReg}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SSC Group</p>
                    <p className="font-medium">{u.sscGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SSC Board</p>
                    <p className="font-medium">{u.sscBoard}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Registered</p>
                    <p className="font-medium">{u.createdAt ? format(new Date(u.createdAt), "PPp") : "N/A"}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  {resetPasswordUserId === u.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-[200px]">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="New password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          data-testid={`input-reset-password-${u.id}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid={`button-toggle-password-${u.id}`}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        disabled={resetPassword.isPending || newPassword.length < 6}
                        onClick={() => resetPassword.mutate({ userId: u.id, newPassword })}
                        data-testid={`button-confirm-reset-${u.id}`}
                      >
                        {resetPassword.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setResetPasswordUserId(null); setNewPassword(""); setShowPassword(false); }}
                        data-testid={`button-cancel-reset-${u.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setResetPasswordUserId(u.id)}
                      data-testid={`button-reset-password-${u.id}`}
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {(!filtered || filtered.length === 0) && <p className="text-sm text-muted-foreground">No users found.</p>}
    </div>
  );
}

function useDeleteMutation(endpoint: string, queryKey: string) {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });
}

function RegFormTab() {
  const { toast } = useToast();
  const { data: allUsers } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });
  const { data: timerRules } = useQuery<Array<{ hscYear: string; sscYear: string; status: string }>>({ queryKey: ["/api/admin/timer-rules"] });
  const [hscYear, setHscYear] = useState("");
  const [sscYear, setSscYear] = useState("");
  const [action, setAction] = useState("");

  const yearOptions = Array.from({ length: 9 }, (_, i) => String(2022 + i));

  const effectiveHsc = hscYear && hscYear !== "__clear__" ? hscYear : "";
  const effectiveSsc = sscYear && sscYear !== "__clear__" ? sscYear : "";

  const matchingUsers = allUsers?.filter((u) => {
    if (!effectiveHsc && !effectiveSsc) return false;
    if (effectiveHsc && effectiveSsc) return u.hscYear === effectiveHsc && u.sscYear === effectiveSsc;
    if (effectiveHsc) return u.hscYear === effectiveHsc;
    return u.sscYear === effectiveSsc;
  }) || [];

  const bulkAssign = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/bulk-assign", { hscYear: effectiveHsc, sscYear: effectiveSsc, action });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/timer-rules"] });
      toast({ title: data.message || `Updated ${data.count} user(s)` });
      setAction("");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Timer Rules (1st / 2nd Timer)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set timer status by year. This updates all existing users AND automatically applies to new registrations matching the selected year(s).
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">HSC Year</Label>
              <Select value={hscYear} onValueChange={setHscYear}>
                <SelectTrigger className="mt-1" data-testid="select-reg-hsc-year">
                  <SelectValue placeholder="Select HSC Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">All HSC Years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">SSC Year</Label>
              <Select value={sscYear} onValueChange={setSscYear}>
                <SelectTrigger className="mt-1" data-testid="select-reg-ssc-year">
                  <SelectValue placeholder="Select SSC Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__clear__">All SSC Years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(effectiveHsc || effectiveSsc) && (
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-sm font-medium mb-1">
                {matchingUsers.length} existing user(s) match
                {effectiveHsc ? ` HSC ${effectiveHsc}` : ""}
                {effectiveHsc && effectiveSsc ? " &" : ""}
                {effectiveSsc ? ` SSC ${effectiveSsc}` : ""}
              </p>
              <div className="flex flex-wrap gap-1 mt-2 max-h-32 overflow-y-auto">
                {matchingUsers.slice(0, 50).map((u) => (
                  <Badge key={u.id} variant="secondary" className="text-xs">
                    {u.fullName}
                    {(u as any).isSecondTimer && " (2nd)"}
                    {u.isRestricted && " (R)"}
                  </Badge>
                ))}
                {matchingUsers.length > 50 && (
                  <Badge variant="outline" className="text-xs">+{matchingUsers.length - 50} more</Badge>
                )}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Assign As</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="mt-1 max-w-xs" data-testid="select-reg-action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st_timer">1st Timer (No Penalty)</SelectItem>
                <SelectItem value="2nd_timer">2nd Timer (-3 Penalty)</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => bulkAssign.mutate()}
            disabled={(!effectiveHsc && !effectiveSsc) || !action || bulkAssign.isPending}
            data-testid="button-bulk-assign"
          >
            {bulkAssign.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
            ) : (
              <>Apply to {matchingUsers.length} Existing + All Future Users</>
            )}
          </Button>
        </CardContent>
      </Card>

      {timerRules && timerRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Saved Timer Rules
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These rules automatically apply to new users when they register.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timerRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 flex-wrap">
                  {rule.hscYear && <Badge variant="outline" className="text-xs">HSC {rule.hscYear}</Badge>}
                  {rule.sscYear && <Badge variant="outline" className="text-xs">SSC {rule.sscYear}</Badge>}
                  <Badge
                    variant={rule.status === "2nd_timer" ? "destructive" : "default"}
                    className="text-xs"
                  >
                    {rule.status === "2nd_timer" ? "2nd Timer (-3)" : "1st Timer"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-2xl font-bold">{allUsers?.filter((u) => !(u as any).isSecondTimer && !u.isRestricted).length ?? 0}</p>
              <p className="text-sm text-muted-foreground">1st Timers</p>
            </div>
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{allUsers?.filter((u) => (u as any).isSecondTimer).length ?? 0}</p>
              <p className="text-sm text-muted-foreground">2nd Timers</p>
            </div>
            <div className="p-4 rounded-md bg-muted/50">
              <p className="text-2xl font-bold text-destructive">{allUsers?.filter((u) => u.isRestricted).length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Restricted</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CoursesTab() {
  const { data: courseList, isLoading } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });
  const { data: allEnrollments } = useQuery<any[]>({ queryKey: ["/api/admin/enrollments"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [viewingCourseId, setViewingCourseId] = useState<number | null>(null);
  const [enrollFilter, setEnrollFilter] = useState<string>("pending");
  const deleteMutation = useDeleteMutation("/api/admin/courses", "/api/admin/courses");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({ title: "Course created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const enrollmentAction = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/enrollments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment updated" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const dismissEnrollment = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/enrollments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/enrollments"] });
      toast({ title: "Enrollment dismissed" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.price !== undefined) data.price = Number(data.price) || 0;
    if (data.offerPrice) data.offerPrice = Number(data.offerPrice);
    if (!data.access) data.access = "all";
    if (data.isVisible === undefined) data.isVisible = true;
    createMutation.mutate(data);
  };

  const courseEnrollments = viewingCourseId ? (allEnrollments?.filter((e: any) => e.courseId === viewingCourseId) || []) : [];
  const filteredEnrollments = courseEnrollments.filter((e: any) => enrollFilter === "all" || e.status === enrollFilter);
  const viewingCourse = courseList?.find((c) => c.id === viewingCourseId);

  const pendingCount = (courseId: number) => allEnrollments?.filter((e: any) => e.courseId === courseId && e.status === "pending").length || 0;
  const approvedCount = (courseId: number) => allEnrollments?.filter((e: any) => e.courseId === courseId && e.status === "approved").length || 0;

  if (viewingCourseId && viewingCourse) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => setViewingCourseId(null)} data-testid="button-back-courses">
          Back to Courses
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{viewingCourse.title} - Enrollments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["pending", "approved", "restricted", "declined", "all"].map((f) => (
                <Button key={f} size="sm" variant={enrollFilter === f ? "default" : "outline"} onClick={() => setEnrollFilter(f)} data-testid={`filter-enroll-${f}`}>
                  {f === "pending" ? `Pending (${courseEnrollments.filter((e: any) => e.status === "pending").length})` :
                   f === "approved" ? `Enrolled (${courseEnrollments.filter((e: any) => e.status === "approved").length})` :
                   f === "restricted" ? `Restricted (${courseEnrollments.filter((e: any) => e.status === "restricted").length})` :
                   f === "declined" ? `Declined (${courseEnrollments.filter((e: any) => e.status === "declined").length})` : "All"}
                </Button>
              ))}
            </div>
            {filteredEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No {enrollFilter === "all" ? "" : enrollFilter} enrollments.</p>
            ) : (
              <div className="space-y-2">
                {filteredEnrollments.map((e: any, idx: number) => (
                  <Card key={e.id} data-testid={`enrollment-row-${e.id}`}>
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                            <p className="text-sm font-medium">{e.userFullName}</p>
                            <Badge variant="secondary" className="text-xs">@{e.userName}</Badge>
                            <Badge variant={e.status === "approved" ? "default" : e.status === "pending" ? "outline" : "destructive"} className={`text-xs ${e.status === "restricted" ? "bg-orange-500 hover:bg-orange-600 text-white border-none" : ""}`}>
                              {e.status === "approved" ? "Enrolled" : e.status === "pending" ? "Pending" : e.status === "restricted" ? "Restricted" : "Declined"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{e.userEmail} | {e.userWhatsapp}</p>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {e.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => enrollmentAction.mutate({ id: e.id, status: "approved" })} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-approve-${e.id}`}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => enrollmentAction.mutate({ id: e.id, status: "declined" })} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-decline-${e.id}`}>
                                Decline
                              </Button>
                            </>
                          )}
                          {e.status === "approved" && (
                            <>
                              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => enrollmentAction.mutate({ id: e.id, status: "restricted" })} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-restrict-${e.id}`}>
                                Restrict
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => dismissEnrollment.mutate(e.id)} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-dismiss-${e.id}`}>
                                Dismiss
                              </Button>
                            </>
                          )}
                          {e.status === "restricted" && (
                            <>
                              <Button size="sm" onClick={() => enrollmentAction.mutate({ id: e.id, status: "approved" })} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-approve-${e.id}`}>
                                Re-approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => dismissEnrollment.mutate(e.id)} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-dismiss-${e.id}`}>
                                Dismiss
                              </Button>
                            </>
                          )}
                          {e.status === "declined" && (
                            <>
                              <Button size="sm" onClick={() => enrollmentAction.mutate({ id: e.id, status: "approved" })} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-approve-${e.id}`}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => dismissEnrollment.mutate(e.id)} disabled={enrollmentAction.isPending || dismissEnrollment.isPending} data-testid={`button-dismiss-${e.id}`}>
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-course">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Course
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-course-title" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <ImageUploader
                label="Banner Image"
                value={formData.bannerImage || ""}
                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
              />
              <div className="flex items-center gap-3 py-1">
                <Label className="text-xs">Free Course</Label>
                <Switch
                  checked={formData.isFree ?? false}
                  onCheckedChange={(v) => setFormData({ ...formData, isFree: v, price: v ? 0 : formData.price, offerPrice: v ? "" : formData.offerPrice })}
                  data-testid="switch-free-course"
                />
              </div>
              {!formData.isFree && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Price (BDT)</Label>
                    <Input type="number" value={formData.price ?? ""} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs">Offer Price (optional)</Label>
                    <Input type="number" value={formData.offerPrice ?? ""} onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })} placeholder="Leave empty if no offer" />
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs">Last Date (optional)</Label>
                <Input type="datetime-local" value={formData.lastDate || ""} onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Access</Label>
                  <Select value={formData.access || "all"} onValueChange={(v) => setFormData({ ...formData, access: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {courseList?.map((c) => (
            <Card key={c.id} data-testid={`card-course-${c.id}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex gap-3 min-w-0">
                    {c.bannerImage && (
                      <img src={c.bannerImage} alt="" className="w-16 h-12 rounded-md object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {Number(c.price) === 0 ? "Free" : `BDT ${c.price}`}
                        {c.offerPrice ? ` (Offer: BDT ${c.offerPrice})` : ""}
                        {" | "}{c.access}
                      </p>
                      {c.lastDate && (
                        <p className="text-xs text-muted-foreground">Last date: {format(new Date(c.lastDate), "PP")}</p>
                      )}
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {pendingCount(c.id) > 0 && (
                          <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 dark:text-amber-400">
                            {pendingCount(c.id)} Pending
                          </Badge>
                        )}
                        {approvedCount(c.id) > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {approvedCount(c.id)} Enrolled
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => { setViewingCourseId(c.id); setEnrollFilter("pending"); }} data-testid={`button-view-enrollments-${c.id}`}>
                      Enrollments
                    </Button>
                    <Badge variant={c.isVisible ? "default" : "outline"}>
                      {c.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { if (confirm("Delete this course?")) deleteMutation.mutate(c.id); }}
                      data-testid={`button-delete-course-${c.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!courseList || courseList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No courses yet.</p>}
        </div>
      )}
    </div>
  );
}

interface ImageAssignment {
  questionId: number;
  imageUrl: string;
}

function MockTestForm({
  initialData,
  onSubmit,
  isPending,
  onCancel,
  title,
  courses,
}: {
  initialData?: MockTest;
  onSubmit: (data: any) => void;
  isPending: boolean;
  onCancel: () => void;
  title: string;
  courses?: Course[];
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialData) {
      const pt = initialData.publishTime
        ? new Date(initialData.publishTime).toLocaleString("sv-SE", { timeZone: "Asia/Dhaka" }).replace(" ", "T").slice(0, 16)
        : "";
      return {
        title: initialData.title,
        tag: initialData.tag,
        duration: initialData.duration,
        publishTime: pt,
        access: initialData.access,
        isVisible: initialData.isVisible,
        courseId: initialData.courseId ?? "__none__",
      };
    }
    return {};
  });
  const [questionsJson, setQuestionsJson] = useState(() => {
    if (initialData && Array.isArray(initialData.questions) && (initialData.questions as any[]).length > 0) {
      return JSON.stringify(initialData.questions, null, 2);
    }
    return "";
  });
  const [jsonError, setJsonError] = useState("");
  const [imageAssignments, setImageAssignments] = useState<ImageAssignment[]>([]);
  const [assignId, setAssignId] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    const idNum = parseInt(assignId);
    if (!assignId || isNaN(idNum)) {
      toast({ title: "Enter a question ID first", variant: "destructive" });
      return;
    }
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/avif"];
    if (!file.type.startsWith("image/") && !validImageTypes.includes(file.type)) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large (max 10MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/request-url", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { objectPath } = await res.json();

      const existing = imageAssignments.find(a => a.questionId === idNum);
      if (existing) {
        setImageAssignments(imageAssignments.map(a => a.questionId === idNum ? { ...a, imageUrl: objectPath } : a));
      } else {
        setImageAssignments([...imageAssignments, { questionId: idNum, imageUrl: objectPath }]);
      }
      setAssignId("");
      toast({ title: `Image assigned to question #${idNum}` });
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeAssignment = (qId: number) => {
    setImageAssignments(imageAssignments.filter(a => a.questionId !== qId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalQuestions: any[] = [];
    if (questionsJson.trim()) {
      try {
        finalQuestions = JSON.parse(questionsJson);
        if (!Array.isArray(finalQuestions)) {
          setJsonError("Questions must be a JSON array");
          return;
        }
        setJsonError("");
      } catch {
        setJsonError("Invalid JSON format. Please check your syntax.");
        return;
      }
    }
    const publishTimeWithTZ = formData.publishTime ? formData.publishTime + "+06:00" : undefined;
    const courseIdVal = formData.courseId && formData.courseId !== "__none__" ? Number(formData.courseId) : null;
    const data = {
      ...formData,
      publishTime: publishTimeWithTZ,
      questions: finalQuestions,
      imageAssignments: imageAssignments.length > 0 ? imageAssignments : undefined,
      duration: Number(formData.duration) || 60,
      isVisible: formData.isVisible ?? true,
      access: formData.access || "all",
      courseId: courseIdVal,
    };
    onSubmit(data);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button size="icon" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-mock-title" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tag</Label>
              <Select value={formData.tag || ""} onValueChange={(v) => setFormData({ ...formData, tag: v })}>
                <SelectTrigger data-testid="select-mock-tag"><SelectValue placeholder="Select tag" /></SelectTrigger>
                <SelectContent>
                  {MOCK_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Duration (minutes)</Label>
              <Input type="number" value={formData.duration ?? 60} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Publish Date & Time (Bangladesh Time)</Label>
            <Input
              type="datetime-local"
              value={formData.publishTime || ""}
              onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
              required
              data-testid="input-mock-publish-time"
            />
            <p className="text-xs text-muted-foreground mt-0.5">Time is in Bangladesh Standard Time (BST, UTC+6)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Access</Label>
              <Select value={formData.access || "all"} onValueChange={(v) => setFormData({ ...formData, access: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Label className="text-xs">Visible</Label>
              <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Course (optional)</Label>
            <Select value={String(formData.courseId || "__none__")} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
              <SelectTrigger data-testid="select-mock-course"><SelectValue placeholder="Standalone (no course)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Standalone (no course)</SelectItem>
                {courses?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Questions (JSON)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Format: [{`{ "id": 1, "section": "EngP", "question": "...", "image": null, "passage": null, "options": ["A","B","C","D"], "correctAnswer": 0 }`}]
              <br />Sections: EngP, EngO, AS, PS. correctAnswer: 0=A, 1=B, 2=C, 3=D
            </p>
            <Textarea
              value={questionsJson}
              onChange={(e) => { setQuestionsJson(e.target.value); setJsonError(""); }}
              rows={12}
              className="font-mono text-xs"
              placeholder="Paste your questions JSON array here..."
              data-testid="textarea-mock-questions"
            />
            {jsonError && <p className="text-xs text-destructive mt-1">{jsonError}</p>}
          </div>

          <div>
            <Label className="text-xs mb-2 block">Upload Images for Questions</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload an image and assign it to a question ID. The image will replace the question's "image" field when saved.
            </p>
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-shrink-0">
                <Label className="text-xs">Question ID</Label>
                <Input
                  type="number"
                  value={assignId}
                  onChange={(e) => setAssignId(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-24"
                  data-testid="input-assign-id"
                />
              </div>
              <div>
                <Label className="text-xs">Upload</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*,.webp,.png,.jpg,.jpeg,.gif,.svg,.bmp"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = "";
                    }}
                    className="text-xs"
                    data-testid="input-upload-question-img"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            </div>

            {imageAssignments.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs">Assigned Images:</Label>
                {imageAssignments.map((a) => (
                  <div key={a.questionId} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Q#{a.questionId}</Badge>
                    <img src={a.imageUrl} alt={`Q${a.questionId}`} className="w-12 h-9 rounded object-cover" />
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">{a.imageUrl}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeAssignment(a.questionId)} data-testid={`button-remove-img-${a.questionId}`}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              {initialData ? "Update Mock Test" : "Create Mock Test"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function MockTestsTab() {
  const { data: testList, isLoading } = useQuery<MockTest[]>({ queryKey: ["/api/admin/mock-tests"] });
  const { data: courseList } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);
  const deleteMutation = useDeleteMutation("/api/admin/mock-tests", "/api/admin/mock-tests");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/mock-tests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mock-tests"] });
      toast({ title: "Mock test created" });
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/mock-tests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mock-tests"] });
      toast({ title: "Mock test updated" });
      setEditingTest(null);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      {!isCreating && !editingTest ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-mock">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Mock Test
        </Button>
      ) : isCreating ? (
        <MockTestForm
          title="Create Mock Test"
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
          onCancel={() => setIsCreating(false)}
          courses={courseList}
        />
      ) : editingTest ? (
        <MockTestForm
          title="Edit Mock Test"
          initialData={editingTest}
          onSubmit={(data) => updateMutation.mutate({ id: editingTest.id, data })}
          isPending={updateMutation.isPending}
          onCancel={() => setEditingTest(null)}
          courses={courseList}
        />
      ) : null}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {testList?.map((t) => (
            <MockTestCard
              key={t.id}
              test={t}
              onEdit={() => { setEditingTest(t); setIsCreating(false); }}
              onDelete={() => deleteMutation.mutate(t.id)}
              courseName={t.courseId ? courseList?.find((c) => c.id === t.courseId)?.title : undefined}
            />
          ))}
          {(!testList || testList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No mock tests yet.</p>}
        </div>
      )}
    </div>
  );
}

function MockTestCard({ test, onEdit, onDelete, courseName }: { test: MockTest; onEdit: () => void; onDelete: () => void; courseName?: string }) {
  const questions = Array.isArray(test.questions) ? test.questions : [];
  const [showSubmissions, setShowSubmissions] = useState(false);

  return (
    <Card data-testid={`card-mock-${test.id}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-sm font-medium">{test.title}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="secondary" className="text-xs">{test.tag}</Badge>
              <span className="text-xs text-muted-foreground">{test.duration} min</span>
              <span className="text-xs text-muted-foreground">{questions.length} questions</span>
              <span className="text-xs text-muted-foreground">{test.access}</span>
              {courseName && <Badge variant="outline" className="text-xs" data-testid={`badge-mock-course-${test.id}`}>{courseName}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Publish: {test.publishTime ? new Date(test.publishTime).toLocaleString("en-US", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }) + " (BST)" : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={test.isVisible ? "default" : "outline"}>
              {test.isVisible ? "Visible" : "Hidden"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSubmissions(!showSubmissions)}
              data-testid={`button-submissions-mock-${test.id}`}
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1" />
              Submissions
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              data-testid={`button-edit-mock-${test.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { if (confirm("Delete this mock test and all its submissions?")) onDelete(); }}
              data-testid={`button-delete-mock-${test.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {showSubmissions && (
          <div className="mt-4 pt-4 border-t">
            <MockSubmissionsList mockTestId={test.id} mockTitle={test.title} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SubmissionRow {
  id: number;
  mockTestId: number;
  userId: number;
  totalMarks: number | null;
  engPMarks: number | null;
  engOMarks: number | null;
  asMarks: number | null;
  psMarks: number | null;
  netMarks: number | null;
  passed: boolean | null;
  isSubmitted: boolean;
  submittedAt: string | null;
  startedAt: string;
  username: string;
  fullName: string;
  whatsapp: string;
}

function MockSubmissionsList({ mockTestId, mockTitle }: { mockTestId: number; mockTitle: string }) {
  const { data: submissions, isLoading } = useQuery<SubmissionRow[]>({
    queryKey: [`/api/admin/mock-tests/${mockTestId}/submissions`],
  });

  const [search, setSearch] = useState("");
  const [passFilter, setPassFilter] = useState<string>("all");

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  const submitted = submissions?.filter(s => s.isSubmitted) || [];

  const filtered = submitted.filter((s) => {
    if (passFilter === "passed" && !s.passed) return false;
    if (passFilter === "failed" && s.passed) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.username.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q) || s.whatsapp.includes(q);
    }
    return true;
  });

  const passedCount = submitted.filter(s => s.passed).length;
  const failedCount = submitted.filter(s => !s.passed).length;

  return (
    <div className="space-y-3" data-testid={`submissions-panel-${mockTestId}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">
            {submitted.length} Submission{submitted.length !== 1 ? "s" : ""}
          </p>
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> {passedCount} Passed
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <XCircle className="h-3 w-3 mr-1 text-destructive" /> {failedCount} Failed
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
            data-testid={`input-search-submissions-${mockTestId}`}
          />
        </div>
        <Select value={passFilter} onValueChange={setPassFilter}>
          <SelectTrigger className="w-28" data-testid={`select-filter-${mockTestId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" data-testid={`table-submissions-${mockTestId}`}>
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-2 font-medium">#</th>
                <th className="py-2 pr-2 font-medium">Username</th>
                <th className="py-2 pr-2 font-medium">Name</th>
                <th className="py-2 pr-2 font-medium">WhatsApp</th>
                <th className="py-2 pr-2 font-medium text-center">EngP</th>
                <th className="py-2 pr-2 font-medium text-center">EngO</th>
                <th className="py-2 pr-2 font-medium text-center">AS</th>
                <th className="py-2 pr-2 font-medium text-center">PS</th>
                <th className="py-2 pr-2 font-medium text-center">Total</th>
                <th className="py-2 pr-2 font-medium text-center">Net</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id} className="border-b last:border-0" data-testid={`row-submission-${s.id}`}>
                  <td className="py-2 pr-2 text-muted-foreground">{idx + 1}</td>
                  <td className="py-2 pr-2 font-mono">{s.username}</td>
                  <td className="py-2 pr-2">{s.fullName}</td>
                  <td className="py-2 pr-2">{s.whatsapp}</td>
                  <td className="py-2 pr-2 text-center">{s.engPMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 pr-2 text-center">{s.engOMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 pr-2 text-center">{s.asMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 pr-2 text-center">{s.psMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 pr-2 text-center font-medium">{s.totalMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 pr-2 text-center font-medium">{s.netMarks?.toFixed(1) ?? "-"}</td>
                  <td className="py-2 text-center">
                    {s.passed ? (
                      <Badge variant="default" className="bg-green-600 text-xs">Pass</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Fail</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-2">
          {submitted.length === 0 ? "No submissions yet for this mock test." : "No matching submissions found."}
        </p>
      )}
    </div>
  );
}

function ClassesTab() {
  const { data: classList, isLoading } = useQuery<Class[]>({ queryKey: ["/api/admin/classes"] });
  const { data: courseList } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editData, setEditData] = useState<Record<string, any>>({});
  const deleteMutation = useDeleteMutation("/api/admin/classes", "/api/admin/classes");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes"] });
      toast({ title: "Class created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/classes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes"] });
      toast({ title: "Class updated" });
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const startEdit = (cls: Class) => {
    setEditingId(cls.id);
    setEditData({
      title: cls.title,
      videoUrl: cls.videoUrl,
      tag: cls.tag,
      description: cls.description || "",
      thumbnail: cls.thumbnail || "",
      access: cls.access,
      isVisible: cls.isVisible,
      courseId: cls.courseId ?? "__none__",
    });
  };

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-class">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Class
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={(e) => { e.preventDefault(); const courseIdVal = formData.courseId && formData.courseId !== "__none__" ? Number(formData.courseId) : null; createMutation.mutate({ ...formData, isVisible: formData.isVisible ?? true, access: formData.access || "all", courseId: courseIdVal }); }} className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required data-testid="input-class-title" />
              </div>
              <div>
                <Label className="text-xs">Video URL</Label>
                <Input value={formData.videoUrl || ""} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} required placeholder="YouTube/Drive URL" />
              </div>
              <ImageUploader
                label="Thumbnail"
                value={formData.thumbnail || ""}
                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
              />
              <div>
                <Label className="text-xs">Tag</Label>
                <Select value={formData.tag || ""} onValueChange={(v) => setFormData({ ...formData, tag: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                  <SelectContent>
                    {CLASS_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Course (optional)</Label>
                <Select value={String(formData.courseId || "__none__")} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger data-testid="select-class-course"><SelectValue placeholder="Standalone (no course)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Standalone (no course)</SelectItem>
                    {courseList?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Access</Label>
                  <Select value={formData.access || "all"} onValueChange={(v) => setFormData({ ...formData, access: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {classList?.map((cls) => (
            <Card key={cls.id} data-testid={`card-class-${cls.id}`}>
              <CardContent className="pt-4">
                {editingId === cls.id ? (
                  <form onSubmit={(e) => { e.preventDefault(); const courseIdVal = editData.courseId && editData.courseId !== "__none__" ? Number(editData.courseId) : null; updateMutation.mutate({ id: cls.id, data: { ...editData, courseId: courseIdVal } }); }} className="space-y-3">
                    <div>
                      <Label className="text-xs">Title</Label>
                      <Input value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} required />
                    </div>
                    <div>
                      <Label className="text-xs">Video URL</Label>
                      <Input value={editData.videoUrl || ""} onChange={(e) => setEditData({ ...editData, videoUrl: e.target.value })} required />
                    </div>
                    <ImageUploader
                      label="Thumbnail"
                      value={editData.thumbnail || ""}
                      onChange={(url) => setEditData({ ...editData, thumbnail: url })}
                    />
                    <div>
                      <Label className="text-xs">Tag</Label>
                      <Select value={editData.tag || ""} onValueChange={(v) => setEditData({ ...editData, tag: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CLASS_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea value={editData.description || ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Course (optional)</Label>
                      <Select value={String(editData.courseId || "__none__")} onValueChange={(v) => setEditData({ ...editData, courseId: v })}>
                        <SelectTrigger data-testid="select-edit-class-course"><SelectValue placeholder="Standalone (no course)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Standalone (no course)</SelectItem>
                          {courseList?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Access</Label>
                        <Select value={editData.access || "all"} onValueChange={(v) => setEditData({ ...editData, access: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ACCESS_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <Label className="text-xs">Visible</Label>
                        <Switch checked={editData.isVisible ?? true} onCheckedChange={(v) => setEditData({ ...editData, isVisible: v })} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                        Save
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex gap-3 min-w-0">
                      {cls.thumbnail && (
                        <img src={cls.thumbnail} alt="" className="w-16 h-12 rounded-md object-cover shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{cls.title}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <Badge variant="secondary" className="text-xs">{cls.tag}</Badge>
                          <span className="text-xs text-muted-foreground">{cls.access}</span>
                          {cls.courseId && courseList?.find((c) => c.id === cls.courseId) && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-class-course-${cls.id}`}>{courseList.find((c) => c.id === cls.courseId)!.title}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={cls.isVisible ? "default" : "outline"}>
                        {cls.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(cls)} data-testid={`button-edit-class-${cls.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { if (confirm("Delete this class?")) deleteMutation.mutate(cls.id); }}
                        data-testid={`button-delete-class-${cls.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {(!classList || classList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No classes yet.</p>}
        </div>
      )}
    </div>
  );
}

function ResourcesTab() {
  const { data: resourceList, isLoading } = useQuery<Resource[]>({ queryKey: ["/api/admin/resources"] });
  const { data: courseList } = useQuery<Course[]>({ queryKey: ["/api/admin/courses"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const deleteMutation = useDeleteMutation("/api/admin/resources", "/api/admin/resources");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/resources", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      toast({ title: "Resource created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-resource">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Resource
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={(e) => { e.preventDefault(); const courseIdVal = formData.courseId && formData.courseId !== "__none__" ? Number(formData.courseId) : null; createMutation.mutate({ ...formData, isVisible: formData.isVisible ?? true, access: formData.access || "all", courseId: courseIdVal }); }} className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">File URL</Label>
                <Input value={formData.fileUrl || ""} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} required placeholder="Google Drive / link" />
              </div>
              <div>
                <Label className="text-xs">Tag</Label>
                <Select value={formData.tag || ""} onValueChange={(v) => setFormData({ ...formData, tag: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Course (optional)</Label>
                <Select value={String(formData.courseId || "__none__")} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger data-testid="select-resource-course"><SelectValue placeholder="Standalone (no course)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Standalone (no course)</SelectItem>
                    {courseList?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Access</Label>
                  <Select value={formData.access || "all"} onValueChange={(v) => setFormData({ ...formData, access: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {resourceList?.map((r) => (
            <Card key={r.id} data-testid={`card-resource-${r.id}`}>
              <CardContent className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="secondary" className="text-xs">{r.tag}</Badge>
                    <span className="text-xs text-muted-foreground">{r.access}</span>
                    {r.courseId && courseList?.find((c) => c.id === r.courseId) && (
                      <Badge variant="outline" className="text-xs" data-testid={`badge-resource-course-${r.id}`}>{courseList.find((c) => c.id === r.courseId)!.title}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={r.isVisible ? "default" : "outline"}>
                    {r.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { if (confirm("Delete this resource?")) deleteMutation.mutate(r.id); }}
                    data-testid={`button-delete-resource-${r.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!resourceList || resourceList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No resources yet.</p>}
        </div>
      )}
    </div>
  );
}

function NoticesTab() {
  const { data: noticeList, isLoading } = useQuery<Notice[]>({ queryKey: ["/api/admin/notices"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const deleteMutation = useDeleteMutation("/api/admin/notices", "/api/admin/notices");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/notices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({ title: "Notice created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-notice">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Notice
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...formData, isVisible: formData.isVisible ?? true }); }} className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Tag</Label>
                <Select value={formData.tag || ""} onValueChange={(v) => setFormData({ ...formData, tag: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tag" /></SelectTrigger>
                  <SelectContent>
                    {NOTICE_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">URL (optional)</Label>
                <Input value={formData.url || ""} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com" data-testid="input-notice-url" />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal" data-testid="button-notice-date">
                      <Calendar className="h-3.5 w-3.5 mr-2" />
                      {formData.date ? format(new Date(formData.date), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(d) => setFormData({ ...formData, date: d?.toISOString() || null })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Visible</Label>
                <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {noticeList?.map((n) => (
            <Card key={n.id} data-testid={`card-notice-${n.id}`}>
              <CardContent className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="secondary" className="text-xs">{n.tag}</Badge>
                    <span className="text-xs text-muted-foreground">{n.date ? format(new Date(n.date), "PP") : n.createdAt ? format(new Date(n.createdAt), "PP") : ""}</span>
                    {n.url && <Badge variant="outline" className="text-xs">Has Link</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={n.isVisible ? "default" : "outline"}>
                    {n.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { if (confirm("Delete this notice?")) deleteMutation.mutate(n.id); }}
                    data-testid={`button-delete-notice-${n.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!noticeList || noticeList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No notices yet.</p>}
        </div>
      )}
    </div>
  );
}

function BannersTab() {
  const { data: bannerList, isLoading } = useQuery<HeroBanner[]>({ queryKey: ["/api/admin/banners"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const deleteMutation = useDeleteMutation("/api/admin/banners", "/api/admin/banners");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/banners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banner created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-banner">
          <Plus className="h-3.5 w-3.5 mr-1" /> Create Banner
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...formData, isVisible: formData.isVisible ?? true, sortOrder: Number(formData.sortOrder) || 0 }); }} className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <ImageUploader
                label="Banner Image"
                value={formData.imageUrl || ""}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />
              <div>
                <Label className="text-xs">Link URL</Label>
                <Input value={formData.linkUrl || ""} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Sort Order</Label>
                  <Input type="number" value={formData.sortOrder ?? 0} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {bannerList?.map((b) => (
            <Card key={b.id} data-testid={`card-banner-${b.id}`}>
              <CardContent className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-3 min-w-0">
                  {b.imageUrl && <img src={b.imageUrl} alt="" className="w-20 h-12 rounded-md object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground">Order: {b.sortOrder}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={b.isVisible ? "default" : "outline"}>
                    {b.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { if (confirm("Delete this banner?")) deleteMutation.mutate(b.id); }}
                    data-testid={`button-delete-banner-${b.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!bannerList || bannerList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No banners yet.</p>}
        </div>
      )}
    </div>
  );
}

function TeamTab() {
  const { data: teamList, isLoading } = useQuery<TeamMember[]>({ queryKey: ["/api/admin/team"] });
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const deleteMutation = useDeleteMutation("/api/admin/team", "/api/admin/team");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/team", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team"] });
      toast({ title: "Team member created" });
      setFormData({});
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      {!isCreating ? (
        <Button size="sm" onClick={() => setIsCreating(true)} data-testid="button-create-team">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Team Member
        </Button>
      ) : (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...formData, isVisible: formData.isVisible ?? true, sortOrder: Number(formData.sortOrder) || 0 }); }} className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label className="text-xs">Post / Title</Label>
                <Input value={formData.post || ""} onChange={(e) => setFormData({ ...formData, post: e.target.value })} required />
              </div>
              <ImageUploader
                label="Photo"
                value={formData.photo || ""}
                onChange={(url) => setFormData({ ...formData, photo: url })}
              />
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Sort Order</Label>
                  <Input type="number" value={formData.sortOrder ?? 0} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Label className="text-xs">Visible</Label>
                  <Switch checked={formData.isVisible ?? true} onCheckedChange={(v) => setFormData({ ...formData, isVisible: v })} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Skeleton className="h-48 w-full mt-4" /> : (
        <div className="space-y-2 mt-4">
          {teamList?.map((m) => (
            <Card key={m.id} data-testid={`card-team-${m.id}`}>
              <CardContent className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-3 min-w-0">
                  {m.photo && <img src={m.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.post}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={m.isVisible ? "default" : "outline"}>
                    {m.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { if (confirm("Delete this team member?")) deleteMutation.mutate(m.id); }}
                    data-testid={`button-delete-team-${m.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!teamList || teamList.length === 0) && <p className="text-sm text-muted-foreground mt-4">No team members yet.</p>}
        </div>
      )}
    </div>
  );
}
