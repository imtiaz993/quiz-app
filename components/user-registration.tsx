"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserInfo } from "@/app/quiz/page"
import { BookOpen } from "lucide-react"

interface UserRegistrationProps {
  onComplete: (userInfo: UserInfo) => void
}

export function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentSalary: "",
    expectedSalary: "",
    reasonForLeaving: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.currentSalary.trim()) {
      newErrors.currentSalary = "Current/Previous salary is required"
    }

    if (!formData.expectedSalary.trim()) {
      newErrors.expectedSalary = "Expected salary is required"
    }

    if (!formData.reasonForLeaving.trim()) {
      newErrors.reasonForLeaving = "Reason for switching/leaving is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Simulate a brief loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    onComplete({
      name: formData.name.trim(),
      email: formData.email.trim(),
      currentSalary: formData.currentSalary.trim(),
      expectedSalary: formData.expectedSalary.trim(),
      reasonForLeaving: formData.reasonForLeaving.trim(),
    })

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Codexiom</h1>
          <p className="text-muted-foreground">Please provide your information to begin the test</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>We need some basic information before you start the test</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentSalary">Current/Previous Salary *</Label>
                <Input
                  id="currentSalary"
                  type="text"
                  placeholder="Enter your current or previous salary"
                  value={formData.currentSalary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentSalary: e.target.value }))}
                  className={errors.currentSalary ? "border-destructive" : ""}
                />
                <p className="text-xs text-muted-foreground">Slip will be required at the time of joining</p>
                {errors.currentSalary && <p className="text-sm text-destructive">{errors.currentSalary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary *</Label>
                <Input
                  id="expectedSalary"
                  type="text"
                  placeholder="Enter your expected salary"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expectedSalary: e.target.value }))}
                  className={errors.expectedSalary ? "border-destructive" : ""}
                />
                {errors.expectedSalary && <p className="text-sm text-destructive">{errors.expectedSalary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForLeaving">Reason for Switching/Leaving Last Job *</Label>
                <Textarea
                  id="reasonForLeaving"
                  placeholder="Please explain your reason for switching or leaving your last job..."
                  value={formData.reasonForLeaving}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reasonForLeaving: e.target.value }))}
                  rows={3}
                  className={errors.reasonForLeaving ? "border-destructive" : ""}
                />
                {errors.reasonForLeaving && <p className="text-sm text-destructive">{errors.reasonForLeaving}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Starting Test..." : "Start Test"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
