-- ============================================================================
-- Gy25 Studieplattform — Cloudflare D1 (SQLite) Schema
-- Migration: 0001_initial_schema.sql
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT,
  stripe_customer_id TEXT UNIQUE,
  active_plan_type TEXT CHECK (active_plan_type IN ('terminspass', 'lasarspass')),
  access_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 2. SESSIONS (HTTP-only session token hashes)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- 3. MAGIC LINKS (Passwordless Swedish email auth)
CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  token TEXT NOT NULL UNIQUE,
  redirect_path TEXT NOT NULL DEFAULT '/',
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

-- 4. SUBJECTS (Fysik, Matematik, Svenska, Engelska)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_sv TEXT NOT NULL,
  description_sv TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

-- 5. COURSES (Gy25 / Skolverket syllabus courses)
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  code_gy25 TEXT NOT NULL,
  name_sv TEXT NOT NULL,
  level_label_sv TEXT NOT NULL,
  central_content_summary_sv TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

-- 6. CHAPTERS (Chapter 1 of every course is ALWAYS free)
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  title_sv TEXT NOT NULL,
  summary_sv TEXT NOT NULL,
  is_free INTEGER NOT NULL DEFAULT 0 CHECK (is_free IN (0, 1)),
  estimated_minutes INTEGER NOT NULL DEFAULT 25,
  sort_order INTEGER NOT NULL,
  UNIQUE (course_id, slug),
  UNIQUE (course_id, chapter_number)
);

-- 7. STUDY LESSONS (Structured content for the Dedicated Study/Reading Page)
CREATE TABLE IF NOT EXISTS study_lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  section_slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  title_sv TEXT NOT NULL,
  overview_concepts_json TEXT NOT NULL,
  theory_blocks_json TEXT NOT NULL,
  formulas_json TEXT NOT NULL,
  worked_examples_eca_json TEXT NOT NULL,
  exam_pitfalls_json TEXT NOT NULL,
  interactive_widget_type TEXT NOT NULL DEFAULT 'none' CHECK (interactive_widget_type IN ('none', 'energy_sim', 'unit_converter', 'graph_explorer')),
  interactive_config_json TEXT,
  updated_at INTEGER NOT NULL,
  UNIQUE (chapter_id, section_slug)
);

-- 8. QUESTIONS (E/C/A Question Bank linked to Study Lesson sections)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES study_lessons(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('E', 'C', 'A')),
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'numeric', 'text_analysis')),
  category_sv TEXT NOT NULL,
  prompt_sv TEXT NOT NULL,
  latex_formula TEXT,
  options_json TEXT,
  correct_answer TEXT NOT NULL,
  numeric_tolerance REAL,
  unit_sv TEXT,
  hint_sv TEXT NOT NULL,
  step_by_step_solution_sv TEXT NOT NULL,
  deep_derivation_sv TEXT,
  related_section_slug TEXT NOT NULL
);

-- 9. USER READING PROGRESS (Per-lesson completion & scroll checkpoint)
CREATE TABLE IF NOT EXISTS user_reading_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES study_lessons(id) ON DELETE CASCADE,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  scroll_ratio REAL NOT NULL DEFAULT 0 CHECK (scroll_ratio >= 0 AND scroll_ratio <= 1),
  last_read_at INTEGER NOT NULL,
  client_updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);

-- 10. USER QUIZ PROGRESS (Idempotent E/C/A attempt log)
CREATE TABLE IF NOT EXISTS user_quiz_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('E', 'C', 'A')),
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  given_answer TEXT NOT NULL,
  time_spent_ms INTEGER NOT NULL DEFAULT 0,
  attempted_at INTEGER NOT NULL,
  client_attempt_id TEXT NOT NULL UNIQUE
);

-- 11. PAYMENT EVENTS (Stripe Webhook Idempotency & Audit Ledger)
CREATE TABLE IF NOT EXISTS payment_events (
  stripe_event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('terminspass', 'lasarspass')),
  amount_ore INTEGER NOT NULL CHECK (amount_ore IN (4900, 7900)),
  currency TEXT NOT NULL CHECK (currency = 'sek'),
  access_granted_until INTEGER NOT NULL,
  processed_at INTEGER NOT NULL,
  raw_payload_json TEXT NOT NULL
);

-- 12. RATE LIMITS (Distributed sliding-window rate limiting fallback in D1)
CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  window_reset_at INTEGER NOT NULL
);

-- ============================================================================
-- MANDATORY PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON users(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_lessons_chapter_sort
  ON study_lessons(chapter_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_lookup
  ON user_reading_progress(user_id, course_id, chapter_id);

CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_lookup
  ON user_quiz_progress(user_id, course_id, chapter_id, grade_level);

CREATE INDEX IF NOT EXISTS idx_magic_links_token_expires
  ON magic_links(token, expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_token_expires
  ON sessions(token_hash, expires_at);

CREATE INDEX IF NOT EXISTS idx_questions_chapter_cursor
  ON questions(chapter_id, grade_level, sort_order, id);
