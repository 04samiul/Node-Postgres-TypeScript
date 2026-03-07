import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import type { MockSubmission } from "@shared/schema";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { renderMath } from "@/lib/render-math";

interface Question {
  id: number;
  passage: string | null;
  section: string;
  question: string;
  image: string | null;
  options: string[];
  correctAnswer: number;
}

interface ReviewData {
  submission: MockSubmission;
  mockTest: {
    id: number;
    title: string;
    questions: Question[];
  };
}

const SECTION_COLORS: Record<string, string> = {
  EngP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EngO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  AS: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  PS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};


export default function MockReviewPage() {
  useSEO({ title: "Mock Test Review", description: "Review your mock test answers and see correct solutions.", noIndex: true });

  const [, params] = useRoute("/mock-review/:submissionId");
  const submissionId = params?.submissionId;
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<ReviewData>({
    queryKey: ["/api/my-submissions", submissionId, "review"],
    enabled: !!submissionId && !!user,
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Please sign in to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-3" />
        <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Could not load review"}</p>
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const { submission, mockTest } = data;
  const questions = Array.isArray(mockTest.questions) ? mockTest.questions as Question[] : [];
  const studentAnswers = (submission.answers || {}) as Record<string, number>;

  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  questions.forEach((q) => {
    const ans = studentAnswers[String(q.id)];
    if (ans === undefined || ans === null || ans === -1) {
      unanswered++;
    } else if (ans === q.correctAnswer) {
      correct++;
    } else {
      wrong++;
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-testid="page-mock-review">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-review-title">{mockTest.title} - Review</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span>Net: <strong className={submission.passed ? "text-green-600" : "text-destructive"}>{(submission.netMarks ?? 0).toFixed(2)}</strong></span>
              <span>{submission.passed ? (
                <Badge variant="default" className="bg-green-600 text-xs">Passed</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Failed</Badge>
              )}</span>
              <span>Correct: {correct}</span>
              <span>Wrong: {wrong}</span>
              <span>Skipped: {unanswered}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const studentAns = studentAnswers[String(q.id)];
            const isCorrect = studentAns === q.correctAnswer;
            const isUnanswered = studentAns === undefined || studentAns === null || studentAns === -1;

            return (
              <Card key={q.id} data-testid={`review-question-${q.id}`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground">Q{idx + 1}.</span>
                      <Badge className={SECTION_COLORS[q.section] || ""}>
                        {q.section}
                      </Badge>
                    </div>
                    {isUnanswered ? (
                      <Badge variant="outline" className="text-xs">Skipped</Badge>
                    ) : isCorrect ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Correct</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Wrong</span>
                      </div>
                    )}
                  </div>

                  {q.passage && (
                    <div
                      className="bg-muted p-3 rounded-md text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMath(q.passage) }}
                    />
                  )}

                  {q.image && (
                    <img src={q.image} alt={`Question ${q.id} illustration`} className="max-w-full rounded-md max-h-64 object-contain" loading="lazy" />
                  )}

                  <p
                    className="text-sm font-medium"
                    dangerouslySetInnerHTML={{ __html: renderMath(q.question) }}
                  />

                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isStudentChoice = studentAns === oi;
                      const isCorrectOption = q.correctAnswer === oi;

                      let optionClass = "border-border";
                      if (isCorrectOption) {
                        optionClass = "bg-green-50 dark:bg-green-950 border-green-400 dark:border-green-600";
                      } else if (isStudentChoice && !isCorrect) {
                        optionClass = "bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600";
                      }

                      return (
                        <div
                          key={oi}
                          className={`w-full text-left p-3 rounded-md border flex items-center gap-3 ${optionClass}`}
                          data-testid={`review-option-${q.id}-${oi}`}
                        >
                          <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCorrectOption
                              ? "bg-green-500 text-white border-green-500"
                              : isStudentChoice && !isCorrect
                              ? "bg-red-500 text-white border-red-500"
                              : "border-border"
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span
                            className="text-sm flex-1"
                            dangerouslySetInnerHTML={{ __html: renderMath(opt) }}
                          />
                          {isCorrectOption && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                          {isStudentChoice && !isCorrect && (
                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          )}
                          {isStudentChoice && isCorrect && (
                            <span className="text-xs text-green-600 shrink-0">Your answer</span>
                          )}
                          {isStudentChoice && !isCorrect && (
                            <span className="text-xs text-destructive shrink-0">Your answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-6 pb-4">
          <Link href="/dashboard">
            <Button variant="outline" data-testid="button-back-dashboard">Back to Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
