# Lumina AI Chat

A modern, responsive, and feature-rich React/TypeScript chat UI designed for interacting with Google's Gemini AI model. Lumina AI Chat provides a seamless interface for users to input their API keys, manage conversations, and enjoy a persistent, markdown-supported chat experience with built-in light/dark theme support.

## Features

- **Gemini AI Integration**: Direct API interaction with Google's Gemini models (default: `gemini-pro`).
- **Flexible Configuration**: Securely input your own API key and configure optional custom proxy settings.
- **Theme Support**: Built-in light and dark mode toggle for comfortable viewing in any environment.
- **Persistent State**: Chat history, user preferences, and settings are automatically saved and restored using Redux Persist (localStorage).
- **Markdown Rendering**: Beautifully formatted AI responses powered by `react-markdown`.
- **Session Management**: Easily clear chat history or log out to switch accounts/API keys.
- **Modern UI**: Clean, accessible, and custom-built components styled with SCSS.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit & Redux Persist
- **Styling**: SCSS / CSS Modules
- **Markdown**: `react-markdown`
- **Code Quality**: ESLint, TypeScript

## Project Structure

```text
AI-CHAT-IFAZ/
├── .dockerignore
├── .eslintrc.cjs
├── .gitignore
├── Caddyfile
├── docker-compose.yaml
├── Dockerfile
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite-env.d.ts
└── src/
    ├── App.tsx                 # Root component & conditional routing logic
    ├── main.tsx                # Application entry point
    ├── components/             # Reusable UI components (Button, LoadingLine, ThemeToggle, etc.)
    ├── pages/
    │   ├── Chat/               # Main chat interface, header, and prompt input
    │   └── Welcome/            # Initial setup screen for API key, proxy, and model selection
    ├── store/                  # Redux Toolkit store and user slice (state & async thunks)
    └── types/                  # TypeScript interfaces and type definitions
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm, yarn, or pnpm
- Docker & Docker Compose *(optional, for containerized deployment)*

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ifaz2611/Lumina-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

### Docker Deployment

To run the application in a containerized environment, ensure Docker and Docker Compose are installed, then run:

```bash
docker compose up
```
The application will be accessible at `http://localhost:5173`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Starts the Vite development server on port 3000. |
| `npm run build` | Compiles TypeScript and builds the production-ready bundle. |
| `npm run lint` | Runs ESLint to check for code quality, types, and formatting issues. |
| `npm run preview` | Serves the production build locally for pre-deployment testing. |

## Deployment

- **Vercel**: This project is optimized and ready for seamless deployment on Vercel. Simply connect your repository to Vercel and deploy.
- **Other Platforms**: For step-by-step deployment guides on alternative hosting platforms, refer to the [TSSFL Deployment Guide](https://www.tssfl.com/viewtopic.php?t=6778).

## Roadmap & Feature Requests

We are continuously improving Lumina AI Chat. Upcoming features and community requests include:
- [ ] A more streamlined, user-friendly API key setup flow.
- [ ] A welcoming empty state or greeting message when the chat log is empty.
- [ ] Support for additional Gemini models and advanced model parameters (e.g., temperature, top-p).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/lumina-ai-chat/issues) if you want to contribute.

---

*Made with using React, TypeScript, and Google Gemini.*
```
