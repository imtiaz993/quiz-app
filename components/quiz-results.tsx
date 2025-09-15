"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { UserInfo, QuizAttempt } from "@/app/quiz/page"
import { Trophy } from "lucide-react"

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

  const percentage = Math.round((attempt.totalScore / attempt.totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
          <p className="text-lg text-muted-foreground">Great job, {userInfo.name}! Here are your results.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Score</span>
              <Badge variant={getScoreBadgeVariant(attempt.totalScore, attempt.totalQuestions)}>{percentage}%</Badge>
            </CardTitle>
            <CardDescription>
              Quiz Variant {attempt.variant} • Completed on {new Date(attempt.completedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{attempt.totalScore}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attempt.totalQuestions - attempt.totalScore}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attempt.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(attempt.totalScore, attempt.totalQuestions)}`}>
                  {percentage}%
                </p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground">Thank you for taking the quiz! Your results have been recorded.</p>
        </div>
      </div>
    </div>
  )
}
