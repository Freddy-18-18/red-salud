import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getPosts,
  getPostById,
  createPost,
  getReplies,
  createReply,
  voteOnPost,
  voteOnReply,
  getUserVotes,
  getArticles,
  getArticleById,
  likeArticle,
  checkArticleLiked,
  getSpecialties,
  getDailyTip,
  type PostCategory,
  type ArticleCategory,
  type VoteType,
  type CommunityPost,
  type CommunityReply,
  type HealthArticle,
  type CreatePostData,
} from "@/lib/services/community-service";

// ── Auth helper ────────────────────────────────────────────────────────

export function useCommunityUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        setUserRole(profile?.role ?? null);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { userId, userRole, isDoctor: userRole === "medico", loading };
}

// ── Posts listing ──────────────────────────────────────────────────────

export function useCommunityPosts(options?: {
  category?: PostCategory;
  search?: string;
}) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPosts({
      category: options?.category,
      search: options?.search,
      limit: 50,
    });
    if (result.success) {
      setPosts(result.data);
      setTotalCount(result.count);
    } else {
      setError("Error al cargar publicaciones");
    }
    setLoading(false);
  }, [options?.category, options?.search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, error, totalCount, refresh };
}

// ── Single post ────────────────────────────────────────────────────────

export function useCommunityPost(postId: string | null) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const result = await getPostById(postId);
    if (result.success && result.data) {
      setPost(result.data);
    } else {
      setError("Error al cargar la publicacion");
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { post, loading, error, refresh };
}

// ── Replies ────────────────────────────────────────────────────────────

export function usePostReplies(postId: string | null) {
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const result = await getReplies(postId);
    if (result.success) {
      setReplies(result.data);
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReply = async (
    userId: string,
    content: string,
    isDoctorReply: boolean
  ) => {
    if (!postId) return { success: false };
    const result = await createReply(
      userId,
      { post_id: postId, content },
      isDoctorReply
    );
    if (result.success) {
      await refresh();
    }
    return result;
  };

  return { replies, loading, refresh, addReply };
}

// ── Voting ─────────────────────────────────────────────────────────────

export function useVoting(userId: string | null, postId: string | null) {
  const [votes, setVotes] = useState<Record<string, VoteType>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !postId) return;
    const load = async () => {
      const result = await getUserVotes(userId, postId);
      if (result.success) {
        setVotes(result.data);
      }
    };
    load();
  }, [userId, postId]);

  const vote = async (
    targetType: "post" | "reply",
    targetId: string,
    voteType: VoteType
  ) => {
    if (!userId) return;
    setLoading(true);
    const result =
      targetType === "post"
        ? await voteOnPost(userId, targetId, voteType)
        : await voteOnReply(userId, targetId, voteType);

    if (result.success) {
      const key =
        targetType === "post" ? `post:${targetId}` : `reply:${targetId}`;
      setVotes((prev) => {
        const next = { ...prev };
        if (result.action === "removed") {
          delete next[key];
        } else {
          next[key] = voteType;
        }
        return next;
      });
    }
    setLoading(false);
    return result;
  };

  return { votes, vote, loading };
}

// ── Create post ────────────────────────────────────────────────────────

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (userId: string, data: CreatePostData) => {
    setLoading(true);
    setError(null);
    const result = await createPost(userId, data);
    if (!result.success) {
      setError("Error al crear la publicacion");
    }
    setLoading(false);
    return result;
  };

  return { create, loading, error };
}

// ── Articles listing ───────────────────────────────────────────────────

export function useHealthArticles(options?: {
  category?: ArticleCategory;
  featured?: boolean;
  search?: string;
}) {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getArticles({
      category: options?.category,
      featured: options?.featured,
      search: options?.search,
      limit: 50,
    });
    if (result.success) {
      setArticles(result.data);
      setTotalCount(result.count);
    } else {
      setError("Error al cargar articulos");
    }
    setLoading(false);
  }, [options?.category, options?.featured, options?.search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { articles, loading, error, totalCount, refresh };
}

// ── Single article ─────────────────────────────────────────────────────

export function useHealthArticle(articleId: string | null) {
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) return;
    const load = async () => {
      setLoading(true);
      const result = await getArticleById(articleId);
      if (result.success && result.data) {
        setArticle(result.data);
      } else {
        setError("Error al cargar el articulo");
      }
      setLoading(false);
    };
    load();
  }, [articleId]);

  return { article, loading, error };
}

// ── Article like ───────────────────────────────────────────────────────

export function useArticleLike(userId: string | null, articleId: string | null) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !articleId) return;
    const check = async () => {
      const result = await checkArticleLiked(userId, articleId);
      setLiked(result.liked);
    };
    check();
  }, [userId, articleId]);

  const toggle = async () => {
    if (!userId || !articleId) return;
    setLoading(true);
    const result = await likeArticle(userId, articleId);
    if (result.success) {
      setLiked(result.liked ?? false);
    }
    setLoading(false);
  };

  return { liked, toggle, loading };
}

// ── Specialties ────────────────────────────────────────────────────────

export function useCommunitySpecialties() {
  const [specialties, setSpecialties] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await getSpecialties();
      if (result.success) {
        setSpecialties(result.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { specialties, loading };
}

// ── Daily tip ──────────────────────────────────────────────────────────

export function useDailyTip() {
  const [tip, setTip] = useState<Partial<HealthArticle> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await getDailyTip();
      if (result.success) {
        setTip(result.data ?? null);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { tip, loading };
}

// ── Featured articles ──────────────────────────────────────────────────

export function useFeaturedArticles() {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await getArticles({ featured: true, limit: 5 });
      if (result.success) {
        setArticles(result.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { articles, loading };
}
