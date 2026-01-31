/**
 * Tipos para el sistema de Blog y Comunidad Médica
 */

// ============================================
// CATEGORÍAS Y TAGS
// ============================================

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string;
    parent_id: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ContentTag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    usage_count: number;
    created_at: string;
}

// ============================================
// BLOG POSTS
// ============================================

export type PostStatus = "draft" | "pending_review" | "published" | "archived";

export interface BlogPost {
    id: string;
    author_id: string;
    category_id: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image: string | null;
    meta_title: string | null;
    meta_description: string | null;
    status: PostStatus;
    is_featured: boolean;
    is_pinned: boolean;
    view_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
    bookmark_count: number;
    reading_time: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Relaciones
    author?: AuthorInfo;
    category?: BlogCategory;
    tags?: ContentTag[];
}

export interface BlogComment {
    id: string;
    post_id: string;
    author_id: string;
    parent_id: string | null;
    content: string;
    is_approved: boolean;
    is_highlighted: boolean;
    like_count: number;
    created_at: string;
    updated_at: string;
    // Relaciones
    author?: AuthorInfo;
    replies?: BlogComment[];
}

// ============================================
// Q&A SYSTEM
// ============================================

export type QuestionStatus = "open" | "answered" | "closed" | "archived";

export interface QAQuestion {
    id: string;
    author_id: string;
    category_id: string | null;
    title: string;
    slug: string;
    content: string;
    status: QuestionStatus;
    is_featured: boolean;
    is_pinned: boolean;
    accepted_answer_id: string | null;
    view_count: number;
    vote_count: number;
    answer_count: number;
    bookmark_count: number;
    bounty_amount: number;
    bounty_expires_at: string | null;
    created_at: string;
    updated_at: string;
    // Relaciones
    author?: AuthorInfo;
    category?: BlogCategory;
    tags?: ContentTag[];
    accepted_answer?: QAAnswer;
}

export interface QAAnswer {
    id: string;
    question_id: string;
    author_id: string;
    content: string;
    is_accepted: boolean;
    is_highlighted: boolean;
    vote_count: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
    // Relaciones
    author?: AuthorInfo;
    comments?: QAAnswerComment[];
}

export interface QAAnswerComment {
    id: string;
    answer_id: string;
    author_id: string;
    content: string;
    like_count: number;
    created_at: string;
    updated_at: string;
    author?: AuthorInfo;
}

// ============================================
// VOTOS Y LIKES
// ============================================

export type VoteType = "upvote" | "downvote";
export type ContentType =
    | "post"
    | "question"
    | "answer"
    | "comment"
    | "answer_comment";

export interface ContentVote {
    id: string;
    user_id: string;
    content_type: ContentType;
    content_id: string;
    vote_type: VoteType;
    created_at: string;
}

export interface ContentLike {
    id: string;
    user_id: string;
    content_type: ContentType;
    content_id: string;
    created_at: string;
}

export interface ContentBookmark {
    id: string;
    user_id: string;
    content_type: "post" | "question";
    content_id: string;
    created_at: string;
}

// ============================================
// REPUTACIÓN Y BADGES
// ============================================

export interface UserReputation {
    user_id: string;
    total_points: number;
    points_from_posts: number;
    points_from_answers: number;
    points_from_accepted_answers: number;
    points_from_votes_received: number;
    points_from_helpful_comments: number;
    level: number;
    level_name: string;
    total_posts: number;
    total_answers: number;
    total_accepted_answers: number;
    total_questions: number;
    total_comments: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    created_at: string;
    updated_at: string;
    user?: {
        avatar_url?: string;
        nombre_completo?: string;
        role?: string;
    } | null;
}

export type BadgeType = "bronze" | "silver" | "gold" | "platinum";

export interface Badge {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string;
    badge_type: BadgeType;
    requirement_type: string | null;
    requirement_value: number | null;
    points_reward: number;
    created_at: string;
}

export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    awarded_at: string;
    badge?: Badge;
}

// ============================================
// SUSCRIPCIONES
// ============================================

export interface AuthorSubscription {
    id: string;
    subscriber_id: string;
    author_id: string;
    notify_new_posts: boolean;
    notify_new_answers: boolean;
    created_at: string;
}

export interface CategorySubscription {
    id: string;
    user_id: string;
    category_id: string;
    notify_new_posts: boolean;
    notify_new_questions: boolean;
    created_at: string;
}

// ============================================
// NOTIFICACIONES
// ============================================

export type CommunityNotificationType =
    | "new_post"
    | "new_answer"
    | "answer_accepted"
    | "new_comment"
    | "vote_received"
    | "badge_earned"
    | "mention"
    | "new_follower"
    | "bounty_awarded"
    | "post_featured";

export interface CommunityNotification {
    id: string;
    user_id: string;
    notification_type: CommunityNotificationType;
    title: string;
    message: string | null;
    content_type: string | null;
    content_id: string | null;
    actor_id: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    actor?: AuthorInfo;
}

// ============================================
// AUTOR INFO (para relaciones)
// ============================================

export interface AuthorInfo {
    id: string;
    nombre_completo: string | null;
    avatar_url: string | null;
    role: string;
    // Info de médico si aplica
    verified?: boolean;
    doctor_details?: {
        verified: boolean;
        specialty?: { name: string };
    };
    specialty_name?: string;
    reputation?: {
        total_points: number;
        level_name: string;
    };
}

// ============================================
// FILTROS Y PAGINACIÓN
// ============================================

export interface PostFilters {
    category?: string;
    tag?: string;
    author?: string;
    status?: PostStatus;
    search?: string;
    featured?: boolean;
}

export interface QuestionFilters {
    category?: string;
    tag?: string;
    status?: QuestionStatus;
    search?: string;
    unanswered?: boolean;
    bounty?: boolean;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

// ============================================
// FORMULARIOS
// ============================================

export interface CreatePostInput {
    title: string;
    content: string;
    excerpt?: string;
    category_id?: string;
    tags?: string[];
    cover_image?: string;
    status?: PostStatus;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
    id: string;
}

export interface CreateQuestionInput {
    title: string;
    content: string;
    category_id?: string;
    tags?: string[];
    bounty_amount?: number;
}

export interface CreateAnswerInput {
    question_id: string;
    content: string;
}

export interface CreateCommentInput {
    post_id?: string;
    answer_id?: string;
    parent_id?: string;
    content: string;
}
