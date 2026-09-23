## Lumina — Project Archive & Status Update

Lumina was built as a React/TypeScript portfolio project exploring direct Gemini API integration.

### Why Development Was Paused

Generic Gemini chat wrappers struggle to grow because users can access Gemini directly, and competing apps offer richer ecosystems. While features like a clean UI, Markdown, and custom themes are great for learning, they are insufficient for a standalone product without a distinct niche.

### Current Implementation Status (v2.0)

All high, medium, and low roadmap items are fully implemented, verified, and passing (typecheck, lint, test, build):

* **Security:** API key moved from plaintext `localStorage` to `sessionStorage` via transformation blacklist with migration v2 and security warnings. Added `.env.example` fallback support (`VITE_GEMINI_API_KEY`).
* **API & History:** Role-aware conversation history (`user`/`model` turns + system instruction), streaming support via SSE, 401/429/500 error mapping, exponential backoff retries, client-side rate limiting, and token usage tracking.
* **UI & Features:** Model selector (Gemini 2.0/2.5 variants) with temp/top-P controls, drag-and-drop image inputs (4MB guard with MIME checks), message editing/deleting/copying, Markdown export, multi-conversation management, and 3-theme switching (dark/light/midnight).
* **Engineering & Quality:** Fully tested setup (Vitest + JSDOM), accessibility improvements (ARIA roles, focus traps), code-splitting, pre-commit hooks (Husky + lint-staged), analytics consent banner, and SEO optimization.

### Future Direction

* **Portfolio/Learning:** Complete and functional demonstration of modern frontend engineering.
* **Scaling:** If revived, pivot away from a generic chat wrapper into a specialized niche (e.g., study tools, coding workspace, or multi-provider client) rather than competing directly with native AI chat interfaces.