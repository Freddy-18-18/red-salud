-- ============================================
-- SISTEMA DE BLOG Y COMUNIDAD MÉDICA
-- Migración: 20251206000001
-- ============================================

-- ============================================
-- 1. TABLAS DE CATEGORÍAS Y TAGS
-- ============================================

-- Categorías de blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags para artículos y preguntas
CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SISTEMA DE ARTÍCULOS/BLOG
-- ============================================

-- Artículos del blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  
  -- Contenido
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Estado y visibilidad
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Estadísticas
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  
  -- Tiempo de lectura estimado (minutos)
  reading_time INTEGER DEFAULT 5,
  
  -- Fechas
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación posts-tags (muchos a muchos)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comentarios en artículos
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Moderación
  is_approved BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  
  -- Estadísticas
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. SISTEMA DE PREGUNTAS Y RESPUESTAS (Q&A)
-- ============================================

-- Preguntas
CREATE TABLE IF NOT EXISTS qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  
  -- Contenido
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  
  -- Estado
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Respuesta aceptada
  accepted_answer_id UUID,
  
  -- Estadísticas
  view_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  
  -- Bounty (puntos extra por respuesta)
  bounty_amount INTEGER DEFAULT 0,
  bounty_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación preguntas-tags
CREATE TABLE IF NOT EXISTS qa_question_tags (
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- Respuestas
CREATE TABLE IF NOT EXISTS qa_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Estado
  is_accepted BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  
  -- Estadísticas
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios en respuestas
CREATE TABLE IF NOT EXISTS qa_answer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES qa_answers(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar FK de accepted_answer después de crear qa_answers
ALTER TABLE qa_questions 
  ADD CONSTRAINT fk_accepted_answer 
  FOREIGN KEY (accepted_answer_id) 
  REFERENCES qa_answers(id) ON DELETE SET NULL;

-- ============================================
-- 4. SISTEMA DE VOTOS Y PUNTUACIÓN
-- ============================================

-- Votos en contenido (posts, preguntas, respuestas)
CREATE TABLE IF NOT EXISTS content_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de contenido
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'question', 'answer', 'comment')),
  content_id UUID NOT NULL,
  
  -- Tipo de voto
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un usuario solo puede votar una vez por contenido
  UNIQUE(user_id, content_type, content_id)
);

-- Likes en contenido
CREATE TABLE IF NOT EXISTS content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'answer_comment')),
  content_id UUID NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, content_type, content_id)
);

-- Bookmarks/Guardados
CREATE TABLE IF NOT EXISTS content_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'question')),
  content_id UUID NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, content_type, content_id)
);

-- ============================================
-- 5. SISTEMA DE REPUTACIÓN
-- ============================================

-- Puntos de reputación del usuario
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Puntos totales
  total_points INTEGER DEFAULT 0,
  
  -- Desglose de puntos
  points_from_posts INTEGER DEFAULT 0,
  points_from_answers INTEGER DEFAULT 0,
  points_from_accepted_answers INTEGER DEFAULT 0,
  points_from_votes_received INTEGER DEFAULT 0,
  points_from_helpful_comments INTEGER DEFAULT 0,
  
  -- Nivel y badges
  level INTEGER DEFAULT 1,
  level_name TEXT DEFAULT 'Novato',
  
  -- Estadísticas
  total_posts INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  total_accepted_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  
  -- Racha de actividad
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de puntos
CREATE TABLE IF NOT EXISTS reputation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  
  -- Referencia al contenido que generó los puntos
  content_type TEXT,
  content_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges/Insignias
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  
  -- Tipo de badge
  badge_type TEXT DEFAULT 'bronze' CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Requisitos para obtenerlo
  requirement_type TEXT,
  requirement_value INTEGER,
  
  points_reward INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges obtenidos por usuarios
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 6. SISTEMA DE SUSCRIPCIONES Y NOTIFICACIONES
-- ============================================

-- Suscripciones a autores
CREATE TABLE IF NOT EXISTS author_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Preferencias de notificación
  notify_new_posts BOOLEAN DEFAULT true,
  notify_new_answers BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(subscriber_id, author_id)
);

-- Suscripciones a categorías
CREATE TABLE IF NOT EXISTS category_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  
  notify_new_posts BOOLEAN DEFAULT true,
  notify_new_questions BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, category_id)
);

-- Suscripciones a tags
CREATE TABLE IF NOT EXISTS tag_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tag_id)
);

-- Seguimiento de preguntas (para recibir notificaciones de nuevas respuestas)
CREATE TABLE IF NOT EXISTS question_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, question_id)
);

-- Notificaciones
CREATE TABLE IF NOT EXISTS community_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de notificación
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'new_post', 'new_answer', 'answer_accepted', 'new_comment',
    'vote_received', 'badge_earned', 'mention', 'new_follower',
    'bounty_awarded', 'post_featured'
  )),
  
  title TEXT NOT NULL,
  message TEXT,
  
  -- Referencia al contenido
  content_type TEXT,
  content_id UUID,
  
  -- Actor (quien generó la notificación)
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferencias de notificación del usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Email
  email_new_follower BOOLEAN DEFAULT true,
  email_new_answer BOOLEAN DEFAULT true,
  email_answer_accepted BOOLEAN DEFAULT true,
  email_new_comment BOOLEAN DEFAULT true,
  email_mention BOOLEAN DEFAULT true,
  email_weekly_digest BOOLEAN DEFAULT true,
  
  -- Push/In-app
  push_new_follower BOOLEAN DEFAULT true,
  push_new_answer BOOLEAN DEFAULT true,
  push_answer_accepted BOOLEAN DEFAULT true,
  push_new_comment BOOLEAN DEFAULT true,
  push_mention BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 7. ÍNDICES PARA RENDIMIENTO
-- ============================================

-- Blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Blog comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_author ON blog_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_id);

-- Q&A
CREATE INDEX IF NOT EXISTS idx_qa_questions_author ON qa_questions(author_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_category ON qa_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_status ON qa_questions(status);
CREATE INDEX IF NOT EXISTS idx_qa_questions_slug ON qa_questions(slug);
CREATE INDEX IF NOT EXISTS idx_qa_answers_question ON qa_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_qa_answers_author ON qa_answers(author_id);

-- Votes and likes
CREATE INDEX IF NOT EXISTS idx_content_votes_content ON content_votes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_content ON content_likes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_user ON content_bookmarks(user_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_author_subscriptions_author ON author_subscriptions(author_id);
CREATE INDEX IF NOT EXISTS idx_category_subscriptions_category ON category_subscriptions(category_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON community_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON community_notifications(user_id, is_read) WHERE is_read = false;

-- Tags
CREATE INDEX IF NOT EXISTS idx_content_tags_slug ON content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_qa_question_tags_tag ON qa_question_tags(tag_id);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_answer_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. POLÍTICAS DE SEGURIDAD
-- ============================================

-- Categorías y tags (lectura pública)
CREATE POLICY "Categories are viewable by everyone" ON blog_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Tags are viewable by everyone" ON content_tags FOR SELECT USING (true);

-- Blog posts
CREATE POLICY "Published posts are viewable by everyone" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view their own posts" ON blog_posts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Verified doctors can create posts" ON blog_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM doctor_details WHERE profile_id = auth.uid() AND is_verified = true)
);
CREATE POLICY "Authors can update their own posts" ON blog_posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors can delete their own posts" ON blog_posts FOR DELETE USING (author_id = auth.uid());

-- Post tags
CREATE POLICY "Post tags are viewable by everyone" ON blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage post tags" ON blog_post_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM blog_posts WHERE id = post_id AND author_id = auth.uid())
);

-- Blog comments
CREATE POLICY "Approved comments are viewable by everyone" ON blog_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create comments" ON blog_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own comments" ON blog_comments FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON blog_comments FOR DELETE USING (author_id = auth.uid());

-- Q&A Questions
CREATE POLICY "Questions are viewable by everyone" ON qa_questions FOR SELECT USING (status != 'archived');
CREATE POLICY "Users can create questions" ON qa_questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors can update their own questions" ON qa_questions FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors can delete their own questions" ON qa_questions FOR DELETE USING (author_id = auth.uid());

-- Question tags
CREATE POLICY "Question tags are viewable by everyone" ON qa_question_tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage question tags" ON qa_question_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM qa_questions WHERE id = question_id AND author_id = auth.uid())
);

-- Q&A Answers
CREATE POLICY "Answers are viewable by everyone" ON qa_answers FOR SELECT USING (true);
CREATE POLICY "Users can create answers" ON qa_answers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors can update their own answers" ON qa_answers FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors can delete their own answers" ON qa_answers FOR DELETE USING (author_id = auth.uid());

-- Answer comments
CREATE POLICY "Answer comments are viewable by everyone" ON qa_answer_comments FOR SELECT USING (true);
CREATE POLICY "Users can create answer comments" ON qa_answer_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own answer comments" ON qa_answer_comments FOR UPDATE USING (author_id = auth.uid());

-- Votes
CREATE POLICY "Users can view all votes" ON content_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON content_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can change their vote" ON content_votes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can remove their vote" ON content_votes FOR DELETE USING (user_id = auth.uid());

-- Likes
CREATE POLICY "Users can view all likes" ON content_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON content_likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can unlike" ON content_likes FOR DELETE USING (user_id = auth.uid());

-- Bookmarks
CREATE POLICY "Users can view their bookmarks" ON content_bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can bookmark" ON content_bookmarks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can remove bookmarks" ON content_bookmarks FOR DELETE USING (user_id = auth.uid());

-- Reputation
CREATE POLICY "Reputation is viewable by everyone" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can view their reputation history" ON reputation_history FOR SELECT USING (user_id = auth.uid());

-- Badges
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Subscriptions
CREATE POLICY "Users can view their subscriptions" ON author_subscriptions FOR SELECT USING (subscriber_id = auth.uid());
CREATE POLICY "Users can subscribe" ON author_subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());
CREATE POLICY "Users can unsubscribe" ON author_subscriptions FOR DELETE USING (subscriber_id = auth.uid());

CREATE POLICY "Users can view their category subscriptions" ON category_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can subscribe to categories" ON category_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsubscribe from categories" ON category_subscriptions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view their tag subscriptions" ON tag_subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can subscribe to tags" ON tag_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsubscribe from tags" ON tag_subscriptions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can follow questions" ON question_followers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can follow" ON question_followers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unfollow" ON question_followers FOR DELETE USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view their notifications" ON community_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their notifications" ON community_notifications FOR UPDATE USING (user_id = auth.uid());

-- Notification preferences
CREATE POLICY "Users can view their preferences" ON notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their preferences" ON notification_preferences FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create their preferences" ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- 10. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para generar slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[áàäâã]', 'a', 'gi'),
        '[éèëê]', 'e', 'gi'
      ),
      '[^a-z0-9]+', '-', 'gi'
    )
  ) || '-' || substr(gen_random_uuid()::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Función para calcular tiempo de lectura
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200;
BEGIN
  word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
  RETURN GREATEST(1, CEIL(word_count::DECIMAL / words_per_minute));
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar slug en posts
CREATE OR REPLACE FUNCTION blog_posts_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  NEW.reading_time := calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blog_posts_before_insert
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION blog_posts_before_insert();

-- Trigger para auto-generar slug en questions
CREATE OR REPLACE FUNCTION qa_questions_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_qa_questions_before_insert
  BEFORE INSERT ON qa_questions
  FOR EACH ROW
  EXECUTE FUNCTION qa_questions_before_insert();

-- Función para actualizar contadores de votos
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  vote_delta INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    vote_delta := CASE WHEN NEW.vote_type = 'upvote' THEN 1 ELSE -1 END;
  ELSIF TG_OP = 'DELETE' THEN
    vote_delta := CASE WHEN OLD.vote_type = 'upvote' THEN -1 ELSE 1 END;
  ELSIF TG_OP = 'UPDATE' THEN
    vote_delta := CASE 
      WHEN NEW.vote_type = 'upvote' AND OLD.vote_type = 'downvote' THEN 2
      WHEN NEW.vote_type = 'downvote' AND OLD.vote_type = 'upvote' THEN -2
      ELSE 0
    END;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.content_type = 'question' THEN
      UPDATE qa_questions SET vote_count = vote_count + vote_delta WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'answer' THEN
      UPDATE qa_answers SET vote_count = vote_count + vote_delta WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSE
    IF OLD.content_type = 'question' THEN
      UPDATE qa_questions SET vote_count = vote_count + vote_delta WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'answer' THEN
      UPDATE qa_answers SET vote_count = vote_count + vote_delta WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON content_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Función para actualizar contadores de likes
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
DECLARE
  like_delta INTEGER;
BEGIN
  like_delta := CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END;
  
  IF TG_OP = 'INSERT' THEN
    IF NEW.content_type = 'post' THEN
      UPDATE blog_posts SET like_count = like_count + like_delta WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'comment' THEN
      UPDATE blog_comments SET like_count = like_count + like_delta WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'answer_comment' THEN
      UPDATE qa_answer_comments SET like_count = like_count + like_delta WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSE
    IF OLD.content_type = 'post' THEN
      UPDATE blog_posts SET like_count = like_count + like_delta WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'comment' THEN
      UPDATE blog_comments SET like_count = like_count + like_delta WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'answer_comment' THEN
      UPDATE qa_answer_comments SET like_count = like_count + like_delta WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
  AFTER INSERT OR DELETE ON content_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Función para actualizar contador de respuestas
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE qa_questions SET answer_count = answer_count + 1 WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE qa_questions SET answer_count = answer_count - 1 WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_answer_count
  AFTER INSERT OR DELETE ON qa_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_count();

-- Función para actualizar contador de comentarios
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_count();

-- Función para actualizar uso de tags
CREATE OR REPLACE FUNCTION update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE content_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE content_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_posts
  AFTER INSERT OR DELETE ON blog_post_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage();

CREATE TRIGGER trigger_update_tag_usage_questions
  AFTER INSERT OR DELETE ON qa_question_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage();

-- Trigger para updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_questions_updated_at
  BEFORE UPDATE ON qa_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qa_answers_updated_at
  BEFORE UPDATE ON qa_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. DATOS INICIALES
-- ============================================

-- Categorías por defecto
INSERT INTO blog_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Salud General', 'salud-general', 'Consejos y artículos sobre salud general y bienestar', 'heart', '#EF4444', 1),
  ('Nutrición', 'nutricion', 'Alimentación saludable y consejos nutricionales', 'apple', '#22C55E', 2),
  ('Salud Mental', 'salud-mental', 'Bienestar emocional y psicológico', 'brain', '#8B5CF6', 3),
  ('Pediatría', 'pediatria', 'Salud infantil y cuidado de los niños', 'baby', '#F59E0B', 4),
  ('Cardiología', 'cardiologia', 'Salud cardiovascular y prevención', 'activity', '#DC2626', 5),
  ('Dermatología', 'dermatologia', 'Cuidado de la piel y tratamientos', 'droplet', '#06B6D4', 6),
  ('Medicina Preventiva', 'medicina-preventiva', 'Prevención de enfermedades y chequeos', 'shield', '#10B981', 7),
  ('Tecnología Médica', 'tecnologia-medica', 'Innovaciones y avances en medicina', 'cpu', '#6366F1', 8),
  ('Ejercicio y Fitness', 'ejercicio-fitness', 'Actividad física y deporte para la salud', 'dumbbell', '#F97316', 9),
  ('Enfermedades Crónicas', 'enfermedades-cronicas', 'Manejo de condiciones crónicas', 'clipboard', '#64748B', 10)
ON CONFLICT (slug) DO NOTHING;

-- Tags populares
INSERT INTO content_tags (name, slug, description) VALUES
  ('COVID-19', 'covid-19', 'Información sobre coronavirus'),
  ('Diabetes', 'diabetes', 'Diabetes y control glucémico'),
  ('Hipertensión', 'hipertension', 'Presión arterial alta'),
  ('Vacunas', 'vacunas', 'Inmunización y vacunación'),
  ('Embarazo', 'embarazo', 'Salud durante el embarazo'),
  ('Estrés', 'estres', 'Manejo del estrés'),
  ('Sueño', 'sueno', 'Calidad del sueño'),
  ('Obesidad', 'obesidad', 'Control de peso'),
  ('Alergias', 'alergias', 'Reacciones alérgicas'),
  ('Dolor', 'dolor', 'Manejo del dolor'),
  ('Telemedicina', 'telemedicina', 'Consultas virtuales'),
  ('Medicamentos', 'medicamentos', 'Uso de fármacos'),
  ('Primeros Auxilios', 'primeros-auxilios', 'Atención de emergencia'),
  ('Salud Femenina', 'salud-femenina', 'Salud de la mujer'),
  ('Salud Masculina', 'salud-masculina', 'Salud del hombre')
ON CONFLICT (slug) DO NOTHING;

-- Badges iniciales
INSERT INTO badges (name, slug, description, icon, badge_type, requirement_type, requirement_value, points_reward) VALUES
  ('Primer Artículo', 'primer-articulo', 'Publicaste tu primer artículo', 'pen-tool', 'bronze', 'posts', 1, 10),
  ('Escritor Activo', 'escritor-activo', 'Publicaste 10 artículos', 'book-open', 'silver', 'posts', 10, 50),
  ('Autor Prolífico', 'autor-prolifico', 'Publicaste 50 artículos', 'award', 'gold', 'posts', 50, 200),
  ('Primera Respuesta', 'primera-respuesta', 'Respondiste tu primera pregunta', 'message-circle', 'bronze', 'answers', 1, 10),
  ('Colaborador', 'colaborador', 'Respondiste 25 preguntas', 'users', 'silver', 'answers', 25, 75),
  ('Experto', 'experto', 'Respondiste 100 preguntas', 'star', 'gold', 'answers', 100, 300),
  ('Respuesta Aceptada', 'respuesta-aceptada', 'Tu respuesta fue aceptada', 'check-circle', 'bronze', 'accepted_answers', 1, 15),
  ('Solucionador', 'solucionador', 'Tienes 10 respuestas aceptadas', 'target', 'silver', 'accepted_answers', 10, 100),
  ('Gurú', 'guru', 'Tienes 50 respuestas aceptadas', 'crown', 'gold', 'accepted_answers', 50, 500),
  ('Médico Verificado', 'medico-verificado', 'Eres un médico verificado en la plataforma', 'shield-check', 'platinum', 'verified_doctor', 1, 100),
  ('Popular', 'popular', 'Un artículo tuyo tiene 100 likes', 'heart', 'silver', 'post_likes', 100, 50),
  ('Viral', 'viral', 'Un artículo tuyo tiene 1000 vistas', 'trending-up', 'gold', 'post_views', 1000, 100),
  ('Racha de 7 días', 'racha-7', 'Participaste 7 días seguidos', 'flame', 'bronze', 'streak', 7, 25),
  ('Racha de 30 días', 'racha-30', 'Participaste 30 días seguidos', 'zap', 'silver', 'streak', 30, 100)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE blog_categories IS 'Categorías para organizar artículos y preguntas';
COMMENT ON TABLE content_tags IS 'Tags/etiquetas para clasificar contenido';
COMMENT ON TABLE blog_posts IS 'Artículos del blog escritos por médicos verificados';
COMMENT ON TABLE blog_comments IS 'Comentarios en artículos del blog';
COMMENT ON TABLE qa_questions IS 'Preguntas de la comunidad';
COMMENT ON TABLE qa_answers IS 'Respuestas a preguntas de la comunidad';
COMMENT ON TABLE content_votes IS 'Votos (upvote/downvote) en contenido';
COMMENT ON TABLE content_likes IS 'Likes en contenido';
COMMENT ON TABLE content_bookmarks IS 'Contenido guardado por usuarios';
COMMENT ON TABLE user_reputation IS 'Puntos de reputación de usuarios';
COMMENT ON TABLE badges IS 'Insignias disponibles en la plataforma';
COMMENT ON TABLE user_badges IS 'Insignias obtenidas por usuarios';
COMMENT ON TABLE author_subscriptions IS 'Suscripciones a autores';
COMMENT ON TABLE community_notifications IS 'Notificaciones de la comunidad';


-- ============================================
-- 12. FUNCIONES RPC ADICIONALES
-- ============================================

-- Función para incrementar vistas de posts
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar vistas de preguntas
CREATE OR REPLACE FUNCTION increment_question_views(question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE qa_questions 
  SET view_count = view_count + 1 
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar puntos de reputación
CREATE OR REPLACE FUNCTION add_reputation_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_content_type TEXT DEFAULT NULL,
  p_content_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insertar o actualizar reputación del usuario
  INSERT INTO user_reputation (user_id, total_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_reputation.total_points + p_points,
    updated_at = NOW();

  -- Registrar en historial
  INSERT INTO reputation_history (user_id, points, reason, content_type, content_id)
  VALUES (p_user_id, p_points, p_reason, p_content_type, p_content_id);

  -- Actualizar nivel basado en puntos
  UPDATE user_reputation
  SET 
    level = GREATEST(1, FLOOR(total_points / 500) + 1),
    level_name = CASE 
      WHEN total_points < 100 THEN 'Novato'
      WHEN total_points < 500 THEN 'Aprendiz'
      WHEN total_points < 1000 THEN 'Contribuidor'
      WHEN total_points < 2500 THEN 'Experto'
      WHEN total_points < 5000 THEN 'Maestro'
      WHEN total_points < 10000 THEN 'Gurú'
      ELSE 'Leyenda'
    END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar racha de actividad
CREATE OR REPLACE FUNCTION update_activity_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak 
  INTO v_last_activity, v_current_streak
  FROM user_reputation 
  WHERE user_id = p_user_id;

  IF v_last_activity IS NULL THEN
    -- Primera actividad
    INSERT INTO user_reputation (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(user_reputation.longest_streak, 1),
      last_activity_date = CURRENT_DATE;
  ELSIF v_last_activity = CURRENT_DATE - 1 THEN
    -- Día consecutivo
    UPDATE user_reputation SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  ELSIF v_last_activity < CURRENT_DATE - 1 THEN
    -- Racha rota
    UPDATE user_reputation SET
      current_streak = 1,
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar y otorgar badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_badge RECORD;
  v_user_stats RECORD;
BEGIN
  -- Obtener estadísticas del usuario
  SELECT * INTO v_user_stats FROM user_reputation WHERE user_id = p_user_id;

  -- Verificar cada badge
  FOR v_badge IN SELECT * FROM badges LOOP
    -- Verificar si ya tiene el badge
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) THEN
      -- Verificar si cumple los requisitos
      IF (v_badge.requirement_type = 'posts' AND v_user_stats.total_posts >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'answers' AND v_user_stats.total_answers >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'accepted_answers' AND v_user_stats.total_accepted_answers >= v_badge.requirement_value) OR
         (v_badge.requirement_type = 'streak' AND v_user_stats.current_streak >= v_badge.requirement_value) THEN
        
        -- Otorgar badge
        INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
        
        -- Agregar puntos de recompensa
        IF v_badge.points_reward > 0 THEN
          PERFORM add_reputation_points(p_user_id, v_badge.points_reward, 'Badge: ' || v_badge.name);
        END IF;

        -- Crear notificación
        INSERT INTO community_notifications (user_id, notification_type, title, message)
        VALUES (p_user_id, 'badge_earned', '¡Nueva insignia!', 'Has obtenido la insignia: ' || v_badge.name);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar estadísticas cuando se crea un post
CREATE OR REPLACE FUNCTION on_post_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' THEN
    -- Actualizar contador de posts
    UPDATE user_reputation SET
      total_posts = total_posts + 1
    WHERE user_id = NEW.author_id;

    -- Agregar puntos
    PERFORM add_reputation_points(NEW.author_id, 50, 'Artículo publicado', 'post', NEW.id);
    
    -- Actualizar racha
    PERFORM update_activity_streak(NEW.author_id);
    
    -- Verificar badges
    PERFORM check_and_award_badges(NEW.author_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_post_created
  AFTER INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION on_post_created();

-- Trigger para actualizar estadísticas cuando se crea una respuesta
CREATE OR REPLACE FUNCTION on_answer_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contador de respuestas
  UPDATE user_reputation SET
    total_answers = total_answers + 1
  WHERE user_id = NEW.author_id;

  -- Agregar puntos
  PERFORM add_reputation_points(NEW.author_id, 10, 'Respuesta publicada', 'answer', NEW.id);
  
  -- Actualizar racha
  PERFORM update_activity_streak(NEW.author_id);
  
  -- Verificar badges
  PERFORM check_and_award_badges(NEW.author_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_answer_created
  AFTER INSERT ON qa_answers
  FOR EACH ROW
  EXECUTE FUNCTION on_answer_created();

-- Trigger para cuando una respuesta es aceptada
CREATE OR REPLACE FUNCTION on_answer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_accepted = true AND (OLD.is_accepted IS NULL OR OLD.is_accepted = false) THEN
    -- Actualizar contador de respuestas aceptadas
    UPDATE user_reputation SET
      total_accepted_answers = total_accepted_answers + 1
    WHERE user_id = NEW.author_id;

    -- Agregar puntos extra
    PERFORM add_reputation_points(NEW.author_id, 25, 'Respuesta aceptada', 'answer', NEW.id);
    
    -- Verificar badges
    PERFORM check_and_award_badges(NEW.author_id);

    -- Notificar al autor
    INSERT INTO community_notifications (user_id, notification_type, title, message, content_type, content_id)
    VALUES (NEW.author_id, 'answer_accepted', '¡Respuesta aceptada!', 'Tu respuesta ha sido marcada como la mejor respuesta.', 'answer', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_answer_accepted
  AFTER UPDATE ON qa_answers
  FOR EACH ROW
  EXECUTE FUNCTION on_answer_accepted();

-- Trigger para cuando se recibe un voto positivo
CREATE OR REPLACE FUNCTION on_vote_received()
RETURNS TRIGGER AS $$
DECLARE
  v_content_author_id UUID;
BEGIN
  IF NEW.vote_type = 'upvote' THEN
    -- Obtener el autor del contenido
    IF NEW.content_type = 'question' THEN
      SELECT author_id INTO v_content_author_id FROM qa_questions WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'answer' THEN
      SELECT author_id INTO v_content_author_id FROM qa_answers WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'post' THEN
      SELECT author_id INTO v_content_author_id FROM blog_posts WHERE id = NEW.content_id;
    END IF;

    IF v_content_author_id IS NOT NULL AND v_content_author_id != NEW.user_id THEN
      -- Agregar puntos al autor del contenido
      PERFORM add_reputation_points(v_content_author_id, 5, 'Voto positivo recibido', NEW.content_type, NEW.content_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_on_vote_received
  AFTER INSERT ON content_votes
  FOR EACH ROW
  EXECUTE FUNCTION on_vote_received();
