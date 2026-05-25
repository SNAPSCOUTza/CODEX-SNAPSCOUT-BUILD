import type { AhaCardItem, OnboardingBranch, OnboardingQuestion, OnboardingRole, OnboardingTrack } from "@/types/onboarding"

const provinces = [
  { value: "johannesburg_gauteng", label: "Johannesburg & Gauteng" },
  { value: "cape_town_western_cape", label: "Cape Town & Western Cape" },
  { value: "other_province", label: "Other province" },
]

const optionize = (labels: string[]) =>
  labels.map((label) => ({
    label,
    value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
  }))

export const roleCards = [
  {
    role: "scout" as const,
    icon: "search",
    badgeLabel: "Free",
    badgeClass: "bg-green-100 text-green-700 border border-green-200",
    title: "Scout",
    description: "Find & hire creatives, studios and gear",
    price: "Free / always free",
    features: ["Browse unlimited profiles", "Contact crew directly", "Filter by location"],
    ctaClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    role: "creator" as const,
    icon: "camera",
    badgeLabel: "Most Popular",
    badgeClass: "bg-red-700 text-white",
    title: "Creator",
    description: "Photographers, videographers & film crew",
    price: "R129/month",
    features: ["Professional profile", "Showcase credits & gear", "Get discovered by clients"],
    ctaClass: "bg-red-700 hover:bg-red-800 text-white",
  },
  {
    role: "studio_store" as const,
    icon: "building",
    badgeLabel: "R489/mo",
    badgeClass: "bg-purple-600 text-white",
    title: "Studio & Store",
    description: "Studios, spaces & gear rental shops",
    price: "R489/month",
    features: ["List your space or store", "Accept bookings", "Manage rentals & terms"],
    ctaClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
]

export const branchOptions: Record<Exclude<OnboardingRole, "scout">, { id: OnboardingBranch; title: string; subtitle: string }[]> = {
  creator: [
    { id: "content_creator", title: "Creator", subtitle: "Photographer / Videographer" },
    { id: "film_crew", title: "Film Crew", subtitle: "Director, DOP, sound and more" },
  ],
  studio_store: [
    { id: "studio", title: "Studio", subtitle: "List spaces and in-house gear" },
    { id: "store", title: "Store", subtitle: "List rental or sales inventory" },
  ],
}

export const tracks: Record<string, OnboardingTrack> = {
  scout: {
    role: "scout",
    title: "Scout onboarding",
    questions: [
      { id: "q1", prompt: "What are you mainly looking for?", mode: "single", layout: "cards", options: optionize(["Photographers & Videographers", "Film & Production Crew", "Studios, Spaces & Gear"]) },
      { id: "q2", prompt: "What industry are you in?", mode: "single", layout: "cards", options: optionize(["Fashion & Lifestyle", "Music & Entertainment", "Corporate & Brand"]) },
      { id: "q3", prompt: "How often do you hire creatives?", mode: "single", layout: "cards", options: optionize(["Once off project", "A few times a year", "Regularly / Ongoing"]) },
      { id: "q4", prompt: "What's your typical project size?", mode: "single", layout: "cards", options: optionize(["Solo or small shoot", "Small crew (2–5 people)", "Full production team"]) },
      { id: "q5", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
      { id: "q6", prompt: "What's your usual budget range per project?", mode: "single", layout: "cards", options: optionize(["Under R5,000", "R5,000 – R20,000", "R20,000+"]) },
      { id: "q7", prompt: "How do you prefer to communicate with creatives?", mode: "single", layout: "cards", options: optionize(["Direct message on SnapScout", "Email", "Phone or WhatsApp"]) },
      { id: "q8", prompt: "What matters most when hiring?", mode: "single", layout: "cards", options: optionize(["Portfolio quality", "Price and availability", "Reviews and reputation"]) },
    ],
  },
  content_creator: {
    role: "creator",
    branch: "content_creator",
    title: "Creator onboarding",
    questions: [
      { id: "q1", prompt: "What's your craft?", mode: "single", layout: "cards", options: optionize(["Photography", "Videography", "Both"]) },
      {
        id: "q2",
        prompt: "What are your specialisations?",
        mode: "multi",
        layout: "chips",
        options: optionize([
          "Portrait", "Wedding", "Fashion", "Product", "Food", "Events", "Corporate", "Lifestyle", "Fine Art", "Street", "Real Estate", "Nature", "Family/Newborn", "Boudoir", "Architectural",
          "Music Videos", "Social Media", "Commercial/Ads", "Documentary", "Drone", "YouTube", "TikTok/Reels", "Live Streaming", "Animation", "Brand Story", "Training/Ed",
        ]),
      },
      { id: "q3", prompt: "How experienced are you?", mode: "single", layout: "three-col", options: optionize(["Beginner (0–2 years)", "Intermediate (2–5 years)", "Professional (5+ years)"]) },
      { id: "q4", prompt: "What's your gear situation?", mode: "single", layout: "cards", options: optionize(["Fully equipped", "Some gear, rent the rest", "I rent everything I need"]) },
      { id: "q5", prompt: "How do you work?", mode: "single", layout: "cards", options: optionize(["Freelance, on my own", "Part of a collective or agency", "I run my own studio"]) },
      { id: "q6", prompt: "What's your typical availability?", mode: "single", layout: "three-col", options: optionize(["Full time, most days", "Part time / weekends", "Project by project"]) },
      { id: "q7", prompt: "What type of clients do you mainly work with?", mode: "single", layout: "cards", options: optionize(["Individual clients and small businesses", "Brands and marketing teams", "Agencies and productions"]) },
      { id: "q8", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  film_crew: {
    role: "creator",
    branch: "film_crew",
    title: "Film crew onboarding",
    questions: [
      { id: "q1", prompt: "What's your primary role?", mode: "single", layout: "two-col", options: optionize(["Director", "Producer", "Cinematographer / DOP", "Camera Operator", "Sound Engineer", "Boom Operator", "Gaffer", "Editor", "Script Supervisor", "Makeup Artist"]) },
      { id: "q2", prompt: "How experienced are you?", mode: "single", layout: "three-col", options: optionize(["Beginner (0–2 years)", "Intermediate (2–5 years)", "Professional (5+ years)"]) },
      { id: "q3", prompt: "What type of productions do you work on?", mode: "multi", layout: "chips", options: optionize(["Film & TV", "Commercials & Brand", "Music Videos", "Events & Corporate", "Documentary"]) },
      { id: "q4", prompt: "Do you own your own equipment?", mode: "single", layout: "three-col", options: optionize(["Yes, fully equipped", "Some, rent the rest", "Productions supply everything"]) },
      { id: "q5", prompt: "Are you available to travel?", mode: "single", layout: "cards", options: optionize(["Yes, anywhere in SA", "Local to my city only", "International too"]) },
      { id: "q6", prompt: "How do you prefer to be contracted?", mode: "single", layout: "three-col", options: optionize(["Day rate", "Project rate", "Either works"]) },
      { id: "q7", prompt: "How do you work?", mode: "single", layout: "cards", options: optionize(["Freelance, independently", "Part of a crew or collective", "Employed by a production company"]) },
      { id: "q8", prompt: "Where are you based?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  studio: {
    role: "studio_store",
    branch: "studio",
    title: "Studio onboarding",
    questions: [
      { id: "q1", prompt: "What does your studio offer?", mode: "single", layout: "cards", options: optionize(["Space & location rental", "Gear rental", "Both space and gear"]) },
      { id: "q2", prompt: "What type of space are you listing?", mode: "single", layout: "cards", options: optionize(["Photo / Film Studio", "Home or Residential", "Outdoor / Unique Venue"]) },
      { id: "q3", prompt: "How big is your space?", mode: "single", layout: "three-col", options: optionize(["Small (under 50sqm)", "Medium (50–150sqm)", "Large (150sqm+)"]) },
      { id: "q4", prompt: "What kind of shoots do you accommodate?", mode: "multi", layout: "chips", options: optionize(["Photography", "Film & Video", "Music Videos", "Fashion & Editorial", "Corporate & Brand", "Events"]) },
      { id: "q5", prompt: "Do you take a deposit for bookings?", mode: "single", layout: "cards", options: optionize(["Yes, always upfront", "No deposits", "Depends on the booking"]) },
      { id: "q6", prompt: "What's your minimum booking duration?", mode: "single", layout: "three-col", options: optionize(["By the hour", "Half day minimum", "Full day minimum"]) },
      { id: "q7", prompt: "Do you have in-house gear available?", mode: "single", layout: "cards", options: optionize(["Yes, included in booking", "Yes, available to hire separately", "No, bring your own"]) },
      { id: "q8", prompt: "Where is your studio located?", mode: "single", layout: "cards", options: provinces },
    ],
  },
  store: {
    role: "studio_store",
    branch: "store",
    title: "Store onboarding",
    questions: [
      { id: "q1", prompt: "What does your store offer?", mode: "single", layout: "cards", options: optionize(["Gear rental only", "Gear sales only", "Rental and sales"]) },
      { id: "q2", prompt: "What type of gear do you carry?", mode: "multi", layout: "chips", options: optionize(["Camera bodies & lenses", "Lighting & grip", "Audio & sound", "Drones", "Stabilisers & rigs", "Accessories & small gear"]) },
      { id: "q3", prompt: "What brands do you carry?", mode: "multi", layout: "chips", options: optionize(["Sony", "Canon", "Nikon", "Arri", "RED", "DJI", "Aputure", "Rode", "Other"]) },
      { id: "q4", prompt: "Do you take a deposit for rentals?", mode: "single", layout: "cards", options: optionize(["Yes, always upfront", "No deposits", "Depends on the gear"]) },
      { id: "q5", prompt: "How do you handle rental terms?", mode: "single", layout: "cards", options: optionize(["Standard terms for all rentals", "Custom terms per client", "Still figuring this out"]) },
      { id: "q6", prompt: "Do you offer delivery?", mode: "single", layout: "three-col", options: optionize(["Collection only", "Delivery available", "Both options"]) },
      { id: "q7", prompt: "Who do you mainly supply?", mode: "single", layout: "cards", options: optionize(["Independent photographers & videographers", "Film and production crews", "Both equally"]) },
      { id: "q8", prompt: "Where is your store located?", mode: "single", layout: "cards", options: provinces },
    ],
  },
}

export const roleTheme: Record<OnboardingRole, { primary: string; light: string; selection: string; label: string; accountType: string }> = {
  scout: {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    light: "bg-green-50 text-green-700 border-green-200",
    selection: "border-green-600 bg-green-50",
    label: "Scout",
    accountType: "scout",
  },
  creator: {
    primary: "bg-red-700 hover:bg-red-800 text-white",
    light: "bg-red-50 text-red-700 border-red-200",
    selection: "border-red-700 bg-red-50",
    label: "Creator",
    accountType: "content_creator",
  },
  studio_store: {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    light: "bg-purple-50 text-purple-700 border-purple-200",
    selection: "border-purple-600 bg-purple-50",
    label: "Studio & Store",
    accountType: "studio",
  },
}

export const ahaCards: AhaCardItem[] = [
  { id: "a1", name: "Lebo M.", subtitle: "Photographer", rate: "From R950 /hr", badge: "Portrait", availability: "Available this week" },
  { id: "a2", name: "Nandi S.", subtitle: "Stylist", rate: "From R600 /hr", badge: "Fashion", availability: "Available this week" },
  { id: "a3", name: "Jaden R.", subtitle: "Editor", rate: "From R800 /hr", badge: "Post", availability: "Available this week" },
  { id: "a4", name: "Urban Loft Studio", subtitle: "Studio", rate: "From R850 /hr", badge: "Space", availability: "Available this week" },
]

export const featureTourSteps = [
  { id: "tour1", title: "Save locations for later", text: "Tap the heart on profiles and spaces to keep your favorites.", target: "heart" },
  { id: "tour2", title: "Your saved collection", text: "Everything you save appears in your dashboard collections.", target: "dashboard" },
  { id: "tour3", title: "Book or connect", text: "Open any profile and use Contact or Book to start.", target: "cta" },
  { id: "tour4", title: "Refine your search", text: "Use filters to quickly narrow to the right fit.", target: "filters" },
]

export function getTrack(role: OnboardingRole | null, branch: OnboardingBranch | null): OnboardingTrack | null {
  if (!role) return null
  if (role === "scout") return tracks.scout
  if (!branch) return null
  return tracks[branch] || null
}

export function getPersonaLine(role: OnboardingRole | null, branch: OnboardingBranch | null, answers: Record<string, string | string[]>) {
  if (role === "scout") {
    const priority = answers.q8
    return `A feed tuned for your hiring priorities${priority ? `: ${String(priority).replace(/_/g, " ")}` : ""}.`
  }
  if (role === "creator" && branch === "film_crew") {
    return "Your crew-facing profile is matched to productions actively hiring."
  }
  if (role === "studio_store") {
    return "Your listing can attract nearby productions looking to book now."
  }
  return "Your profile is ready to match with the right projects."
}
