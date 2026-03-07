import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { RichTextDisplay } from "@/components/rich-text-editor";
import { Calendar, Video, Play, Crown, Loader2, BookOpen, Lock } from "lucide-react";
import type { Class, PaginatedResponse, Enrollment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";

const FILTER_TAGS = ["All", "Free", "English", "Analytical Skill", "Problem Solving"];

export default function ClassesPage() {
  useSEO({ title: "Video Classes", description: "Watch expert video classes for CU admission preparation. Covering English, Analytical Skills, and Problem Solving subjects.", path: "/classes" });

  const [offset, setOffset] = useState(0);
  const [limit] = useState(6);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [filter, setFilter] = useState("All");
  const { user } = useAuth();

  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<Class>>({
    queryKey: ["/api/classes", { limit, offset, filter }],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (filter === "Free") { params.set("free", "true"); }
      else if (filter !== "All") { params.set("tag", filter); }
      const res = await fetch(`/api/classes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch classes");
      return res.json();
    }
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.filter(e => e.status === "approved").map(e => e.courseId) ?? []);

  useEffect(() => {
    if (data?.items) {
      if (offset === 0) {
        setAllClasses(data.items);
      } else {
        setAllClasses(prev => [...prev, ...data.items]);
      }
    }
  }, [data, offset]);

  const filtered = allClasses;
  const hasMore = data?.hasMore;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-classes">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Classes</h1>
        <p className="text-muted-foreground mb-6">Watch video classes from our expert mentors</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TAGS.map((tag) => (
          <Button
            key={tag}
            variant={filter === tag ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(tag);
              setOffset(0);
              setAllClasses([]);
            }}
            data-testid={`filter-${tag.toLowerCase().replace(/\s/g, "-")}`}
          >
            {tag}
          </Button>
        ))}
      </div>

      {isLoading && offset === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
              <CardContent className="pt-4"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls, idx) => (
              <motion.div key={`${cls.id}-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx % limit) * 0.05 }} className="h-full">
                <Card 
                  className={`overflow-visible flex flex-col h-full transition-all duration-300 ${
                    cls.courseId
                      ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-background shadow-sm"
                      : cls.access === "paid" 
                        ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm" 
                        : ""
                  }`} 
                  data-testid={`card-class-${cls.id}`}
                >
                  <div className="relative aspect-video bg-muted rounded-t-xl flex items-center justify-center overflow-hidden">
                    {cls.thumbnail ? (
                      <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover rounded-t-xl" loading="lazy" />
                    ) : (
                      <Video className="h-12 w-12 text-muted-foreground/40" />
                    )}
                    {cls.courseId ? (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Course
                        </Badge>
                      </div>
                    ) : cls.access === "paid" ? (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm scale-110">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    ) : null}
                    <div className="absolute inset-0 bg-black/20 rounded-t-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base line-clamp-1">{cls.title}</CardTitle>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="secondary">{cls.tag}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {cls.description && <div className="text-sm text-muted-foreground line-clamp-2 mb-2"><RichTextDisplay content={cls.description} /></div>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(cls.createdAt), "MMM dd, yyyy")}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <UserAction cls={cls} enrolledCourseIds={enrolledCourseIds} />
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setOffset(prev => prev + limit)}
                disabled={isFetching}
                className="min-w-[200px]"
                data-testid="button-load-more"
              >
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More Classes
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Video className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No classes available for this filter.</p>
        </div>
      )}
    </div>
  );
}

function UserAction({ cls, enrolledCourseIds }: { cls: Class; enrolledCourseIds: Set<number> }) {
  const { user } = useAuth();

  if (cls.courseId) {
    if (!user) {
      return <Link href="/auth"><Button size="sm" variant="outline" data-testid={`button-login-watch-${cls.id}`}><Lock className="h-3.5 w-3.5 mr-1" />Login to Access</Button></Link>;
    }
    if (!enrolledCourseIds.has(cls.courseId)) {
      return (
        <Link href={`/courses/${cls.courseId}`}>
          <Button size="sm" variant="outline" data-testid={`button-enroll-access-${cls.id}`}>
            <Lock className="h-3.5 w-3.5 mr-1" />
            Enroll to Access
          </Button>
        </Link>
      );
    }
  }

  if (cls.access === "paid" && !user?.isPremium && !cls.courseId) {
    return <Button size="sm" variant="outline" disabled data-testid={`button-premium-${cls.id}`}>Premium Only</Button>;
  }
  if (cls.access === "signin" && !user) {
    return <Link href="/auth"><Button size="sm" variant="outline" data-testid={`button-login-watch-${cls.id}`}>Login to Watch</Button></Link>;
  }
  if (cls.videoUrl) {
    return (
      <a href={cls.videoUrl} target="_blank" rel="noopener noreferrer">
        <Button size="sm" data-testid={`button-watch-${cls.id}`}>
          <Play className="h-3.5 w-3.5 mr-1" />
          Watch
        </Button>
      </a>
    );
  }
  return <Button size="sm" variant="outline" disabled>No Video</Button>;
}
