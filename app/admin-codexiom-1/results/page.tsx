"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Search, Eye, Calendar, Users, TrendingUp, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuizAttempt {
  id: string
  user_name: string
  user_email: string
  variant: number
  started_at: string
  completed_at: string | null
  total_score: number
  total_questions: number
}

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterVariant, setFilterVariant] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    uniqueUsers: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadResults()
  }, [])

  useEffect(() => {
    filterResults()
    calculateStats()
  }, [attempts, searchTerm, filterVariant, filterStatus])

  const loadResults = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("quiz_attempts").select("*").order("started_at", { ascending: false })

      if (error) throw error
      setAttempts(data || [])
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterResults = () => {
    let filtered = attempts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (attempt) =>
          attempt.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attempt.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Variant filter
    if (filterVariant !== "all") {
      filtered = filtered.filter((attempt) => attempt.variant === Number.parseInt(filterVariant))
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "completed") {
        filtered = filtered.filter((attempt) => attempt.completed_at !== null)
      } else if (filterStatus === "incomplete") {
        filtered = filtered.filter((attempt) => attempt.completed_at === null)
      }
    }

    setFilteredAttempts(filtered)
  }

  const calculateStats = () => {
    const completed = attempts.filter((attempt) => attempt.completed_at !== null)
    const totalScore = completed.reduce((sum, attempt) => sum + attempt.total_score, 0)
    const uniqueEmails = new Set(attempts.map((attempt) => attempt.user_email))

    setStats({
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      averageScore: completed.length > 0 ? Math.round((totalScore / completed.length) * 100) / 100 : 0,
      uniqueUsers: uniqueEmails.size,
    })
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

  const deleteAttempt = async (attemptId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete the test attempt by ${userName}? This action cannot be undone.`)) {
      return
    }

    setDeletingId(attemptId)
    try {
      const supabase = createClient()

      // Delete quiz answers first (foreign key constraint)
      const { error: answersError } = await supabase.from("quiz_answers").delete().eq("attempt_id", attemptId)

      if (answersError) throw answersError

      // Delete the quiz attempt
      const { error: attemptError } = await supabase.from("quiz_attempts").delete().eq("id", attemptId)

      if (attemptError) throw attemptError

      // Update local state
      setAttempts((prev) => prev.filter((attempt) => attempt.id !== attemptId))

      toast({
        title: "Success",
        description: `Test attempt by ${userName} has been deleted.`,
      })
    } catch (error) {
      console.error("Error deleting attempt:", error)
      toast({
        title: "Error",
        description: "Failed to delete test attempt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin-codexiom-1">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Test Results</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAttempts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAttempts > 0
                  ? `${Math.round((stats.completedAttempts / stats.totalAttempts) * 100)}% completion rate`
                  : "No attempts yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-muted-foreground">Out of total questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-4">
          {filteredAttempts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    {attempts.length === 0 ? "No test attempts found." : "No attempts match your filters."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{attempt.user_name}</CardTitle>
                      <CardDescription className="mb-2">{attempt.user_email}</CardDescription>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Variant {attempt.variant}</Badge>
                        {attempt.completed_at ? (
                          <Badge
                            variant={getScoreBadgeVariant(attempt.total_score, attempt.total_questions)}
                            className="bg-transparent"
                          >
                            {getScorePercentage(attempt.total_score, attempt.total_questions)}% ({attempt.total_score}/
                            {attempt.total_questions})
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Incomplete</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Started: {new Date(attempt.started_at).toLocaleString()}</p>
                        {attempt.completed_at && <p>Completed: {new Date(attempt.completed_at).toLocaleString()}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin-codexiom-1/results/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAttempt(attempt.id, attempt.user_name)}
                        disabled={deletingId === attempt.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === attempt.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredAttempts.length} of {attempts.length} test attempts
        </div>
      </main>
    </div>
  )
}
