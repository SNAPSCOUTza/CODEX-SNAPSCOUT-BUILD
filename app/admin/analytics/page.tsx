import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // TODO: Add admin role check here
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("user_id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <AnalyticsDashboard />
    </div>
  )
}
