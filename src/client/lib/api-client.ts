import type {
  CatalogResponseDTO,
  ChapterSummaryDTO,
  CourseDetailResponseDTO,
  QuizPageResponseDTO,
  StudyChapterResponseDTO,
  UserSessionDTO,
} from '@shared/schema';
import { WORKER_LIMITS, type GradeLevel, type PlanType } from '@shared/constants';
import { SV_COPY } from './sv-copy';

const RETRY_DELAYS_MS = [350, 1000, 2400] as const;
const OFFLINE_QUEUE_KEY = 'gy25_offline_queue_v1';
const LOCAL_PROGRESS_KEY = 'gy25_local_progress_v1';
const RECENT_STUDY_KEY = 'gy25_recent_study_v1';

export interface ReadingProgressPayload {
  courseId: string;
  chapterId: string;
  lessonId: string;
  isCompleted: boolean;
  scrollRatio: number;
  clientUpdatedAt: number;
}

export interface QuizAttemptPayload {
  courseId: string;
  chapterId: string;
  questionId: string;
  gradeLevel: GradeLevel;
  isCorrect: boolean;
  givenAnswer: string;
  timeSpentMs: number;
  attemptedAt: number;
  clientAttemptId: string;
}

interface OfflineQueueStore {
  reading: ReadingProgressPayload[];
  quiz: QuizAttemptPayload[];
}

export interface LocalLessonProgressRecord {
  courseId: string;
  chapterId: string;
  lessonId: string;
  isCompleted: boolean;
  scrollRatio: number;
  updatedAt: number;
}

export interface LocalQuizAnswerRecord {
  courseId: string;
  chapterId: string;
  questionId: string;
  gradeLevel: GradeLevel;
  isCorrect: boolean;
  givenAnswer: string;
  attemptedAt: number;
}

export interface LocalProgressStore {
  lessons: Record<string, LocalLessonProgressRecord>;
  quizAnswers: Record<string, LocalQuizAnswerRecord>;
}

export interface RecentStudyBookmark {
  courseSlug: string;
  courseNameSv: string;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitleSv: string;
  sectionSlug?: string;
  updatedAt: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;
  readonly isNetworkError: boolean;
  readonly isTimeout: boolean;

  constructor(
    status: number,
    message: string,
    options?: { payload?: unknown; isNetworkError?: boolean; isTimeout?: boolean },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = options?.payload;
    this.isNetworkError = Boolean(options?.isNetworkError);
    this.isTimeout = Boolean(options?.isTimeout);
  }
}

type SessionListener = (user: UserSessionDTO | null) => void;
const sessionListeners = new Set<SessionListener>();
let cachedUser: UserSessionDTO | null | undefined = undefined;
let flushInFlight: Promise<void> | null = null;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota restrictions gracefully
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function extractSwedishServerError(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const rawMsg =
      typeof record.error === 'string'
        ? record.error
        : typeof record.message === 'string'
          ? record.message
          : '';
    if (rawMsg.trim()) {
      return rawMsg.trim();
    }
  }
  if (status === 401) return 'Du behöver logga in för att fortsätta.';
  if (status === 403) return SV_COPY.study.lockedBody;
  if (status === 404) return SV_COPY.errors.notFoundBody;
  if (status === 413) return 'Förfrågan är för stor.';
  if (status === 429) return 'För många försök på kort tid — vänta en stund och försök igen.';
  return SV_COPY.errors.genericBody;
}

async function fetchWithTimeoutAndRetry(
  url: string,
  init: RequestInit = {},
  options?: { retryOnTransient?: boolean },
): Promise<Response> {
  const retryEnabled = options?.retryOnTransient !== false;
  const maxAttempts = retryEnabled ? RETRY_DELAYS_MS.length + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), WORKER_LIMITS.apiTimeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        credentials: 'same-origin',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init.headers ?? {}),
        },
      });
      window.clearTimeout(timer);

      if (response.status >= 500 && attempt < maxAttempts - 1) {
        const delay = RETRY_DELAYS_MS[attempt] ?? 2400;
        await sleep(delay);
        continue;
      }

      return response;
    } catch (err) {
      window.clearTimeout(timer);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (attempt < maxAttempts - 1) {
        const delay = RETRY_DELAYS_MS[attempt] ?? 2400;
        await sleep(delay);
        continue;
      }
      if (isAbort) {
        throw new ApiError(0, SV_COPY.errors.timeoutBody, { isTimeout: true, isNetworkError: true });
      }
      throw new ApiError(0, SV_COPY.errors.networkBody, { isNetworkError: true });
    }
  }

  throw new ApiError(0, SV_COPY.errors.networkBody, { isNetworkError: true });
}

async function requestJson<T>(
  url: string,
  init: RequestInit = {},
  options?: { retryOnTransient?: boolean; allow403WithPayload?: boolean },
): Promise<T> {
  const response = await fetchWithTimeoutAndRetry(url, init, options);
  let payload: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (options?.allow403WithPayload && response.status === 403 && payload && typeof payload === 'object') {
      return payload as T;
    }
    throw new ApiError(response.status, extractSwedishServerError(payload, response.status), {
      payload,
    });
  }

  return payload as T;
}

// ============================================================================
// Session & Auth State
// ============================================================================

export function subscribeSession(listener: SessionListener): () => void {
  sessionListeners.add(listener);
  if (cachedUser !== undefined) {
    listener(cachedUser);
  }
  return () => {
    sessionListeners.delete(listener);
  };
}

export function getCachedUser(): UserSessionDTO | null {
  return cachedUser ?? null;
}

export function setCachedUser(user: UserSessionDTO | null): void {
  cachedUser = user;
  for (const listener of sessionListeners) {
    listener(user);
  }
}

export async function fetchCurrentUser(force = false): Promise<UserSessionDTO | null> {
  if (!force && cachedUser !== undefined) {
    return cachedUser;
  }
  try {
    const res = await requestJson<{ user?: UserSessionDTO | null } | UserSessionDTO>(
      '/api/auth/me',
      { method: 'GET' },
      { retryOnTransient: false },
    );
    const user =
      res && typeof res === 'object' && 'user' in res
        ? (res.user ?? null)
        : res && typeof res === 'object' && 'id' in res
          ? (res as UserSessionDTO)
          : null;
    setCachedUser(user);
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setCachedUser(null);
      return null;
    }
    setCachedUser(cachedUser ?? null);
    return cachedUser ?? null;
  }
}

export async function requestMagicLink(
  email: string,
  redirectPath: string,
): Promise<{ message: string; demoVerifyUrl?: string }> {
  return requestJson<{ message: string; demoVerifyUrl?: string }>(
    '/api/auth/magic-link',
    {
      method: 'POST',
      body: JSON.stringify({ email, redirectPath }),
    },
    { retryOnTransient: false },
  );
}

export async function verifyMagicLinkToken(
  token: string,
): Promise<{ redirectPath: string; user: UserSessionDTO | null }> {
  const response = await fetchWithTimeoutAndRetry(
    `/api/auth/verify?token=${encodeURIComponent(token)}`,
    { method: 'GET' },
    { retryOnTransient: false },
  );

  // If the worker responded with a redirect, fetch followed it and response.url is the destination
  if (response.redirected) {
    const dest = new URL(response.url);
    const user = await fetchCurrentUser(true);
    await flushOfflineQueue();
    return {
      redirectPath: `${dest.pathname}${dest.search}${dest.hash}`,
      user,
    };
  }

  let payload: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(response.status, extractSwedishServerError(payload, response.status), {
      payload,
    });
  }

  const data = (payload ?? {}) as { redirectPath?: string; user?: UserSessionDTO | null };
  const user = data.user ?? (await fetchCurrentUser(true));
  if (data.user) {
    setCachedUser(data.user);
  }
  await flushOfflineQueue();
  return {
    redirectPath:
      typeof data.redirectPath === 'string' && data.redirectPath.startsWith('/') && !data.redirectPath.startsWith('//')
        ? data.redirectPath
        : '/',
    user,
  };
}

export async function logoutSession(): Promise<void> {
  try {
    await requestJson('/api/auth/logout', { method: 'POST' }, { retryOnTransient: false });
  } finally {
    setCachedUser(null);
  }
}

export async function createCheckoutSession(planType: PlanType): Promise<string> {
  const data = await requestJson<{ url?: string; checkoutUrl?: string }>(
    '/api/checkout',
    {
      method: 'POST',
      body: JSON.stringify({ planType }),
    },
    { retryOnTransient: false },
  );
  const url = data.url ?? data.checkoutUrl;
  if (!url) {
    throw new ApiError(500, SV_COPY.errors.genericBody);
  }
  return url;
}

// ============================================================================
// Curriculum & Study Endpoints
// ============================================================================

export async function fetchCatalog(): Promise<CatalogResponseDTO> {
  return requestJson<CatalogResponseDTO>('/api/catalog', { method: 'GET' });
}

interface CourseProgressPayload {
  chapters?: Array<{
    chapterId: string;
    completedLessons?: number;
    lessonCount?: number;
    masteryByGrade?: ChapterSummaryDTO['masteryByGrade'];
  }>;
}

export async function fetchCourseDetail(kursSlug: string): Promise<CourseDetailResponseDTO> {
  const slug = encodeURIComponent(kursSlug);
  let detail: CourseDetailResponseDTO | null = null;

  try {
    detail = await requestJson<CourseDetailResponseDTO>(`/api/catalog/${slug}`, { method: 'GET' });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 404) {
      throw err;
    }
  }

  if (!detail) {
    try {
      detail = await requestJson<CourseDetailResponseDTO>(`/api/courses/${slug}`, { method: 'GET' });
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 404) {
        throw err;
      }
    }
  }

  if (!detail) {
    // Fallback if catalog already embeds chapters or progress endpoint provides them
    const catalog = await fetchCatalog();
    for (const subject of catalog.subjects) {
      const matched = subject.courses.find((c) => c.slug === kursSlug) as
        | (typeof subject.courses[number] & { chapters?: ChapterSummaryDTO[] })
        | undefined;
      if (matched) {
        detail = {
          course: matched,
          chapters: Array.isArray(matched.chapters) ? matched.chapters : [],
          hasActivePass: Boolean(cachedUser?.hasActivePass),
        };
        break;
      }
    }
    if (!detail) {
      throw new ApiError(404, SV_COPY.errors.notFoundBody);
    }
  }

  // Optionally enrich with server progress if authenticated and chapters lack progress fields
  const needsProgressFetch =
    cachedUser &&
    detail.chapters.length > 0 &&
    detail.chapters[0]?.masteryByGrade === undefined;
  if (needsProgressFetch) {
    try {
      const progress = await requestJson<CourseProgressPayload | CourseDetailResponseDTO>(
        `/api/progress/course/${slug}`,
        { method: 'GET' },
        { retryOnTransient: false },
      );
      if ('chapters' in progress && Array.isArray(progress.chapters)) {
        const byId = new Map(
          progress.chapters.map((ch) => [
            'chapterId' in ch ? ch.chapterId : (ch as ChapterSummaryDTO).id,
            ch,
          ]),
        );
        detail.chapters = detail.chapters.map((ch) => {
          const match = byId.get(ch.id);
          if (!match) return ch;
          return {
            ...ch,
            completedLessons: match.completedLessons ?? ch.completedLessons,
            lessonCount: match.lessonCount ?? ch.lessonCount,
            masteryByGrade: match.masteryByGrade ?? ch.masteryByGrade,
          };
        });
      }
    } catch {
      // Non-fatal: course metadata still displays cleanly
    }
  }

  return detail;
}

export async function fetchStudyChapter(
  kursSlug: string,
  kapitelSlug: string,
): Promise<StudyChapterResponseDTO> {
  const url = `/api/study/${encodeURIComponent(kursSlug)}/${encodeURIComponent(kapitelSlug)}`;
  try {
    const res = await requestJson<StudyChapterResponseDTO>(
      url,
      { method: 'GET' },
      { allow403WithPayload: true },
    );
    return res;
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return {
        course: {
          id: '',
          subjectId: '',
          subjectSlug: '',
          subjectNameSv: '',
          slug: kursSlug,
          codeGy25: '',
          nameSv: kursSlug,
          levelLabelSv: '',
          centralContentSummarySv: '',
          sortOrder: 0,
          chapterCount: 0,
        },
        chapter: {
          id: '',
          courseId: '',
          slug: kapitelSlug,
          chapterNumber: 2,
          titleSv: SV_COPY.study.lockedHeading,
          summarySv: SV_COPY.study.lockedBody,
          isFree: false,
          estimatedMinutes: 0,
          sortOrder: 2,
        },
        prevChapter: null,
        nextChapter: null,
        lessons: [],
        locked: true,
      };
    }
    throw err;
  }
}

export async function fetchQuizPage(
  kursSlug: string,
  kapitelSlug: string,
  params?: { cursor?: string; limit?: number; niva?: 'alla' | GradeLevel },
): Promise<QuizPageResponseDTO> {
  const search = new URLSearchParams();
  if (params?.cursor) search.set('cursor', params.cursor);
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.niva) search.set('niva', params.niva);
  const query = search.toString();
  const url = `/api/quiz/${encodeURIComponent(kursSlug)}/${encodeURIComponent(kapitelSlug)}${query ? `?${query}` : ''}`;

  try {
    return await requestJson<QuizPageResponseDTO>(url, { method: 'GET' }, { allow403WithPayload: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return {
        course: {
          id: '',
          subjectId: '',
          subjectSlug: '',
          subjectNameSv: '',
          slug: kursSlug,
          codeGy25: '',
          nameSv: kursSlug,
          levelLabelSv: '',
          centralContentSummarySv: '',
          sortOrder: 0,
          chapterCount: 0,
        },
        chapter: {
          id: '',
          courseId: '',
          slug: kapitelSlug,
          chapterNumber: 2,
          titleSv: SV_COPY.study.lockedHeading,
          summarySv: SV_COPY.study.lockedBody,
          isFree: false,
          estimatedMinutes: 0,
          sortOrder: 2,
        },
        questions: [],
        nextCursor: null,
        totalCount: 0,
        locked: true,
      };
    }
    throw err;
  }
}

// ============================================================================
// Local Anonymous Progress + Offline Queue (gy25_local_progress_v1 & gy25_offline_queue_v1)
// ============================================================================

export function getLocalProgress(): LocalProgressStore {
  const raw = safeReadJson<Partial<LocalProgressStore>>(LOCAL_PROGRESS_KEY, {});
  return {
    lessons: raw.lessons && typeof raw.lessons === 'object' ? raw.lessons : {},
    quizAnswers: raw.quizAnswers && typeof raw.quizAnswers === 'object' ? raw.quizAnswers : {},
  };
}

function saveLocalLessonProgress(item: ReadingProgressPayload): void {
  const store = getLocalProgress();
  store.lessons[item.lessonId] = {
    courseId: item.courseId,
    chapterId: item.chapterId,
    lessonId: item.lessonId,
    isCompleted: item.isCompleted,
    scrollRatio: item.scrollRatio,
    updatedAt: item.clientUpdatedAt,
  };
  safeWriteJson(LOCAL_PROGRESS_KEY, store);
}

function saveLocalQuizAnswer(attempt: QuizAttemptPayload): void {
  const store = getLocalProgress();
  store.quizAnswers[attempt.questionId] = {
    courseId: attempt.courseId,
    chapterId: attempt.chapterId,
    questionId: attempt.questionId,
    gradeLevel: attempt.gradeLevel,
    isCorrect: attempt.isCorrect,
    givenAnswer: attempt.givenAnswer,
    attemptedAt: attempt.attemptedAt,
  };
  safeWriteJson(LOCAL_PROGRESS_KEY, store);
}

export function clearChapterLocalQuizAnswers(chapterId: string): void {
  const store = getLocalProgress();
  for (const [qId, rec] of Object.entries(store.quizAnswers)) {
    if (rec.chapterId === chapterId) {
      delete store.quizAnswers[qId];
    }
  }
  safeWriteJson(LOCAL_PROGRESS_KEY, store);
}

export function getRecentStudyBookmark(): RecentStudyBookmark | null {
  const raw = safeReadJson<RecentStudyBookmark | null>(RECENT_STUDY_KEY, null);
  if (!raw || !raw.courseSlug || !raw.chapterSlug) return null;
  return raw;
}

export function setRecentStudyBookmark(bookmark: RecentStudyBookmark): void {
  safeWriteJson(RECENT_STUDY_KEY, bookmark);
}

function readOfflineQueue(): OfflineQueueStore {
  const raw = safeReadJson<Partial<OfflineQueueStore>>(OFFLINE_QUEUE_KEY, {});
  return {
    reading: Array.isArray(raw.reading) ? raw.reading : [],
    quiz: Array.isArray(raw.quiz) ? raw.quiz : [],
  };
}

function writeOfflineQueue(queue: OfflineQueueStore): void {
  safeWriteJson(OFFLINE_QUEUE_KEY, queue);
}

export function getOfflineQueueCount(): number {
  const q = readOfflineQueue();
  return q.reading.length + q.quiz.length;
}

function enqueueReadingItem(item: ReadingProgressPayload): void {
  const queue = readOfflineQueue();
  const filtered = queue.reading.filter((r) => r.lessonId !== item.lessonId);
  filtered.push(item);
  queue.reading = filtered.slice(-50);
  writeOfflineQueue(queue);
}

function enqueueQuizAttempt(attempt: QuizAttemptPayload): void {
  const queue = readOfflineQueue();
  if (!queue.quiz.some((q) => q.clientAttemptId === attempt.clientAttemptId)) {
    queue.quiz.push(attempt);
    queue.quiz = queue.quiz.slice(-100);
    writeOfflineQueue(queue);
  }
}

export async function recordReadingProgress(
  item: ReadingProgressPayload,
): Promise<{ synced: boolean; queued: boolean }> {
  saveLocalLessonProgress(item);

  if (!cachedUser) {
    // Unauthenticated free Chapter 1 reading stays in localStorage seamlessly
    return { synced: false, queued: false };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueueReadingItem(item);
    return { synced: false, queued: true };
  }

  try {
    await requestJson('/api/progress/reading', {
      method: 'POST',
      body: JSON.stringify({ items: [item] }),
    });
    return { synced: true, queued: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { synced: false, queued: false };
    }
    enqueueReadingItem(item);
    return { synced: false, queued: true };
  }
}

export async function recordQuizAttempt(
  attempt: QuizAttemptPayload,
): Promise<{ synced: boolean; queued: boolean }> {
  saveLocalQuizAnswer(attempt);

  if (!cachedUser) {
    return { synced: false, queued: false };
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueueQuizAttempt(attempt);
    return { synced: false, queued: true };
  }

  try {
    await requestJson('/api/progress/quiz', {
      method: 'POST',
      body: JSON.stringify({ attempts: [attempt] }),
    });
    return { synced: true, queued: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { synced: false, queued: false };
    }
    enqueueQuizAttempt(attempt);
    return { synced: false, queued: true };
  }
}

export async function flushOfflineQueue(): Promise<void> {
  if (flushInFlight) return flushInFlight;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  const user = cachedUser !== undefined ? cachedUser : await fetchCurrentUser();
  if (!user) return;

  const queue = readOfflineQueue();
  if (queue.reading.length === 0 && queue.quiz.length === 0) return;

  flushInFlight = (async () => {
    try {
      while (queue.reading.length > 0) {
        const batch = queue.reading.slice(0, 25);
        await requestJson(
          '/api/progress/reading',
          {
            method: 'POST',
            body: JSON.stringify({ items: batch }),
          },
          { retryOnTransient: false },
        );
        queue.reading = queue.reading.slice(batch.length);
        writeOfflineQueue(queue);
      }

      while (queue.quiz.length > 0) {
        const batch = queue.quiz.slice(0, 30);
        await requestJson(
          '/api/progress/quiz',
          {
            method: 'POST',
            body: JSON.stringify({ attempts: batch }),
          },
          { retryOnTransient: false },
        );
        queue.quiz = queue.quiz.slice(batch.length);
        writeOfflineQueue(queue);
      }
    } catch {
      // Retain remaining queued items for the next reconnect/startup flush
    } finally {
      flushInFlight = null;
    }
  })();

  return flushInFlight;
}

export function createClientAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
