"use client"
import Link from "next/link"
import Image from "next/image"
import { useProfileStore } from "@/hooks/use-profile-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Instagram, Linkedin, Youtube, UserPlus, Edit, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DemoProfilePreviewPage() {
  const { profile } = useProfileStore()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 sm:p-8">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold text-blue-800">This is a Demo Preview</AlertTitle>
          <AlertDescription className="flex items-center justify-between text-blue-800">
            This is how your profile will look to clients. Ready to go live?
            <div>
              <Button asChild size="sm" className="ml-4 bg-transparent" variant="outline">
                <Link href="/dashboard">
                  <Edit className="h-4 w-4 mr-2" />
                  Continue Editing
                </Link>
              </Button>
              <Button asChild size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/signup">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up & Publish
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={profile.profile_picture || "/placeholder.svg"}
                    alt={profile.display_name}
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                <p className="text-gray-600">{profile.profession}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {profile.city}, {profile.province}
                </p>
                <div className="mt-4 flex justify-center space-x-2">
                  {profile.instagram && (
                    <Button asChild size="icon" variant="ghost">
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram />
                      </a>
                    </Button>
                  )}
                  {profile.linkedin && (
                    <Button asChild size="icon" variant="ghost">
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin />
                      </a>
                    </Button>
                  )}
                  {profile.youtube_vimeo && (
                    <Button asChild size="icon" variant="ghost">
                      <a href={profile.youtube_vimeo} target="_blank" rel="noopener noreferrer">
                        <Youtube />
                      </a>
                    </Button>
                  )}
                  {profile.website_url && (
                    <Button asChild size="icon" variant="ghost">
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.roles.map((role, roleIndex) => (
                  <Badge key={`role-${roleIndex}`}>{role}</Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.portfolio_images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.portfolio_images.map((image, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No portfolio images have been added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
