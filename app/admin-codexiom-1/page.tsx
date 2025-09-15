import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Quiz Admin Panel</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Question Management</CardTitle>
              <CardDescription>Add, edit, and manage quiz questions across all skill areas</CardDescription>
              <Link href="/admin-codexiom-1/questions">
                <Button className="mt-4">Manage Questions</Button>
              </Link>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>View user quiz attempts and analyze performance data</CardDescription>
              <Link href="/admin-codexiom-1/results">
                <Button className="mt-4">View Results</Button>
              </Link>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
