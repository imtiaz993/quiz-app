"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type AppGateProps = {
  children: React.ReactNode
}

const ACCESS_PASSWORD = "790106885299"

export function AppGate({ children }: AppGateProps) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    const trimmed = password.trim()
    if (trimmed === ACCESS_PASSWORD) {
      setIsAuthorized(true)
    } else {
      setError("Incorrect password. Please try again.")
    }
    setSubmitting(false)
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Enter Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-password">Password</Label>
                  <Input
                    id="app-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={error ? "border-destructive" : ""}
                    autoFocus
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={submitting || password.trim().length === 0}>
                  {submitting ? "Checking..." : "Unlock"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


