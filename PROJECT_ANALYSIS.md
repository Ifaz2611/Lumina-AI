# Lumina AI Chat Project Analysis

## Project Overview
This is a React/TypeScript chat UI for Google's Gemini AI model, named `google-gemini-ui`. The application allows users to interact with the Gemini model by providing an API key and optional proxy settings. It features a chat interface with message history persisted via Redux Persist, theme toggling (light/dark), and model selection.

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with Redux Persist
- **Styling**: CSS/SCSS (using Sass)
- **UI Components**: Custom components (Button, LoadingLine, ThemeToggle, etc.)
- **Markdown Rendering**: react-markdown
- **API Integration**: Direct fetch to Google Gemini API
- **Development Tools**: ESLint, TypeScript

## Folder Structure
```
AI-CHAT-IFAZ/
├── .dockerignore
├── .eslintrc.cjs
├── .gitignore
├── Caddyfile
├── docker-compose.yaml
├── Dockerfile
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── PROJECT_ANALYSIS.md
├── tsconfig.json
├── vite-env.d.ts
└── src/
    ├── App.css
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── Button/
    │   │   ├── Button.scss
    │   │   ├── Button.tsx
    │   │   └── index.ts
    │   ├── LoadingLine/
    │   │   ├── LoadingLine.scss
    │   │   ├── LoadingLine.tsx
    │   │   └── index.ts
    │   ├── Logout/
    │   │   └── Logout.tsx
    │   └── ThemeToggle/
    │       ├── ThemeToggle.scss
    │       ├── ThemeToggle.tsx
    │       ├── hooks.ts
    │       └── index.ts
    ├── pages/
    │   ├── Chat/
    │   │   ├── Chat.scss
    │   │   ├── Chat.tsx
    │   │   ├── Header/
    │   │   │   ├── Header.scss
    │   │   │   ├── Header.tsx
    │   │   │   └── index.ts
    │   │   ├── PromptGenerator.tsx
    │   │   └── hooks.ts
    │   └── Welcome/
    │       ├── Setup/
    │       │   ├── ProxySetup.tsx
    │       │   ├── Setup.scss
    │       │   ├── Setup.tsx
    │       │   ├── hooks.ts
    │       │   └── index.ts
    │       ├── Welcome.scss
    │       └── Welcome.tsx
    ├── store/
    │   ├── index.ts
    │   └── user/
    │       ├── dispatchers.user.ts
    │       └── userSlice.tsx
    ├── types/
    │   └── responses.ts
    └── vite-env.d.ts
```

## Key Files Description

### `src/App.tsx`
- Root component that checks for API key in Redux state.
- Renders `Welcome` page if no API key, otherwise renders `Chat` page.
- Applies theme class (light/dark) to the main wrapper.

### `src/store/index.ts`
- Configures Redux Toolkit store with Redux Persist.
- Combines reducers (currently only `user` slice).
- Configures middleware to ignore serializableCheck for persist actions.
- Exports store, persistor, RootState, AppDispatch, and typed `useSelector`.

### `src/store/user/userSlice.tsx`
- Manages user state: name, API_KEY, conversation, selectedModel, proxy, theme.
- Reducers for setting/clearing user, clearing chat, setting theme, and selected model.
- Extra reducers for handling the async thunk `generateTextContent` (from dispatchers.user):
  - `pending`: sets loading flag, adds outbound message to conversation.
  - `fulfilled`: stops loading, adds inbound message (model response) to conversation.
  - `rejected`: stops loading, sets error message.

### `src/store/user/dispatchers.user.ts` (not read but referenced)
- Contains the `generateTextContent` async thunk that calls the Gemini API.

### `src/types/responses.ts` (not read but referenced)
- Defines `UserState` TypeScript interface used in the user slice.

### `src/pages/Welcome/Setup/Setup.tsx`
- Landing page where users enter their API key, optional proxy, and select a model.
- On submit, dispatches `setUser` action to store the credentials.

### `src/pages/Chat/Chat.tsx`
- Main chat interface.
- Displays chat messages using `react-markdown` for model responses.
- Includes `PromptGenerator` for user input and `Header` for controls.

### `src/pages/Chat/Header/Header.tsx`
- Header with theme toggle, logout, and clear chat buttons.

### `src/components/ThemeToggle/`
- Component to switch between light and dark themes.

### `src/pages/Chat/PromptGenerator.tsx`
- Input field for user to send messages; handles enter key and send button.

## How to Run

### Locally
1. Install dependencies: `npm i`
2. Start development server: `npm start` (runs on port 3000 by default)
3. Build for production: `npm run build`
4. Preview production build: `npm preview`

### Using Docker
```sh
docker compose up   # Then visit http://localhost:5173
```

### Deployment
- Ready for Vercel deployment (see README for details).
- For other platforms, refer to the step-by-step guide by [@TSSFL](https://www.tssfl.com/viewtopic.php?t=6778).

## Features
- API Key and proxy setup via Welcome screen.
- Dark/Light theme toggle.
- Persistent chat history (via Redux Persist in localStorage).
- Markdown rendering of model responses.
- Ability to clear chat and log out.
- Model selection (default: gemini-pro).

## Known Issues / Features Requested
- **Features Requested** (from README):
  - Easier way to setup API Key.
  - Greeting or empty state when chatlog is empty.
- **Known Issues**: None reported.

## Development Scripts (package.json)
- `start`: `vite --port 3000`
- `build`: `tsc && vite build`
- `lint`: `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`
- `preview`: `vite preview`

## Notes
- The project uses Vite as a bundler with React TypeScript template.
- Styling is done with SCSS modules (e.g., Button.scss, Chat.scss).
- Redux toolkit is used for state management with persistence.
- The application interacts directly with the Gemini API (no backend proxy needed unless using custom proxy)