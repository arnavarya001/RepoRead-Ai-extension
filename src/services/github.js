// GitHub API and Raw Content Client

export async function verifyGitHubToken(token) {
  if (!token || !token.trim()) return null;
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${token.trim()}`
      }
    });
    if (res.ok) {
      const user = await res.json();
      return { login: user.login, avatar_url: user.avatar_url, name: user.name };
    }
  } catch (err) {
    console.warn("Token verification failed:", err);
  }
  return null;
}

export async function fetchRepoMetadata(owner, repo, token = "") {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `token ${token.trim()}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`GitHub API returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch repo metadata from API, using fallback info:", err);
    return {
      name: repo,
      full_name: `${owner}/${repo}`,
      default_branch: "main",
      html_url: `https://github.com/${owner}/${repo}`,
      description: null,
      homepage: null,
      language: null,
      stargazers_count: 0
    };
  }
}

export async function fetchRepoContents(owner, repo, branch = "", token = "") {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `token ${token.trim()}`;

  // 1. Try default contents without ?ref (GitHub uses repository's default branch)
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn("Could not list repo contents via API root:", err);
  }

  // 2. Try with specified branch or fallback branches
  const branchesToTry = [branch, "main", "master", "HEAD"].filter(Boolean);
  for (const b of Array.from(new Set(branchesToTry))) {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${b}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (_) {}
  }
  return [];
}

export async function fetchRawFile(owner, repo, branch = "main", path = "README.md") {
  const branches = [branch, "main", "master", "HEAD"];
  for (const b of Array.from(new Set(branches.filter(Boolean)))) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${b}/${path}`);
      if (res.ok) {
        const text = await res.text();
        return { content: text, branch: b };
      }
    } catch (_) {}
  }
  return null;
}

export async function inspectRepository(owner, repo, token = "") {
  const metadata = await fetchRepoMetadata(owner, repo, token);
  const defaultBranch = metadata?.default_branch || "main";
  const contents = await fetchRepoContents(owner, repo, defaultBranch, token);

  const fileNames = Array.isArray(contents) ? contents.map(item => item.name) : [];
  const isDir = name => contents.some(item => item.name === name && item.type === "dir");

  // Fetch package.json if present
  let packageJson = null;
  if (fileNames.includes("package.json") || fileNames.length === 0) {
    const rawPkg = await fetchRawFile(owner, repo, defaultBranch, "package.json");
    if (rawPkg) {
      try {
        packageJson = JSON.parse(rawPkg.content);
      } catch (_) {}
    }
  }

  // Check if README exists (try README.md, readme.md, README)
  let existingReadme = await fetchRawFile(owner, repo, defaultBranch, "README.md");
  if (!existingReadme) {
    existingReadme = await fetchRawFile(owner, repo, defaultBranch, "readme.md");
  }

  // Detect tech stack across languages and frameworks
  const techStack = [];
  const deps = { ...(packageJson?.dependencies || {}), ...(packageJson?.devDependencies || {}) };

  // JavaScript / TypeScript / Node ecosystem
  if (packageJson) techStack.push("Node.js");
  if (deps["react"] || fileNames.some(f => f.includes("vite.config") || f.includes("next.config"))) {
    techStack.push("React");
  }
  if (deps["next"]) techStack.push("Next.js");
  if (deps["vue"]) techStack.push("Vue.js");
  if (deps["express"] || fileNames.includes("app.js") || fileNames.includes("server.js")) {
    techStack.push("Express");
  }
  if (deps["drizzle-orm"] || fileNames.includes("drizzle.config.ts")) techStack.push("Drizzle ORM");
  if (deps["prisma"]) techStack.push("Prisma");
  if (deps["tailwindcss"]) techStack.push("Tailwind CSS");
  if (deps["typescript"] || fileNames.includes("tsconfig.json")) techStack.push("TypeScript");
  if (deps["ejs"] || isDir("views")) techStack.push("EJS");
  if (deps["@netlify/functions"] || fileNames.includes("netlify.toml") || isDir("netlify")) techStack.push("Netlify");
  if (fileNames.includes("vercel.json")) techStack.push("Vercel");

  // Other languages
  if (fileNames.includes("requirements.txt") || fileNames.includes("pyproject.toml") || fileNames.some(f => f.endsWith(".py"))) {
    techStack.push("Python");
  }
  if (fileNames.includes("Cargo.toml") || fileNames.some(f => f.endsWith(".rs"))) {
    techStack.push("Rust");
  }
  if (fileNames.includes("go.mod") || fileNames.some(f => f.endsWith(".go"))) {
    techStack.push("Go");
  }
  if (fileNames.includes("pom.xml") || fileNames.includes("build.gradle")) {
    techStack.push("Java");
  }
  if (fileNames.some(f => f.endsWith(".cpp") || f.endsWith(".c") || f.endsWith(".h"))) {
    techStack.push("C++");
  }
  if (fileNames.includes("index.html") || fileNames.some(f => f.endsWith(".html"))) {
    if (!techStack.includes("React") && !techStack.includes("Next.js")) {
      techStack.push("HTML5");
    }
  }
  if (fileNames.some(f => f.endsWith(".css")) || isDir("css") || isDir("styles")) {
    techStack.push("CSS");
  }
  if (fileNames.includes("Dockerfile") || fileNames.includes("docker-compose.yml")) {
    techStack.push("Docker");
  }

  if (metadata?.language && !techStack.includes(metadata.language)) {
    techStack.push(metadata.language);
  }

  return {
    owner,
    repo,
    branch: defaultBranch,
    metadata,
    contents,
    fileNames,
    packageJson,
    hasReadme: !!existingReadme,
    existingReadmeContent: existingReadme ? existingReadme.content : null,
    techStack: Array.from(new Set(techStack))
  };
}

export async function commitReadmeToGitHub(owner, repo, branch, content, message, token) {
  if (!token || !token.trim()) {
    throw new Error("GitHub Personal Access Token is required for 1-click automatic updates.");
  }
  const cleanToken = token.trim();
  const headers = {
    Accept: "application/vnd.github.v3+json",
    Authorization: `token ${cleanToken}`,
    "Content-Type": "application/json"
  };

  // Determine actual target branch
  let targetBranch = branch || "main";
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (repoRes.ok) {
      const rdata = await repoRes.json();
      if (rdata.default_branch) {
        targetBranch = rdata.default_branch;
      }
    }
  } catch (_) {}

  // Get current file sha if README.md exists
  let sha = undefined;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md?ref=${targetBranch}`, { headers });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (_) {}

  // Commit via PUT
  const body = {
    message: message || "docs: auto-generate and update README.md via RepoRead AI",
    content: btoa(unescape(encodeURIComponent(content))),
    branch: targetBranch
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    if (putRes.status === 401) {
      throw new Error("GitHub token is invalid or expired. Please enter a valid token.");
    }
    if (putRes.status === 404) {
      throw new Error("Repository not found or token lacks 'repo' permission. Make sure your token has the 'repo' scope checked.");
    }
    throw new Error(errData.message || `GitHub commit failed (${putRes.status})`);
  }
  return await putRes.json();
}
