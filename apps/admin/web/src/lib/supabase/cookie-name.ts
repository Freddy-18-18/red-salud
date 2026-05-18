/**
 * Cookie name used by Supabase Auth in the admin web app.
 *
 * Why a custom name: by default @supabase/ssr writes the session under
 * `sb-<project-ref>-auth-token`. Every app in this monorepo points at the SAME
 * Supabase project, so when running locally on localhost the cookies collide
 * across apps — logging into paciente_web overwrites the admin session and
 * vice versa.
 *
 * Using a unique cookie name + storageKey scopes the admin session to this app.
 *
 * If you change this value, every existing admin user must clear their browser
 * cookies for the app's host (the old cookie won't be read anymore).
 */
export const ADMIN_AUTH_COOKIE_NAME = 'sb-rs-admin-auth-token';
