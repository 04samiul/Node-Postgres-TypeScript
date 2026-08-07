import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, ArrowLeft, Clock } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  netMarks: number;
  durationSeconds: number;
  isYou: boolean;
}

interface LeaderboardData {
  totalParticipants: number;
  top: LeaderboardEntry[];
  yourRank: number | null;
  yourNeighbors: LeaderboardEntry[];
}

function formatDuration(seconds: number) {
  if (!isFinite(seconds) || seconds > 24 * 60 * 60) return "-";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return (
    <span className="text-sm font-mono text-muted-foreground w-4 text-center">
      {rank}
    </span>
  );
}

export default function MockLeaderboardPage() {
  const [, params] = useRoute<{ id: string }>("/mock-tests/:id/leaderboard");
  const mockTestId = parseInt(params?.id || "0");

  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: [`/api/mock-tests/${mockTestId}/leaderboard`],
    enabled: mockTestId > 0,
  });

  useSEO({
    title: "Leaderboard",
    description: "See how you rank against other students.",
    path: `/mock-tests/${mockTestId}/leaderboard`,
  });

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8"
      data-testid="page-mock-leaderboard"
    >
      <Link href="/mock-tests">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          data-testid="button-back-mocktests"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Mock Tests
        </Button>
      </Link>

      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-amber-500" />
        Leaderboard
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Ranked by best net marks. Ties broken by faster completion time.
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.totalParticipants === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No completed attempts yet. Be the first to finish this mock test.
          </CardContent>
        </Card>
      ) : (
        <>
          {data.yourRank && (
            <Card
              className="mb-6 border-primary/40 bg-primary/5"
              data-testid="card-your-rank"
            >
              <CardContent className="py-4">
                <p className="text-sm font-medium mb-3">
                  You're ranked{" "}
                  <span className="text-primary font-bold">
                    #{data.yourRank}
                  </span>{" "}
                  out of {data.totalParticipants}
                </p>
                <div className="space-y-1.5">
                  {data.yourNeighbors.map((e) => (
                    <div
                      key={e.rank}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm ${e.isYou ? "bg-primary text-primary-foreground font-semibold" : "bg-background"}`}
                      data-testid={`neighbor-rank-${e.rank}`}
                    >
                      <div className="flex items-center gap-2">
                        <RankBadge rank={e.rank} />
                        <span>{e.isYou ? "You" : e.displayName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-80">
                        <span>{e.netMarks.toFixed(2)} marks</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(e.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Top {Math.min(20, data.totalParticipants)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {data.top.map((e) => (
                <div
                  key={e.rank}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm ${e.isYou ? "bg-primary/10 border border-primary/30 font-semibold" : "hover:bg-muted"}`}
                  data-testid={`top-rank-${e.rank}`}
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={e.rank} />
                    <span>
                      {e.isYou ? `${e.displayName} (You)` : e.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {e.netMarks.toFixed(2)} marks
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(e.durationSeconds)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
