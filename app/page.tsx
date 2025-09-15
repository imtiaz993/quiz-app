import { UserRegistration } from "@/components/user-registration"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Frontend Developer Quiz</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <UserRegistration />
      </main>
    </div>
  )
}
