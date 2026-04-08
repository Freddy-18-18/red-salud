import { supabase } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────

export type PostCategory = "pregunta" | "experiencia" | "tip" | "articulo";
export type VoteType = "up" | "down";
export type PostStatus = "published" | "draft" | "hidden";
export type ArticleCategory =
  | "nutricion"
  | "ejercicio"
  | "salud_mental"
  | "prevencion"
  | "medicamentos"
  | "enfermedades"
  | "embarazo"
  | "pediatria"
  | "dental"
  | "cardiologia"
  | "general";

export interface PostAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: PostCategory;
  specialty_id: string | null;
  tags: string[] | null;
  upvotes: number;
  views: number;
  is_verified_answer: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
  specialty?: { id: string; name: string } | null;
  reply_count?: number;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_doctor_reply: boolean;
  upvotes: number;
  is_best_answer: boolean;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
}

export interface HealthArticle {
  id: string;
  author_id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  category: ArticleCategory;
  reading_time_minutes: number;
  views: number;
  likes: number;
  is_featured: boolean;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  author?: PostAuthor;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: PostCategory;
  specialty_id?: string;
  tags?: string[];
}

export interface CreateReplyData {
  post_id: string;
  content: string;
}

// ── Helper ─────────────────────────────────────────────────────────────

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// ── Posts ───────────────────────────────────────────────────────────────

export async function getPosts(options?: {
  category?: PostCategory;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from("community_posts")
      .select(
        `
        *,
        author:profiles!community_posts_author_id_fkey(
          id, full_name, avatar_url, role
        ),
        specialty:specialties!community_posts_specialty_id_fkey(
          id, name
        )
      `,
        { count: "exact" }
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,content.ilike.%${options.search}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 20) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch reply counts for all posts
    const postIds = (data || []).map((p) => p.id);
    const replyCounts: Record<string, number> = {};

    if (postIds.length > 0) {
      const { data: counts } = await supabase
        .from("community_replies")
        .select("post_id")
        .in("post_id", postIds);

      if (counts) {
        for (const row of counts) {
          replyCounts[row.post_id] = (replyCounts[row.post_id] || 0) + 1;
        }
      }
    }

    const posts = (data || []).map((post) => ({
      ...post,
      reply_count: replyCounts[post.id] || 0,
    })) as CommunityPost[];

    return { success: true, data: posts, count: count ?? 0 };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { success: false, error, data: [], count: 0 };
  }
}

export async function getPostById(postId: string) {
  try {
    // Increment views (best-effort, ignore errors)
    try {
      await supabase.rpc("increment_post_views", { post_id: postId });
    } catch {
      // Silently ignore if RPC doesn't exist
    }

    const { data, error } = await supabase
      .from("community_posts")
      .select(
        `
        *,
        author:profiles!community_posts_author_id_fkey(
          id, full_name, avatar_url, role
        ),
        specialty:specialties!community_posts_specialty_id_fkey(
          id, name
        )
      `
      )
      .eq("id", postId)
      .single();

    if (error) throw error;

    return { success: true, data: data as CommunityPost };
  } catch (error) {
    console.error("Error fetching post:", error);
    return { success: false, error, data: null };
  }
}

export async function createPost(userId: string, postData: CreatePostData) {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: userId,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        specialty_id: postData.specialty_id || null,
        tags: postData.tags || [],
        status: "published",
        upvotes: 0,
        views: 0,
        is_verified_answer: false,
      })
      .select(
        `
        *,
        author:profiles!community_posts_author_id_fkey(
          id, full_name, avatar_url, role
        )
      `
      )
      .single();

    if (error) throw error;

    return { success: true, data: data as CommunityPost };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error, data: null };
  }
}

// ── Replies ────────────────────────────────────────────────────────────

export async function getReplies(postId: string) {
  try {
    const { data, error } = await supabase
      .from("community_replies")
      .select(
        `
        *,
        author:profiles!community_replies_author_id_fkey(
          id, full_name, avatar_url, role
        )
      `
      )
      .eq("post_id", postId)
      .order("is_best_answer", { ascending: false })
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: (data || []) as CommunityReply[] };
  } catch (error) {
    console.error("Error fetching replies:", error);
    return { success: false, error, data: [] };
  }
}

export async function createReply(
  userId: string,
  replyData: CreateReplyData,
  isDoctorReply: boolean = false
) {
  try {
    const { data, error } = await supabase
      .from("community_replies")
      .insert({
        post_id: replyData.post_id,
        author_id: userId,
        content: replyData.content,
        is_doctor_reply: isDoctorReply,
        upvotes: 0,
        is_best_answer: false,
      })
      .select(
        `
        *,
        author:profiles!community_replies_author_id_fkey(
          id, full_name, avatar_url, role
        )
      `
      )
      .single();

    if (error) throw error;

    return { success: true, data: data as CommunityReply };
  } catch (error) {
    console.error("Error creating reply:", error);
    return { success: false, error, data: null };
  }
}

// ── Votes ──────────────────────────────────────────────────────────────

export async function voteOnPost(userId: string, postId: string, voteType: VoteType) {
  try {
    // Check existing vote
    const { data: existing } = await supabase
      .from("community_votes")
      .select("id, vote_type")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .is("reply_id", null)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote (toggle off)
        await supabase.from("community_votes").delete().eq("id", existing.id);
        // Update post upvote count
        const delta = voteType === "up" ? -1 : 1;
        await supabase
          .from("community_posts")
          .update({ upvotes: supabase.rpc("decrement", { x: 1 }) })
          .eq("id", postId);
        // Fallback: fetch and update manually
        const { data: post } = await supabase
          .from("community_posts")
          .select("upvotes")
          .eq("id", postId)
          .single();
        if (post) {
          await supabase
            .from("community_posts")
            .update({ upvotes: Math.max(0, (post.upvotes || 0) + delta) })
            .eq("id", postId);
        }
        return { success: true, action: "removed" as const };
      } else {
        // Change vote direction
        await supabase
          .from("community_votes")
          .update({ vote_type: voteType })
          .eq("id", existing.id);
        const delta = voteType === "up" ? 2 : -2;
        const { data: post } = await supabase
          .from("community_posts")
          .select("upvotes")
          .eq("id", postId)
          .single();
        if (post) {
          await supabase
            .from("community_posts")
            .update({ upvotes: Math.max(0, (post.upvotes || 0) + delta) })
            .eq("id", postId);
        }
        return { success: true, action: "changed" as const };
      }
    } else {
      // New vote
      await supabase.from("community_votes").insert({
        user_id: userId,
        post_id: postId,
        reply_id: null,
        vote_type: voteType,
      });
      const delta = voteType === "up" ? 1 : -1;
      const { data: post } = await supabase
        .from("community_posts")
        .select("upvotes")
        .eq("id", postId)
        .single();
      if (post) {
        await supabase
          .from("community_posts")
          .update({ upvotes: Math.max(0, (post.upvotes || 0) + delta) })
          .eq("id", postId);
      }
      return { success: true, action: "voted" as const };
    }
  } catch (error) {
    console.error("Error voting on post:", error);
    return { success: false, error };
  }
}

export async function voteOnReply(userId: string, replyId: string, voteType: VoteType) {
  try {
    const { data: existing } = await supabase
      .from("community_votes")
      .select("id, vote_type")
      .eq("user_id", userId)
      .eq("reply_id", replyId)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === voteType) {
        await supabase.from("community_votes").delete().eq("id", existing.id);
        const delta = voteType === "up" ? -1 : 1;
        const { data: reply } = await supabase
          .from("community_replies")
          .select("upvotes")
          .eq("id", replyId)
          .single();
        if (reply) {
          await supabase
            .from("community_replies")
            .update({ upvotes: Math.max(0, (reply.upvotes || 0) + delta) })
            .eq("id", replyId);
        }
        return { success: true, action: "removed" as const };
      } else {
        await supabase
          .from("community_votes")
          .update({ vote_type: voteType })
          .eq("id", existing.id);
        const delta = voteType === "up" ? 2 : -2;
        const { data: reply } = await supabase
          .from("community_replies")
          .select("upvotes")
          .eq("id", replyId)
          .single();
        if (reply) {
          await supabase
            .from("community_replies")
            .update({ upvotes: Math.max(0, (reply.upvotes || 0) + delta) })
            .eq("id", replyId);
        }
        return { success: true, action: "changed" as const };
      }
    } else {
      await supabase.from("community_votes").insert({
        user_id: userId,
        reply_id: replyId,
        post_id: null,
        vote_type: voteType,
      });
      const delta = voteType === "up" ? 1 : -1;
      const { data: reply } = await supabase
        .from("community_replies")
        .select("upvotes")
        .eq("id", replyId)
        .single();
      if (reply) {
        await supabase
          .from("community_replies")
          .update({ upvotes: Math.max(0, (reply.upvotes || 0) + delta) })
          .eq("id", replyId);
      }
      return { success: true, action: "voted" as const };
    }
  } catch (error) {
    console.error("Error voting on reply:", error);
    return { success: false, error };
  }
}

export async function getUserVotes(userId: string, postId: string) {
  try {
    const { data, error } = await supabase
      .from("community_votes")
      .select("post_id, reply_id, vote_type")
      .eq("user_id", userId)
      .or(`post_id.eq.${postId},reply_id.not.is.null`);

    if (error) throw error;

    const votes: Record<string, VoteType> = {};
    for (const v of data || []) {
      const key = v.reply_id ? `reply:${v.reply_id}` : `post:${v.post_id}`;
      votes[key] = v.vote_type;
    }

    return { success: true, data: votes };
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return { success: false, error, data: {} };
  }
}

// ── Articles ───────────────────────────────────────────────────────────

export async function getArticles(options?: {
  category?: ArticleCategory;
  featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from("health_articles")
      .select(
        `
        *,
        author:profiles!health_articles_author_id_fkey(
          id, full_name, avatar_url, role
        )
      `,
        { count: "exact" }
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.featured) {
      query = query.eq("is_featured", true);
    }

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,summary.ilike.%${options.search}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 20) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      success: true,
      data: (data || []) as HealthArticle[],
      count: count ?? 0,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return { success: false, error, data: [], count: 0 };
  }
}

export async function getArticleById(articleId: string) {
  try {
    // Increment views
    const { data: article } = await supabase
      .from("health_articles")
      .select("views")
      .eq("id", articleId)
      .single();

    if (article) {
      await supabase
        .from("health_articles")
        .update({ views: (article.views || 0) + 1 })
        .eq("id", articleId);
    }

    const { data, error } = await supabase
      .from("health_articles")
      .select(
        `
        *,
        author:profiles!health_articles_author_id_fkey(
          id, full_name, avatar_url, role
        )
      `
      )
      .eq("id", articleId)
      .single();

    if (error) throw error;

    return { success: true, data: data as HealthArticle };
  } catch (error) {
    console.error("Error fetching article:", error);
    return { success: false, error, data: null };
  }
}

export async function likeArticle(userId: string, articleId: string) {
  try {
    // Check if already liked via community_votes with a convention
    const { data: existing } = await supabase
      .from("community_votes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", articleId)
      .eq("vote_type", "up")
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from("community_votes").delete().eq("id", existing.id);
      const { data: article } = await supabase
        .from("health_articles")
        .select("likes")
        .eq("id", articleId)
        .single();
      if (article) {
        await supabase
          .from("health_articles")
          .update({ likes: Math.max(0, (article.likes || 0) - 1) })
          .eq("id", articleId);
      }
      return { success: true, liked: false };
    } else {
      // Like
      await supabase.from("community_votes").insert({
        user_id: userId,
        post_id: articleId,
        vote_type: "up",
      });
      const { data: article } = await supabase
        .from("health_articles")
        .select("likes")
        .eq("id", articleId)
        .single();
      if (article) {
        await supabase
          .from("health_articles")
          .update({ likes: (article.likes || 0) + 1 })
          .eq("id", articleId);
      }
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error liking article:", error);
    return { success: false, error };
  }
}

export async function checkArticleLiked(userId: string, articleId: string) {
  try {
    const { data } = await supabase
      .from("community_votes")
      .select("id")
      .eq("user_id", userId)
      .eq("post_id", articleId)
      .eq("vote_type", "up")
      .maybeSingle();

    return { success: true, liked: !!data };
  } catch {
    return { success: false, liked: false };
  }
}

// ── Specialties (reuse) ────────────────────────────────────────────────

export async function getSpecialties() {
  try {
    const res = await fetch("/api/specialties");
    if (!res.ok) throw new Error("Failed to fetch specialties");
    const { data } = await res.json();

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return { success: false, error, data: [] };
  }
}

// ── Daily tip ──────────────────────────────────────────────────────────

export async function getDailyTip() {
  try {
    const { data, error } = await supabase
      .from("health_articles")
      .select(
        `
        id, title, summary, category, cover_image_url,
        author:profiles!health_articles_author_id_fkey(
          id, full_name, avatar_url
        )
      `
      )
      .eq("status", "published")
      .limit(5)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return { success: true, data: null };

    // Pick one based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % data.length;

    return { success: true, data: data[index] as unknown as Partial<HealthArticle> };
  } catch (error) {
    console.error("Error fetching daily tip:", error);
    return { success: false, error, data: null };
  }
}
