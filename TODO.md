# TODO - Lumina AI Future Roadmap

> Docker support has been removed as of 2026-09-23. Deployment is now via static hosting (Vercel, Netlify, Cloudflare Pages) using `npm run build`.

## 🔴 High Priority

- [ ] **Fix API key storage security** – `src/store/user/userSlice.tsx:7` and `redux-persist` store API key in plaintext `localStorage`. Migrate to `sessionStorage` or memory-only with optional encryption, warn user in UI.
- [ ] **Proper conversation history format** – Current `dispatchers.user.ts:12-26` flattens history into a single `text` part. Gemini API expects `contents: [{role:"user", parts:[...]}, {role:"model", parts:[...]}]` for multi-turn. Implement role-aware history mapping.
- [ ] **Environment-based API key** – Add `VITE_GEMINI_API_KEY` support via `.env` for dev, keep user input as fallback. Add `.env.example`.
- [ ] **Error handling & retry** – `PromptGenerator.tsx:98` only shows raw error. Add error codes (401, 429, 500), retry with exponential backoff, and “Regenerate” button.
- [ ] **Input validation** – `Setup/hooks.ts:21` only checks empty string. Add Gemini API key format validation (`AIza...` length 39), trim whitespace, debounce.
- [ ] **Rate limiting / token counting** – Prevent abuse, show token usage if available in `textResponse`.

## 🟡 Medium Priority

- [ ] **Streaming responses** – Switch from `generateContent` to `streamGenerateContent` (SSE), render tokens incrementally like ChatGPT.
- [ ] **Model selection UI** – `Header/Header.tsx:36` currently shows static `ModelBadge`. Re-enable dropdown for `gemini-2.0-flash` vs `gemini-2.5-pro` vs `gemini-2.5-flash` with temp/topP controls.
- [ ] **Image handling improvements** – Detect `mimeType` correctly (already partially done), add drag & drop, preview thumbnail, remove button, 4MB limit UI feedback, support `image/png`, `image/webp`.
- [ ] **Accessibility (a11y)** – Add `aria-*`, focus trap in `Header.tsx:89` mobile menu, keyboard nav, contrast checks for `.light` theme.
- [ ] **Testing** – No tests exist. Add Vitest + React Testing Library: `store/user/userSlice`, `dispatchers.user`, `usePromptGenerator`, `PromptGenerator`.
- [ ] **Lint & format** – Add Prettier, `lint-staged` + `husky` pre-commit, fix 119kB JS bundle: code-split `react-markdown`.

## 🟢 Low Priority / Enhancements

- [ ] **Chat features** – Edit/delete messages, copy conversation, export to Markdown/PDF, search history, pin chats.
- [ ] **Multiple conversations** – Sidebar with conversation list, rename, persistence per conversation ID (currently single `conversation.data` array).
- [ ] **System instructions** – Allow user to set system prompt / personality in Settings.
- [ ] **Theming** – Extract SCSS variables to `src/styles/_variables.scss`, add 3rd theme (e.g. `midnight`), respect `prefers-color-scheme` without flicker (`ThemeToggle/hooks.ts:18` causes double render).
- [ ] **SEO / Metadata** – Replace placeholder `https://example.com/` in `index.html:17,25,33` with real domain; add `manifest.json`, remove GTM unless needed.
- [ ] **Analytics** – Replace GTM script with privacy-friendly alternative or make it opt-in.


## 📝 Notes for Contributors

- Keep bundle small: avoid adding `moment`, `lodash`; prefer native `Intl`.
- Do not re-introduce Docker; use `npm run preview` for local prod testing.
- All Redux state is persisted via `redux-persist` key `root` – bump `persistConfig.version` and add migration in `src/store/index.ts:18` when shape changes.
- Validate with `npm run typecheck && npm run lint && npm run build` before PR.

---

