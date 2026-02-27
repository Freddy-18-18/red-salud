/**
 * API functions para el sistema de Blog y Comunidad
 */

import { createClient } from '@/lib/supabase/client';
import type {
  BlogPost,
  BlogComment,
  QAQuestion,
  QAAnswer,
  BlogCategory,
  ContentTag,
  UserReputation,
  Badge,
  CommunityNotification,
  PostFilters,
  QuestionFilters,
  PaginationParams,
  PaginatedResponse,
  CreatePostInput,
  CreateQuestionInput,
  CreateAnswerInput,
  CreateCommentInput,
  VoteType,
} from "@red-salud/types";

const supabase = createClient();

// ============================================
// CATEGORÍAS Y TAGS
// ============================================

export async function getCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
}

export async function getPopularTags(limit = 20): Promise<ContentTag[]> {
  const { data, error } = await supabase
    .from('content_tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================
// BLOG POSTS
// ============================================

export async function getPosts(
  filters: PostFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<BlogPost>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role),
      category:blog_categories!category_id(id, name, slug, color, icon)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters.author) {
    query = query.eq('author_id', filters.author);
  }
  if (filters.featured) {
    query = query.eq('is_featured', true);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  const total = count || 0;
  return {
    data: data || [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: offset + limit < total,
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!author_id(
        id, nombre_completo, avatar_url, role,
        doctor_details(verified, specialty:specialties(name))
      ),
      category:blog_categories!category_id(id, name, slug, color, icon),
      tags:blog_post_tags(tag:content_tags(*))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Incrementar vistas
  await supabase.rpc('increment_post_views', { post_id: data.id });

  return data;
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role),
      category:blog_categories!category_id(id, name, slug, color, icon)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createPost(input: CreatePostInput): Promise<BlogPost> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { tags, ...postData } = input;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      ...postData,
      author_id: userData.user.id,
      published_at: input.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  // Agregar tags si existen
  if (tags && tags.length > 0) {
    await addTagsToPost(data.id, tags);
  }

  return data;
}

export async function updatePost(id: string, input: Partial<CreatePostInput>): Promise<BlogPost> {
  const { tags, ...postData } = input;

  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...postData,
      published_at: input.status === 'published' ? new Date().toISOString() : undefined,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (tags) {
    // Eliminar tags existentes y agregar nuevos
    await supabase.from('blog_post_tags').delete().eq('post_id', id);
    await addTagsToPost(id, tags);
  }

  return data;
}

async function addTagsToPost(postId: string, tagNames: string[]) {
  for (const tagName of tagNames) {
    // Buscar o crear tag
    let { data: tag } = await supabase
      .from('content_tags')
      .select('id')
      .eq('name', tagName)
      .single();

    if (!tag) {
      const { data: newTag } = await supabase
        .from('content_tags')
        .insert({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') })
        .select('id')
        .single();
      tag = newTag;
    }

    if (tag) {
      await supabase.from('blog_post_tags').insert({ post_id: postId, tag_id: tag.id });
    }
  }
}

// ============================================
// COMENTARIOS
// ============================================

export async function getPostComments(postId: string): Promise<BlogComment[]> {
  const { data, error } = await supabase
    .from('blog_comments')
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role)
    `)
    .eq('post_id', postId)
    .eq('is_approved', true)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Obtener respuestas para cada comentario
  const commentsWithReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: replies } = await supabase
        .from('blog_comments')
        .select(`
          *,
          author:profiles!author_id(id, nombre_completo, avatar_url, role)
        `)
        .eq('parent_id', comment.id)
        .eq('is_approved', true)
        .order('created_at');

      return { ...comment, replies: replies || [] };
    })
  );

  return commentsWithReplies;
}

export async function createComment(input: CreateCommentInput): Promise<BlogComment> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      post_id: input.post_id,
      parent_id: input.parent_id,
      content: input.content,
      author_id: userData.user.id,
    })
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role)
    `)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Q&A - PREGUNTAS
// ============================================

export async function getQuestions(
  filters: QuestionFilters = {},
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<QAQuestion>> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('qa_questions')
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role),
      category:blog_categories!category_id(id, name, slug, color, icon)
    `, { count: 'exact' })
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.unanswered) {
    query = query.eq('answer_count', 0);
  }
  if (filters.bounty) {
    query = query.gt('bounty_amount', 0);
  }
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw error;

  const total = count || 0;
  return {
    data: data || [],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: offset + limit < total,
  };
}

export async function getQuestionBySlug(slug: string): Promise<QAQuestion | null> {
  const { data, error } = await supabase
    .from('qa_questions')
    .select(`
      *,
      author:profiles!author_id(
        id, nombre_completo, avatar_url, role,
        doctor_details(verified, specialty:specialties(name))
      ),
      category:blog_categories!category_id(id, name, slug, color, icon),
      tags:qa_question_tags(tag:content_tags(*))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Incrementar vistas
  await supabase.rpc('increment_question_views', { question_id: data.id });

  return data;
}

export async function createQuestion(input: CreateQuestionInput): Promise<QAQuestion> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { tags, ...questionData } = input;

  const { data, error } = await supabase
    .from('qa_questions')
    .insert({
      ...questionData,
      author_id: userData.user.id,
    })
    .select()
    .single();

  if (error) throw error;

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      let { data: tag } = await supabase
        .from('content_tags')
        .select('id')
        .eq('name', tagName)
        .single();

      if (!tag) {
        const { data: newTag } = await supabase
          .from('content_tags')
          .insert({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') })
          .select('id')
          .single();
        tag = newTag;
      }

      if (tag) {
        await supabase.from('qa_question_tags').insert({ question_id: data.id, tag_id: tag.id });
      }
    }
  }

  return data;
}

// ============================================
// Q&A - RESPUESTAS
// ============================================

export async function getAnswers(questionId: string): Promise<QAAnswer[]> {
  const { data, error } = await supabase
    .from('qa_answers')
    .select(`
      *,
      author:profiles!author_id(
        id, nombre_completo, avatar_url, role,
        doctor_details(verified, specialty:specialties(name))
      )
    `)
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('vote_count', { ascending: false })
    .order('created_at');

  if (error) throw error;
  return data || [];
}

export async function createAnswer(input: CreateAnswerInput): Promise<QAAnswer> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('qa_answers')
    .insert({
      question_id: input.question_id,
      content: input.content,
      author_id: userData.user.id,
    })
    .select(`
      *,
      author:profiles!author_id(id, nombre_completo, avatar_url, role)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptAnswer(questionId: string, answerId: string): Promise<void> {
  const { error } = await supabase
    .from('qa_questions')
    .update({
      accepted_answer_id: answerId,
      status: 'answered'
    })
    .eq('id', questionId);

  if (error) throw error;

  await supabase
    .from('qa_answers')
    .update({ is_accepted: true })
    .eq('id', answerId);
}

// ============================================
// VOTOS Y LIKES
// ============================================

export async function vote(
  contentType: 'question' | 'answer',
  contentId: string,
  voteType: VoteType
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  // Verificar si ya votó
  const { data: existingVote } = await supabase
    .from('content_votes')
    .select('id, vote_type')
    .eq('user_id', userData.user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Eliminar voto si es el mismo
      await supabase.from('content_votes').delete().eq('id', existingVote.id);
    } else {
      // Cambiar voto
      await supabase
        .from('content_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
    }
  } else {
    // Crear nuevo voto
    await supabase.from('content_votes').insert({
      user_id: userData.user.id,
      content_type: contentType,
      content_id: contentId,
      vote_type: voteType,
    });
  }
}

export async function likeContent(
  contentType: 'post' | 'comment' | 'answer_comment',
  contentId: string
): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { data: existingLike } = await supabase
    .from('content_likes')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (existingLike) {
    await supabase.from('content_likes').delete().eq('id', existingLike.id);
    return false;
  } else {
    await supabase.from('content_likes').insert({
      user_id: userData.user.id,
      content_type: contentType,
      content_id: contentId,
    });
    return true;
  }
}

export async function bookmarkContent(
  contentType: 'post' | 'question',
  contentId: string
): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { data: existing } = await supabase
    .from('content_bookmarks')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (existing) {
    await supabase.from('content_bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('content_bookmarks').insert({
      user_id: userData.user.id,
      content_type: contentType,
      content_id: contentId,
    });
    return true;
  }
}

// ============================================
// SUSCRIPCIONES
// ============================================

export async function subscribeToAuthor(authorId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('No autenticado');

  const { data: existing } = await supabase
    .from('author_subscriptions')
    .select('id')
    .eq('subscriber_id', userData.user.id)
    .eq('author_id', authorId)
    .single();

  if (existing) {
    await supabase.from('author_subscriptions').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('author_subscriptions').insert({
      subscriber_id: userData.user.id,
      author_id: authorId,
    });
    return true;
  }
}

export async function getAuthorSubscribers(authorId: string): Promise<number> {
  const { count } = await supabase
    .from('author_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', authorId);

  return count || 0;
}

// ============================================
// REPUTACIÓN Y BADGES
// ============================================

export async function getUserReputation(userId: string): Promise<UserReputation | null> {
  const { data, error } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(ub => ub.badge);
}

export async function getTopContributors(limit = 10): Promise<UserReputation[]> {
  const { data, error } = await supabase
    .from('user_reputation')
    .select(`
      *,
      user:profiles!user_id(id, nombre_completo, avatar_url, role)
    `)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

// ============================================
// NOTIFICACIONES
// ============================================

export async function getNotifications(
  unreadOnly = false,
  limit = 20
): Promise<CommunityNotification[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  let query = supabase
    .from('community_notifications')
    .select(`
      *,
      actor:profiles!actor_id(id, nombre_completo, avatar_url)
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('community_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase
    .from('community_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userData.user.id)
    .eq('is_read', false);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return 0;

  const { count } = await supabase
    .from('community_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .eq('is_read', false);

  return count || 0;
}
