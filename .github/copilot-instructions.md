<!-- Copilot / AI agent instructions for the BubbleAi codebase -->
# BubbleAi — Quick agent guide

This file gives focused, actionable knowledge to help an AI coding agent be immediately productive in this repo.

1. Project type & entry points
   - Next.js (App Router) TypeScript app. See `package.json` (Next 14) and `app/layout.tsx`.
   - UI lives under `app/` (pages are React Server/Client components). Many components are client components and use `"use client"` at file top.

2. Auth & user model (critical)
   - Firebase Auth + Firestore. Initialization in `lib/firebase.ts`. Expects NEXT_PUBLIC_FIREBASE_* env vars.
   - User records stored in `users` collection. Creation/lookup logic: `lib/db.ts::checkOrCreateUser()` — note: first created user is implicitly treated as an admin; default role is `student`.
   - Student sign-up/login uses a shadow-email pattern: username -> `${username}@student.bubbleai.com`. See `components/StudentAuth.tsx` and `lib/actions.ts::generateShadowEmail()` for the canonical implementation.

3. Classroom / curriculum data flows
   - `classrooms` collection: created via `lib/db.ts::createClassroom()`. Teacher dashboard (`components/TeacherDashboard.tsx`) reads teacher classes using `getTeacherClasses()`.
   - Curriculum is stored under `curriculum/{gradeId}/weeks` and is queried in `app/dashboard/page.tsx::fetchCurriculum(gradeId)`.
   - Class keys use a 6-character, human-friendly format (e.g., `ABC-123`) generated in `lib/db.ts::generateClassCode()` and validated by `lib/actions.ts::verifyClassKey()`.

4. AI integration
   - Server API at `app/api/gemini/route.ts` calls Google Generative API (model `gemini-2.5-flash`) using `GEMINI_API_KEY` env var. The client-side component `components/AiTutor.tsx` POSTs to `/api/gemini`.
   - Responses are simple JSON { answer: string } — client code expects `data.answer`.

5. Conventions & pitfalls to follow exactly
   - Shadow email must be computed exactly the same in both join and login flows. The canonical helper is in `components/StudentAuth.tsx` (getStudentEmail) and `lib/actions.ts::generateShadowEmail()`.
   - Auth state is handled through `onAuthStateChanged` in `app/page.tsx` (login redirect) and `app/dashboard/page.tsx` (protect dashboard). Follow those flows when adding auth-related features.
   - Client components include data fetching via Firestore SDK in the browser; server-only sensitive logic should live in `app/api/*` routes.

6. Environment & dev workflows
   - Local dev: `npm run dev` (Next dev). Build: `npm run build`; start production server: `npm run start`.
   - Required env vars (discoverable from code):
     - NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID
     - GEMINI_API_KEY (used in `app/api/gemini/route.ts`)

7. Files to inspect when debugging common tasks
   - Auth/login issues: `components/StudentAuth.tsx`, `lib/firebase.ts`, `lib/db.ts`.
   - Teacher flows and class creation: `components/TeacherDashboard.tsx`, `lib/db.ts`.
   - Curriculum reading/writing: `app/dashboard/page.tsx`, `components/AdminCurriculum.tsx`.
   - AI behavior / model usage: `app/api/gemini/route.ts`, `components/AiTutor.tsx`.

8. Tests & CI
   - No tests found in the repo. Keep changes small and run TypeScript checks locally (`npm run build` or `tsc`) before larger refactors.

9. Example PR guidance for agents
   - Keep public API of components stable. When changing student auth flow, update both `StudentAuth.tsx` and any helper in `lib/actions.ts` to keep shadow-email logic identical.
   - For any change touching Firestore structure, list the affected collections and example document shapes in the PR description.

If any area above is unclear or you want this shorter/longer or organized differently (e.g., quick “file map” table), tell me which sections to expand or trim and I’ll iterate.
