"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserInfo } from "@/app/quiz/page"
import { BookOpen } from "lucide-react"

interface UserRegistrationProps {
  onComplete: (userInfo: UserInfo) => void
}

export function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    additionalInfo: "",
    reactExperience: "", // Added React experience field
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

    // additionalInfo is optional

    if (!formData.reactExperience.trim()) {
      newErrors.reactExperience = "React experience is required"
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
      additionalInfo: formData.additionalInfo.trim() || undefined,
      reactExperience: formData.reactExperience.trim(), // Added React experience to form data
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

              {/* Salary fields removed as requested */}

              <div className="space-y-2">
                <Label htmlFor="reactExperience">React Experience *</Label>
                <Select
                  value={formData.reactExperience}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, reactExperience: value }))}
                >
                  <SelectTrigger className={errors.reactExperience ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your React experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No Professional Experience">No Professional Experience</SelectItem>
                    <SelectItem value="3+ Months">3+ Months</SelectItem>
                    <SelectItem value="6+ Months">6+ Months</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                  </SelectContent>
                </Select>
                {errors.reactExperience && <p className="text-sm text-destructive">{errors.reactExperience}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Anything you'd like to share (optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Share anything you'd like us to know about you or your goals..."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                  rows={3}
                />
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
