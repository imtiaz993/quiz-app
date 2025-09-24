"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserInfo, QuizAttempt } from "@/app/quiz/page"
import { Trophy, AlertCircle } from "lucide-react"

interface QuizResultsProps {
  attempt: QuizAttempt
  userInfo: UserInfo
  onStartNewQuiz: () => void
}

export function QuizResults({ attempt, userInfo }: QuizResultsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [attempt.id])

  const mcqScore = attempt.mcqScore || 0
  const totalMcqs = attempt.totalMcqs || 0
  const textualQuestions = attempt.textualQuestions || 0
  const mcqPercentage = totalMcqs > 0 ? Math.round((mcqScore / totalMcqs) * 100) : 0
  const isEligible = mcqPercentage >= 70

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Complete!</h1>
          <p className="text-lg text-muted-foreground">Great job, {userInfo.name}! Here are your results.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your MCQ Score</span>
              <Badge variant={getScoreBadgeVariant(mcqScore, totalMcqs)}>{mcqPercentage}%</Badge>
            </CardTitle>
            <CardDescription>
              Test Variant {attempt.variant} • Completed on {new Date(attempt.completedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{attempt.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMcqs}</p>
                <p className="text-sm text-muted-foreground">Total MCQs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mcqScore}</p>
                <p className="text-sm text-muted-foreground">Correct MCQs</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(mcqScore, totalMcqs)}`}>{mcqPercentage}%</p>
                <p className="text-sm text-muted-foreground">MCQ Accuracy</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-medium text-foreground">70% accuracy of MCQs is required to become eligible for the next step.</p>
              {!isEligible && (
                <p className="text-xl text-destructive mt-1">You didn't qualify for the next step. Please aim for at least 70%.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {textualQuestions > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Textual Answers Under Review</h3>
                  <p className="text-amber-700 text-sm">
                    You answered {textualQuestions} textual question{textualQuestions > 1 ? "s" : ""} that will be
                    verified by our admin team. Your final score will be updated once the review is complete.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-muted-foreground">Thank you for taking the test! Your results have been recorded.</p>
        </div>
      </div>
    </div>
  )
}
