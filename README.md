# 🌌 Lumina AI Chat

A modern, responsive, and feature-rich **React + TypeScript** chat interface built for seamless interaction with **Google’s Gemini AI models**. Lumina AI Chat offers a clean, persistent, and markdown-supported experience with light/dark theme support, making it ideal for developers, researchers, and AI enthusiasts.

---

## ✨ Features

- **Gemini AI Integration**  
  Direct API interaction with Google’s Gemini models (default: `gemini-pro`).

- **Flexible Configuration**  
  Securely input your own API key and optionally configure custom proxy settings.

- **Theme Support**  
  Built-in light/dark mode toggle for comfortable viewing in any environment.

- **Persistent State**  
  Chat history, user preferences, and settings are automatically saved and restored using **Redux Persist** (`localStorage`).

- **Markdown Rendering**  
  Beautifully formatted AI responses powered by `react-markdown`.

- **Session Management**  
  Clear chat history or log out to switch accounts/API keys effortlessly.

- **Modern UI**  
  Clean, accessible, and custom-built components styled with **SCSS**.

---

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript  
- **Build Tool**: Vite  
- **State Management**: Redux Toolkit & Redux Persist  
- **Styling**: SCSS / CSS Modules  
- **Markdown Rendering**: `react-markdown`  
- **Code Quality**: ESLint + TypeScript  

---

## 🚀 Getting Started

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
   The app will be available at: **http://localhost:3000**

---

### 🐳 Docker Deployment

Run the application in a containerized environment:

```bash
docker compose up
```

The app will be accessible at: **http://localhost:5173**

---

## 📜 Available Scripts

| Script            | Description |
|-------------------|-------------|
| `npm start`       | Starts the Vite development server on port 3000. |
| `npm run build`   | Compiles TypeScript and builds the production-ready bundle. |
| `npm run lint`    | Runs ESLint for code quality and formatting checks. |
| `npm run preview` | Serves the production build locally for testing. |

---

## 🌍 Deployment

- **Vercel**: Optimized for seamless deployment. Connect your repository and deploy instantly.  
- **Other Platforms**: Refer to the [TSSFL Deployment Guide](https://www.tssfl.com/viewtopic.php?t=6778) for step-by-step instructions.  

---

## 🗺 Roadmap

Planned improvements and community-driven features:  
- [ ] Streamlined API key setup flow  
- [ ] Welcoming empty state or greeting message when chat log is empty  
- [ ] Support for additional Gemini models and advanced parameters (temperature, top-p, etc.)  

---

## 📄 License

This project is licensed under the **Apache 2.0 License**. See the `[Looks like the result wasn't safe to show. Let's switch things up and try something else!]` file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Check the issues page [(github.com in Bing)](https://www.bing.com/search?q="https%3A%2F%2Fgithub.com%2FIfaz2611%2FLumina-AI%2Fissues") to get started.

---

## 👤 Author

**Developed by [Ifaz](https://github.com/Ifaz2611)**  

---

✨ *Made with React, TypeScript, and Google Gemini.*  
