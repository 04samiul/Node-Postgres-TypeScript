import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Clock, Play, Calendar, FileText, Crown, BookOpen, Lock } from "lucide-react";
import type { MockTest, Enrollment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";

const FILTER_TAGS = ["All", "Free", "CU Mock", "English", "Analytical Skill", "Problem Solving"];

function CountdownTimer({ targetDate, onReached }: { targetDate: Date; onReached?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const tl = getTimeRemaining(targetDate);
      setTimeLeft(tl);
      if (tl.total <= 0 && onReached) onReached();
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onReached]);

  if (timeLeft.total <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground" data-testid="countdown-timer">
      <Clock className="h-3.5 w-3.5" />
      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function getTimeRemaining(targetDate: Date) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export default function MockTestsPage() {
  useSEO({ title: "Mock Tests", description: "Practice with realistic Chittagong University admission mock tests. Timed exams with detailed grading for English, Analytical Skills, and Problem Solving.", path: "/mock-tests" });

  const { data: mockTests, isLoading } = useQuery<MockTest[]>({
    queryKey: ["/api/mock-tests"],
  });
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [, setTick] = useState(0);

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.map(e => e.courseId) ?? []);

  const filtered = mockTests?.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Free") return t.access === "all" || t.access === "signin";
    return t.tag === filter;
  }) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-mock-tests">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2" data-testid="heading-mock-tests">Mock Tests</h1>
        <p className="text-muted-foreground mb-6">Practice with our mock tests for CU admission</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TAGS.map((tag) => (
          <Button
            key={tag}
            variant={filter === tag ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tag)}
            data-testid={`filter-${tag.toLowerCase().replace(/\s/g, "-")}`}
          >
            {tag}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-5 w-3/4 mb-3" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((test, idx) => {
            const publishDate = new Date(test.publishTime);
            const isUpcoming = publishDate.getTime() > Date.now();
            return (
              <motion.div key={test.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="h-full">
                <Card 
                  className={`flex flex-col h-full transition-all duration-300 ${
                    test.courseId
                      ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-background shadow-sm"
                      : test.access === "paid" 
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
                      <div className="flex gap-1 flex-wrap">
                        {test.courseId ? (
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Course
                          </Badge>
                        ) : test.access === "paid" ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        ) : null}
                        <Badge variant="secondary">{test.tag}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{publishDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka", month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} (BST)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{test.duration} min</span>
                    </div>
                    {isUpcoming && (
                      <CountdownTimer targetDate={publishDate} onReached={() => setTick((t) => t + 1)} />
                    )}
                  </CardContent>
                  <CardFooter>
                    <MockTestAction test={test} isUpcoming={isUpcoming} enrolledCourseIds={enrolledCourseIds} />
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No mock tests available for this filter.</p>
        </div>
      )}
    </div>
  );
}

function MockTestAction({ test, isUpcoming, enrolledCourseIds }: { test: MockTest; isUpcoming: boolean; enrolledCourseIds: Set<number> }) {
  const { user } = useAuth();

  if (isUpcoming) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Clock className="h-3.5 w-3.5 mr-1" />
        Upcoming
      </Button>
    );
  }

  if (test.courseId) {
    if (!user) {
      return <Link href="/auth"><Button size="sm" variant="outline"><Lock className="h-3.5 w-3.5 mr-1" />Login to Access</Button></Link>;
    }
    if (!enrolledCourseIds.has(test.courseId)) {
      return (
        <Link href={`/courses/${test.courseId}`}>
          <Button size="sm" variant="outline" data-testid={`button-enroll-access-${test.id}`}>
            <Lock className="h-3.5 w-3.5 mr-1" />
            Enroll to Access
          </Button>
        </Link>
      );
    }
  }

  if ((test.access === "signin" || test.access === "paid") && !user) {
    return <Link href="/auth"><Button size="sm">Sign in to Start</Button></Link>;
  }
  if (test.access === "paid" && !user?.isPremium && !test.courseId) {
    return (
      <Button size="sm" variant="outline" disabled data-testid={`button-premium-${test.id}`}>
        Premium Only
      </Button>
    );
  }
  return (
    <Link href={`/mock-tests/${test.id}`}>
      <Button size="sm" data-testid={`button-start-${test.id}`}>
        <Play className="h-3.5 w-3.5 mr-1" />
        Start Exam
      </Button>
    </Link>
  );
}
