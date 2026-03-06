import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  BookOpen, Calendar, Clock, Crown, Download, ExternalLink,
  FileText, Image as ImageIcon, Loader2, Lock, Play, Video,
  CheckCircle2, ArrowLeft,
} from "lucide-react";
import type { Course, Class, MockTest, Resource, Enrollment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  if (timeLeft.total <= 0) return null;
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="countdown-timer">
      <Clock className="h-3.5 w-3.5" />
      <span>{timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}{String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}</span>
    </div>
  );
}

function getTimeLeft(targetDate: Date) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrollment = enrollments?.find((e) => e.courseId === courseId);
  const isEnrolled = enrollment?.status === "approved";

  const { data: classesData, isLoading: classesLoading } = useQuery<{ items: Class[]; isEnrolled: boolean }>({
    queryKey: ["/api/courses", courseId, "classes"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/classes`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery<{ items: Resource[]; isEnrolled: boolean }>({
    queryKey: ["/api/courses", courseId, "resources"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/resources`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: mocksData, isLoading: mocksLoading } = useQuery<{ items: MockTest[]; isEnrolled: boolean }>({
    queryKey: ["/api/courses", courseId, "mock-tests"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/mock-tests`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/enroll/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
      setShowConfirm(true);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  useSEO({
    title: course?.title || "Course",
    description: course?.description || "Course details",
    path: `/courses/${courseId}`,
  });

  if (courseLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8" data-testid="course-detail-skeleton">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <p className="text-muted-foreground mb-4">This course doesn't exist or has been removed.</p>
        <Link href="/courses"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back to Courses</Button></Link>
      </div>
    );
  }

  const classItems = classesData?.items ?? [];
  const resourceItems = resourcesData?.items ?? [];
  const mockItems = mocksData?.items ?? [];
  const totalContent = classItems.length + resourceItems.length + mockItems.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" data-testid="page-course-detail">
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-courses">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Courses
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {course.bannerImage && (
          <div className="relative aspect-video max-h-[350px] rounded-xl overflow-hidden mb-6">
            <img src={course.bannerImage} alt={course.title} className="w-full h-full object-cover" data-testid="img-course-banner" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white" data-testid="text-course-title">{course.title}</h1>
            </div>
          </div>
        )}

        {!course.bannerImage && (
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2" data-testid="text-course-title">{course.title}</h1>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {course.price > 0 ? (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
              <Crown className="h-3 w-3 mr-1" />
              {course.offerPrice != null && course.offerPrice < course.price ? (
                <span>BDT {course.offerPrice} <s className="opacity-60 ml-1">BDT {course.price}</s></span>
              ) : (
                <span>BDT {course.price}</span>
              )}
            </Badge>
          ) : (
            <Badge variant="outline" data-testid="badge-free">Free</Badge>
          )}
          {course.lastDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Last date: {format(new Date(course.lastDate), "MMM dd, yyyy")}</span>
            </div>
          )}
          <Badge variant="secondary">{totalContent} items</Badge>
        </div>

        {course.description && (
          <p className="text-muted-foreground whitespace-pre-wrap mb-6" data-testid="text-course-desc">{course.description}</p>
        )}

        <div className="mb-6">
          {!user ? (
            <Link href="/auth">
              <Button data-testid="button-login-enroll">Login to Enroll</Button>
            </Link>
          ) : isEnrolled ? (
            <Button variant="outline" disabled data-testid="button-enrolled">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Enrolled
            </Button>
          ) : enrollment?.status === "pending" ? (
            <Button variant="outline" disabled data-testid="button-pending">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-amber-500" />
              Enrollment Pending
            </Button>
          ) : (
            <Button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending} data-testid="button-enroll">
              {enrollMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
              Enroll Now
            </Button>
          )}
        </div>
      </motion.div>

      {totalContent > 0 ? (
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="w-full justify-start mb-4" data-testid="tabs-course-content">
            <TabsTrigger value="classes" data-testid="tab-classes">
              Classes ({classItems.length})
            </TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">
              Resources ({resourceItems.length})
            </TabsTrigger>
            <TabsTrigger value="mocks" data-testid="tab-mocks">
              Mock Tests ({mockItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            {classesLoading ? (
              <ContentSkeleton />
            ) : classItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classItems.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} isEnrolled={isEnrolled} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<Video className="h-10 w-10" />} text="No classes added to this course yet." />
            )}
          </TabsContent>

          <TabsContent value="resources">
            {resourcesLoading ? (
              <ContentSkeleton />
            ) : resourceItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourceItems.map((res) => (
                  <ResourceCard key={res.id} resource={res} isEnrolled={isEnrolled} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<FileText className="h-10 w-10" />} text="No resources added to this course yet." />
            )}
          </TabsContent>

          <TabsContent value="mocks">
            {mocksLoading ? (
              <ContentSkeleton />
            ) : mockItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockItems.map((test) => (
                  <MockTestCard key={test.id} test={test} isEnrolled={isEnrolled} />
                ))}
              </div>
            ) : (
              <EmptyState icon={<BookOpen className="h-10 w-10" />} text="No mock tests added to this course yet." />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12 border rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Course content will be added soon.</p>
        </div>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              Enrollment Request Submitted
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Your enrollment request for <strong>{course.title}</strong> has been submitted. You will soon be contacted by our representative.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowConfirm(false)} data-testid="button-close-enroll-dialog">Got it</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassCard({ cls, isEnrolled }: { cls: Class; isEnrolled: boolean }) {
  const { user } = useAuth();
  return (
    <Card className="overflow-visible flex flex-col h-full" data-testid={`card-course-class-${cls.id}`}>
      <div className="relative aspect-video bg-muted rounded-t-xl flex items-center justify-center overflow-hidden">
        {cls.thumbnail ? (
          <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover rounded-t-xl" loading="lazy" />
        ) : (
          <Video className="h-10 w-10 text-muted-foreground/40" />
        )}
        {!isEnrolled && (
          <div className="absolute inset-0 bg-black/40 rounded-t-xl flex items-center justify-center">
            <Lock className="h-8 w-8 text-white/80" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm line-clamp-2">{cls.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {cls.description && <p className="text-xs text-muted-foreground line-clamp-2">{cls.description}</p>}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <Badge variant="secondary" className="text-[10px]">{cls.tag}</Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {isEnrolled && cls.videoUrl ? (
          <a href={cls.videoUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" data-testid={`button-watch-${cls.id}`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              Watch
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" disabled data-testid={`button-locked-${cls.id}`}>
            <Lock className="h-3 w-3 mr-1" />
            {!user ? "Login Required" : "Enroll to Access"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ResourceCard({ resource, isEnrolled }: { resource: Resource; isEnrolled: boolean }) {
  const { user } = useAuth();
  return (
    <Card className="flex flex-col h-full" data-testid={`card-course-resource-${resource.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm line-clamp-2">{resource.title}</CardTitle>
          <Badge variant="secondary" className="text-[10px] shrink-0">{resource.tag}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {resource.description && <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>}
      </CardContent>
      <CardFooter className="pt-0">
        {isEnrolled ? (
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" data-testid={`button-download-${resource.id}`}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" disabled data-testid={`button-locked-${resource.id}`}>
            <Lock className="h-3 w-3 mr-1" />
            {!user ? "Login Required" : "Enroll to Access"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function MockTestCard({ test, isEnrolled }: { test: MockTest; isEnrolled: boolean }) {
  const { user } = useAuth();
  const publishDate = new Date(test.publishTime);
  const isUpcoming = publishDate.getTime() > Date.now();

  return (
    <Card className="flex flex-col h-full" data-testid={`card-course-mock-${test.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm line-clamp-2">{test.title}</CardTitle>
          <Badge variant="secondary" className="text-[10px] shrink-0">{test.tag}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Calendar className="h-3 w-3" />
          <span>{format(publishDate, "MMM dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{test.duration} min</span>
        </div>
        {isUpcoming && <CountdownTimer targetDate={publishDate} />}
      </CardContent>
      <CardFooter className="pt-0">
        {isUpcoming ? (
          <Button variant="outline" size="sm" disabled>
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Button>
        ) : isEnrolled ? (
          <Link href={`/mock-tests/${test.id}`}>
            <Button size="sm" data-testid={`button-start-mock-${test.id}`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              Start Exam
            </Button>
          </Link>
        ) : (
          <Button size="sm" variant="outline" disabled data-testid={`button-locked-mock-${test.id}`}>
            <Lock className="h-3 w-3 mr-1" />
            {!user ? "Login Required" : "Enroll to Access"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <Skeleton className="h-32 w-full rounded-t-xl rounded-b-none" />
          <CardContent className="pt-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto text-muted-foreground/40 mb-3">{icon}</div>
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
