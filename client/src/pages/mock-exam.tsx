import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Clock, Send, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { MockTest, MockSubmission } from "@shared/schema";
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

const SECTION_COLORS: Record<string, string> = {
  EngP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EngO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  AS: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  PS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};


export default function MockExamPage() {
  useSEO({ title: "Mock Exam", description: "Take your Chittagong University admission mock test. Timed exam with auto-grading.", noIndex: true });

  const [, params] = useRoute("/mock-tests/:id");
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<MockSubmission | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: test, isLoading, error } = useQuery<MockTest>({
    queryKey: ["/api/mock-tests", id],
    enabled: !!id && !!user,
  });

  const questions: Question[] = test && Array.isArray(test.questions) ? test.questions as Question[] : [];

  useEffect(() => {
    if (test && !submitted) {
      setTimeLeft(test.duration * 60);
    }
  }, [test, submitted]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const submitMutation = useMutation({
    mutationFn: async (data: { answers: Record<string, number> }) => {
      const res = await apiRequest("POST", `/api/mock-tests/${id}/submit`, data);
      return res.json();
    },
    onSuccess: (data: MockSubmission) => {
      setResult(data);
      setSubmitted(true);
      toast({ title: "Mock test submitted! Check your email for results." });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    submitMutation.mutate({ answers });
  };

  const handleAutoSubmit = useCallback(() => {
    if (!submitted && !submitMutation.isPending) {
      submitMutation.mutate({ answers });
    }
  }, [answers, submitted, submitMutation.isPending]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Please sign in to take mock tests.</p>
        <Link href="/auth"><Button>Sign In</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-3" />
        <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Mock test not found"}</p>
        <Link href="/mock-tests"><Button variant="outline">Back to Mock Tests</Button></Link>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" data-testid="page-mock-result">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3">
                {result.passed ? (
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl" data-testid="text-result-status">
                {result.passed ? "Congratulations! You Passed!" : "Keep Trying!"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-medium text-center">{test.title}</h3>

              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="English Passage" marks={result.engPMarks ?? 0} />
                <ResultCard label="English Other" marks={result.engOMarks ?? 0} />
                <ResultCard label="English Total" marks={(result.engPMarks ?? 0) + (result.engOMarks ?? 0)} pass={13} />
                <ResultCard label="Analytical Skill" marks={result.asMarks ?? 0} pass={10} />
                <ResultCard label="Problem Solving" marks={result.psMarks ?? 0} pass={10} />
              </div>

              <div className="text-center space-y-1 pt-2">
                <p className="text-sm text-muted-foreground">Total: <strong>{(result.totalMarks ?? 0).toFixed(2)}</strong></p>
                {user?.isSecondTimer && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">2nd Timer Penalty: <strong>-3</strong></p>
                )}
                <p className="text-lg font-bold">Net Marks: <span className={result.passed ? "text-green-600" : "text-destructive"}>{(result.netMarks ?? 0).toFixed(2)}</span></p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className={user?.isSecondTimer ? "border-amber-500 text-amber-600 dark:text-amber-400" : ""} data-testid="badge-timer-status">
                    {user?.isSecondTimer ? "2nd Timer" : "1st Timer"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">(Pass mark: 40 overall, English 13, AS 10, PS 10)</p>
              </div>

              <div className="flex justify-center gap-2 pt-4">
                <Link href="/mock-tests">
                  <Button variant="outline" data-testid="button-back-to-mocks">Back to Mock Tests</Button>
                </Link>
                <Link href="/dashboard">
                  <Button data-testid="button-go-dashboard">Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4" data-testid="page-mock-exam">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur pb-3 border-b mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-sm font-medium truncate" data-testid="text-exam-title">{test.title}</h1>
            <p className="text-xs text-muted-foreground">{answeredCount}/{questions.length} answered</p>
          </div>
          <div className="flex items-center gap-3">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1 font-mono text-sm font-bold ${timeLeft < 300 ? "text-destructive" : ""}`} data-testid="text-timer">
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <Button
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={submitMutation.isPending}
              data-testid="button-submit-exam"
            >
              <Send className="h-3.5 w-3.5 mr-1" /> Submit
            </Button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-sm w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
              <p className="font-medium">Submit this exam?</p>
              <p className="text-sm text-muted-foreground">
                You have answered {answeredCount} out of {questions.length} questions.
                {questions.length - answeredCount > 0 && ` ${questions.length - answeredCount} unanswered.`}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button onClick={() => { setShowConfirm(false); handleSubmit(); }} disabled={submitMutation.isPending}>
                  Confirm Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id} data-testid={`card-question-${q.id}`}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">Q{idx + 1}.</span>
                <Badge className={SECTION_COLORS[q.section] || ""}>
                  {q.section}
                </Badge>
              </div>

              {q.passage && (
                <div
                  className="bg-muted p-3 rounded-md text-sm leading-relaxed"
                  data-testid={`text-passage-${q.id}`}
                  dangerouslySetInnerHTML={{ __html: renderMath(q.passage) }}
                />
              )}

              {q.image && (
                <img src={q.image} alt={`Question ${q.id} illustration`} className="max-w-full rounded-md max-h-64 object-contain" loading="lazy" data-testid={`img-question-${q.id}`} />
              )}

              <p
                className="text-sm font-medium"
                data-testid={`text-question-${q.id}`}
                dangerouslySetInnerHTML={{ __html: renderMath(q.question) }}
              />

              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[String(q.id)] === oi;
                  return (
                    <button
                      key={oi}
                      className={`w-full text-left p-3 rounded-md border transition-colors flex items-center gap-3 ${
                        selected
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-600"
                          : "hover:bg-muted border-border"
                      }`}
                      onClick={() => {
                        const newAnswers = { ...answers };
                        if (newAnswers[String(q.id)] === oi) {
                          delete newAnswers[String(q.id)];
                        } else {
                          newAnswers[String(q.id)] = oi;
                        }
                        setAnswers(newAnswers);
                      }}
                      data-testid={`button-option-${q.id}-${oi}`}
                    >
                      <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected ? "bg-blue-500 text-white border-blue-500" : "border-border"
                      }`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: renderMath(opt) }}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-3 border-t mt-4 pb-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{answeredCount}/{questions.length} answered</p>
          <Button
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={submitMutation.isPending}
            data-testid="button-submit-exam-bottom"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, marks, pass }: { label: string; marks: number; pass?: number }) {
  const passed = pass === undefined || marks >= pass;
  return (
    <Card>
      <CardContent className="pt-3 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${passed ? "" : "text-destructive"}`}>{marks.toFixed(2)}</p>
        {pass !== undefined && (
          <p className="text-xs text-muted-foreground">Pass: {pass}</p>
        )}
      </CardContent>
    </Card>
  );
}
