"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, CheckCircle, XCircle, User, Calendar, Target, Minus } from "lucide-react"

interface QuizAttempt {
  id: string
  user_name: string
  user_email: string
  user_info: any
  variant: number
  started_at: string
  completed_at: string | null
  total_score: number
  total_questions: number
}

interface UserAnswer {
  id: string
  user_answer: string
  is_correct: boolean
  answered_at: string
  question: {
    id: string
    question_text: string
    question_type: string
    options?: Record<string, string>
    correct_answer: string
    explanation: string
  }
}

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [attemptId, setAttemptId] = useState<string>("")
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setAttemptId(resolvedParams.id)
      loadAttemptDetails(resolvedParams.id)
    }
    getParams()
  }, [params])

  const loadAttemptDetails = async (id: string) => {
    try {
      const supabase = createClient()

      // Load attempt details
      const { data: attemptData, error: attemptError } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("id", id)
        .single()

      if (attemptError) throw attemptError

      // Load user answers with question details
      const { data: answersData, error: answersError } = await supabase
        .from("quiz_answers")
        .select(`
          id,
          user_answer,
          is_correct,
          created_at,
          questions (
            id,
            question_text,
            question_type,
            options,
            correct_answer,
            explanation
          )
        `)
        .eq("attempt_id", id)
        .order("created_at")

      if (answersError) throw answersError

      // Transform the data
      const transformedAnswers =
        answersData?.map((item) => ({
          id: item.id,
          user_answer: item.user_answer,
          is_correct: item.is_correct,
          answered_at: item.created_at,
          question: {
            id: (item.questions as any)?.id || "",
            question_text: (item.questions as any)?.question_text || "",
            question_type: (item.questions as any)?.question_type || "",
            options: (item.questions as any)?.options || null,
            correct_answer: (item.questions as any)?.correct_answer || "",
            explanation: (item.questions as any)?.explanation || "",
          },
        })) || []

      setAttempt(attemptData)
      setUserAnswers(transformedAnswers)
    } catch (error) {
      console.error("Error loading attempt details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScorePercentage = (score: number, total: number) => {
    return total > 0 ? Math.round((score / total) * 100) : 0
  }

  const getScoreBadgeVariant = (score: number, total: number) => {
    const percentage = getScorePercentage(score, total)
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice"
      case "fill_blank":
        return "Fill in the Blank"
      case "short_answer":
        return "Short Answer"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading attempt details...</p>
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Quiz attempt not found.</p>
            <div className="text-center mt-4">
              <Link href="/admin-codexiom-1/results">
                <Button variant="outline">Back to Results</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = getScorePercentage(attempt.total_score, attempt.total_questions)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin-codexiom-1/results">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Test Attempt Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User Info & Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5" />
                  {attempt.user_name}
                </CardTitle>
                <CardDescription className="mb-4">{attempt.user_email}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started: {new Date(attempt.started_at).toLocaleString()}
                  </div>
                  {attempt.completed_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Completed: {new Date(attempt.completed_at).toLocaleString()}
                    </div>
                  )}
                  {!attempt.completed_at && (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  Variant {attempt.variant}
                </Badge>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  {attempt.completed_at ? (
                    <Badge variant={getScoreBadgeVariant(attempt.total_score, attempt.total_questions)}>
                      {percentage}% ({attempt.total_score}/{attempt.total_questions})
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      In Progress ({attempt.total_score}/{attempt.total_questions} answered)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          {attempt.user_info && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attempt.user_info.currentSalary && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Current/Previous Salary:</h4>
                    <p className="text-sm">{attempt.user_info.currentSalary}</p>
                  </div>
                )}
                {attempt.user_info.expectedSalary && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Expected Salary:</h4>
                    <p className="text-sm">{attempt.user_info.expectedSalary}</p>
                  </div>
                )}
                {attempt.user_info.reactExperience && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">React Experience:</h4>
                    <p className="text-sm">{attempt.user_info.reactExperience}</p>
                  </div>
                )}
                {attempt.user_info.reasonForLeaving && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Reason for Switching/Leaving:</h4>
                    <p className="text-sm">{attempt.user_info.reasonForLeaving}</p>
                  </div>
                )}
                {attempt.user_info.additionalInfo && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Additional Information:</h4>
                    <p className="text-sm">{attempt.user_info.additionalInfo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Detailed Answers */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            {attempt.completed_at ? "Question-by-Question Review" : "Answers So Far"}
          </h2>
          {userAnswers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {attempt.completed_at ? "No answers recorded." : "User hasn't answered any questions yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            userAnswers.map((answer, index) => (
              <Card
                key={answer.id}
                className={`border-l-4 ${
                  answer.question.question_type === "mcq"
                    ? answer.is_correct
                      ? "border-l-green-500"
                      : "border-l-red-500"
                    : "border-l-gray-400"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Q{index + 1}.</span>
                        <span className="text-balance">{answer.question.question_text}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getQuestionTypeLabel(answer.question.question_type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Answered: {new Date(answer.answered_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {answer.question.question_type === "mcq" ? (
                      answer.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )
                    ) : (
                      <Minus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* MCQ Options Display */}
                  {answer.question.question_type === "mcq" && answer.question.options && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Options:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(answer.question.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2 rounded text-sm border ${
                              key === answer.question.correct_answer
                                ? "bg-green-50 border-green-200 text-green-800"
                                : key === answer.user_answer
                                  ? "bg-red-50 border-red-200 text-red-800"
                                  : "bg-muted border-border"
                            }`}
                          >
                            <strong>{key.toUpperCase()}.</strong> {value}
                            {key === answer.question.correct_answer && (
                              <span className="ml-2 text-xs font-medium">(Correct)</span>
                            )}
                            {key === answer.user_answer && key !== answer.question.correct_answer && (
                              <span className="ml-2 text-xs font-medium">(User's Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answer Details */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">User's Answer:</h4>
                      <p
                        className={`text-sm ${
                          answer.question.question_type === "mcq"
                            ? answer.is_correct
                              ? "text-green-700"
                              : "text-red-700"
                            : "text-foreground"
                        }`}
                      >
                        {answer.user_answer}
                      </p>
                    </div>

                    {answer.question.question_type === "mcq" && !answer.is_correct && (
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Correct Answer:</h4>
                        <p className="text-sm text-green-700">{answer.question.correct_answer}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Explanation:</h4>
                      <p className="text-sm text-muted-foreground">{answer.question.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{attempt.total_score}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{attempt.total_questions - attempt.total_score}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attempt.total_questions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {percentage}%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
