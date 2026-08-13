import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextDisplay } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  BookOpen,
  Calendar,
  Clock,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lock,
  Play,
  Video,
  CheckCircle2,
  ArrowLeft,
  ArrowUpDown,
} from "lucide-react";
import type {
  Course,
  Class,
  MockTest,
  Resource,
  Enrollment,
} from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SUBJECT_ORDER = ["English", "Problem Solving", "Analytical Skill"];

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft(getTimeLeft(targetDate)),
      1000,
    );
    return () => clearInterval(interval);
  }, [targetDate]);
  if (timeLeft.total <= 0) return null;
  return (
    <div
      className="flex items-center gap-1 text-sm text-muted-foreground"
      data-testid="countdown-timer"
    >
      <Clock className="h-3.5 w-3.5" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function getTimeLeft(targetDate: Date) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0)
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
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
  const classesAndMocksRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [classSortOrder, setClassSortOrder] = useState<
    "default" | "newest" | "oldest"
  >("default");

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

  const { data: classesData, isLoading: classesLoading } = useQuery<{
    items: Class[];
    isEnrolled: boolean;
  }>({
    queryKey: ["/api/courses", courseId, "classes"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/classes`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery<{
    items: Resource[];
    isEnrolled: boolean;
  }>({
    queryKey: ["/api/courses", courseId, "resources"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/resources`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: courseId > 0,
  });

  const { data: mocksData, isLoading: mocksLoading } = useQuery<{
    items: MockTest[];
    isEnrolled: boolean;
  }>({
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

  const classItems = classesData?.items ?? [];
  const resourceItems = resourcesData?.items ?? [];
  const mockItems = mocksData?.items ?? [];
  const totalContent =
    classItems.length + resourceItems.length + mockItems.length;

  const availableSubjects = SUBJECT_ORDER.filter(
    (s) =>
      classItems.some((c) => c.tag === s) || mockItems.some((m) => m.tag === s),
  );
  const otherClasses = classItems.filter(
    (c) => !SUBJECT_ORDER.includes(c.tag as any),
  );
  const otherMocks = mockItems.filter(
    (m) => !SUBJECT_ORDER.includes(m.tag as any),
  );
  const hasGeneral = otherClasses.length > 0 || otherMocks.length > 0;
  const allSubjects = hasGeneral
    ? [...availableSubjects, "General"]
    : availableSubjects;

  useEffect(() => {
    if (activeSubject === null && allSubjects.length > 0) {
      setActiveSubject(allSubjects[0]);
    }
  }, [allSubjects.join("|"), activeSubject]);

  function sortClasses(list: Class[]): Class[] {
    if (classSortOrder === "default") {
      return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    const sorted = [...list].sort(
      (a, b) =>
        new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime(),
    );
    return classSortOrder === "oldest" ? sorted : sorted.reverse();
  }

  if (courseLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-8"
        data-testid="course-detail-skeleton"
      >
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
        <p className="text-muted-foreground mb-4">
          This course doesn't exist or has been removed.
        </p>
        <Link href="/courses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8"
      data-testid="page-course-detail"
    >
      <Link href="/courses">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          data-testid="button-back-courses"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Courses
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {course.bannerImage && (
          <div className="relative aspect-video max-h-[350px] rounded-xl overflow-hidden mb-6">
            <img
              src={course.bannerImage}
              alt={course.title}
              className="w-full h-full object-cover"
              data-testid="img-course-banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1
                className="text-2xl md:text-3xl font-bold text-white"
                data-testid="text-course-title"
              >
                {course.title}
              </h1>
            </div>
          </div>
        )}

        {!course.bannerImage && (
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight mb-2"
            data-testid="text-course-title"
          >
            {course.title}
          </h1>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          {course.price > 0 ? (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
              <Crown className="h-3 w-3 mr-1" />
              {course.offerPrice != null && course.offerPrice < course.price ? (
                <span>
                  BDT {course.offerPrice}{" "}
                  <s className="opacity-60 ml-1">BDT {course.price}</s>
                </span>
              ) : (
                <span>BDT {course.price}</span>
              )}
            </Badge>
          ) : (
            <Badge variant="outline" data-testid="badge-free">
              Free
            </Badge>
          )}
          {course.lastDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Last date: {format(new Date(course.lastDate), "MMM dd, yyyy")}
              </span>
            </div>
          )}
          <Badge variant="secondary">{totalContent} items</Badge>
        </div>

        {course.description && (
          <div
            className="text-muted-foreground mb-6"
            data-testid="text-course-desc"
          >
            <RichTextDisplay content={course.description || ""} />
          </div>
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
            <Button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              data-testid="button-enroll"
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4 mr-2" />
              )}
              Enroll Now
            </Button>
          )}
        </div>
      </motion.div>

      {totalContent > 0 ? (
        <div>
          <div
            className="sticky top-14 z-40 -mx-4 px-4 py-2 mb-4 bg-background/95 backdrop-blur border-b flex items-center gap-2 overflow-x-auto"
            data-testid="quick-jump-nav"
          >
            {(classItems.length > 0 || mockItems.length > 0) && (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 h-8 text-xs"
                onClick={() =>
                  classesAndMocksRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                data-testid="button-jump-classes"
              >
                <Video className="h-3.5 w-3.5 mr-1" /> Classes & Mocks
              </Button>
            )}
            {resourceItems.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 h-8 text-xs"
                onClick={() =>
                  resourcesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                data-testid="button-jump-resources"
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Resources
              </Button>
            )}
          </div>

          {(() => {
            const currentClasses = sortClasses(
              activeSubject === "General"
                ? otherClasses
                : classItems.filter((c) => c.tag === activeSubject),
            );
            const currentMocks =
              activeSubject === "General"
                ? otherMocks
                : mockItems.filter((m) => m.tag === activeSubject);

            return (
              <div ref={classesAndMocksRef} className="scroll-mt-28">
                <div
                  className="flex flex-wrap gap-2 mb-6"
                  data-testid="subject-filter-buttons"
                >
                  {allSubjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={
                        activeSubject === subject ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveSubject(subject)}
                      data-testid={`button-subject-${subject.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>

                <div
                  className="space-y-8"
                  data-testid={`section-subject-${(activeSubject || "").replace(/\s+/g, "-").toLowerCase()}`}
                >
                  {currentClasses.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                          <Video className="h-4 w-4" /> Classes (
                          {currentClasses.length})
                        </h3>
                        <Select
                          value={classSortOrder}
                          onValueChange={(v) =>
                            setClassSortOrder(
                              v as "default" | "newest" | "oldest",
                            )
                          }
                        >
                          <SelectTrigger
                            className="w-40 h-7 text-xs"
                            data-testid="select-sort-classes"
                          >
                            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Default Order
                            </SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentClasses.map((cls) => (
                          <ClassCard
                            key={`cls-${cls.id}`}
                            cls={cls}
                            isEnrolled={isEnrolled}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {currentMocks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                        <FileText className="h-4 w-4" /> Mock Tests (
                        {currentMocks.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentMocks.map((test) => (
                          <MockTestCard
                            key={`mock-${test.id}`}
                            test={test}
                            isEnrolled={isEnrolled}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {currentClasses.length === 0 && currentMocks.length === 0 && (
                    <EmptyState
                      icon={<BookOpen className="h-10 w-10" />}
                      text="No content added for this subject yet."
                    />
                  )}
                </div>
              </div>
            );
          })()}

          {resourceItems.length > 0 && (
            <div
              className="mt-10 scroll-mt-28"
              ref={resourcesRef}
              data-testid="section-resources"
            >
              <h2 className="text-xl font-bold mb-4 pb-2 border-b">
                Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourceItems.map((res) => (
                  <ResourceCard
                    key={`res-${res.id}`}
                    resource={res}
                    isEnrolled={isEnrolled}
                  />
                ))}
              </div>
            </div>
          )}

          {(classesLoading || resourcesLoading || mocksLoading) && (
            <ContentSkeleton />
          )}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-xl">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            Course content will be added soon.
          </p>
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
              Your enrollment request for <strong>{course.title}</strong> has
              been submitted. You will soon be contacted by our representative.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowConfirm(false)}
            data-testid="button-close-enroll-dialog"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClassCard({
  cls,
  isEnrolled,
  showTypeBadge,
}: {
  cls: Class;
  isEnrolled: boolean;
  showTypeBadge?: boolean;
}) {
  const { user } = useAuth();
  const isUpcoming = new Date(cls.publishTime).getTime() > Date.now();
  return (
    <Card
      className="overflow-visible flex flex-col h-full"
      data-testid={`card-course-class-${cls.id}`}
    >
      <div className="relative aspect-video bg-muted rounded-t-xl flex items-center justify-center overflow-hidden">
        {cls.thumbnail ? (
          <img
            src={cls.thumbnail}
            alt={cls.title}
            className="w-full h-full object-cover rounded-t-xl"
            loading="lazy"
          />
        ) : (
          <Video className="h-10 w-10 text-muted-foreground/40" />
        )}
        {showTypeBadge && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none text-[10px] px-2">
              <Video className="h-2.5 w-2.5 mr-1" />
              Class
            </Badge>
          </div>
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <Badge variant="secondary" className="text-[10px]">
            {cls.tag}
          </Badge>
        </div>
        {isUpcoming && (
          <div className="mt-2">
            <CountdownTimer targetDate={new Date(cls.publishTime)} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {isUpcoming ? (
          <Button
            size="sm"
            variant="outline"
            disabled
            data-testid={`button-upcoming-${cls.id}`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Button>
        ) : isEnrolled && cls.videoUrl ? (
          <a href={cls.videoUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" data-testid={`button-watch-${cls.id}`}>
              <Play className="h-3.5 w-3.5 mr-1" />
              Watch
            </Button>
          </a>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled
            data-testid={`button-locked-${cls.id}`}
          >
            <Lock className="h-3 w-3 mr-1" />
            {!user ? "Login Required" : "Enroll to Access"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ResourceCard({
  resource,
  isEnrolled,
  showTypeBadge,
}: {
  resource: Resource;
  isEnrolled: boolean;
  showTypeBadge?: boolean;
}) {
  const { user } = useAuth();
  return (
    <Card
      className="flex flex-col h-full"
      data-testid={`card-course-resource-${resource.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {showTypeBadge && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none text-[10px] px-2 shrink-0 mt-0.5">
                <FileText className="h-2.5 w-2.5 mr-1" />
                Resource
              </Badge>
            )}
            <CardTitle className="text-sm line-clamp-2">
              {resource.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {resource.tag}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {resource.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            <RichTextDisplay content={resource.description} />
          </div>
        )}
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
          <Button
            size="sm"
            variant="outline"
            disabled
            data-testid={`button-locked-${resource.id}`}
          >
            <Lock className="h-3 w-3 mr-1" />
            {!user ? "Login Required" : "Enroll to Access"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function MockTestCard({
  test,
  isEnrolled,
  showTypeBadge,
}: {
  test: MockTest;
  isEnrolled: boolean;
  showTypeBadge?: boolean;
}) {
  const { user } = useAuth();
  const publishDate = new Date(test.publishTime);
  const isUpcoming = publishDate.getTime() > Date.now();

  return (
    <Card
      className="flex flex-col h-full"
      data-testid={`card-course-mock-${test.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {showTypeBadge && (
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none text-[10px] px-2 shrink-0 mt-0.5">
                <FileText className="h-2.5 w-2.5 mr-1" />
                Mock
              </Badge>
            )}
            <CardTitle className="text-sm line-clamp-2">{test.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {test.tag}
          </Badge>
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
          <Button
            size="sm"
            variant="outline"
            disabled
            data-testid={`button-locked-mock-${test.id}`}
          >
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
