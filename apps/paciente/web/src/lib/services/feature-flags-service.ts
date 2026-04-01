import { publicSupabase } from '@/lib/supabase/public'

export interface ActiveFeatures {
  hasBlog: boolean
  hasTestimonials: boolean
  hasDoctors: boolean
  hasEmergencyService: boolean
}

/**
 * Check which features are active based on available data.
 * Handles missing tables gracefully by catching errors.
 */
export async function getActiveFeatures(): Promise<ActiveFeatures> {
  const [hasBlog, hasTestimonials] = await Promise.all([
    checkBlogActive(),
    checkTestimonialsActive(),
  ])

  return {
    hasBlog,
    hasTestimonials,
    hasDoctors: true, // always show doctor search
    hasEmergencyService: false, // future feature
  }
}

async function checkBlogActive(): Promise<boolean> {
  try {
    const { count, error } = await publicSupabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true)

    if (error) return false
    return (count ?? 0) > 0
  } catch {
    return false
  }
}

async function checkTestimonialsActive(): Promise<boolean> {
  try {
    const { count, error } = await publicSupabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true)

    if (error) return false
    return (count ?? 0) > 0
  } catch {
    return false
  }
}
