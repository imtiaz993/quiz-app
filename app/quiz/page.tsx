"use client"

import { useState } from "react"
import { UserRegistration } from "@/components/user-registration"
import { QuizInterface } from "@/components/quiz-interface"
import { QuizResults } from "@/components/quiz-results"

export type UserInfo = {
  name: string
  email: string
  currentSalary: string
  expectedSalary: string
  reasonForLeaving: string
}

export type QuizAttempt = {
  id: string
  variant: number
  totalScore: number
  totalQuestions: number
  completedAt: string
  mcqScore?: number
  totalMcqs?: number
  textualQuestions?: number
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState<"registration" | "quiz" | "results">("registration")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)

  const handleRegistrationComplete = (info: UserInfo) => {
    setUserInfo(info)
    setCurrentStep("quiz")
  }

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setQuizAttempt(attempt)
    setCurrentStep("results")
  }

  const handleStartNewQuiz = () => {
    setCurrentStep("registration")
    setUserInfo(null)
    setQuizAttempt(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "registration" && <UserRegistration onComplete={handleRegistrationComplete} />}

      {currentStep === "quiz" && userInfo && <QuizInterface userInfo={userInfo} onComplete={handleQuizComplete} />}

      {currentStep === "results" && quizAttempt && userInfo && (
        <QuizResults attempt={quizAttempt} userInfo={userInfo} onStartNewQuiz={handleStartNewQuiz} />
      )}
    </div>
  )
}
