"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { UserInfo, QuizAttempt } from "@/app/quiz/page"
import { createClient } from "@/lib/supabase/client"
import { Clock, XCircle } from "lucide-react"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "fill_blank" | "short_answer"
  skill: string
  options?: Record<string, string>
  correct_answer: string
  explanation: string
}

interface QuizInterfaceProps {
  userInfo: UserInfo
  onComplete: (attempt: QuizAttempt) => void
}

export function QuizInterface({ userInfo, onComplete }: QuizInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptId, setAttemptId] = useState<string>("")
  const [variant, setVariant] = useState<number>(1)
  const [timeLeft, setTimeLeft] = useState(1200) // Changed timer to 20 minutes (1200 seconds)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const hasAttemptBeenCreated = useRef(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isTimeUp) {
      setIsTimeUp(true)
      finishQuiz()
    }
  }, [timeLeft, isTimeUp])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const loadQuestions = async () => {
    // Prevent multiple attempts from being created
    if (hasAttemptBeenCreated.current) {
      console.log("Attempt already created for this component instance, skipping...")
      return
    }

    hasAttemptBeenCreated.current = true
    
    try {
      const supabase = createClient()

      const selectedVariant = Math.floor(Math.random() * 3) + 1
      setVariant(selectedVariant)

      const { data: allQuestionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          *,
          skills!skill_id(name)
        `)
        .eq("variant", selectedVariant)
        .order("created_at")

      if (questionsError) {
        console.error("[v0] Database query error:", questionsError)
        throw questionsError
      }

      console.log("[v0] Raw questions data:", allQuestionsData)

      const questionsWithSkills =
        allQuestionsData?.map((question) => ({
          ...question,
          skill: question.skills?.name || "Unknown",
        })) || []

      console.log("[v0] Questions with skills:", questionsWithSkills)

      if (questionsWithSkills.length === 0) {
        console.log("[v0] No questions found for variant", selectedVariant)
        setQuestions([])
        return
      }

      const questionsBySkill = questionsWithSkills.reduce(
        (acc, question) => {
          if (!acc[question.skill]) {
            acc[question.skill] = []
          }
          acc[question.skill].push(question)
          return acc
        },
        {} as Record<string, Question[]>,
      )

      const skills = Object.keys(questionsBySkill)
      const totalAvailableQuestions = questionsWithSkills.length
      const targetQuestionsPerTest = Math.min(50, totalAvailableQuestions)
      const questionsPerSkill = Math.floor(targetQuestionsPerTest / skills.length)
      const remainingQuestions = targetQuestionsPerTest % skills.length

      let selectedQuestions: Question[] = []

      skills.forEach((skill, index) => {
        const skillQuestions = questionsBySkill[skill]
        const questionsToTake = questionsPerSkill + (index < remainingQuestions ? 1 : 0)

        const shuffled = [...skillQuestions].sort(() => Math.random() - 0.5)
        selectedQuestions.push(...shuffled.slice(0, Math.min(questionsToTake, skillQuestions.length)))
      })

      const mcqQuestions = selectedQuestions.filter((q) => q.question_type === "mcq")
      const otherQuestions = selectedQuestions.filter((q) => q.question_type !== "mcq")

      // Shuffle MCQs
      const shuffledMcqs = [...mcqQuestions].sort(() => Math.random() - 0.5)

      // Combine: MCQs first, then other questions
      selectedQuestions = [...shuffledMcqs, ...otherQuestions]

      console.log("[v0] Final selected questions:", selectedQuestions.length)

      // Check if there's already an incomplete attempt for this user
      console.log("Checking for existing attempts for email:", userInfo.email)
      const { data: allIncompleteAttempts, error: existingError } = await supabase
        .from("quiz_attempts")
        .select("id, completed_at, started_at")
        .eq("user_email", userInfo.email)
        .is("completed_at", null)
        .order("started_at", { ascending: false })

      console.log("All incomplete attempts for user:", allIncompleteAttempts)

      // If there are multiple incomplete attempts, delete the older ones
      if (allIncompleteAttempts && allIncompleteAttempts.length > 1) {
        console.log(`Found ${allIncompleteAttempts.length} incomplete attempts, cleaning up...`)
        const attemptsToDelete = allIncompleteAttempts.slice(1) // Keep the most recent one
        for (const attempt of attemptsToDelete) {
          console.log("Deleting old incomplete attempt:", attempt.id)
          await supabase.from("quiz_attempts").delete().eq("id", attempt.id)
        }
      }

      const existingAttempt = allIncompleteAttempts && allIncompleteAttempts.length > 0 ? allIncompleteAttempts[0] : null

      let currentAttemptId

      if (existingAttempt && !existingError) {
        // Use existing incomplete attempt
        currentAttemptId = existingAttempt.id
        console.log("Using existing incomplete attempt:", currentAttemptId)
      } else {
        // Create new attempt
        console.log("No existing attempt found, creating new one for:", userInfo.email)
        const { data: attemptData, error: attemptError } = await supabase
          .from("quiz_attempts")
          .insert({
            user_name: userInfo.name,
            user_email: userInfo.email,
            user_info: {
              reactExperience: userInfo.reactExperience,
              additionalInfo: userInfo.additionalInfo || null,
            },
            variant: selectedVariant,
            total_questions: selectedQuestions.length,
          })
          .select()
          .single()

        if (attemptError) {
          console.error("Error creating new attempt:", attemptError)
          throw attemptError
        }
        currentAttemptId = attemptData.id
        console.log("Created new attempt:", currentAttemptId)
      }

      setQuestions(selectedQuestions)
      setAttemptId(currentAttemptId)
    } catch (error) {
      console.error("[v0] Error loading questions:", error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!questions[currentQuestionIndex]) return

    const currentQuestion = questions[currentQuestionIndex]
    const userAnswer = userAnswers[currentQuestion.id] || ""

    if (!userAnswer.trim()) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const correct = checkAnswer(currentQuestion, userAnswer)

      await supabase.from("user_answers").insert({
        attempt_id: attemptId,
        question_id: currentQuestion.id,
        user_answer: userAnswer,
        is_correct: correct,
      })

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        finishQuiz()
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const checkAnswer = (question: Question, userAnswer: string): boolean => {
    const correctAnswer = question.correct_answer.toLowerCase().trim()
    const answer = userAnswer.toLowerCase().trim()

    console.log("[v0] Checking answer:", {
      questionType: question.question_type,
      userAnswer: answer,
      correctAnswer: correctAnswer,
    })

    if (question.question_type === "mcq") {
      return answer === correctAnswer
    } else if (question.question_type === "fill_blank") {
      return answer === correctAnswer
    } else {
      return answer.includes(correctAnswer.toLowerCase()) || correctAnswer.toLowerCase().includes(answer)
    }
  }

  const finishQuiz = async () => {
    try {
      const supabase = createClient()

      const { data: answersData } = await supabase
        .from("user_answers")
        .select(`
          is_correct,
          questions!inner(question_type)
        `)
        .eq("attempt_id", attemptId)

      const totalScore = answersData?.filter((answer) => answer.is_correct).length || 0

      const mcqAnswers = answersData?.filter((answer) => (answer.questions as any)?.question_type === "mcq") || []
      const mcqCorrect = mcqAnswers.filter((answer) => answer.is_correct).length
      const totalMcqs = mcqAnswers.length
      const textualQuestions = questions.filter((q) => q.question_type !== "mcq").length

      // First, try to update with all fields
      let updateData: any = {
        completed_at: new Date().toISOString(),
        total_score: totalScore,
        mcq_score: mcqCorrect,
        total_mcqs: totalMcqs,
      }

      let { error: updateError } = await supabase
        .from("quiz_attempts")
        .update(updateData)
        .eq("id", attemptId)

      // If the update fails (likely due to missing MCQ fields), try without them
      if (updateError) {
        console.warn("First update failed, trying without MCQ fields:", updateError)
        updateData = {
          completed_at: new Date().toISOString(),
          total_score: totalScore,
        }
        
        const { error: retryError } = await supabase
          .from("quiz_attempts")
          .update(updateData)
          .eq("id", attemptId)
        
        updateError = retryError
      }

      if (updateError) {
        console.error("Error updating quiz attempt:", updateError)
        throw updateError
      }

      console.log("Quiz attempt updated successfully:", {
        attemptId,
        completed_at: new Date().toISOString(),
        total_score: totalScore,
        mcq_score: mcqCorrect,
        total_mcqs: totalMcqs,
      })

      onComplete({
        id: attemptId,
        variant,
        totalScore,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString(),
        mcqScore: mcqCorrect,
        totalMcqs: totalMcqs,
        textualQuestions,
      })
    } catch (error) {
      console.error("Error finishing quiz:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-lg text-muted-foreground">Loading your quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-4">
              The database needs to be set up with questions. Please run the database setup script first.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{formatTime(timeLeft)}</span>
                <span className="text-sm text-muted-foreground">remaining</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Quiz Assessment</h1>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
       <Card className="mb-6 select-none">
          <CardHeader>
            <CardTitle className="text-xl text-balance">{currentQuestion.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* MCQ Questions */}
            {currentQuestion.question_type === "mcq" && currentQuestion.options && (
              <RadioGroup
                value={userAnswers[currentQuestion.id] || ""}
                onValueChange={(value) => setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))}
              >
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={key} />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      {key.toUpperCase()}. {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Fill in the Blank Questions */}
            {currentQuestion.question_type === "fill_blank" && (
              <Input
                placeholder="Enter your answer..."
                value={userAnswers[currentQuestion.id] || ""}
                onChange={(e) => setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                className="text-lg"
              />
            )}

            {/* Short Answer Questions */}
            {currentQuestion.question_type === "short_answer" && (
              <Textarea
                placeholder="Enter your answer..."
                value={userAnswers[currentQuestion.id] || ""}
                onChange={(e) => setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                rows={4}
                className="text-base"
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div></div>
          <Button
            onClick={handleAnswerSubmit}
            disabled={!userAnswers[currentQuestion.id]?.trim() || isSubmitting}
            size="lg"
          >
            {isSubmitting
              ? "Submitting..."
              : currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
          </Button>
        </div>
      </div>
    </div>
  )
}
