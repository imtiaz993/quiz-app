"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Edit, Trash2, ArrowLeft, Upload, Copy } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "fill_blank" | "short_answer"
  variant: number
  skill: string
  options?: Record<string, string>
  correct_answer: string
  explanation: string
  created_at: string
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterVariant, setFilterVariant] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterSkill, setFilterSkill] = useState<string>("all")
  const [jsonInput, setJsonInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showJsonDialog, setShowJsonDialog] = useState(false)
  const [availableSkills, setAvailableSkills] = useState<{ id: string; name: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadQuestions()
    loadSkills()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, filterVariant, filterType, filterSkill])

  const loadQuestions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          skills!inner(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const questionsWithSkills =
        data?.map((question) => ({
          ...question,
          skill: question.skills.name,
        })) || []

      setQuestions(questionsWithSkills)
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSkills = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("skills").select("id, name").order("name")

      if (error) throw error
      setAvailableSkills(data || [])
    } catch (error) {
      console.error("Error loading skills:", error)
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((q) => q.question_text.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Variant filter
    if (filterVariant !== "all") {
      filtered = filtered.filter((q) => q.variant === Number.parseInt(filterVariant))
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((q) => q.question_type === filterType)
    }

    // Skill filter
    if (filterSkill !== "all") {
      filtered = filtered.filter((q) => q.skill === filterSkill)
    }

    setFilteredQuestions(filtered)
  }

  const deleteQuestion = async (questionId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("questions").delete().eq("id", questionId)

      if (error) throw error

      // Remove from local state
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    } catch (error) {
      console.error("Error deleting question:", error)
    }
  }

  const handleJsonUpload = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter JSON data",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const questionsData = JSON.parse(jsonInput)

      if (!Array.isArray(questionsData)) {
        throw new Error("JSON must be an array of questions")
      }

      const validSkillIds = new Set(availableSkills.map((skill) => skill.id))
      const invalidQuestions = questionsData.filter((q) => !validSkillIds.has(q.skill_id))

      if (invalidQuestions.length > 0) {
        throw new Error(
          `Invalid skill_id found. Please use one of the available skill IDs: ${availableSkills.map((s) => `${s.name} (${s.id})`).join(", ")}`,
        )
      }

      const processedQuestions = questionsData.map((question) => {
        if (question.question_type === "mcq" && Array.isArray(question.options)) {
          // Convert array to object with keys a, b, c, d
          const optionsObject: Record<string, string> = {}
          const keys = ["a", "b", "c", "d", "e", "f"] // Support up to 6 options

          question.options.forEach((option: string, index: number) => {
            if (index < keys.length) {
              optionsObject[keys[index]] = option
            }
          })

          // Find the correct answer key based on the answer text
          let correctAnswerKey = ""
          for (const [key, value] of Object.entries(optionsObject)) {
            if (value.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()) {
              correctAnswerKey = key
              break
            }
          }

          if (!correctAnswerKey) {
            throw new Error(
              `Correct answer "${question.correct_answer}" not found in options for question: "${question.question_text}"`,
            )
          }

          return {
            ...question,
            options: optionsObject,
            correct_answer: correctAnswerKey,
          }
        }

        return question
      })

      const supabase = createClient()
      const { data, error } = await supabase.from("questions").insert(processedQuestions).select()

      if (error) throw error

      toast({
        title: "Success",
        description: `${questionsData.length} questions uploaded successfully`,
      })

      setJsonInput("")
      setShowJsonDialog(false)
      loadQuestions()
    } catch (error) {
      console.error("Error uploading questions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload questions",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyJsonFormat = () => {
    const sampleSkillId = availableSkills.length > 0 ? availableSkills[0].id : "550e8400-e29b-41d4-a716-446655440000"

    const sampleFormat = [
      {
        skill_id: sampleSkillId,
        question_text: "Which of the following is not a JavaScript data type?",
        question_type: "mcq",
        options: ["Boolean", "Undefined", "Float", "Symbol"],
        correct_answer: "Float",
        explanation:
          "JavaScript has Boolean, Undefined, and Symbol as data types, but not Float. Numbers are just 'number' type.",
        variant: 1,
      },
      {
        skill_id: sampleSkillId,
        question_text: "The _______ keyword is used to import functions or components from another file in ES6.",
        question_type: "fill_blank",
        options: [],
        correct_answer: "import",
        explanation: "The import keyword is used for ES6 module imports.",
        variant: 1,
      },
      {
        skill_id: sampleSkillId,
        question_text: "What is the difference between == and === in JavaScript?",
        question_type: "short_answer",
        options: [],
        correct_answer:
          "== performs type coercion before comparison, === compares both value and type without coercion",
        explanation: "== allows type conversion, === requires exact match of type and value.",
        variant: 1,
      },
    ]

    navigator.clipboard.writeText(JSON.stringify(sampleFormat, null, 2))
    toast({
      title: "Copied!",
      description: `JSON format copied to clipboard. Available skills: ${availableSkills.map((s) => `${s.name} (${s.id})`).join(", ")}`,
    })
  }

  const uniqueSkills = Array.from(new Set(questions.map((q) => q.skill))).sort()

  const getTypeLabel = (type: string) => {
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

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "mcq":
        return "default"
      case "fill_blank":
        return "secondary"
      case "short_answer":
        return "outline"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin-codexiom-1">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Question Management</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* JSON upload dialog */}
              <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload JSON
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Upload Questions via JSON</DialogTitle>
                    <DialogDescription>
                      Upload multiple questions at once using JSON format. Click "Copy Format" to get the correct
                      structure with valid skill IDs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {availableSkills.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Available Skills:</p>
                        <div className="grid grid-cols-1 gap-1 text-xs">
                          {availableSkills.map((skill) => (
                            <div key={skill.id} className="font-mono">
                              {skill.name}: <span className="text-muted-foreground">{skill.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={copyJsonFormat}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Format
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Paste your JSON data here..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={15}
                      className="font-mono text-sm h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowJsonDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleJsonUpload} disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Questions"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Link href="/admin-codexiom-1/questions/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter questions by type, variant, and skill</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterVariant} onValueChange={setFilterVariant}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Variants</SelectItem>
                  <SelectItem value="1">Variant 1</SelectItem>
                  <SelectItem value="2">Variant 2</SelectItem>
                  <SelectItem value="3">Variant 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
              {/* Skill filter dropdown */}
              <Select value={filterSkill} onValueChange={setFilterSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {uniqueSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    {questions.length === 0
                      ? "No questions found. Add your first question!"
                      : "No questions match your filters."}
                  </p>
                  {questions.length === 0 && (
                    <Link href="/admin-codexiom-1/questions/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-balance mb-2">{question.question_text}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getTypeBadgeVariant(question.question_type)}>
                          {getTypeLabel(question.question_type)}
                        </Badge>
                        <Badge variant="outline">Variant {question.variant}</Badge>
                        {/* Skill badge */}
                        <Badge variant="secondary">{question.skill}</Badge>
                      </div>
                      <CardDescription>
                        Correct Answer: <span className="font-medium">{question.correct_answer}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin-codexiom-1/questions/${question.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Question</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this question? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteQuestion(question.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                {question.question_type === "mcq" && question.options && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div
                          key={key}
                          className={`p-2 rounded text-sm ${
                            key === question.correct_answer ? "bg-green-100 text-green-800" : "bg-muted"
                          }`}
                        >
                          <strong>{key.toUpperCase()}.</strong> {value}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </main>
    </div>
  )
}
