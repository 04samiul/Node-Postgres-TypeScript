import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Bell, ExternalLink } from "lucide-react";
import { RichTextDisplay } from "@/components/rich-text-editor";
import type { Notice } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

const FILTER_TAGS = ["All", "Admission", "CU Notice", "Crack-CU Notice"];

export default function NoticesPage() {
  useSEO({ title: "Notices", description: "Latest notices and announcements for Chittagong University admission updates and Crack-CU platform news.", path: "/notices" });

  const { data: noticeItems, isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });
  const [filter, setFilter] = useState("All");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const filtered = noticeItems?.filter((n) => filter === "All" || n.tag === filter) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="page-notices">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Notices</h1>
        <p className="text-muted-foreground mb-6">Stay updated with the latest notices</p>
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-5 w-3/4 mb-3" /><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((notice, idx) => (
            <motion.div key={notice.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card data-testid={`card-notice-${notice.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base">
                      <Bell className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                      {notice.title}
                    </CardTitle>
                    <Badge variant="secondary">{notice.tag}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{notice.date ? format(new Date(notice.date), "MMM dd, yyyy") : format(new Date(notice.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2"><RichTextDisplay content={notice.description || ""} /></div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {(notice.description || "").replace(/<[^>]*>/g, "").length > 150 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedNotice(notice)}
                        data-testid={`button-readmore-${notice.id}`}
                      >
                        Read More
                      </Button>
                    )}
                    {notice.url && (
                      <a href={notice.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" data-testid={`button-url-${notice.id}`}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Visit Link
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No notices available for this filter.</p>
        </div>
      )}

      <Dialog open={!!selectedNotice} onOpenChange={(open) => !open && setSelectedNotice(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-start gap-2">
              <Bell className="h-5 w-5 mt-0.5 shrink-0" />
              {selectedNotice?.title}
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="secondary">{selectedNotice?.tag}</Badge>
              <span className="text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 inline mr-1" />
                {selectedNotice?.date ? format(new Date(selectedNotice.date), "MMM dd, yyyy") : selectedNotice?.createdAt ? format(new Date(selectedNotice.createdAt), "MMM dd, yyyy") : ""}
              </span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed"><RichTextDisplay content={selectedNotice?.description || ""} /></div>
            {selectedNotice?.url && (
              <a href={selectedNotice.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
                <Button variant="outline" size="sm" data-testid="button-dialog-url">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Visit Link
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
