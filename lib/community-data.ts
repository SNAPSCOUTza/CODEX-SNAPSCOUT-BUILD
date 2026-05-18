export type CommunityPost = {
  id: string
  slug: string
  title: string
  headline: string
  body: string
  category: "News" | "Resources" | "Tutorials" | "Spotlights" | "Announcements"
  cover_image_url: string
  published_at: string
  access_level: "preview" | "subscribers"
  status: "draft" | "published"
}

export const communityCategories = ["All", "News", "Resources", "Tutorials", "Spotlights", "Announcements"] as const

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    slug: "winter-location-scouting-cape-town",
    title: "Winter location scouting in Cape Town",
    headline: "How to plan light, weather windows, and crew call times for colder production days.",
    body:
      "Winter shoots reward preparation. Keep your location shortlist tight, build in weather holds, and confirm indoor backup spaces before deposit day. For smaller crews, choose locations with strong natural light, easy parking, and quick load-in access.",
    category: "Tutorials",
    cover_image_url: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    access_level: "subscribers",
    status: "published",
  },
  {
    id: "post-2",
    slug: "snapscout-creator-spotlight-lebo",
    title: "Creator spotlight: Lebo M.",
    headline: "A Cape Town photographer building a clean natural-light portfolio for local brands.",
    body:
      "Lebo's work shows how strong visual consistency helps clients understand your style before the first call. His strongest profile signals are clear categories, honest response times, and a portfolio that opens with recent commercial work.",
    category: "Spotlights",
    cover_image_url: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    access_level: "preview",
    status: "published",
  },
  {
    id: "post-3",
    slug: "gear-checklist-for-brand-shoots",
    title: "Gear checklist for brand shoots",
    headline: "A practical pre-shoot checklist for cameras, audio, power, backups, and files.",
    body:
      "Bring more batteries than you think, label media before arrival, and keep one clean audio backup rolling during interviews. For fast turnarounds, align card naming, file transfer, and editor handoff before the first shot.",
    category: "Resources",
    cover_image_url: "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    access_level: "subscribers",
    status: "published",
  },
  {
    id: "post-4",
    slug: "platform-update-availability-calendar",
    title: "Platform update: availability calendar",
    headline: "Bookable profiles can now surface live availability directly on profile pages.",
    body:
      "Availability is one of the strongest booking signals for clients. The new calendar makes it easier to choose the right profile, request a date, and avoid slow back-and-forth messages.",
    category: "Announcements",
    cover_image_url: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=900",
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    access_level: "preview",
    status: "published",
  },
]
