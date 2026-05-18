"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Eye, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ProjectApplication, ApplicationStatus } from "@/types/marketplace"
import { formatDistanceToNow } from "date-fns"

export function MyApplications() {
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const supabase = createClient()

  const fetchApplications = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("User not authenticated")
        return
      }

      const { data, error } = await supabase
        .from("project_applications")
        .select(`
          *,
          project:project_id (
            id,
            title,
            category,
            project_type,
            city,
            province,
            rate_amount,
            rate_type,
            is_negotiable,
            status,
            client:client_id (
              id,
              display_name,
              profile_picture
            )
          )
        `)
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "shortlisted":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "hired":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filterApplications = (status?: ApplicationStatus) => {
    if (!status) return applications
    return applications.filter((app) => app.status === status)
  }

  const formatRate = (application: ProjectApplication) => {
    if (application.proposed_rate) {
      return `R${application.proposed_rate.toLocaleString()}`
    }
    if (application.project?.rate_amount) {
      return `R${application.project.rate_amount.toLocaleString()}`
    }
    return "Rate negotiable"
  }

  if (loading) {
    return <div className="text-center py-8">Loading your applications...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
        <p className="text-gray-600">Track the status of your project applications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterApplications("pending").length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({filterApplications("shortlisted").length})</TabsTrigger>
          <TabsTrigger value="hired">Hired ({filterApplications("hired").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filterApplications("rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filterApplications("pending").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="shortlisted" className="space-y-4">
          {filterApplications("shortlisted").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="hired" className="space-y-4">
          {filterApplications("hired").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterApplications("rejected").map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </TabsContent>
      </Tabs>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Start applying to projects to see your applications here.</p>
          <Button className="bg-red-600 hover:bg-red-700">Browse Projects</Button>
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ application }: { application: ProjectApplication }) {
  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "shortlisted":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "hired":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-blue-100 text-blue-800"
      case "hired":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatRate = (application: ProjectApplication) => {
    if (application.proposed_rate) {
      return `R${application.proposed_rate.toLocaleString()}`
    }
    if (application.project?.rate_amount) {
      return `R${application.project.rate_amount.toLocaleString()}`
    }
    return "Rate negotiable"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{application.project?.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">{application.project?.category}</Badge>
              {application.project?.project_type && <Badge variant="outline">{application.project.project_type}</Badge>}
              <Badge className={getStatusColor(application.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-600">{formatRate(application)}</p>
            {application.proposed_timeline && <p className="text-sm text-gray-500">{application.proposed_timeline}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Application Message Preview */}
          <div>
            <p className="text-sm text-gray-600 line-clamp-2">{application.cover_message}</p>
          </div>

          {/* Project Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {(application.project?.city || application.project?.province) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{[application.project.city, application.project.province].filter(Boolean).join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Applied {formatDistanceToNow(new Date(application.created_at))} ago</span>
            </div>
          </div>

          {/* Portfolio Samples */}
          {application.portfolio_samples.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Portfolio samples:</p>
              <div className="flex flex-wrap gap-2">
                {application.portfolio_samples.slice(0, 3).map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                  >
                    Sample {index + 1}
                  </a>
                ))}
                {application.portfolio_samples.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{application.portfolio_samples.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">Project status: {application.project?.status}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Project
              </Button>
              {application.status === "hired" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact Client
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

