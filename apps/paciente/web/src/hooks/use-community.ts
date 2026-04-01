import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
  type CreatePostData,
} from "@/lib/services/community-service";
import { supabase } from "@/lib/supabase/client";

// ── Auth helper ────────────────────────────────────────────────────────

export function useCommunityUser() {
  const { data, isLoading } = useQuery({
    queryKey: ["communityUser"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { userId: null, userRole: null };

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      return { userId: user.id, userRole: profile?.role ?? null };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    userId: data?.userId ?? null,
    userRole: data?.userRole ?? null,
    isDoctor: data?.userRole === "medico",
    loading: isLoading,
  };
}

// ── Posts listing ──────────────────────────────────────────────────────

export function useCommunityPosts(options?: {
  category?: PostCategory;
  search?: string;
}) {
  const {
    data,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["communityPosts", options?.category, options?.search],
    queryFn: async () => {
      const result = await getPosts({
        category: options?.category,
        search: options?.search,
        limit: 50,
      });
      if (!result.success) throw new Error("Error al cargar publicaciones");
      return result;
    },
  });

  return {
    posts: data?.data ?? [],
    loading: isFetching,
    error: error ? "Error al cargar publicaciones" : null,
    totalCount: data?.count ?? 0,
    refresh,
  };
}

// ── Single post ────────────────────────────────────────────────────────

export function useCommunityPost(postId: string | null) {
  const {
    data,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: ["communityPost", postId],
    queryFn: async () => {
      const result = await getPostById(postId!);
      if (!result.success || !result.data)
        throw new Error("Error al cargar la publicacion");
      return result;
    },
    enabled: !!postId,
  });

  return {
    post: data?.data ?? null,
    loading: isFetching,
    error: error ? "Error al cargar la publicacion" : null,
    refresh,
  };
}

// ── Replies ────────────────────────────────────────────────────────────

export function usePostReplies(postId: string | null) {
  const queryClient = useQueryClient();

  const {
    data,
    isFetching,
    refetch: refresh,
  } = useQuery({
    queryKey: ["postReplies", postId],
    queryFn: async () => {
      const result = await getReplies(postId!);
      if (!result.success) throw new Error("Error loading replies");
      return result;
    },
    enabled: !!postId,
  });

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
      await queryClient.invalidateQueries({ queryKey: ["postReplies", postId] });
    }
    return result;
  };

  return { replies: data?.data ?? [], loading: isFetching, refresh, addReply };
}

// ── Voting ─────────────────────────────────────────────────────────────

export function useVoting(userId: string | null, postId: string | null) {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ["userVotes", userId, postId],
    queryFn: async () => {
      const result = await getUserVotes(userId!, postId!);
      if (!result.success) throw new Error("Error loading votes");
      return result.data;
    },
    enabled: !!userId && !!postId,
  });

  const vote = useCallback(
    async (
      targetType: "post" | "reply",
      targetId: string,
      voteType: VoteType
    ) => {
      if (!userId) return;
      const result =
        targetType === "post"
          ? await voteOnPost(userId, targetId, voteType)
          : await voteOnReply(userId, targetId, voteType);

      if (result.success) {
        const key =
          targetType === "post" ? `post:${targetId}` : `reply:${targetId}`;
        // Optimistic update of local votes state
        const currentVotes =
          queryClient.getQueryData<Record<string, VoteType>>([
            "userVotes",
            userId,
            postId,
          ]) ?? {};
        const next = { ...currentVotes };
        if (result.action === "removed") {
          delete next[key];
        } else {
          next[key] = voteType;
        }
        queryClient.setQueryData(["userVotes", userId, postId], next);
      }
      return result;
    },
    [userId, postId]
  );

  return { votes: data ?? {}, vote, loading: isFetching };
}

// ── Create post ────────────────────────────────────────────────────────

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: CreatePostData;
    }) => {
      const result = await createPost(userId, data);
      if (!result.success) throw new Error("Error al crear la publicacion");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const create = async (userId: string, data: CreatePostData) => {
    try {
      return await mutateAsync({ userId, data });
    } catch {
      return { success: false as const, error: true, data: null };
    }
  };

  return {
    create,
    loading: isPending,
    error: error ? "Error al crear la publicacion" : null,
  };
}

// ── Articles listing ───────────────────────────────────────────────────

export function useHealthArticles(options?: {
  category?: ArticleCategory;
  featured?: boolean;
  search?: string;
}) {
  const {
    data,
    isFetching,
    error,
    refetch: refresh,
  } = useQuery({
    queryKey: [
      "healthArticles",
      options?.category,
      options?.featured,
      options?.search,
    ],
    queryFn: async () => {
      const result = await getArticles({
        category: options?.category,
        featured: options?.featured,
        search: options?.search,
        limit: 50,
      });
      if (!result.success) throw new Error("Error al cargar articulos");
      return result;
    },
  });

  return {
    articles: data?.data ?? [],
    loading: isFetching,
    error: error ? "Error al cargar articulos" : null,
    totalCount: data?.count ?? 0,
    refresh,
  };
}

// ── Single article ─────────────────────────────────────────────────────

export function useHealthArticle(articleId: string | null) {
  const { data, isFetching, error } = useQuery({
    queryKey: ["healthArticle", articleId],
    queryFn: async () => {
      const result = await getArticleById(articleId!);
      if (!result.success || !result.data)
        throw new Error("Error al cargar el articulo");
      return result;
    },
    enabled: !!articleId,
  });

  return {
    article: data?.data ?? null,
    loading: isFetching,
    error: error ? "Error al cargar el articulo" : null,
  };
}

// ── Article like ───────────────────────────────────────────────────────

export function useArticleLike(userId: string | null, articleId: string | null) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["articleLiked", userId, articleId],
    queryFn: async () => {
      const result = await checkArticleLiked(userId!, articleId!);
      return result.liked;
    },
    enabled: !!userId && !!articleId,
  });

  const { mutateAsync: toggleMutation, isPending } = useMutation({
    mutationFn: async () => {
      const result = await likeArticle(userId!, articleId!);
      if (!result.success) throw new Error("Error toggling like");
      return result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["articleLiked", userId, articleId],
        result.liked ?? false
      );
    },
  });

  const toggle = async () => {
    if (!userId || !articleId) return;
    await toggleMutation();
  };

  return { liked: data ?? false, toggle, loading: isPending };
}

// ── Specialties ────────────────────────────────────────────────────────

export function useCommunitySpecialties() {
  const { data, isLoading } = useQuery({
    queryKey: ["communitySpecialties"],
    queryFn: async () => {
      const result = await getSpecialties();
      if (!result.success) throw new Error("Error loading specialties");
      return result.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  return { specialties: data ?? [], loading: isLoading };
}

// ── Daily tip ──────────────────────────────────────────────────────────

export function useDailyTip() {
  const { data, isLoading } = useQuery({
    queryKey: ["dailyTip"],
    queryFn: async () => {
      const result = await getDailyTip();
      if (!result.success) throw new Error("Error loading daily tip");
      return result.data ?? null;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  return { tip: data ?? null, loading: isLoading };
}

// ── Featured articles ──────────────────────────────────────────────────

export function useFeaturedArticles() {
  const { data, isLoading } = useQuery({
    queryKey: ["featuredArticles"],
    queryFn: async () => {
      const result = await getArticles({ featured: true, limit: 5 });
      if (!result.success) throw new Error("Error loading featured articles");
      return result.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  return { articles: data ?? [], loading: isLoading };
}
