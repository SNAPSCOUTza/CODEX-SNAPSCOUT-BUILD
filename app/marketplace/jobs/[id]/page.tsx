"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Users, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

// Mock job for fallback
const mockJob = {
  id: "mock-1",
  title: "Corporate Video Production",
  location: "Cape Town, Western Cape",
  category: "Commercial",
  job_type: "Contract",
  salary_min: 15000,
  salary_max: 25000,
  salary_currency: "ZAR",
  experience_level: "mid", // Changed from "Mid-level" to "mid"
  description:
    "Looking for a complete video production team for corporate training videos. Need director, cinematographer, and editor.",
  required_skills: ["Cinematography", "Video Editing", "Directing"],
  responsibilities:
    "Lead video production from concept to completion. Manage crew and equipment. Deliver high-quality corporate training content.",
  qualifications:
    "Minimum 3 years experience in corporate video production. Professional equipment required. Portfolio showcasing similar work.",
  remote_option: false,
  positions_available: 3,
  status: "active",
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  application_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  client: {
    id: "client-1",
    full_name: "Sarah Johnson",
    profile_image_url:
      "https://images.pexels.com/photos/2327360/pexels-photo-2327360.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
}

export default function JobApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Prevent duplicate submissions
  const submitAttemptedRef = useRef(false)
  const dataFetchedRef = useRef(false)

  const [applicationData, setApplicationData] = useState({
    cover_message: "",
    proposed_rate: "",
    proposed_timeline: "",
    portfolio_samples: "",
  })

  useEffect(() => {
    if (dataFetchedRef.current) return

    const fetchJobAndCheckApplication = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // Get session once
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setCurrentUserId(session.user.id)
        }

        // Check if using mock ID
        if (params.id.startsWith("mock-")) {
          setJob(mockJob)
          setLoading(false)
          dataFetchedRef.current = true
          return
        }

        // Single query to fetch job with client info
        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select(`
            *,
            client:client_id (
              id,
              full_name,
              profile_image_url
            )
          `)
          .eq("id", params.id)
          .single()

        if (jobError || !jobData) {
          setJob(mockJob)
        } else {
          setJob(jobData)

          if (session?.user) {
            const { data: existingApp } = await supabase
              .from("project_applications")
              .select("id")
              .eq("project_id", params.id)
              .eq("freelancer_id", session.user.id)
              .maybeSingle()

            if (existingApp) {
              setAlreadyApplied(true)
            }
          }
        }

        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error:", err)
        setJob(mockJob)
      } finally {
        setLoading(false)
      }
    }

    fetchJobAndCheckApplication()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (submitting || submitAttemptedRef.current || alreadyApplied) return
    submitAttemptedRef.current = true
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Please sign in to apply")
        setSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      // Parse portfolio samples as array
      const portfolioSamples = applicationData.portfolio_samples
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const { error: insertError } = await supabase.from("project_applications").insert({
        project_id: params.id.startsWith("mock-") ? null : params.id,
        freelancer_id: session.user.id,
        cover_message: applicationData.cover_message,
        proposed_rate: applicationData.proposed_rate ? Number.parseFloat(applicationData.proposed_rate) : null,
        proposed_timeline: applicationData.proposed_timeline,
        portfolio_samples: portfolioSamples,
        status: "pending",
      })

      if (insertError) {
        console.error("Error submitting application:", insertError)
        setError(insertError.message)
        setSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      setSubmitSuccess(true)
      setAlreadyApplied(true)

      setTimeout(() => {
        router.push("/marketplace/my-applications?success=true")
      }, 1500)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
      setSubmitting(false)
      submitAttemptedRef.current = false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link href="/marketplace/available-jobs">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600">Redirecting to your applications...</p>
        </motion.div>
      </div>
    )
  }

  const formatBudget = () => {
    if (job.salary_min && job.salary_max) {
      return `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}`
    }
    if (job.salary_max) return `Up to R${job.salary_max.toLocaleString()}`
    if (job.salary_min) return `From R${job.salary_min.toLocaleString()}`
    return "Negotiable"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/marketplace/available-jobs"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apply for Position</h1>
            <p className="text-gray-600">Submit your application for this opportunity</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <Badge variant="secondary">{job.category}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {job.job_type}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  {formatBudget()}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {job.positions_available || 1} position(s)
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.client && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Posted By</h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={job.client.profile_image_url || "/placeholder.svg?height=40&width=40"}
                        alt={job.client.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-medium text-gray-900">{job.client.full_name}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                {alreadyApplied && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg mt-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>You have already applied to this job</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                  )}

                  {/* Proposed Rate */}
                  <div>
                    <Label htmlFor="rate">Your Proposed Rate (ZAR)</Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="e.g., 5000"
                      value={applicationData.proposed_rate}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, proposed_rate: e.target.value }))}
                      className="mt-1"
                      disabled={alreadyApplied}
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <Label htmlFor="timeline">Proposed Timeline</Label>
                    <Select
                      value={applicationData.proposed_timeline}
                      onValueChange={(value) => setApplicationData((prev) => ({ ...prev, proposed_timeline: value }))}
                      disabled={alreadyApplied}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Available Immediately</SelectItem>
                        <SelectItem value="1-week">Within 1 Week</SelectItem>
                        <SelectItem value="2-weeks">Within 2 Weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 Month</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Portfolio Samples */}
                  <div>
                    <Label htmlFor="portfolio">Portfolio Links (comma-separated)</Label>
                    <Input
                      id="portfolio"
                      type="text"
                      placeholder="https://portfolio.com/project1, https://vimeo.com/12345"
                      value={applicationData.portfolio_samples}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, portfolio_samples: e.target.value }))}
                      className="mt-1"
                      disabled={alreadyApplied}
                    />
                  </div>

                  {/* Cover Message */}
                  <div>
                    <Label htmlFor="coverMessage">Cover Message *</Label>
                    <Textarea
                      id="coverMessage"
                      placeholder="Tell the client why you're perfect for this role..."
                      rows={6}
                      value={applicationData.cover_message}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, cover_message: e.target.value }))}
                      required
                      className="mt-1"
                      disabled={alreadyApplied}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || alreadyApplied || !applicationData.cover_message}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : alreadyApplied ? (
                        "Already Applied"
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
