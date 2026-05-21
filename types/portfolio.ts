export type PortfolioSourcePlatform =
  | "local"
  | "instagram"
  | "facebook"
  | "youtube"
  | "vimeo"
  | "imdb"
  | "external"

export type PortfolioMediaType = "image" | "video" | "embed" | "external"

export type ProfilePortfolioItem = {
  id: string
  user_id?: string
  source_platform?: PortfolioSourcePlatform | null
  media_type?: PortfolioMediaType | null
  source_url?: string | null
  thumbnail_url?: string | null
  full_media_url?: string | null
  embed_url?: string | null
  title?: string | null
  caption?: string | null
  sort_order?: number | null
  is_visible?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  type?: "image" | "video"
  thumbnail?: string
  fullUrl?: string
  platform?: PortfolioSourcePlatform
  link?: string
  embedUrl?: string
  duration?: number
}

export type LightboxPortfolioItem = {
  id: string
  type: "image" | "video"
  thumbnail: string
  fullUrl?: string
  title?: string
  platform?: PortfolioSourcePlatform
  duration?: number
  link?: string
  embedUrl?: string
}

export function normalizePortfolioItem(item: ProfilePortfolioItem, index = 0): LightboxPortfolioItem {
  const platform = item.source_platform || item.platform || "local"
  const mediaType = item.media_type || item.type || "image"
  const thumbnail =
    item.thumbnail_url ||
    item.thumbnail ||
    item.full_media_url ||
    item.fullUrl ||
    item.source_url ||
    "/placeholder.svg"

  return {
    id: item.id || `portfolio-${index}`,
    type: mediaType === "image" || mediaType === "external" ? "image" : "video",
    thumbnail,
    fullUrl: item.full_media_url || item.fullUrl || item.thumbnail_url || item.thumbnail || undefined,
    title: item.title || item.caption || undefined,
    platform,
    link: item.source_url || item.link || undefined,
    embedUrl: item.embed_url || item.embedUrl || undefined,
    duration: item.duration,
  }
}

export function fallbackImagesToPortfolioItems(
  images: string[] = [],
  ownerId = "profile",
  titlePrefix = "Portfolio",
): LightboxPortfolioItem[] {
  return images.filter(Boolean).map((image, index) => ({
    id: `${ownerId}-fallback-${index}`,
    type: "image",
    thumbnail: image,
    fullUrl: image,
    title: `${titlePrefix} ${index + 1}`,
    platform: "local",
  }))
}
