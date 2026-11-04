import React, { useState } from "react";
import { Github, X, ShieldCheck, ExternalLink, Check, Copy, Download, RefreshCw, AlertCircle } from "lucide-react";
import { commitReadmeToGitHub } from "../services/github";

export default function PublishModal({ repoData, markdown, token, onClose, notify }) {
  const { owner, repo, branch = "main", hasReadme } = repoData || { owner: "owner", repo: "repo", branch: "main" };
  const [commitMessage, setCommitMessage] = useState("docs: update README.md via RepoRead AI");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const handleCopyAndOpen = async () => {
    await navigator.clipboard.writeText(markdown);
    notify("README copied! Opening GitHub web editor…");
    const targetUrl = hasReadme
      ? `https://github.com/${owner}/${repo}/edit/${branch}/README.md`
      : `https://github.com/${owner}/${repo}/new/${branch}?filename=README.md`;
    window.open(targetUrl, "_blank");
    onClose();
  };

  const handleDirectCommit = async () => {
    if (!token) {
      notify("Please add a GitHub Personal Access Token in Settings to commit directly.");
      return;
    }
    setIsCommitting(true);
    try {
      await commitReadmeToGitHub(owner, repo, branch, markdown, commitMessage, token);
      setCommitSuccess(true);
      notify("✓ README successfully committed to GitHub!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      notify(`Commit error: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    notify("README.md downloaded");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal publish-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><Github size={19}/><strong>Review & Publish to GitHub</strong></div>
          <button className="icon-btn" onClick={onClose}><X size={17}/></button>
        </div>

        {commitSuccess ? (
          <div className="commit-success-box">
            <Check size={32}/>
            <h3>Committed to GitHub!</h3>
            <p>Your README has been committed to branch <code>{branch}</code> of <strong>{owner}/{repo}</strong>.</p>
          </div>
        ) : (
          <>
            <div className="publish-warning">
              <ShieldCheck size={19}/>
              <div>
                <strong>Safe & Reviewable Documentation</strong>
                <span>Review your changes before pushing or opening in GitHub.</span>
              </div>
            </div>

            <div className="publish-detail">
              <span>Target repository</span>
              <strong>{owner}/{repo}</strong>
            </div>

            <div className="publish-detail">
              <span>Target branch</span>
              <strong>{branch}</strong>
            </div>

            <div className="publish-detail">
              <span>Target file</span>
              <strong>README.md {hasReadme ? "(Update existing)" : "(Create new)"}</strong>
            </div>

            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">Commit message</label>
              <input
                type="text"
                className="form-input"
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
              />
            </div>

            <div className="publish-actions">
              {token ? (
                <button
                  className="btn publish-btn full"
                  onClick={handleDirectCommit}
                  disabled={isCommitting}
                >
                  {isCommitting ? <RefreshCw size={14} className="spin"/> : <Github size={14}/>}
                  {isCommitting ? "Committing to GitHub…" : "Commit Directly to GitHub"}
                </button>
              ) : (
                <button
                  className="btn publish-btn full"
                  onClick={handleCopyAndOpen}
                >
                  <Copy size={14}/> Copy & Open GitHub Web Editor <ExternalLink size={13}/>
                </button>
              )}

              <div className="secondary-row">
                <button className="btn secondary flex-1" onClick={downloadFile}>
                  <Download size={13}/> Download README.md
                </button>
                <button className="btn secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>

              {!token && (
                <p className="modal-footnote">
                  Tip: Want 1-click commits without opening GitHub web? Add a GitHub Personal Access Token in <strong>Settings</strong>.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

