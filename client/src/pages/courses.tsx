import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { BookOpen, Calendar, Image as ImageIcon, Loader2, CheckCircle2, Crown } from "lucide-react";
import type { Course, Enrollment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

export default function CoursesPage() {
  useSEO({ title: "Courses", description: "Browse admission preparation courses for Chittagong University. English, Analytical Skills, and Problem Solving courses by expert mentors.", path: "/courses" });
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrollmentMap: Record<number, string> = {};
  enrollments?.forEach((e) => { enrollmentMap[e.courseId] = e.status; });

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
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-courses">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2" data-testid="heading-courses">Courses</h1>
        <p className="text-muted-foreground mb-6" data-testid="text-courses-subtitle">
          Explore our courses for CU admission preparation
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
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
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="h-full"
            >
              <Card 
                className={`overflow-visible flex flex-col h-full transition-all duration-300 ${
                  course.price > 0 
                    ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm hover:shadow-amber-100 dark:hover:shadow-amber-900/20" 
                    : ""
                }`}
                data-testid={`card-course-${course.id}`}
              >
                <Link href={`/courses/${course.id}`}>
                  <div className="relative aspect-video bg-muted rounded-t-xl flex items-center justify-center overflow-hidden cursor-pointer">
                    {course.bannerImage ? (
                      <img
                        src={course.bannerImage}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-t-xl"
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                    )}
                    {course.price > 0 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm scale-110">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <Link href={`/courses/${course.id}`}>
                      <CardTitle className="text-base line-clamp-1 cursor-pointer hover:text-primary transition-colors" data-testid={`text-course-title-${course.id}`}>
                        {course.title}
                      </CardTitle>
                    </Link>
                    {course.price === 0 ? (
                      <Badge variant="outline">Free</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        {course.offerPrice != null && course.offerPrice < course.price && (
                          <span className="text-xs text-muted-foreground line-through">BDT {course.price}</span>
                        )}
                        <Badge>
                          BDT {course.offerPrice != null && course.offerPrice < course.price ? course.offerPrice : course.price}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2" data-testid={`text-course-desc-${course.id}`}>
                    {course.description}
                  </p>
                  {course.lastDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Last Date: {format(new Date(course.lastDate), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2 flex-wrap">
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" size="sm" data-testid={`button-course-more-${course.id}`}>
                      <BookOpen className="h-3.5 w-3.5 mr-1" />
                      Explore
                    </Button>
                  </Link>
                  {!user ? (
                    <Link href="/auth">
                      <Button size="sm" variant="outline" data-testid={`button-login-enroll-${course.id}`}>Login to Enroll</Button>
                    </Link>
                  ) : enrollmentMap[course.id] === "approved" ? (
                    <Button size="sm" variant="outline" disabled data-testid={`button-enrolled-${course.id}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" />
                      Enrolled
                    </Button>
                  ) : enrollmentMap[course.id] === "pending" ? (
                    <Button size="sm" variant="outline" disabled data-testid={`button-pending-${course.id}`}>
                      <Loader2 className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      Pending
                    </Button>
                  ) : enrollmentMap[course.id] === "declined" ? (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Badge variant="destructive" className="text-[10px] py-0 h-5 justify-center">Declined</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnroll(course)}
                        disabled={enrollMutation.isPending}
                        data-testid={`button-re-enroll-${course.id}`}
                        className="h-8 text-xs border-red-200 hover:bg-red-50 text-red-600"
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No courses available yet.</p>
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
              Your enrollment request for <strong>{selectedCourse?.title}</strong> has been submitted. You will soon be contacted by our representative.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowConfirm(false)} data-testid="button-close-enroll-dialog">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
