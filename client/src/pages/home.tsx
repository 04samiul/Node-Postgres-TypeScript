import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/section-header";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  BookOpen,
  Clock,
  Download,
  FileText,
  Play,
  ChevronLeft,
  ChevronRight,
  Bell,
  Calendar,
  Image as ImageIcon,
  Video,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  Crown,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Course, MockTest, Class, Resource, Notice, HeroBanner, Enrollment } from "@shared/schema";
import { useState, useEffect, useCallback } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
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
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function HeroSection() {
  const { data: banners, isLoading } = useQuery<HeroBanner[]>({
    queryKey: ["/api/hero-banners"],
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleBanners = banners?.filter((b) => b.isVisible) ?? [];
  const hasBanners = visibleBanners.length > 0;

  const goNext = useCallback(() => {
    if (visibleBanners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % visibleBanners.length);
    }
  }, [visibleBanners.length]);

  const goPrev = useCallback(() => {
    if (visibleBanners.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + visibleBanners.length) % visibleBanners.length);
    }
  }, [visibleBanners.length]);

  useEffect(() => {
    if (visibleBanners.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [goNext, visibleBanners.length]);

  if (isLoading) {
    return (
      <div className="relative w-full min-h-[300px] md:min-h-[400px]" data-testid="hero-skeleton">
        <Skeleton className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-none" />
      </div>
    );
  }

  if (!hasBanners) {
    return (
      <div
        className="relative w-full min-h-[300px] md:min-h-[400px] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #eb202a 0%, #1a1a2e 100%)" }}
        data-testid="hero-default"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            data-testid="hero-title"
          >
            Don't Just Study, Crack It!
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            data-testid="hero-tagline"
          >
            Your ultimate platform for CU admission preparation
          </motion.p>
        </div>
      </div>
    );
  }

  const currentBanner = visibleBanners[currentIndex];

  return (
    <div className="relative w-full min-h-[300px] md:min-h-[400px] overflow-hidden" data-testid="hero-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentBanner.imageUrl ? (
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover min-h-[300px] md:min-h-[400px]"
              data-testid={`hero-image-${currentBanner.id}`}
            />
          ) : (
            <div
              className="w-full h-full min-h-[300px] md:min-h-[400px]"
              style={{ background: "linear-gradient(135deg, #eb202a 0%, #1a1a2e 100%)" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              data-testid={`hero-banner-title-${currentBanner.id}`}
            >
              {currentBanner.title}
            </motion.h2>
            {currentBanner.description && (
              <motion.p
                className="text-sm md:text-base text-white/80 max-w-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                data-testid={`hero-banner-desc-${currentBanner.id}`}
              >
                {currentBanner.description}
              </motion.p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {visibleBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm text-white"
            onClick={goPrev}
            data-testid="hero-prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm text-white"
            onClick={goNext}
            data-testid="hero-next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {visibleBanners.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-white" : "bg-white/40"}`}
                onClick={() => setCurrentIndex(idx)}
                data-testid={`hero-dot-${idx}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CoursesSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", "?limit=3"],
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrollmentMap: Record<number, string> = {};
  enrollments?.forEach((e) => {
    enrollmentMap[e.courseId] = e.status;
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
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

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course);
    enrollMutation.mutate(course.id);
  };

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 py-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      data-testid="section-courses"
    >
      <SectionHeader title="Courses" href="/courses" buttonLabel="View All Courses" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <CardContent className="pt-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className={`overflow-visible flex flex-col transition-all duration-300 ${
                course.price > 0 
                  ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm hover:shadow-amber-100 dark:hover:shadow-amber-900/20" 
                  : ""
              }`}
              data-testid={`card-course-${course.id}`}
            >
              <div className="relative h-40 bg-muted rounded-t-xl flex items-center justify-center">
                {course.bannerImage ? (
                  <img
                    src={course.bannerImage}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-t-xl"
                    loading="lazy"
                    data-testid={`img-course-${course.id}`}
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                )}
                {course.price > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base line-clamp-1" data-testid={`text-course-title-${course.id}`}>
                    {course.title}
                  </CardTitle>
                  {course.price === 0 ? (
                    <Badge variant="outline" data-testid={`badge-course-free-${course.id}`}>Free</Badge>
                  ) : (
                    <Badge variant="default" data-testid={`badge-course-price-${course.id}`}>
                      {course.offerPrice != null && course.offerPrice < course.price ? (
                        <span>BDT {course.offerPrice}</span>
                      ) : (
                        <span>BDT {course.price}</span>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-course-desc-${course.id}`}>
                  {course.description}
                </p>
              </CardContent>
              <CardFooter className="gap-2 flex-wrap">
                <Link href="/courses">
                  <Button variant="outline" size="sm" data-testid={`button-course-more-${course.id}`}>
                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                    More
                  </Button>
                </Link>
                {!user ? (
                  <Link href="/auth">
                    <Button size="sm" variant="outline" data-testid={`button-course-enroll-${course.id}`}>
                      Enroll
                    </Button>
                  </Link>
                ) : enrollmentMap[course.id] === "approved" ? (
                  <Button size="sm" variant="outline" disabled data-testid={`button-enrolled-${course.id}`}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
                    Enrolled
                  </Button>
                ) : enrollmentMap[course.id] === "pending" ? (
                  <Button size="sm" variant="outline" disabled data-testid={`button-pending-${course.id}`}>
                    <Loader2 className="h-3.5 w-3.5 mr-1 text-amber-500 animate-spin" />
                    Pending
                  </Button>
                ) : enrollmentMap[course.id] === "declined" ? (
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <Badge variant="destructive" className="text-[10px] py-0 h-4 justify-center">Declined</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnroll(course)}
                      disabled={enrollMutation.isPending}
                      data-testid={`button-re-enroll-${course.id}`}
                      className="h-7 text-[10px] border-red-200 hover:bg-red-50 text-red-600"
                    >
                      {enrollMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : "Re-enroll"}
                    </Button>
                  </div>
                ) : course.access === "paid" && !user?.isPremium ? (
                  <Button size="sm" variant="outline" disabled data-testid={`button-course-premium-${course.id}`}>
                    Premium Only
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleEnroll(course)}
                    disabled={enrollMutation.isPending}
                    data-testid={`button-course-enroll-${course.id}`}
                  >
                    {enrollMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Enroll"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm" data-testid="text-courses-empty">No courses available yet.</p>
      )}

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500" />
              Enrollment Request Submitted
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Your enrollment request for <strong>{selectedCourse?.title}</strong> has been submitted. You will soon be contacted by our representative.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowConfirm(false)} data-testid="button-close-enroll-dialog">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

function MockTestsSection() {
  const { data: mockTests, isLoading } = useQuery<MockTest[]>({
    queryKey: ["/api/mock-tests", "?limit=3"],
  });

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 py-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      data-testid="section-mock-tests"
    >
      <SectionHeader title="Mock Tests" href="/mock-tests" buttonLabel="View All" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mockTests && mockTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTests.map((test) => {
            const publishDate = new Date(test.publishTime);
            const isUpcoming = publishDate.getTime() > Date.now();
            return (
              <Card 
                key={test.id} 
                className={`flex flex-col transition-all duration-300 ${
                  test.access === "paid" 
                    ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm" 
                    : ""
                }`} 
                data-testid={`card-mocktest-${test.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base line-clamp-1" data-testid={`text-mocktest-title-${test.id}`}>
                      {test.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      {test.access === "paid" && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      <Badge variant="secondary" data-testid={`badge-mocktest-tag-${test.id}`}>{test.tag}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span data-testid={`text-mocktest-date-${test.id}`}>{format(publishDate, "MMM dd, yyyy")}</span>
                  </div>
                  {isUpcoming && <CountdownTimer targetDate={publishDate} />}
                </CardContent>
                <CardFooter>
                  {isUpcoming ? (
                    <Button variant="outline" size="sm" disabled data-testid={`button-mocktest-upcoming-${test.id}`}>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Upcoming
                    </Button>
                  ) : (
                    <Link href={`/mock-tests/${test.id}`}>
                      <Button size="sm" data-testid={`button-mocktest-start-${test.id}`}>
                        <Play className="h-3.5 w-3.5 mr-1" />
                        Start Exam
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm" data-testid="text-mocktests-empty">No mock tests available yet.</p>
      )}
    </motion.section>
  );
}

function ClassesSection() {
  const { data: classItems, isLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes", "?limit=3"],
  });

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 py-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      data-testid="section-classes"
    >
      <SectionHeader title="Classes" href="/classes" buttonLabel="View All" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-xl rounded-b-none" />
              <CardContent className="pt-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classItems && classItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classItems.map((cls) => (
            <Card 
              key={cls.id} 
              className={`overflow-visible flex flex-col transition-all duration-300 ${
                cls.access === "paid" 
                  ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm" 
                  : ""
              }`} 
              data-testid={`card-class-${cls.id}`}
            >
              <div className="relative h-40 bg-muted rounded-t-xl flex items-center justify-center">
                {cls.thumbnail ? (
                  <img
                    src={cls.thumbnail}
                    alt={cls.title}
                    className="w-full h-full object-cover rounded-t-xl"
                    loading="lazy"
                    data-testid={`img-class-${cls.id}`}
                  />
                ) : (
                  <Video className="h-12 w-12 text-muted-foreground/40" />
                )}
                {cls.access === "paid" && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base line-clamp-1" data-testid={`text-class-title-${cls.id}`}>
                    {cls.title}
                  </CardTitle>
                  <Badge variant="secondary" data-testid={`badge-class-tag-${cls.id}`}>{cls.tag}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span data-testid={`text-class-date-${cls.id}`}>{format(new Date(cls.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm" data-testid="text-classes-empty">No classes available yet.</p>
      )}
    </motion.section>
  );
}

function ResourcesSection() {
  const { data: resourceItems, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", "?limit=3"],
  });

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 py-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      data-testid="section-resources"
    >
      <SectionHeader title="Resources" href="/resources" buttonLabel="View All" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resourceItems && resourceItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceItems.map((resource) => (
            <Card 
              key={resource.id} 
              className={`flex flex-col transition-all duration-300 ${
                resource.access === "paid" 
                  ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm" 
                  : ""
              }`} 
              data-testid={`card-resource-${resource.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base line-clamp-1" data-testid={`text-resource-title-${resource.id}`}>
                    <FileText className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                    {resource.title}
                  </CardTitle>
                  <div className="flex gap-1">
                    {resource.access === "paid" && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    <Badge variant="secondary" data-testid={`badge-resource-tag-${resource.id}`}>{resource.tag}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span data-testid={`text-resource-date-${resource.id}`}>{format(new Date(resource.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </CardContent>
              <CardFooter>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" data-testid={`button-resource-download-${resource.id}`}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm" data-testid="text-resources-empty">No resources available yet.</p>
      )}
    </motion.section>
  );
}

function NoticesSection() {
  const { data: noticeItems, isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices", "?limit=3"],
  });
  const [detailNotice, setDetailNotice] = useState<Notice | null>(null);

  return (
    <motion.section
      className="max-w-7xl mx-auto px-4 py-8"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      data-testid="section-notices"
    >
      <SectionHeader title="Notices" href="/notices" buttonLabel="View All" />
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : noticeItems && noticeItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticeItems.map((notice) => (
            <Card key={notice.id} className="flex flex-col" data-testid={`card-notice-${notice.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base line-clamp-1" data-testid={`text-notice-title-${notice.id}`}>
                    <Bell className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                    {notice.title}
                  </CardTitle>
                  <Badge variant="secondary" data-testid={`badge-notice-tag-${notice.id}`}>{notice.tag}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span data-testid={`text-notice-date-${notice.id}`}>{format(new Date(notice.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-notice-desc-${notice.id}`}>
                  {notice.description}
                </p>
              </CardContent>
              <CardFooter className="gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setDetailNotice(notice)} data-testid={`button-notice-read-more-${notice.id}`}>
                  <BookOpen className="h-3.5 w-3.5 mr-1" />
                  Read More
                </Button>
                {notice.url && (
                  <a href={notice.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" data-testid={`button-notice-visit-${notice.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Visit Link
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm" data-testid="text-notices-empty">No notices available yet.</p>
      )}

      <Dialog open={!!detailNotice} onOpenChange={(open) => !open && setDetailNotice(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-detail-notice-title">{detailNotice?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{detailNotice?.tag}</Badge>
              <span className="text-sm text-muted-foreground">
                {detailNotice?.createdAt && format(new Date(detailNotice.createdAt), "MMM dd, yyyy")}
              </span>
            </div>
            <DialogDescription className="text-sm whitespace-pre-wrap" data-testid="text-detail-notice-desc">
              {detailNotice?.description}
            </DialogDescription>
            {detailNotice?.url && (
              <a href={detailNotice.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" data-testid="button-detail-notice-visit">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Link
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

export default function Home() {
  useSEO({ title: "Crack-CU", description: "Prepare for Chittagong University admission with expert-led courses, mock tests, video classes, and study resources. Join thousands of CU aspirants.", path: "/" });

  return (
    <div className="min-h-screen" data-testid="page-home">
      <HeroSection />
      <CoursesSection />
      <MockTestsSection />
      <ClassesSection />
      <ResourcesSection />
      <NoticesSection />
    </div>
  );
}
