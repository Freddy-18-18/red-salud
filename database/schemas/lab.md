# Laboratory & Telemedicine Domain

Tables for laboratory orders, results, telemedicine video sessions, messaging, community content, and the knowledge base.

## Laboratory

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `lab_test_types` | Catalog of available lab tests | `id`, `name`, `category`, `description`, `reference_ranges` |
| `lab_orders` | Lab test orders from doctors | `id`, `doctor_id`, `patient_id`, `status`, `ordered_at` |
| `lab_order_tests` | Individual tests within an order | `id`, `order_id`, `test_type_id` |
| `lab_results` | Result headers | `id`, `order_id`, `lab_technician`, `completed_at` |
| `lab_result_values` | Individual result values | `id`, `result_id`, `test_id`, `value`, `unit`, `is_abnormal` |
| `lab_order_status_history` | Order status change audit | `id`, `order_id`, `status`, `changed_at` |

## Telemedicine

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `telemedicine_sessions` | Video consultation sessions | `id`, `doctor_id`, `patient_id`, `status`, `scheduled_at` |
| `telemedicine_participants` | Participants in a session | `id`, `session_id`, `user_id`, `role`, `joined_at` |
| `telemedicine_chat_messages` | In-session chat messages | `id`, `session_id`, `sender_id`, `content` |
| `telemedicine_recordings` | Session recordings | `id`, `session_id`, `file_url`, `duration` |
| `telemedicine_prescriptions` | Prescriptions issued during teleconsult | `id`, `session_id`, `prescription_id` |
| `telemedicine_waiting_room` | Virtual waiting room | `session_id`, `patient_id`, `joined_at` |

## Agora Video Calls

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `agora_sessions` | Agora RTC session records | `id`, `channel_name`, `doctor_id`, `patient_id` |
| `call_participants` | Call participant tracking | `id`, `session_id`, `user_id`, `role` |
| `call_notifications` | Call-related push notifications | `id`, `session_id`, `user_id`, `type` |
| `call_recordings` | Call recording metadata | `id`, `session_id`, `file_url`, `duration` |
| `call_ratings` | Post-call quality ratings | `id`, `session_id`, `user_id`, `rating`, `feedback` |
| `call_events` | Call lifecycle events (join, leave, mute) | `id`, `session_id`, `event_type`, `timestamp` |

## Messaging (v2)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `chat_workspaces` | Chat workspace/organization | `id`, `name`, `owner_id` |
| `chat_categories` | Channel categories | `id`, `workspace_id`, `name` |
| `chat_channels` | Chat channels | `id`, `workspace_id`, `name`, `type` |
| `chat_participants` | Channel members | `channel_id`, `user_id`, `role` |
| `chat_messages` | Messages | `id`, `channel_id`, `sender_id`, `content`, `type` |
| `chat_message_reads` | Read receipts | `message_id`, `user_id`, `read_at` |
| `chat_threads` | Message threads | `id`, `parent_message_id` |
| `chat_mentions` | @mentions | `id`, `message_id`, `user_id` |
| `chat_typing_indicators` | Typing status | `channel_id`, `user_id`, `started_at` |
| `chat_user_presence` | Online/offline/away status | `user_id`, `status`, `last_seen` |
| `chat_polls` | In-chat polls | `id`, `channel_id`, `question`, `options` |
| `chat_poll_votes` | Poll votes | `poll_id`, `user_id`, `option_index` |
| `chat_voice_calls` | Voice call records | `id`, `channel_id`, `initiated_by` |
| `chat_call_participants` | Voice call participants | `call_id`, `user_id` |
| `chat_attachments` | File attachments | `id`, `message_id`, `file_url`, `file_type` |
| `chat_scheduled_messages` | Scheduled/delayed messages | `id`, `channel_id`, `content`, `send_at` |
| `chat_sticker_packs` / `chat_stickers` | Custom sticker packs | `id`, `name`, `image_url` |
| `chat_message_audit` | Message edit/delete audit | `id`, `message_id`, `action`, `previous_content` |
| `chat_search_index` | Full-text search index | `message_id`, `content_tsvector` |
| `chat_encryption_keys` | End-to-end encryption keys | `id`, `channel_id`, `public_key` |

## Messaging (v1 Legacy)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `conversations` | Legacy conversations | `id`, `participants` |
| `messages` | Legacy messages | `id`, `conversation_id`, `sender_id`, `content` |

## Knowledge Base & AI

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `documents` | Vector-embedded documentation chunks | `id`, `content`, `metadata`, `embedding` |
| `chatbot_feedback` | User feedback on AI chatbot responses | `id`, `message_id`, `rating`, `comment` |
| `scientific_articles` | Published scientific articles | `id`, `title`, `abstract`, `author_id`, `category_id` |
| `scientific_categories` | Article categories | `id`, `name` |

## Support

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `support_tickets` | Customer support tickets | `id`, `user_id`, `subject`, `status`, `priority` |

## Community & Blog

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `blog_categories` | Blog categories | `id`, `name`, `slug` |
| `blog_posts` | Blog articles | `id`, `author_id`, `title`, `content`, `status` |
| `blog_comments` | Comments on posts | `id`, `post_id`, `author_id`, `content` |
| `qa_questions` | Q&A forum questions | `id`, `author_id`, `title`, `content` |
| `qa_answers` | Answers to questions | `id`, `question_id`, `author_id`, `content` |
| `content_votes` | Upvotes/downvotes | `id`, `content_type`, `content_id`, `user_id`, `value` |
| `user_reputation` | Community reputation scores | `user_id`, `points` |
| `badges` | Achievable badges | `id`, `name`, `criteria` |
| `user_badges` | Badges earned by users | `user_id`, `badge_id`, `earned_at` |

## Academy

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `academy_specialties` | Learning track specialties | `id`, `name` |
| `academy_levels` | Difficulty levels | `id`, `specialty_id`, `name`, `order` |
| `academy_units` | Learning units | `id`, `level_id`, `name` |
| `academy_lessons` | Individual lessons | `id`, `unit_id`, `title`, `content_type` |
| `academy_questions` | Quiz questions | `id`, `lesson_id`, `question`, `options`, `correct_answer` |
| `academy_user_progress` | User progress tracking | `user_id`, `lesson_id`, `completed`, `score` |
| `academy_achievements` | Achievement definitions | `id`, `name`, `criteria` |
| `academy_certificates` | Issued certificates | `id`, `user_id`, `level_id`, `issued_at` |
| `academy_subscription_plans` | Premium learning plans | `id`, `name`, `price` |
| `academy_subscriptions` | Active subscriptions | `id`, `user_id`, `plan_id`, `status` |

## Google Calendar

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `google_calendar_tokens` | OAuth tokens for Google Calendar | `user_id`, `access_token`, `refresh_token`, `expires_at` |
| `google_calendar_event_mappings` | Maps appointments to Google Calendar events | `appointment_id`, `google_event_id` |
| `google_calendar_imported_events` | Events imported from Google Calendar | `id`, `user_id`, `google_event_id`, `title`, `start`, `end` |

## Migrations

- `006_create_messaging_system.sql`
- `007_create_laboratory_system.sql`
- `008_create_telemedicine_system.sql`
- `20241208000000_create_embeddings.sql`
- `20241208000001_create_chatbot_feedback.sql`
- `20250121000000_messaging_v2_core.sql`
- `20250121000001_messaging_v2_core_fixed.sql`
- `20250220000000_support_tables.sql`
- `20250220000001_kb_and_faq_setup.sql`
- `20251206000001_create_blog_community_system.sql`
- `20251218000001_create_academy_base.sql`
- `20251218000002_create_academy_gamification.sql`
- `20260121230258_agora_call_system.sql`
- `20260212000000_google_calendar_integration.sql`
- `20260215000000_create_scientific_articles_system.sql`
