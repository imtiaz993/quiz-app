"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface MCQOption {
  key: string
  value: string
}

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "fill_blank" | "short_answer"
  variant: number
  options?: Record<string, string>
  correct_answer: string
  explanation: string
}

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [questionId, setQuestionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "" as "mcq" | "fill_blank" | "short_answer" | "",
    variant: "" as "1" | "2" | "3" | "",
    correct_answer: "",
    explanation: "",
  })
  const [mcqOptions, setMcqOptions] = useState<MCQOption[]>([
    { key: "a", value: "" },
    { key: "b", value: "" },
    { key: "c", value: "" },
    { key: "d", value: "" },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setQuestionId(resolvedParams.id)
      loadQuestion(resolvedParams.id)
    }
    getParams()
  }, [params])

  const loadQuestion = async (id: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("questions").select("*").eq("id", id).single()

      if (error) throw error

      const question: Question = data
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        variant: question.variant.toString() as "1" | "2" | "3",
        correct_answer: question.correct_answer,
        explanation: question.explanation,
      })

      // Load MCQ options if it's an MCQ question
      if (question.question_type === "mcq" && question.options) {
        const options = Object.entries(question.options).map(([key, value]) => ({ key, value }))
        setMcqOptions(options)
      }
    } catch (error) {
      console.error("Error loading question:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.question_text.trim()) {
      newErrors.question_text = "Question text is required"
    }

    if (!formData.question_type) {
      newErrors.question_type = "Question type is required"
    }

    if (!formData.variant) {
      newErrors.variant = "Variant is required"
    }

    if (!formData.correct_answer.trim()) {
      newErrors.correct_answer = "Correct answer is required"
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = "Explanation is required"
    }

    // MCQ specific validation
    if (formData.question_type === "mcq") {
      const filledOptions = mcqOptions.filter((opt) => opt.value.trim())
      if (filledOptions.length < 2) {
        newErrors.mcq_options = "At least 2 options are required for MCQ"
      }

      const validKeys = mcqOptions.filter((opt) => opt.value.trim()).map((opt) => opt.key)
      if (!validKeys.includes(formData.correct_answer.toLowerCase())) {
        newErrors.correct_answer = "Correct answer must match one of the option keys (a, b, c, d)"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)

    try {
      const supabase = createClient()

      // Prepare options for MCQ
      let options = null
      if (formData.question_type === "mcq") {
        options = {}
        mcqOptions.forEach((opt) => {
          if (opt.value.trim()) {
            options[opt.key] = opt.value.trim()
          }
        })
      }

      const { error } = await supabase
        .from("questions")
        .update({
          question_text: formData.question_text.trim(),
          question_type: formData.question_type,
          variant: Number.parseInt(formData.variant),
          options,
          correct_answer: formData.correct_answer.trim(),
          explanation: formData.explanation.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", questionId)

      if (error) throw error

      router.push("/admin-codexiom-1/questions")
    } catch (error) {
      console.error("Error updating question:", error)
      setErrors({ submit: "Failed to update question. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const updateMcqOption = (index: number, value: string) => {
    const newOptions = [...mcqOptions]
    newOptions[index].value = value
    setMcqOptions(newOptions)
  }

  const addMcqOption = () => {
    const nextKey = String.fromCharCode(97 + mcqOptions.length) // a, b, c, d, e, f...
    setMcqOptions([...mcqOptions, { key: nextKey, value: "" }])
  }

  const removeMcqOption = (index: number) => {
    if (mcqOptions.length > 2) {
      setMcqOptions(mcqOptions.filter((_, i) => i !== index))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading question...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin-codexiom-1/questions">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Questions
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Edit Question</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Question</CardTitle>
            <CardDescription>Update the question details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Textarea
                  id="question_text"
                  placeholder="Enter your question..."
                  value={formData.question_text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, question_text: e.target.value }))}
                  rows={3}
                  className={errors.question_text ? "border-destructive" : ""}
                />
                {errors.question_text && <p className="text-sm text-destructive">{errors.question_text}</p>}
              </div>

              {/* Question Type and Variant */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question_type">Question Type *</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={(value: "mcq" | "fill_blank" | "short_answer") =>
                      setFormData((prev) => ({ ...prev, question_type: value }))
                    }
                  >
                    <SelectTrigger className={errors.question_type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.question_type && <p className="text-sm text-destructive">{errors.question_type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variant">Variant *</Label>
                  <Select
                    value={formData.variant}
                    onValueChange={(value: "1" | "2" | "3") => setFormData((prev) => ({ ...prev, variant: value }))}
                  >
                    <SelectTrigger className={errors.variant ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Variant 1</SelectItem>
                      <SelectItem value="2">Variant 2</SelectItem>
                      <SelectItem value="3">Variant 3</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.variant && <p className="text-sm text-destructive">{errors.variant}</p>}
                </div>
              </div>

              {/* MCQ Options */}
              {formData.question_type === "mcq" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMcqOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mcqOptions.map((option, index) => (
                      <div key={option.key} className="flex items-center gap-2">
                        <Label className="w-8 text-center font-mono">{option.key.toUpperCase()}.</Label>
                        <Input
                          placeholder={`Option ${option.key.toUpperCase()}`}
                          value={option.value}
                          onChange={(e) => updateMcqOption(index, e.target.value)}
                          className="flex-1"
                        />
                        {mcqOptions.length > 2 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeMcqOption(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.mcq_options && <p className="text-sm text-destructive">{errors.mcq_options}</p>}
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label htmlFor="correct_answer">
                  Correct Answer *
                  {formData.question_type === "mcq" && (
                    <span className="text-sm text-muted-foreground ml-2">(Enter option key: a, b, c, d, etc.)</span>
                  )}
                </Label>
                <Input
                  id="correct_answer"
                  placeholder={
                    formData.question_type === "mcq" ? "Enter option key (a, b, c, d)" : "Enter the correct answer"
                  }
                  value={formData.correct_answer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, correct_answer: e.target.value }))}
                  className={errors.correct_answer ? "border-destructive" : ""}
                />
                {errors.correct_answer && <p className="text-sm text-destructive">{errors.correct_answer}</p>}
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation *</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain why this is the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                  rows={3}
                  className={errors.explanation ? "border-destructive" : ""}
                />
                {errors.explanation && <p className="text-sm text-destructive">{errors.explanation}</p>}
              </div>

              {/* Submit Error */}
              {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/admin-codexiom-1/questions">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
