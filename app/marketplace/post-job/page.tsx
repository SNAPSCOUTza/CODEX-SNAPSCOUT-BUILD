"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, DollarSign, Clock, CheckCircle, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

const jobCategories = [
  "Commercial",
  "Wedding",
  "Short Film",
  "Music Video",
  "Documentary",
  "Corporate",
  "Event",
  "Fashion",
  "Product",
  "Real Estate",
]

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "One-time"]

const experienceLevels = [
  { label: "Entry Level", value: "entry" },
  { label: "Mid Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Expert", value: "expert" },
]

const locations = [
  "Cape Town, Western Cape",
  "Johannesburg, Gauteng",
  "Durban, KwaZulu-Natal",
  "Pretoria, Gauteng",
  "Port Elizabeth, Eastern Cape",
  "Bloemfontein, Free State",
  "Remote/Various",
]

const skillOptions = [
  "Cinematography",
  "Photography",
  "Video Editing",
  "Color Grading",
  "Sound Recording",
  "Lighting",
  "Directing",
  "Producing",
  "Drone Operation",
  "Motion Graphics",
  "VFX",
  "Makeup & Hair",
]

export default function PostJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitAttemptedRef = useRef(false)

  // Form state - collected on submit, not onChange
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    job_type: "",
    experience_level: "", // Updated to store values like 'entry', 'mid', etc.
    location: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "ZAR",
    positions_available: "1",
    application_deadline: "",
    remote_option: false,
    required_skills: [] as string[],
    responsibilities: "",
    qualifications: "",
  })

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting || submitAttemptedRef.current) return
    submitAttemptedRef.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current user session - single call
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Please sign in to post a job")
        setIsSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      const { error: insertError } = await supabase.from("jobs").insert({
        client_id: session.user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        location: formData.location,
        salary_min: formData.salary_min ? Number.parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number.parseFloat(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        positions_available: Number.parseInt(formData.positions_available) || 1,
        application_deadline: formData.application_deadline || null,
        remote_option: formData.remote_option,
        required_skills: formData.required_skills,
        responsibilities: formData.responsibilities,
        qualifications: formData.qualifications,
        status: "active",
      })

      if (insertError) {
        console.error("Error posting job:", insertError)
        setError(insertError.message)
        setIsSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      setSubmitSuccess(true)

      // Redirect after short delay to show success
      setTimeout(() => {
        router.push("/marketplace/available-jobs?posted=true")
      }, 1500)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
      setIsSubmitting(false)
      submitAttemptedRef.current = false
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600">Redirecting to available jobs...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/marketplace/available-jobs"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600 mt-1">Find talented film and photography professionals for your project</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>Provide information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
              )}

              {/* Job Title */}
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Corporate Video Production"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the job, requirements, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  rows={5}
                  className="mt-1"
                />
              </div>

              {/* Category & Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Job Type *</Label>
                  <Select
                    value={formData.job_type}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, job_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Experience & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Experience Level *</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, experience_level: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Range (ZAR)
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Input
                    type="number"
                    placeholder="Min (e.g., 5000)"
                    value={formData.salary_min}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salary_min: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max (e.g., 15000)"
                    value={formData.salary_max}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salary_max: e.target.value }))}
                  />
                </div>
              </div>

              {/* Positions & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positions">Positions Available</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions_available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, positions_available: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Application Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, application_deadline: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Remote Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={formData.remote_option}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, remote_option: checked as boolean }))}
                />
                <Label htmlFor="remote">This job can be done remotely</Label>
              </div>

              {/* Required Skills */}
              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.required_skills.includes(skill) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        formData.required_skills.includes(skill)
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                      {formData.required_skills.includes(skill) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="List the main responsibilities..."
                  value={formData.responsibilities}
                  onChange={(e) => setFormData((prev) => ({ ...prev, responsibilities: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Qualifications */}
              <div>
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  placeholder="List required qualifications..."
                  value={formData.qualifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, qualifications: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.description ||
                    !formData.category ||
                    !formData.job_type ||
                    !formData.experience_level ||
                    !formData.location
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Posting...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
