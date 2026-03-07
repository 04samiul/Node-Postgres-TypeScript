import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { BookOpen, FileText, Play, Calendar, User, Award, Clock, Eye, EyeOff, Crown, Pencil, X, Save, Loader2, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MockSubmission, Course, Enrollment } from "@shared/schema";
import { BANGLADESH_BOARDS, HSC_GROUPS } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

type SubmissionWithTitle = MockSubmission & { mockTestTitle?: string };

export default function Dashboard() {
  useSEO({ title: "Dashboard", description: "Your Crack-CU student dashboard. Track your progress, view enrolled courses, and check mock test submissions.", path: "/dashboard", noIndex: true });

  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const isPremium = user.isPremium;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${isPremium ? "p-4 rounded-md border border-yellow-500/30 dark:border-yellow-600/40 bg-yellow-50/60 dark:bg-yellow-900/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={`h-14 w-14 border-2 ${isPremium ? "border-yellow-500 dark:border-yellow-400" : "border-border"}`} data-testid="avatar-profile">
                <AvatarFallback className={`text-lg font-bold ${isPremium ? "bg-yellow-500 dark:bg-yellow-600 text-white" : "bg-primary text-primary-foreground"}`}>
                  {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {isPremium && (
                <div className="absolute -top-2.5 -right-1 drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]" data-testid="icon-premium-crown">
                  <Crown className="h-5 w-5 text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-welcome">Welcome, {user.fullName}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isPremium ? (
              <Badge className="bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-600 dark:border-yellow-500" data-testid="badge-premium">
                <Crown className="h-3 w-3 mr-1 fill-white" /> Premium
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
            <Badge variant="secondary">{user.role}</Badge>
            <Badge variant="outline" className={user.isSecondTimer ? "border-amber-500 text-amber-600 dark:text-amber-400" : ""} data-testid="badge-timer-status">
              {user.isSecondTimer ? "2nd Timer" : "1st Timer"}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard user={user} />
          <ChangePasswordCard />
          <RecentSubmissions userId={user.id} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <EnrolledCourses userId={user.id} />
        </div>
      </div>
    </div>
  );
}

function ProfileCard({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    hscRoll: user.hscRoll || "",
    hscReg: user.hscReg || "",
    hscGroup: user.hscGroup || "",
    hscBoard: user.hscBoard || "",
    sscRoll: user.sscRoll || "",
    sscReg: user.sscReg || "",
    sscGroup: user.sscGroup || "",
    sscBoard: user.sscBoard || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated successfully" });
      setEditing(false);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  if (!editing) {
    return (
      <Card data-testid="card-profile">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-base">Profile Information</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} data-testid="button-edit-profile">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Full Name</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">WhatsApp</p>
              <p className="font-medium">{user.whatsapp}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Only Admin can change. Contact admin.</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Username</p>
              <p className="font-medium font-mono">{user.username}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">HSC</p>
              <p className="font-medium">{user.hscGroup} | {user.hscYear} | {user.hscBoard}</p>
              <p className="text-xs text-muted-foreground">Roll: {user.hscRoll} | Reg: {user.hscReg}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">SSC</p>
              <p className="font-medium">{user.sscGroup} | {user.sscYear} | {user.sscBoard}</p>
              <p className="text-xs text-muted-foreground">Roll: {user.sscRoll} | Reg: {user.sscReg}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-profile-edit">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base">Edit Profile</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)} data-testid="button-cancel-edit">
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Full Name</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} data-testid="input-edit-name" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="input-edit-email" />
          </div>
          <div>
            <Label className="text-xs">WhatsApp</Label>
            <Input value={user.whatsapp} disabled className="opacity-60" />
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Only Admin can change. Contact admin.</p>
          </div>
          <div>
            <Label className="text-xs">Username</Label>
            <Input value={user.username} disabled className="opacity-60 font-mono" />
          </div>
          <div>
            <Label className="text-xs">HSC Roll</Label>
            <Input value={form.hscRoll} onChange={(e) => setForm({ ...form, hscRoll: e.target.value })} data-testid="input-edit-hsc-roll" />
          </div>
          <div>
            <Label className="text-xs">HSC Reg</Label>
            <Input value={form.hscReg} onChange={(e) => setForm({ ...form, hscReg: e.target.value })} data-testid="input-edit-hsc-reg" />
          </div>
          <div>
            <Label className="text-xs">HSC Group</Label>
            <Select value={form.hscGroup} onValueChange={(v) => setForm({ ...form, hscGroup: v })}>
              <SelectTrigger data-testid="select-edit-hsc-group"><SelectValue /></SelectTrigger>
              <SelectContent>
                {HSC_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">HSC Board</Label>
            <Select value={form.hscBoard} onValueChange={(v) => setForm({ ...form, hscBoard: v })}>
              <SelectTrigger data-testid="select-edit-hsc-board"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BANGLADESH_BOARDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">SSC Roll</Label>
            <Input value={form.sscRoll} onChange={(e) => setForm({ ...form, sscRoll: e.target.value })} data-testid="input-edit-ssc-roll" />
          </div>
          <div>
            <Label className="text-xs">SSC Reg</Label>
            <Input value={form.sscReg} onChange={(e) => setForm({ ...form, sscReg: e.target.value })} data-testid="input-edit-ssc-reg" />
          </div>
          <div>
            <Label className="text-xs">SSC Group</Label>
            <Select value={form.sscGroup} onValueChange={(v) => setForm({ ...form, sscGroup: v })}>
              <SelectTrigger data-testid="select-edit-ssc-group"><SelectValue /></SelectTrigger>
              <SelectContent>
                {HSC_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">SSC Board</Label>
            <Select value={form.sscBoard} onValueChange={(v) => setForm({ ...form, sscBoard: v })}>
              <SelectTrigger data-testid="select-edit-ssc-board"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BANGLADESH_BOARDS.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} data-testid="button-save-profile">
            <Save className="h-3.5 w-3.5 mr-1" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePasswordCard() {
  const { toast } = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, newP: false, confirm: false });

  const changeMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  function handleSubmit() {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast({ title: "All fields are required", variant: "destructive" });
    }
    if (form.newPassword.length < 6) {
      return toast({ title: "New password must be at least 6 characters", variant: "destructive" });
    }
    if (form.newPassword !== form.confirmPassword) {
      return toast({ title: "New passwords do not match", variant: "destructive" });
    }
    changeMutation.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  }

  function PasswordInput({ id, label, field, showKey }: { id: string; label: string; field: keyof typeof form; showKey: keyof typeof show }) {
    return (
      <div>
        <Label className="text-xs">{label}</Label>
        <div className="relative">
          <Input
            id={id}
            type={show[showKey] ? "text" : "password"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder="••••••••"
            data-testid={`input-${id}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
            data-testid={`button-toggle-${id}`}
          >
            {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card data-testid="card-change-password">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4 w-4" /> Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PasswordInput id="current-password" label="Current Password" field="currentPassword" showKey="current" />
          <PasswordInput id="new-password" label="New Password" field="newPassword" showKey="newP" />
          <PasswordInput id="confirm-password" label="Confirm New Password" field="confirmPassword" showKey="confirm" />
        </div>
        <div className="mt-4">
          <Button onClick={handleSubmit} disabled={changeMutation.isPending} data-testid="button-change-password">
            {changeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <KeyRound className="h-3.5 w-3.5 mr-1" />}
            {changeMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSubmissions({ userId }: { userId: number }) {
  const { data: submissions, isLoading } = useQuery<SubmissionWithTitle[]>({
    queryKey: ["/api/my-submissions"],
  });

  return (
    <Card data-testid="card-submissions">
      <CardHeader>
        <CardTitle className="text-base">Recent Mock Tests</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (<Skeleton key={i} className="h-12 w-full" />))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50" data-testid={`submission-${sub.id}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sub.mockTestTitle || `Mock #${sub.mockTestId}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {sub.submittedAt ? format(new Date(sub.submittedAt), "MMM dd, yyyy") : "In progress"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.isSubmitted ? (
                    <>
                      <Badge variant={sub.passed ? "default" : "destructive"} className={sub.passed ? "bg-green-600" : ""}>
                        {sub.netMarks?.toFixed(1)}
                      </Badge>
                      <Link href={`/mock-review/${sub.id}`}>
                        <Button size="sm" variant="outline" data-testid={`button-review-${sub.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Review
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Badge variant="outline">Ongoing</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No mock test submissions yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card data-testid="card-quick-actions">
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/mock-tests">
          <Button variant="outline" className="w-full justify-start" data-testid="action-mock-tests">
            <Play className="h-4 w-4 mr-2" />
            Take a Mock Test
          </Button>
        </Link>
        <Link href="/courses">
          <Button variant="outline" className="w-full justify-start" data-testid="action-courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Courses
          </Button>
        </Link>
        <Link href="/resources">
          <Button variant="outline" className="w-full justify-start" data-testid="action-resources">
            <FileText className="h-4 w-4 mr-2" />
            Study Resources
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function EnrolledCourses({ userId }: { userId: number }) {
  const { data: enrollments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/my-enrollments"],
  });

  const enrolled = enrollments?.filter((e: any) => e.status === "approved") || [];
  const pending = enrollments?.filter((e: any) => e.status === "pending") || [];
  const restricted = enrollments?.filter((e: any) => e.status === "restricted") || [];
  const declined = enrollments?.filter((e: any) => e.status === "declined") || [];

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", `/api/enroll/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200/60 dark:border-emerald-800/40 overflow-hidden" data-testid="card-enrolled-courses">
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            My Courses
            {enrolled.length > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-none text-xs">
                {enrolled.length} Enrolled
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (<Skeleton key={i} className="h-16 w-full rounded-lg" />))}
            </div>
          ) : enrolled.length > 0 ? (
            <div className="space-y-3">
              {enrolled.map((e: any, idx: number) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/courses/${e.courseId}`}>
                    <div className="group flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer" data-testid={`enrollment-${e.id}`}>
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {e.courseTitle || `Course #${e.courseId}`}
                        </span>
                        <span className="text-xs text-emerald-600/70 dark:text-emerald-400/60">Active Enrollment</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] px-2 shadow-sm">
                          <Award className="h-2.5 w-2.5 mr-0.5" />
                          Enrolled
                        </Badge>
                        <Play className="h-3.5 w-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">No enrolled courses yet</p>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="text-xs" data-testid="button-browse-courses">
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {(isLoading || pending.length > 0) && (
        <Card className="border-amber-200/60 dark:border-amber-800/40 overflow-hidden" data-testid="card-pending-courses">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              Pending Requests
              {pending.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-none text-xs">
                  {pending.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (<Skeleton key={i} className="h-14 w-full rounded-lg" />))}
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((e: any, idx: number) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-800/30"
                    data-testid={`enrollment-pending-${e.id}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Clock className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{e.courseTitle || `Course #${e.courseId}`}</span>
                      <span className="text-xs text-amber-600/70 dark:text-amber-400/60">Awaiting admin approval</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-none text-[10px] px-2 shrink-0">
                      Pending
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(isLoading || restricted.length > 0) && (
        <Card className="border-orange-200/60 dark:border-orange-800/40 overflow-hidden" data-testid="card-restricted-courses">
          <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <X className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              Restricted
              {restricted.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-none text-xs">
                  {restricted.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (<Skeleton key={i} className="h-14 w-full rounded-lg" />))}
              </div>
            ) : (
              <div className="space-y-3">
                {restricted.map((e: any, idx: number) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-800/30"
                    data-testid={`enrollment-restricted-${e.id}`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                      <X className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{e.courseTitle || `Course #${e.courseId}`}</span>
                      <span className="text-xs text-orange-600/70 dark:text-orange-400/60">Access has been restricted</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-none text-[10px] px-2 shrink-0">
                      Restricted
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(isLoading || declined.length > 0) && (
        <Card className="border-red-200/60 dark:border-red-800/40 overflow-hidden" data-testid="card-declined-courses">
          <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <X className="h-4 w-4 text-red-500" />
              </div>
              Declined Requests
              {declined.length > 0 && (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-none text-xs">
                  {declined.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (<Skeleton key={i} className="h-16 w-full rounded-lg" />))}
              </div>
            ) : (
              <div className="space-y-3">
                {declined.map((e: any, idx: number) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex flex-col gap-2.5 p-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-800/30"
                    data-testid={`enrollment-declined-${e.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0 shadow-sm">
                        <X className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{e.courseTitle || `Course #${e.courseId}`}</span>
                        <span className="text-xs text-red-500/70 dark:text-red-400/60">Enrollment was declined</span>
                      </div>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-none text-[10px] px-2 shrink-0">
                        Declined
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-8 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 rounded-lg transition-colors"
                      onClick={() => enrollMutation.mutate(e.courseId)}
                      disabled={enrollMutation.isPending}
                      data-testid={`button-reenroll-${e.courseId}`}
                    >
                      {enrollMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "Re-enroll"}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
