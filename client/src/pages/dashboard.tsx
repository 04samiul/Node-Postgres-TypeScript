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
import { BookOpen, FileText, Play, Calendar, User, Award, Clock, Eye, Crown, Pencil, X, Save, Loader2 } from "lucide-react";
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
      <Card data-testid="card-enrolled-courses">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Enrolled Courses
            {enrolled.length > 0 && <Badge variant="default" className="text-xs">{enrolled.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
            </div>
          ) : enrolled.length > 0 ? (
            <div className="space-y-2">
              {enrolled.map((e: any) => (
                <div key={e.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50" data-testid={`enrollment-${e.id}`}>
                  <BookOpen className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm truncate flex-1">{e.courseTitle || `Course #${e.courseId}`}</span>
                  <Badge variant="default" className="text-xs shrink-0 bg-emerald-600">Enrolled</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No enrolled courses yet.</p>
          )}
        </CardContent>
      </Card>

      {(isLoading || pending.length > 0) && (
        <Card data-testid="card-pending-courses">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Requests
              {pending.length > 0 && <Badge variant="outline" className="text-xs">{pending.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50" data-testid={`enrollment-pending-${e.id}`}>
                    <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="text-sm truncate flex-1">{e.courseTitle || `Course #${e.courseId}`}</span>
                    <Badge variant="outline" className="text-xs shrink-0 border-amber-500 text-amber-600 dark:text-amber-400">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(isLoading || declined.length > 0) && (
        <Card data-testid="card-declined-courses">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              Declined Requests
              {declined.length > 0 && <Badge variant="destructive" className="text-xs">{declined.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (<Skeleton key={i} className="h-10 w-full" />))}
              </div>
            ) : (
              <div className="space-y-2">
                {declined.map((e: any) => (
                  <div key={e.id} className="flex flex-col gap-2 p-3 rounded-md bg-red-50/50 border border-red-100" data-testid={`enrollment-declined-${e.id}`}>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 shrink-0 text-red-500" />
                      <span className="text-sm font-medium truncate flex-1">{e.courseTitle || `Course #${e.courseId}`}</span>
                      <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Declined</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Your enrollment request was declined. You can try enrolling again.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-8 border-red-200 hover:bg-red-50 text-red-600"
                      onClick={() => enrollMutation.mutate(e.courseId)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "Re-enroll"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
