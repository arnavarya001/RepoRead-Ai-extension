# ⚡ RepoRead AI — 1-Click Auto README Updater

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](#)
[![Edge Compatible](https://img.shields.io/badge/Microsoft_Edge-Compatible-0078D7?logo=microsoftedge&logoColor=white)](#)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A lightweight, high-performance Chrome Extension popup (~320px) that automatically inspects any active GitHub repository, generates a comprehensive tailored README grounded in real codebase files, and commits it directly to your GitHub repository with a single click.

---

## 📖 Table of Contents

- [Features](#-features)
- [Installation Guide (Detailed)](#-installation-guide-step-by-step)
  - [Method 1: Direct ZIP Install (Recommended — No Coding Required)](#method-1-direct-zip-install-recommended--no-coding-required)
  - [Method 2: Install from Source Code (For Developers)](#method-2-install-from-source-code-for-developers)
  - [Installing on Microsoft Edge, Brave, or Arc Browser](#installing-on-microsoft-edge-brave-or-arc-browser)
- [Initial Setup (GitHub Token)](#-initial-setup-connecting-your-github-token)
- [How to Use](#-how-to-use)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## ✨ Features

- **🚀 1-Click Auto-Update:** Scans your repo and commits `README.md` directly via the GitHub API without leaving your page.
- **🎯 Dynamic Repository Detection:** Auto-detects whatever repository you are actively viewing in your browser (`Mobile_Shop`, `ToDo_List`, or any third-party repo).
- **🗂️ Multi-Repo Quick Switcher:** Seamlessly switch between open GitHub tabs with a single click.
- **🛠️ Deep Tech Stack Inspection:** Detects Express, React, Drizzle ORM, Netlify, TypeScript, Python, CSS, HTML5, Docker, etc.
- **⚡ Compact Toolbar Popup:** Clean AdBlock-style floating popup (~320px) — no bulky split-screen editor or manual copy-pasting.
- **🔄 Auto Tab Reload:** Automatically refreshes the active GitHub page upon committing so your new README appears live instantly.

---

## 📦 Installation Guide (Step-by-Step)

### Method 1: Direct ZIP Install (Recommended — No Coding Required)

This is the fastest, 100% free way to install and run the extension on any computer without installing Node.js or running terminal commands.

#### Step 1: Download the Extension ZIP
1. Go to this repository: [https://github.com/arnavarya001/RepoRead-Ai-extension](https://github.com/arnavarya001/RepoRead-Ai-extension).
2. Click on the file **[`reporead-ai-extension.zip`](https://github.com/arnavarya001/RepoRead-Ai-extension/raw/main/reporead-ai-extension.zip)** in the file list.
3. Click the **Download raw file** button (or download icon) to save it to your computer.

#### Step 2: Unzip the File
- **On Windows:** Right-click `reporead-ai-extension.zip` ➔ Click **Extract All...** ➔ Choose a folder (e.g. `Downloads` or `Documents`) ➔ Click **Extract**.
- **On macOS:** Double-click `reporead-ai-extension.zip` in Finder to extract it into a normal folder.

#### Step 3: Open Chrome Extensions Page
1. Launch **Google Chrome**.
2. In the address bar at the top, type or paste:
   ```text
   chrome://extensions/
   ```
   and press <kbd>Enter</kbd>.

#### Step 4: Turn ON Developer Mode
- In the top-right corner of the Extensions page, look for the toggle switch labeled **Developer mode**.
- Click the toggle switch so that it turns **ON** (blue).

#### Step 5: Load the Extension
1. In the top-left corner of the page, click the button labeled **"Load unpacked"**.
2. A folder picker window will open.
3. Select the folder you extracted in **Step 2** (the folder containing `manifest.json`, `index.html`, `assets/`, etc.).
4. Click **Select / Open**.

#### Step 6: Pin to Toolbar
1. Look at the top-right corner of Chrome (next to your profile icon) and click the **Extensions Puzzle Icon** (<kbd>🧩</kbd>).
2. Find **RepoRead AI — Auto README Updater** in the list.
3. Click the **Pin icon** (<kbd>📌</kbd>) next to it.
4. The RepoRead AI icon will now always be visible in your Chrome toolbar!

---

### Method 2: Install from Source Code (For Developers)

If you want to modify the source code, run a local development build, or package your own version:

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Git](https://git-scm.com/)

#### Steps:
```bash
# 1. Clone the repository
git clone https://github.com/arnavarya001/RepoRead-Ai-extension.git

# 2. Navigate to the project directory
cd RepoRead-Ai-extension

# 3. Install dependencies
npm install

# 4. Build the production extension bundle
npm run build
```

This creates the production distribution inside the `dist/` folder.

#### Load in Chrome:
1. Open `chrome://extensions/` in Google Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** (top-left).
4. Select the `dist/` folder inside your cloned `RepoRead-Ai-extension` directory.

---

### Installing on Microsoft Edge, Brave, or Arc Browser

Since Google Chrome, Microsoft Edge, Brave, and Arc all use the Chromium engine, this extension works identically across all of them:

- **Microsoft Edge:**
  1. Go to `edge://extensions/`.
  2. In the left sidebar, turn ON **Developer mode**.
  3. Turn ON **"Allow extensions from other stores"**.
  4. Click **Load unpacked** and select the extension folder.
- **Brave Browser:**
  1. Go to `brave://extensions/`.
  2. Enable **Developer mode** (top-right).
  3. Click **Load unpacked** and select the extension folder.
- **Arc Browser:**
  1. Go to `arc://extensions/`.
  2. Enable **Developer mode** and click **Load unpacked**.

---

## 🔑 Initial Setup: Connecting Your GitHub Token

To allow the extension to update your README automatically without asking you to manually copy-paste or open multiple tabs, you authorize it once with a GitHub Personal Access Token.

### 1-Click Token Creation:
1. Click the **RepoRead AI** icon in your browser toolbar.
2. Click **Connect GitHub** in the top-right corner of the popup.
3. Click the link: **`🔑 1-Click: Create token on GitHub (pre-filled)`**.
   - This opens GitHub's token generator with the required `repo` scope pre-selected.
4. Scroll to the bottom of that GitHub page and click the green **Generate token** button.
5. Copy the generated token string (starts with `ghp_...`).
6. Paste the token into the popup's input box and click **Connect**.

> [!NOTE]
> Your token is stored locally inside your browser's private extension storage (`chrome.storage.local`). It is never transmitted to any third-party servers.

---

## 💡 How to Use

1. Open any repository page on GitHub (for example: `https://github.com/arnavarya001/Mobile_Shop` or `https://github.com/arnavarya001/ToDo_List`).
2. Click the **RepoRead AI** icon in your browser toolbar.
3. The popup automatically displays:
   - Target repository name & branch
   - Tech stack detected (e.g. `Node.js`, `Express`, `Drizzle ORM`, `Netlify`, `CSS`)
   - Current README status (`README detected` or `No README yet`)
4. Click **`✨ Auto-Generate & Update README`**.
5. The extension will:
   - Step 1: Scan all files, dependencies, and configuration.
   - Step 2: Synthesize a complete, polished README tailored to that exact project.
   - Step 3: Commit the new `README.md` directly to your repository via the GitHub API.
6. The active GitHub tab automatically reloads, showing your new README live!

---

## 🛠️ Troubleshooting & FAQs

### Q: Why does clicking the extension icon do nothing or not show my repo?
- **A:** Make sure you are on a GitHub repository tab (e.g., `github.com/owner/repo`). If you are on a non-GitHub page or GitHub settings, the popup will ask you to open a repository or choose from your open tabs.

### Q: What if I have multiple GitHub repositories open in different tabs?
- **A:** The popup includes a built-in **"Switch open repo"** bar showing all your active GitHub tabs. You can switch between repositories (e.g. `Mobile_Shop` and `ToDo_List`) with one click!

### Q: "Failed to commit README on GitHub (404 / 401)"
- **A:** Ensure your GitHub Personal Access Token has the **`repo`** scope checked (Full control of private repositories & commit access). If expired, generate a new token via the in-app link.

### Q: How do I update the extension if there are new changes?
- **A:** 
  1. Download the latest `reporead-ai-extension.zip` or run `git pull && npm run package`.
  2. Go to `chrome://extensions/`.
  3. Click the **↻ (Reload)** button on the RepoRead AI card.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
