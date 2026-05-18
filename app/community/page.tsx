"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Bookmark, Home, Lock, Sparkles, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { communityCategories, mockCommunityPosts, type CommunityPost } from "@/lib/community-data"

function isNewPost(post: CommunityPost) {
  return Date.now() - new Date(post.published_at).getTime() < 48 * 60 * 60 * 1000
}

export default function CommunityPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts)
  const [category, setCategory] = useState<(typeof communityCategories)[number]>("All")
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null)
  const [openPost, setOpenPost] = useState<CommunityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState<string[]>([])

  const isSubscriber = profile?.subscription_status === "active"

  useEffect(() => {
    window.localStorage.setItem("community_last_visited", String(Date.now()))

    async function loadPosts() {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from("community_posts")
          .select("id, slug, title, headline, body, category, cover_image_url, published_at, access_level, status")
          .eq("status", "published")
          .order("published_at", { ascending: false })

        if (error) throw error
        if (data?.length) setPosts(data as CommunityPost[])
      } catch {
        setPosts(mockCommunityPosts)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    if (category === "All") return posts
    return posts.filter((post) => post.category === category)
  }, [category, posts])

  const handleOpenPost = (post: CommunityPost) => {
    const locked = post.access_level === "subscribers" && !isSubscriber
    if (locked) {
      setExpandedPreviewId((current) => (current === post.id ? null : post.id))
      return
    }
    setOpenPost(post)
  }

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <section className="px-4 pb-10 pt-8 md:px-8 md:pt-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button asChild variant="outline" className="h-11 rounded-full px-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-full px-4 md:hidden">
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Community
              </Badge>
              <h1 className="text-[32px] font-bold leading-none md:text-5xl">SnapScout Community</h1>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground md:text-base">
                News, resources, and spotlights for SA creatives.
              </p>
            </div>
            {!isSubscriber && (
              <Button asChild className="h-[52px] rounded-full px-6">
                <Link href="/subscribe">Subscribe to read</Link>
              </Button>
            )}
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {communityCategories.map((item) => (
              <motion.button
                key={item}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(item)}
                className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </motion.button>
            ))}
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {filteredPosts.map((post) => {
                const locked = post.access_level === "subscribers" && !isSubscriber
                const expanded = expandedPreviewId === post.id

                return (
                  <motion.article key={post.id} layout>
                    <Card className="overflow-hidden rounded-2xl border-border bg-card">
                      <button type="button" onClick={() => handleOpenPost(post)} className="block w-full text-left">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image src={post.cover_image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                          {locked && (
                            <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur">
                              <Lock className="h-4 w-4" />
                            </div>
                          )}
                          {isNewPost(post) && (
                            <span className="absolute left-3 top-3 inline-flex min-h-8 animate-pulse items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-lg">
                              New
                            </span>
                          )}
                          <Badge className="absolute bottom-3 left-3 rounded-full">{post.category}</Badge>
                        </div>
                        <CardContent className="grid gap-2 p-4">
                          <p className="font-mono text-[12px] text-muted-foreground">
                            {new Date(post.published_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}
                          </p>
                          <h2 className="line-clamp-2 text-[16px] font-bold leading-tight md:text-[24px]">{post.title}</h2>
                          <p className="line-clamp-3 text-[14px] text-muted-foreground">{post.headline}</p>
                        </CardContent>
                      </button>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t"
                          >
                            <div className="grid gap-3 p-4">
                              <div className="relative overflow-hidden rounded-2xl bg-muted p-4">
                                <p className="blur-[3px] text-[14px] leading-6 text-muted-foreground">{post.body}</p>
                                <div className="absolute inset-0 grid place-items-center bg-background/35">
                                  <Button asChild className="h-[52px] rounded-full px-6">
                                    <Link href="/subscribe">Subscribe to read</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!openPost} onOpenChange={(open) => !open && setOpenPost(null)}>
        <DialogContent className="bottom-0 left-auto right-0 top-0 h-full max-h-none max-w-xl translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 p-0 sm:max-w-xl">
          {openPost && (
            <>
              <div className="relative aspect-[4/3]">
                <Image src={openPost.cover_image_url || "/placeholder.svg"} alt={openPost.title} fill className="object-cover" />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setOpenPost(null)}
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-background/90 backdrop-blur"
                  aria-label="Close post"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
              <DialogHeader className="p-5 text-left">
                <Badge className="mb-2 w-fit rounded-full">{openPost.category}</Badge>
                <DialogTitle className="text-[24px] font-bold leading-tight">{openPost.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 px-5 pb-8">
                <p className="text-[14px] text-muted-foreground">{openPost.headline}</p>
                <p className="text-[14px] leading-7">{openPost.body}</p>
                {isSubscriber && (
                  <Button
                    variant="outline"
                    className="h-[52px] rounded-full"
                    onClick={() =>
                      setBookmarked((current) =>
                        current.includes(openPost.id) ? current.filter((id) => id !== openPost.id) : [...current, openPost.id],
                      )
                    }
                  >
                    <Bookmark className={bookmarked.includes(openPost.id) ? "fill-current" : ""} />
                    {bookmarked.includes(openPost.id) ? "Bookmarked" : "Bookmark"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
