# ⚡ RepoRead AI — 1-Click Auto README Updater

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](#)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A sleek, lightweight Chrome Extension popup that automatically inspects any active GitHub repository, generates a rich tailored README grounded in real codebase files, and commits it directly to your GitHub repository with a single click.

---

## ✨ Features

- **🚀 1-Click Auto-Update:** Deep scans your active repo files and commits `README.md` directly via GitHub API.
- **🎯 Dynamic Repository Detection:** Automatically detects whatever repository you are viewing in Chrome (`ToDo_List`, `Mobile_Shop`, or any repo).
- **🗂️ Multi-Repo Quick Switcher:** Seamlessly switch between any open GitHub tabs with one tap.
- **🛠️ Deep Tech Stack Inspection:** Auto-detects frameworks & libraries (Express, React, Drizzle ORM, Netlify, TypeScript, Python, CSS, HTML5, etc.).
- **⚡ Compact Toolbar Popup:** Clean AdBlock-style floating popup (~320px) — no bulky split-screen editor.
- **🔄 Auto Tab Reload:** Automatically refreshes your GitHub tab so your new README appears live immediately.

---

## 📦 How to Install (Free for Anyone)

### Option A: Direct Zip Install (No Coding Needed!)

1. **Download the Extension:**
   Download [`reporead-ai-extension.zip`](./reporead-ai-extension.zip) from this repository.
2. **Unzip the file:**
   Extract / Unzip the downloaded `.zip` file on your computer.
3. **Open Chrome Extensions:**
   Open Google Chrome (or Microsoft Edge) and navigate to:
   ```text
   chrome://extensions/
   ```
4. **Enable Developer Mode:**
   Turn **ON** the **Developer mode** toggle in the top-right corner.
5. **Load the Extension:**
   Click **Load unpacked** (top-left) and select the unzipped folder.
6. **Pin to Toolbar:**
   Click the Extensions puzzle icon (🧩) in the Chrome toolbar and pin **RepoRead AI**!

---

### Option B: From Source Code

```bash
# 1. Clone this repository
git clone https://github.com/arnavarya001/RepoRead-Ai-extension.git
cd RepoRead-Ai-extension

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build

# 4. Load dist/ in chrome://extensions/ with "Load unpacked"
```

---

## 💡 How to Use

1. Navigate to any GitHub repository in your browser (e.g. `https://github.com/arnavarya001/Mobile_Shop`).
2. Click the **RepoRead AI** icon in your toolbar.
3. (First time only) Click **Connect GitHub** and paste your Personal Access Token with `repo` scope.
   - *Click "🔑 1-Click: Create token on GitHub" inside the popup to generate one with pre-filled scopes.*
4. Click **`✨ Auto-Generate & Update README`**.
5. The extension scans your codebase, generates a tailored README, commits it to GitHub, and refreshes the page live!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
