/**
 * Cookie name used by Supabase Auth in the paciente web app.
 *
 * Why a custom name: by default @supabase/ssr writes the session under
 * `sb-<project-ref>-auth-token`. Every app in this monorepo points at the SAME
 * Supabase project, so when running locally on localhost the cookies collide
 * across apps — logging into medico_web overwrites the paciente session and
 * vice versa.
 *
 * Using a unique cookie name + storageKey scopes the paciente session to this app.
 *
 * If you change this value, every existing patient must clear their browser
 * cookies for the app's host (the old cookie won't be read anymore).
 */
export const PACIENTE_AUTH_COOKIE_NAME = 'sb-rs-paciente-auth-token';
