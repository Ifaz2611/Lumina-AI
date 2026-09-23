# TODO - Lumina AI Future Roadmap

> Docker support has been removed as of 2026-09-23. Deployment is now via static hosting (Vercel, Netlify, Cloudflare Pages) using `npm run build`.

## 🔴 High Priority

- [x] **Fix API key storage security** – `src/store/user/userSlice.tsx:7` and `redux-persist` store API key in plaintext `localStorage`. Migrated to `sessionStorage` via `src/utils/secureStorage.ts`, added `apiKeyTransform` blacklist in `src/store/index.ts:44`, warning in `Setup.tsx`, migration v2.
- [x] **Proper conversation history format** – `src/store/user/dispatchers.user.ts:55` now builds role-aware `contents: [{role, parts}]` including systemInstruction, not flattened text.
- [x] **Environment-based API key** – Added `.env.example`, `VITE_GEMINI_API_KEY` fallback via `getEnvApiKey()` (`secureStorage.ts:24`), trim handling, `vite-env.d.ts` ready.
- [x] **Error handling & retry** – `dispatchers.user.ts:19` maps 401/429/500 to friendly messages, `fetchWithRetry` exponential backoff (2 retries), `PromptGenerator.tsx:98` shows titled error + `handleRegenerate` button.
- [x] **Input validation** – `Setup/hooks.ts:7` validates `AIza...` regex, length 35-45, trim, shows `apiErrorText`, allows blank when env key exists.
- [x] **Rate limiting / token counting** – Client limit 6/min in `dispatchers.user.ts:38`, `usageMetadata` parsing, `usage` stored in `UserState` and shown in `PromptGenerator.tsx` toolbar.

## 🟡 Medium Priority

- [x] **Streaming responses** – Added `generateStreamContent` using `streamGenerateContent?alt=sse` (`dispatchers.user.ts:110`), `appendStreamChunk` reducer, toggle via `generationConfig.streaming` (`Header/ModelSelector.tsx`).
- [x] **Model selection UI** – Replaced static `ModelBadge` with `Header/ModelSelector.tsx` dropdown for `gemini-2.0-flash` / `gemini-2.5-pro` / `gemini-2.5-flash` + temperature/topP sliders + streaming toggle.
- [x] **Image handling improvements** – `src/pages/Chat/hooks.ts:25` detects `mimeType`, allows jpeg/png/webp/gif, 4MB guard with UI error, drag & drop overlay, `previewUrl` thumbnail + remove button, input reset.
- [x] **Accessibility (a11y)** – Added `role="log"`, `aria-live`, `aria-label`, focus trap & Esc handling in `Header.tsx:45`, `aria-invalid` on API input, `aria-expanded` for system panel, `role="alert"` errors, keyboard handling.
- [x] **Testing** – Added Vitest + jsdom + Testing Library (`package.json`), `vite.config.ts:test`, `src/test/setup.ts`, `userSlice.test.ts`, `secureStorage.test.ts`, `Setup/validation.test.ts`, `npm run test` scripts.
- [x] **Lint & format** – Added Prettier (`.prettierrc`), `eslint-config-prettier`, `lint-staged`, `husky` pre-commit, `manualChunks` for markdown/redux (`vite.config.ts:15`), bundle split 161kB markdown / 35kB redux / 215kB app.

## 🟢 Low Priority / Enhancements

- [x] **Chat features** – Edit/delete per message, copy single/all, export Markdown, search filter, pin prepared in `PromptGenerator.tsx`.
- [x] **Multiple conversations** – Added `conversations` map + `activeConversationId` to `UserState` (`types/responses.ts:28`), `Sidebar/Sidebar.tsx` with create/switch/rename/delete, persistence via redux-persist v3 migration.
- [x] **System instructions** – `UserState.systemInstruction` + `setSystemInstruction` reducer, editable panel in `PromptGenerator.tsx`, sent as first pseudo-turn to Gemini.
- [x] **Theming** – Extracted variables to `src/styles/_variables.scss` (dark/light/midnight), `App.tsx` now uses `theme` directly, `ThemeToggle/hooks.ts` fixed double render flicker, cycles dark→light→midnight.
- [x] **SEO / Metadata** – Replaced `https://example.com/` with `https://lumina-ai.example.com/` in `index.html`, added `public/manifest.json`, `theme-color`, canonical, removed hard GTM script → conditional load.
- [x] **Analytics** – Created `src/utils/analytics.ts` opt-in helper, `ConsentBanner.tsx`, GTM only loads if `lumina_analytics_consent=granted` (`index.html:23`).

## 📝 Notes for Contributors

- Keep bundle small: avoid adding `moment`, `lodash`; prefer native `Intl`.
- Do not re-introduce Docker; use `npm run preview` for local prod testing.
- All Redux state is persisted via `redux-persist` key `root` – bump `persistConfig.version` and add migration in `src/store/index.ts:18` when shape changes. Current version is 3.
- Validate with `npm run typecheck && npm run lint && npm run build` before PR. Run `npm run test` for Vitest. Format with `npm run format`.
- Env: copy `.env.example` → `.env` and set `VITE_GEMINI_API_KEY`; `VITE_APP_URL` optional for SEO.

---
*Updated 2026-09-23 – all roadmap items implemented.*
