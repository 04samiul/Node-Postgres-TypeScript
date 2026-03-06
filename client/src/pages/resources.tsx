import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Download, FileText, Crown, BookOpen, Lock } from "lucide-react";
import type { Resource, Enrollment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

const FILTER_TAGS = ["All", "Free", "CU QB", "English", "Analytical Skill", "Problem Solving"];

export default function ResourcesPage() {
  useSEO({ title: "Study Resources", description: "Download study materials, question banks, and preparation resources for Chittagong University admission test.", path: "/resources" });

  const { data: resourceItems, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const enrolledCourseIds = new Set(enrollments?.filter(e => e.status === "approved").map(e => e.courseId) ?? []);

  const filtered = resourceItems?.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Free") return (r.access === "all" || r.access === "signin") && !r.courseId;
    return r.tag === filter;
  }) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-resources">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Resources</h1>
        <p className="text-muted-foreground mb-6">Download study materials and question banks</p>
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
          {filtered.map((resource, idx) => (
            <motion.div key={resource.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="h-full">
              <Card 
                className={`flex flex-col h-full transition-all duration-300 ${
                  resource.courseId
                    ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-background shadow-sm"
                    : resource.access === "paid" 
                      ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-background shadow-sm" 
                      : ""
                }`} 
                data-testid={`card-resource-${resource.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base line-clamp-1">
                      <FileText className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      {resource.title}
                    </CardTitle>
                    <div className="flex gap-1 flex-wrap">
                      {resource.courseId ? (
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Course
                        </Badge>
                      ) : resource.access === "paid" ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      ) : null}
                      <Badge variant="secondary">{resource.tag}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {resource.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(resource.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <ResourceAction resource={resource} enrolledCourseIds={enrolledCourseIds} />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No resources available for this filter.</p>
        </div>
      )}
    </div>
  );
}

function ResourceAction({ resource, enrolledCourseIds }: { resource: Resource; enrolledCourseIds: Set<number> }) {
  const { user } = useAuth();

  if (resource.courseId) {
    if (!user) {
      return <Link href="/auth"><Button size="sm" variant="outline"><Lock className="h-3.5 w-3.5 mr-1" />Login to Access</Button></Link>;
    }
    if (!enrolledCourseIds.has(resource.courseId)) {
      return (
        <Link href={`/courses/${resource.courseId}`}>
          <Button size="sm" variant="outline" data-testid={`button-enroll-access-${resource.id}`}>
            <Lock className="h-3.5 w-3.5 mr-1" />
            Enroll to Access
          </Button>
        </Link>
      );
    }
  }

  if (resource.access === "paid" && !user?.isPremium && !resource.courseId) {
    return <Button size="sm" variant="outline" disabled>Premium Only</Button>;
  }
  if (resource.access === "signin" && !user) {
    return <Link href="/auth"><Button size="sm" variant="outline">Login to Download</Button></Link>;
  }
  return (
    <Button variant="outline" size="sm" onClick={() => window.open(resource.fileUrl, "_blank")} data-testid={`button-download-${resource.id}`}>
      <Download className="h-3.5 w-3.5 mr-1" />
      Download
    </Button>
  );
}
