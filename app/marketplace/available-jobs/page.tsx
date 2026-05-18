"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, DollarSign, Users, Plus, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

// Mock data fallback when database is empty
const mockJobs = [
  {
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
    remote_option: false,
    positions_available: 3,
    status: "active",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Sarah Johnson",
      profile_image_url:
        "https://images.pexels.com/photos/2327360/pexels-photo-2327360.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-2",
    title: "Wedding Photography & Videography",
    location: "Johannesburg, Gauteng",
    category: "Wedding",
    job_type: "One-time",
    salary_min: 8000,
    salary_max: 12000,
    salary_currency: "ZAR",
    experience_level: "senior", // Changed from "Senior" to "senior"
    description: "Seeking experienced wedding photographer and videographer for luxury wedding in Sandton.",
    required_skills: ["Photography", "Cinematography", "Lighting"],
    remote_option: false,
    positions_available: 2,
    status: "active",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Michael Chen",
      profile_image_url:
        "https://images.pexels.com/photos/31847340/pexels-photo-31847340.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-3",
    title: "Music Video Production",
    location: "Cape Town, Western Cape",
    category: "Music Video",
    job_type: "Freelance",
    salary_min: 30000,
    salary_max: 50000,
    salary_currency: "ZAR",
    experience_level: "expert", // Changed from "Expert" to "expert"
    description: "High-energy music video for upcoming artist. Need creative director and full production team.",
    required_skills: ["Directing", "Cinematography", "Color Grading", "Motion Graphics"],
    remote_option: false,
    positions_available: 5,
    status: "active",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "David Mthembu",
      profile_image_url:
        "https://images.pexels.com/photos/11627682/pexels-photo-11627682.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
  {
    id: "mock-4",
    title: "Documentary Series",
    location: "Remote/Various",
    category: "Documentary",
    job_type: "Contract",
    salary_min: 40000,
    salary_max: 60000,
    salary_currency: "ZAR",
    experience_level: "senior", // Changed from "Senior" to "senior"
    description: "Wildlife documentary series needs experienced crew comfortable with remote locations.",
    required_skills: ["Cinematography", "Sound Recording", "Producing"],
    remote_option: true,
    positions_available: 4,
    status: "active",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    application_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    client: {
      full_name: "Lisa van der Merwe",
      profile_image_url:
        "https://images.pexels.com/photos/27442268/pexels-photo-27442268.jpeg?auto=compress&cs=tinysrgb&w=150",
    },
  },
]

const jobCategories = [
  "All Types",
  "Commercial",
  "Wedding",
  "Short Film",
  "Music Video",
  "Documentary",
  "Corporate",
  "Event",
  "Fashion",
]
const locationOptions = ["All Locations", "Cape Town", "Johannesburg", "Durban", "Pretoria", "Remote"]

export default function AvailableJobsPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [sortBy, setSortBy] = useState("newest")
  const [showPostedSuccess, setShowPostedSuccess] = useState(false)

  // Cache ref to prevent refetching
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    // Show success message if just posted
    if (searchParams.get("posted") === "true") {
      setShowPostedSuccess(true)
      setTimeout(() => setShowPostedSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    if (dataFetchedRef.current) return

    const fetchJobs = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (jobsError) {
          console.error("Error fetching jobs:", jobsError)
          setJobs(mockJobs)
          setUsingMockData(true)
          dataFetchedRef.current = true
          setLoading(false)
          return
        }

        if (!jobsData || jobsData.length === 0) {
          setJobs(mockJobs)
          setUsingMockData(true)
          dataFetchedRef.current = true
          setLoading(false)
          return
        }

        // Fetch client profiles separately for each unique client_id
        const clientIds = [...new Set(jobsData.map((job) => job.client_id).filter(Boolean))]

        const { data: clientsData, error: clientsError } = await supabase
          .from("profiles")
          .select("id, full_name, profile_image_url")
          .in("id", clientIds)

        if (clientsError) {
          console.error("Error fetching clients:", clientsError)
        }

        // Map clients to jobs
        const clientsMap = new Map(clientsData?.map((client) => [client.id, client]) || [])
        const jobsWithClients = jobsData.map((job) => ({
          ...job,
          client: job.client_id ? clientsMap.get(job.client_id) : null,
        }))

        setJobs(jobsWithClients)
        setUsingMockData(false)

        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error:", err)
        setJobs(mockJobs)
        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // Client-side filtering (no API calls)
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "All Types" || job.category === selectedType
    const matchesLocation = selectedLocation === "All Locations" || job.location?.includes(selectedLocation)
    return matchesSearch && matchesType && matchesLocation
  })

  // Client-side sorting (no API calls)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "budget-high":
        return (b.salary_max || 0) - (a.salary_max || 0)
      case "budget-low":
        return (a.salary_min || 0) - (b.salary_min || 0)
      case "deadline":
        return new Date(a.application_deadline || 0).getTime() - new Date(b.application_deadline || 0).getTime()
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const formatBudget = (job: any) => {
    if (job.salary_min && job.salary_max) {
      return `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}`
    }
    if (job.salary_max) return `Up to R${job.salary_max.toLocaleString()}`
    if (job.salary_min) return `From R${job.salary_min.toLocaleString()}`
    return "Negotiable"
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  const formatDeadline = (dateString: string | null) => {
    if (!dateString) return null
    const deadline = new Date(dateString)
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Expired"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    return `${diffDays} days left`
  }

  const formatExperienceLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior",
      expert: "Expert",
    }
    return levelMap[level] || level
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Banner */}
      {showPostedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border-b border-green-200 py-3"
        >
          <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>Your job has been posted successfully!</span>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">Available Jobs</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover exciting film and photography opportunities. Apply to projects that match your skills.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full"
              />
            </div>

            {/* Post Job Button */}
            <Link href="/marketplace/post-job">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Button>
            </Link>

            {usingMockData && (
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Showing sample jobs for testing
                </Badge>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters and Jobs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {jobCategories.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                <SelectItem value="budget-low">Budget: Low to High</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600 ml-auto">
              <span>
                {sortedJobs.length} job{sortedJobs.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {sortedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl text-gray-900">{job.title}</CardTitle>
                          {job.remote_option && (
                            <Badge variant="secondary" className="text-xs">
                              Remote OK
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.job_type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatBudget(job)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatTimeAgo(job.created_at)}</p>
                        {job.application_deadline && (
                          <p className="text-sm font-medium text-primary">{formatDeadline(job.application_deadline)}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    {/* Skills */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.required_skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                          <Badge key={`${job.id}-skill-${skillIndex}`} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.required_skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.required_skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Posted By */}
                    {job.client && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              job.client.profile_image_url || "/placeholder.svg?height=40&width=40&query=professional"
                            }
                            alt={job.client.full_name || "Client"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{job.client.full_name || "Client"}</p>
                            <p className="text-sm text-gray-600">{job.category}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {job.positions_available || 1} position{(job.positions_available || 1) > 1 ? "s" : ""} available
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/marketplace/jobs/${job.id}`}>
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {sortedJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
