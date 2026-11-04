// README Generator & AI Assistant Service

function titleCase(str = "") {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export function generateReadmeFromRepo(repoData) {
  const { owner, repo, branch = "main", metadata, fileNames = [], packageJson, techStack = [] } = repoData;
  const repoTitle = titleCase(repo);
  const pkgTitle = packageJson?.name ? titleCase(packageJson.name) : "";
  const isGeneric = !pkgTitle || /^(lect|app|test|project|src|dist|my-app|untitled)/i.test(packageJson?.name || "");
  const pkgName = isGeneric ? repoTitle : pkgTitle;
  const pkgDesc = packageJson?.description || metadata?.description || `A modern ${techStack.slice(0, 3).join(", ") || "software"} project developed under ${owner}/${repo}.`;
  const homepage = (metadata?.homepage || "").trim();

  // Tech stack badges
  const badgeMap = {
    "React": "https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black",
    "Node.js": "https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white",
    "Express": "https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white",
    "TypeScript": "https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white",
    "EJS": "https://img.shields.io/badge/EJS-Templates-B4CA65?logo=javascript&logoColor=black",
    "Drizzle ORM": "https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=sqlite&logoColor=black",
    "Netlify": "https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify&logoColor=white",
    "Tailwind CSS": "https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white",
    "Next.js": "https://img.shields.io/badge/Next.js-14+-000000?logo=nextdotjs&logoColor=white",
    "Vue.js": "https://img.shields.io/badge/Vue.js-4FC08D?logo=vuedotjs&logoColor=white",
    "Python": "https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white",
    "Rust": "https://img.shields.io/badge/Rust-orange?logo=rust&logoColor=white",
    "Go": "https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white",
    "CSS": "https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white",
    "HTML5": "https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white",
    "Docker": "https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white"
  };

  const badges = techStack
    .filter(t => badgeMap[t])
    .map(t => `[![${t}](${badgeMap[t]})](#)`);

  badges.push(`[![GitHub stars](https://img.shields.io/github/stars/${owner}/${repo}?style=flat&color=yellow)](https://github.com/${owner}/${repo}/stargazers)`);
  badges.push(`[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)`);

  // Build directory structure tree
  const treeItems = [];
  const importantDirs = ["db", "netlify", "views", "public", "src", "client", "server", "routes", "controllers", "models", "components", "css", "js", "assets"];
  const importantFiles = ["app.js", "server.js", "index.js", "main.py", "main.go", "drizzle.config.ts", "netlify.toml", "package.json", "tsconfig.json", "vite.config.js", "requirements.txt", "Cargo.toml"];

  for (const dir of importantDirs) {
    if (fileNames.includes(dir)) {
      let desc = "Application directory";
      if (dir === "db") desc = "Database schema & ORM migrations";
      else if (dir === "netlify") desc = "Serverless functions & edge configuration";
      else if (dir === "views") desc = "EJS view templates & layouts";
      else if (dir === "public") desc = "Static assets, images, and client scripts";
      else if (dir === "src") desc = "Application source code";
      else if (dir === "routes") desc = "API route controllers";
      else if (dir === "css" || dir === "styles") desc = "Stylesheets and presentation rules";
      else if (dir === "js") desc = "Client-side interactivity scripts";
      treeItems.push(`├── ${dir}/                  # ${desc}`);
    }
  }

  for (const f of importantFiles) {
    if (fileNames.includes(f)) {
      let desc = "Configuration file";
      if (f === "app.js") desc = "Main application entry point";
      if (f === "server.js") desc = "Server initialization script";
      if (f === "index.js") desc = "Application entry script";
      if (f === "main.py") desc = "Python entry script";
      if (f === "drizzle.config.ts") desc = "Drizzle ORM schema configuration";
      if (f === "netlify.toml") desc = "Netlify deployment & build settings";
      if (f === "package.json") desc = "Dependencies, metadata, and run scripts";
      if (f === "tsconfig.json") desc = "TypeScript compiler options";
      if (f === "requirements.txt") desc = "Python package requirements";
      if (f === "Cargo.toml") desc = "Rust crate manifests and dependencies";
      treeItems.push(`├── ${f.padEnd(20)} # ${desc}`);
    }
  }

  const structureBlock = treeItems.length > 0 ? `\`\`\`text
${repo}/
${treeItems.join("\n")}
└── README.md            # Project documentation
\`\`\`` : `\`\`\`text
${repo}/
├── src/                 # Application source
├── package.json         # Project configuration
└── README.md            # Documentation
\`\`\``;

  // Key Features
  const features = [];
  if (techStack.includes("Express") || fileNames.includes("app.js") || fileNames.includes("server.js")) {
    features.push("- **Robust Server Architecture:** Powered by Express.js for fast, resilient request routing and middleware integration.");
  }
  if (techStack.includes("Drizzle ORM") || fileNames.includes("drizzle.config.ts")) {
    features.push("- **Type-Safe Database Access:** Backed by Drizzle ORM for schema-first, fully typed database queries and streamlined migrations.");
  }
  if (techStack.includes("EJS") || fileNames.includes("views")) {
    features.push("- **Dynamic Server-Side Rendering:** Clean EJS templates for responsive page rendering and fast first-contentful paint.");
  }
  if (techStack.includes("Netlify") || fileNames.includes("netlify.toml")) {
    features.push("- **Cloud Deployment Ready:** Pre-configured for Netlify with serverless functions and instant automated deployments.");
  }
  if (techStack.includes("TypeScript") || fileNames.includes("tsconfig.json")) {
    features.push("- **Type Safety:** Full TypeScript support ensuring strict type checking and predictable code execution.");
  }
  if (techStack.includes("Python") || fileNames.includes("requirements.txt")) {
    features.push("- **Python Ecosystem:** Modular Python backend engineered for clean code organization and reliable execution.");
  }
  if (techStack.includes("CSS") || fileNames.includes("public")) {
    features.push("- **Responsive UI & Modern Styling:** Polished frontend presentation optimized across mobile, tablet, and desktop viewports.");
  }
  if (features.length < 3) {
    features.push("- **Clean Codebase Structure:** Modular design organized for maintainability, easy feature extension, and collaborative development.");
    features.push("- **Seamless Developer Experience:** Straightforward setup and scripts for local development, testing, and production builds.");
  }

  // Scripts table from package.json
  const scripts = packageJson?.scripts || {};
  const scriptRows = Object.entries(scripts).map(([cmd, script]) => {
    let purpose = "Runs command";
    if (cmd === "start") purpose = "Start production server";
    else if (cmd === "dev") purpose = "Start local development server with hot-reload";
    else if (cmd === "build") purpose = "Compile and bundle production assets";
    else if (cmd === "test") purpose = "Execute project test suites";
    return `| \`npm run ${cmd}\` | \`${script}\` | ${purpose} |`;
  });

  const scriptsTable = scriptRows.length > 0 ? `
### Available Scripts

| Command | Script | Purpose |
| :--- | :--- | :--- |
${scriptRows.join("\n")}
` : "";

  // Tech stack table
  const techRows = [];
  if (techStack.includes("React")) techRows.push("| Frontend | React | User Interface |");
  else if (techStack.includes("EJS")) techRows.push("| Frontend | EJS / HTML5 / CSS | Server-rendered UI Templates |");
  else if (techStack.includes("HTML5") || techStack.includes("CSS")) techRows.push("| Frontend | HTML5 / CSS3 / JavaScript | Client Presentation |");

  if (techStack.includes("Express")) techRows.push("| Backend | Node.js & Express.js | Application Server & API Routing |");
  else if (techStack.includes("Python")) techRows.push("| Backend | Python | Application Runtime & Logic |");
  else if (techStack.includes("Node.js")) techRows.push("| Runtime | Node.js | JavaScript Runtime |");

  if (techStack.includes("Drizzle ORM")) techRows.push("| Database | Drizzle ORM | Type-safe ORM & Database Layer |");
  else if (techStack.includes("Prisma")) techRows.push("| Database | Prisma | Next-generation ORM |");

  if (techStack.includes("Netlify")) techRows.push("| Hosting & CI/CD | Netlify | Edge Network & Automated Deployments |");
  else if (techStack.includes("Vercel")) techRows.push("| Hosting | Vercel | Cloud Platform |");

  if (techStack.includes("TypeScript")) techRows.push("| Language | TypeScript | Static Type Safety |");

  // Prerequisites & run instructions
  const isPython = techStack.includes("Python");
  const isNode = techStack.includes("Node.js") || packageJson;
  const runCommand = scripts["start"] ? "npm start" : scripts["dev"] ? "npm run dev" : fileNames.includes("app.js") ? "node app.js" : "npm start";

  const installInstructions = isNode ? `
1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/${owner}/${repo}.git
   cd ${repo}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the application:**
   \`\`\`bash
   ${runCommand}
   \`\`\`
` : isPython ? `
1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/${owner}/${repo}.git
   cd ${repo}
   \`\`\`

2. **Install requirements:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Run the script:**
   \`\`\`bash
   python main.py
   \`\`\`
` : `
1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/${owner}/${repo}.git
   cd ${repo}
   \`\`\`

2. **Open the project:**
   Open \`index.html\` directly in your browser or run a local web server:
   \`\`\`bash
   npx serve .
   \`\`\`
`;

  return `# 🚀 ${pkgName}

> ${pkgDesc}

${badges.join(" ")}

${homepage ? `🔗 **Live Application:** [${homepage}](${homepage})` : ""}

---

## 📖 Overview

**${pkgName}** is designed to provide a streamlined, high-performance solution for ${pkgDesc.toLowerCase().replace(/^\w/, c => c.toLowerCase())}. Grounded in a modern stack (${techStack.join(", ")}), the architecture prioritizes performance, clarity, and rapid deployment.

## ✨ Features

${features.join("\n")}

${techRows.length > 0 ? `## 🧰 Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
${techRows.join("\n")}
` : ""}
## 🗂️ Project Structure

${structureBlock}

## 📦 Getting Started

### Installation & Run

${installInstructions}
${scriptsTable}
${fileNames.includes("netlify.toml") ? `## 🌐 Deployment

This project includes configuration for automated deployment on **Netlify**:
1. Connect your repository in the Netlify Dashboard.
2. Build command: \`${scripts["build"] || "npm run build"}\`
3. Output directory: configured via \`netlify.toml\`
` : ""}
## 🤝 Contributing

Contributions are welcomed! Feel free to submit pull requests or open issues to improve features, performance, or documentation.

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'feat: Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.
`;
}
