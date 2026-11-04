import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Github, Sparkles, Check, CheckCircle2, AlertTriangle, ExternalLink,
  RefreshCw, Key, GitBranch, Copy, ChevronDown, ChevronUp, FolderCode,
  ShieldCheck, LogOut, ArrowRight, Layers
} from "lucide-react";

import { inspectRepository, commitReadmeToGitHub, verifyGitHubToken } from "./services/github";
import { generateReadmeFromRepo } from "./services/generator";
import { storage } from "./services/storage";

// Safe tab opener for Chrome extension popups (standard <a target="_blank"> fails inside extension popups)
export const openUrl = (url) => {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank");
  }
};

// Extracts { owner, repo } from ANY GitHub URL:
// - https://github.com/owner/repo
// - https://github.com/owner/repo/
// - https://github.com/owner/repo/blob/main/path/to/file.js
// - https://github.com/owner/repo/tree/main/src
// - https://github.com/owner/repo/pull/1
export function extractGitHubRepo(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.toLowerCase().endsWith("github.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/, "");
      const systemKeywords = [
        "settings", "notifications", "explore", "trending", "marketplace",
        "issues", "pulls", "organizations", "login", "signup", "features",
        "pricing", "security", "contact", "about", "site", "topics", "collections"
      ];
      if (!systemKeywords.includes(owner.toLowerCase()) && !systemKeywords.includes(repo.toLowerCase())) {
        return { owner, repo };
      }
    }
  } catch (_) {}
  return null;
}

export default function App() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Dynamic repository state
  const [repoInfo, setRepoInfo] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [openGhTabs, setOpenGhTabs] = useState([]);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // UI status: "idle" | "inspecting" | "generating" | "committing" | "need_token" | "success" | "error"
  const [status, setStatus] = useState("inspecting");
  const [statusMessage, setStatusMessage] = useState("Detecting active repository…");
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedMarkdown, setGeneratedMarkdown] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeTabIdRef = useRef(null);

  // 1. Load saved GitHub token on startup
  useEffect(() => {
    async function initAuth() {
      const savedToken = await storage.get("reporead-github-token", "");
      if (savedToken && typeof savedToken === "string") {
        setToken(savedToken);
        const user = await verifyGitHubToken(savedToken);
        if (user) setUserInfo(user);
      }
    }
    initAuth();
  }, []);

  // 2. Load and inspect whichever repo was detected
  const loadRepo = useCallback(async (owner, repo, activeTabId = null) => {
    if (!owner || !repo) {
      setRepoInfo(null);
      setRepoData(null);
      setStatus("idle");
      return;
    }

    if (activeTabId) activeTabIdRef.current = activeTabId;

    setStatus("inspecting");
    setStatusMessage(`Scanning ${owner}/${repo}…`);
    try {
      const data = await inspectRepository(owner, repo, token);
      setRepoData(data);
      setRepoInfo({
        owner: data.owner,
        repo: data.repo,
        branch: data.branch,
        detected: true
      });
      setStatus("idle");
    } catch (err) {
      console.warn("Repo scan fallback:", err);
      setRepoData(null);
      setRepoInfo({ owner, repo, branch: "main", detected: true });
      setStatus("idle");
    }
  }, [token]);

  // 3. Robust detection of the currently active tab & any other open GitHub tabs
  const detectActiveRepo = useCallback(async () => {
    setStatus("inspecting");
    setStatusMessage("Detecting active repository…");

    if (typeof chrome === "undefined" || !chrome.tabs?.query) {
      // Browser preview fallback
      loadRepo("arnavarya001", "ToDo_List");
      return;
    }

    // Step 1: Query all open GitHub tabs to provide instant multi-repo switching
    chrome.tabs.query({ url: "*://github.com/*" }, (allGh) => {
      const tabList = (allGh || [])
        .map(t => {
          const r = extractGitHubRepo(t.url);
          return r ? { ...r, tabId: t.id, title: t.title, active: t.active } : null;
        })
        .filter(Boolean);

      // Deduplicate by owner/repo
      const unique = [];
      const seen = new Set();
      for (const item of tabList) {
        const key = `${item.owner}/${item.repo}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }
      setOpenGhTabs(unique);
    });

    // Step 2: Query active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs?.[0];
      const detected = extractGitHubRepo(activeTab?.url);

      if (detected) {
        loadRepo(detected.owner, detected.repo, activeTab.id);
        return;
      }

      // Step 3: Query active tab in lastFocusedWindow (if popup opened in another window)
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs2) => {
        const activeTab2 = tabs2?.[0];
        const detected2 = extractGitHubRepo(activeTab2?.url);

        if (detected2) {
          loadRepo(detected2.owner, detected2.repo, activeTab2.id);
          return;
        }

        // Step 4: Check if any normal browser window tab is active on GitHub
        chrome.tabs.query({ active: true, windowType: "normal" }, (normalTabs) => {
          const ghTab = (normalTabs || []).find(t => extractGitHubRepo(t.url));
          if (ghTab) {
            const detected3 = extractGitHubRepo(ghTab.url);
            loadRepo(detected3.owner, detected3.repo, ghTab.id);
            return;
          }

          // Not on a GitHub repo tab right now
          setRepoInfo(null);
          setRepoData(null);
          setStatus("idle");
        });
      });
    });
  }, [loadRepo]);

  // Initial detection + listen for tab switches or URL navigations!
  useEffect(() => {
    detectActiveRepo();

    if (typeof chrome !== "undefined" && chrome.tabs) {
      const onTabActivated = () => detectActiveRepo();
      const onTabUpdated = (tabId, changeInfo) => {
        if (changeInfo.url || changeInfo.status === "complete") {
          detectActiveRepo();
        }
      };

      chrome.tabs.onActivated?.addListener(onTabActivated);
      chrome.tabs.onUpdated?.addListener(onTabUpdated);

      return () => {
        chrome.tabs.onActivated?.removeListener(onTabActivated);
        chrome.tabs.onUpdated?.removeListener(onTabUpdated);
      };
    }
  }, [detectActiveRepo]);

  // Connect GitHub Token
  const handleSaveToken = async (overrideToken = "") => {
    const raw = overrideToken || tokenInput;
    if (!raw.trim()) return;
    const clean = raw.trim();
    setStatus("inspecting");
    setStatusMessage("Verifying GitHub token…");

    const user = await verifyGitHubToken(clean);
    if (!user) {
      setStatus("idle");
      setErrorMessage("Token could not be verified. Ensure it has the 'repo' scope checked.");
      return;
    }

    setToken(clean);
    setUserInfo(user);
    await storage.set("reporead-github-token", clean);
    setShowTokenInput(false);
    setTokenInput("");
    setErrorMessage("");

    // If a generated README is waiting, commit it immediately!
    if (generatedMarkdown && repoInfo?.owner && repoInfo?.repo) {
      commitToGitHub(clean, generatedMarkdown);
    } else {
      setStatus("idle");
      if (repoInfo?.owner && repoInfo?.repo) {
        loadRepo(repoInfo.owner, repoInfo.repo);
      }
    }
  };

  const handleDisconnect = async () => {
    setToken("");
    setUserInfo(null);
    await storage.remove("reporead-github-token");
    setShowTokenInput(false);
    setStatus("idle");
  };

  // ONE-CLICK AUTO UPDATE ACTION
  const handleAutoUpdate = async () => {
    if (!repoInfo?.owner || !repoInfo?.repo) {
      setErrorMessage("Please open a GitHub repository tab or choose one below.");
      return;
    }

    setErrorMessage("");

    try {
      // Step 1: Scan repository
      setStatus("inspecting");
      setStatusMessage(`Scanning ${repoInfo.owner}/${repoInfo.repo}…`);

      let currentRepoData = repoData;
      if (!currentRepoData || currentRepoData.repo !== repoInfo.repo) {
        currentRepoData = await inspectRepository(repoInfo.owner, repoInfo.repo, token);
        setRepoData(currentRepoData);
      }

      // Step 2: Synthesize tailored README
      setStatus("generating");
      setStatusMessage(`Generating tailored README for ${currentRepoData.repo}…`);

      const markdown = generateReadmeFromRepo(currentRepoData);
      setGeneratedMarkdown(markdown);

      // Step 3: If token exists, commit directly!
      if (token) {
        await commitToGitHub(token, markdown);
      } else {
        // If no token yet, show the token input & web copy option
        setStatus("need_token");
      }
    } catch (err) {
      console.error("Auto update failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "An error occurred during README generation.");
    }
  };

  const commitToGitHub = async (activeToken, markdownToCommit) => {
    setStatus("committing");
    setStatusMessage(`Committing README.md to ${repoInfo.owner}/${repoInfo.repo}…`);

    try {
      const commitMsg = repoData?.hasReadme
        ? "docs: update README.md via RepoRead AI"
        : "docs: create README.md via RepoRead AI";

      await commitReadmeToGitHub(
        repoInfo.owner,
        repoInfo.repo,
        repoInfo.branch,
        markdownToCommit,
        commitMsg,
        activeToken
      );

      setStatus("success");

      // Auto-reload the active GitHub tab so the user sees their new README live!
      if (typeof chrome !== "undefined" && chrome.tabs) {
        if (activeTabIdRef.current) {
          chrome.tabs.reload(activeTabIdRef.current);
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs?.[0]?.id) chrome.tabs.reload(tabs[0].id);
          });
        }
      }
    } catch (err) {
      console.error("GitHub commit failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to commit README on GitHub.");
    }
  };

  // Copy to clipboard & open GitHub web editor
  const handleCopyAndOpenWeb = async () => {
    if (generatedMarkdown) {
      await navigator.clipboard.writeText(generatedMarkdown);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    const targetUrl = repoData?.hasReadme
      ? `https://github.com/${repoInfo.owner}/${repoInfo.repo}/edit/${repoInfo.branch}/README.md`
      : `https://github.com/${repoInfo.owner}/${repoInfo.repo}/new/${repoInfo.branch}?filename=README.md`;

    openUrl(targetUrl);
  };

  const openRepoInBrowser = () => {
    if (repoInfo?.owner && repoInfo?.repo) {
      openUrl(`https://github.com/${repoInfo.owner}/${repoInfo.repo}`);
    }
  };

  const openTokenSettings = () => {
    openUrl("https://github.com/settings/tokens/new?scopes=repo&description=RepoRead%20AI%20Auto%20Updater");
  };

  return (
    <div className="popup-container">
      {/* 1. Header (AdBlock style) */}
      <header className="popup-header">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={13}/></div>
          <span>repo<span className="brand-accent">read</span><sup>AI</sup></span>
        </div>

        {userInfo ? (
          <div
            className="auth-badge connected"
            title={`Connected as @${userInfo.login} — Click to disconnect`}
            onClick={handleDisconnect}
          >
            <span className="status-dot"/>
            <span>@{userInfo.login}</span>
            <LogOut size={10} style={{ marginLeft: 2, opacity: 0.7 }}/>
          </div>
        ) : (
          <div
            className="auth-badge"
            title="Click to connect GitHub account for 1-click commits"
            onClick={() => setShowTokenInput(!showTokenInput)}
          >
            <span className="status-dot off"/>
            <span>Connect GitHub</span>
          </div>
        )}
      </header>

      {/* 2. Top notification banner (AdBlock VPN style banner) */}
      <div className="banner-compact">
        <div className="banner-left">
          <span className="banner-pill">1-CLICK</span>
          <span>Automatic README generator & updater</span>
        </div>
        <button
          className="btn-icon-subtle"
          title="Refresh current tab"
          onClick={detectActiveRepo}
        >
          <RefreshCw size={11} className={status === "inspecting" ? "spin" : ""}/>
        </button>
      </div>

      {/* 3. GitHub Token Connection Drawer */}
      {showTokenInput && !userInfo && (
        <div className="auth-box">
          <div className="auth-title">
            <Key size={13}/>
            <span>Connect GitHub Token</span>
          </div>
          <p className="auth-desc">
            To allow 1-click updates directly to your repositories, paste a GitHub Personal Access Token with <code>repo</code> write permission.
          </p>
          <button type="button" className="btn-token-link" onClick={openTokenSettings}>
            🔑 1-Click: Create token on GitHub (pre-filled) <ExternalLink size={10}/>
          </button>
          <div className="auth-action-row">
            <input
              type="password"
              className="input-sm"
              placeholder="Paste ghp_... or github_pat_..."
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
            />
            <button className="btn-secondary" style={{ width: "auto" }} onClick={() => handleSaveToken()}>
              Connect
            </button>
          </div>
          {errorMessage && (
            <p style={{ color: "#f87171", fontSize: 10 }}>{errorMessage}</p>
          )}
        </div>
      )}

      {/* 4. Active Target Repository Card (Dynamic for ANY repository) */}
      {repoInfo?.owner && repoInfo?.repo ? (
        <div className="repo-card">
          <div className="repo-card-head">
            <div className="repo-titles">
              <span className="repo-owner"><Github size={11}/> {repoInfo.owner}</span>
              <strong className="repo-name">{repoInfo.repo}</strong>
            </div>
            <span className="branch-tag"><GitBranch size={10}/> {repoInfo.branch}</span>
          </div>

          <div className="repo-meta-row">
            <span>README Status:</span>
            {repoData?.hasReadme ? (
              <span className="readme-pill ok">README detected</span>
            ) : (
              <span className="readme-pill warn">No README yet</span>
            )}
          </div>

          {repoData?.techStack?.length > 0 && (
            <div className="tech-chips-compact">
              {repoData.techStack.slice(0, 5).map(tech => (
                <span key={tech} className="chip-xs">{tech}</span>
              ))}
            </div>
          )}

          {/* Quick tab switcher if user has other GitHub tabs open */}
          {openGhTabs.length > 1 && (
            <div className="tab-switcher-row">
              <span className="tab-switcher-label"><Layers size={10}/> Switch open repo:</span>
              <div className="tab-chips">
                {openGhTabs.map(t => (
                  <button
                    key={`${t.owner}/${t.repo}`}
                    className={`tab-chip ${t.repo === repoInfo.repo ? "active" : ""}`}
                    onClick={() => loadRepo(t.owner, t.repo, t.tabId)}
                    title={`Switch target to ${t.owner}/${t.repo}`}
                  >
                    {t.repo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <button
              className="preview-toggle"
              onClick={() => setShowManualInput(!showManualInput)}
              style={{ marginTop: 4 }}
            >
              Enter another repository {showManualInput ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
            </button>
            {showManualInput && (
              <div className="repo-input-row">
                <input
                  type="text"
                  className="input-sm"
                  placeholder="owner/repo (e.g. arnavarya001/Mobile_Shop)"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                />
                <button
                  className="btn-secondary"
                  style={{ width: "auto" }}
                  onClick={() => {
                    const match = extractGitHubRepo(manualInput.includes("github.com") ? manualInput : `https://github.com/${manualInput.trim()}`);
                    if (match) {
                      loadRepo(match.owner, match.repo);
                    } else {
                      const [o, r] = manualInput.split("/");
                      if (o && r) loadRepo(o.trim(), r.trim());
                    }
                  }}
                >
                  Load
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* If not on any GitHub repository tab */
        <div className="repo-card" style={{ textAlign: "center", padding: "14px 10px" }}>
          <FolderCode size={22} style={{ margin: "0 auto 6px", color: "#8a94a6" }}/>
          <strong style={{ fontSize: 13, color: "#f1f3f8" }}>No GitHub Repository Active</strong>
          <p style={{ fontSize: 10, color: "#8a94a6", margin: "4px 0 8px" }}>
            Open any GitHub repository in Chrome, or choose an open tab below:
          </p>

          {openGhTabs.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="tab-chips" style={{ justifyContent: "center" }}>
                {openGhTabs.map(t => (
                  <button
                    key={`${t.owner}/${t.repo}`}
                    className="tab-chip"
                    onClick={() => loadRepo(t.owner, t.repo, t.tabId)}
                  >
                    <Github size={10}/> {t.owner}/{t.repo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="repo-input-row">
            <input
              type="text"
              className="input-sm"
              placeholder="owner/repo (e.g. arnavarya001/Mobile_Shop)"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
            />
            <button
              className="btn-secondary"
              style={{ width: "auto" }}
              onClick={() => {
                const match = extractGitHubRepo(manualInput.includes("github.com") ? manualInput : `https://github.com/${manualInput.trim()}`);
                if (match) {
                  loadRepo(match.owner, match.repo);
                } else {
                  const [o, r] = manualInput.split("/");
                  if (o && r) loadRepo(o.trim(), r.trim());
                }
              }}
            >
              Load
            </button>
          </div>
        </div>
      )}

      {/* 5. Main 1-Click Action Button */}
      {status === "idle" && repoInfo?.owner && repoInfo?.repo && (
        <div className="action-section">
          <button
            className="btn-auto-update"
            onClick={handleAutoUpdate}
            disabled={status === "inspecting"}
          >
            <Sparkles size={16}/>
            <span>Auto-Generate & Update README</span>
          </button>
        </div>
      )}

      {/* 6. Live Progress Bar View */}
      {(status === "inspecting" || status === "generating" || status === "committing") && (
        <div className="progress-box">
          <div className={`progress-step ${status === "inspecting" ? "active" : "done"}`}>
            {status === "inspecting" ? <RefreshCw size={12} className="spin"/> : <Check size={12}/>}
            <span>{status === "inspecting" ? statusMessage : "1. Codebase & dependencies scanned"}</span>
          </div>
          <div className={`progress-step ${status === "generating" ? "active" : status === "committing" ? "done" : ""}`}>
            {status === "generating" ? <RefreshCw size={12} className="spin"/> : status === "committing" ? <Check size={12}/> : <span style={{ width: 12 }}/>}
            <span>{status === "generating" ? statusMessage : "2. Tailored README synthesized"}</span>
          </div>
          <div className={`progress-step ${status === "committing" ? "active" : ""}`}>
            {status === "committing" ? <RefreshCw size={12} className="spin"/> : <span style={{ width: 12 }}/>}
            <span>{status === "committing" ? statusMessage : "3. Committing to GitHub directly"}</span>
          </div>
        </div>
      )}

      {/* 7. Ready To Commit (When README is generated & user connects token) */}
      {status === "need_token" && (
        <div className="auth-box" style={{ borderColor: "#6444bf" }}>
          <div className="auth-title" style={{ color: "#d8c7ff" }}>
            <Sparkles size={13}/>
            <span>README Generated! Ready to Commit</span>
          </div>
          <p className="auth-desc">
            To commit this README directly to <strong>{repoInfo.owner}/{repoInfo.repo}</strong> in 1 click, paste your GitHub Personal Access Token:
          </p>
          <button type="button" className="btn-token-link" onClick={openTokenSettings}>
            🔑 Click here to create token on GitHub <ExternalLink size={10}/>
          </button>
          <div className="auth-action-row">
            <input
              type="password"
              className="input-sm"
              placeholder="Paste token (ghp_...)"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              autoFocus
            />
            <button
              className="btn-secondary"
              style={{ width: "auto", background: "#6648df", borderColor: "#825eff", color: "white" }}
              onClick={() => handleSaveToken()}
            >
              Commit Now
            </button>
          </div>

          <div style={{ textAlign: "center", margin: "4px 0", color: "#6e778d", fontSize: 10 }}>— OR —</div>

          <button className="btn-secondary" onClick={handleCopyAndOpenWeb}>
            <Copy size={12}/>
            <span>{copied ? "Copied! Opening GitHub…" : "Copy README & Open Web Editor"}</span>
          </button>
        </div>
      )}

      {/* 8. Success View */}
      {status === "success" && (
        <div className="success-box">
          <div className="success-icon-wrap">
            <CheckCircle2 size={22}/>
          </div>
          <h3>README.md Updated!</h3>
          <p>
            Your repository <strong>{repoInfo?.owner}/{repoInfo?.repo}</strong> was updated on branch <code>{repoInfo?.branch}</code>.
          </p>

          <div className="success-actions">
            <button className="btn-view-live" onClick={openRepoInBrowser}>
              View on GitHub <ExternalLink size={11}/>
            </button>
            <button className="btn-secondary" style={{ width: "auto" }} onClick={() => setStatus("idle")}>
              Update Again
            </button>
          </div>

          {generatedMarkdown && (
            <div className="preview-accordion" style={{ width: "100%", marginTop: 6 }}>
              <button
                className="preview-toggle"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide preview" : "View generated README"} {showPreview ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
              </button>
              {showPreview && (
                <div className="preview-content">
                  {generatedMarkdown}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 9. Error View */}
      {status === "error" && (
        <div className="auth-box" style={{ borderColor: "#6b2a2a", background: "#211215" }}>
          <div className="auth-title" style={{ color: "#fca5a5" }}>
            <AlertTriangle size={14}/> Update Failed
          </div>
          <p className="auth-desc" style={{ color: "#fecaca" }}>
            {errorMessage || "An error occurred while updating the file."}
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button className="btn-secondary" onClick={handleCopyAndOpenWeb}>
              <Copy size={11}/> Copy & Open Web
            </button>
            <button className="btn-secondary" onClick={() => setStatus("idle")}>
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
