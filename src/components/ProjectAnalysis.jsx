import React from "react";
import {
  FileText, GitBranch, Github, Layers, Terminal, FolderTree,
  ExternalLink, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Star
} from "lucide-react";

export default function ProjectAnalysis({ repoData, onGenerate, onInsertSection, isGenerating, onRefresh }) {
  if (!repoData) {
    return (
      <div className="analysis-empty">
        <Github size={36}/>
        <h3>No repository detected</h3>
        <p>Open a GitHub repository in your browser or enter a repository path to inspect.</p>
      </div>
    );
  }

  const { owner, repo, branch, metadata, techStack = [], fileNames = [], packageJson, hasReadme } = repoData;
  const scripts = packageJson?.scripts || {};

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <div>
          <div className="eyebrow">REPOSITORY INTELLIGENCE</div>
          <h2>{owner} / <span>{repo}</span></h2>
          <p>Live architectural analysis derived from repository source files and metadata.</p>
        </div>
        <div className="analysis-actions">
          <button className="btn secondary sm" onClick={onRefresh} title="Re-scan repository">
            <RefreshCw size={13}/> Refresh
          </button>
          <button className="btn ai-btn" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? <RefreshCw size={14} className="spin"/> : <Sparkles size={14}/>}
            {isGenerating ? "Analyzing & Generating…" : "Generate README with AI"}
          </button>
        </div>
      </div>

      <div className="analysis-grid">
        {/* Repo overview card */}
        <div className="analysis-card">
          <div className="card-title"><Github size={15}/> Repository Overview</div>
          <div className="stats-row">
            <div className="stat-pill"><GitBranch size={13}/> {branch}</div>
            <div className="stat-pill"><Star size={13}/> {metadata?.stargazers_count || 0} stars</div>
            <div className="stat-pill">{metadata?.language || "Multi-language"}</div>
          </div>
          {metadata?.homepage && (
            <div className="homepage-link">
              <span>Live Site:</span>
              <a href={metadata.homepage.trim()} target="_blank" rel="noreferrer">
                {metadata.homepage.trim()} <ExternalLink size={12}/>
              </a>
            </div>
          )}
          <div className="readme-status-box">
            {hasReadme ? (
              <div className="status-item ok">
                <CheckCircle2 size={15}/>
                <div>
                  <strong>Existing README detected</strong>
                  <span>You can import it or regenerate a new one.</span>
                </div>
              </div>
            ) : (
              <div className="status-item warn">
                <AlertTriangle size={15}/>
                <div>
                  <strong>No README.md found</strong>
                  <span>This repository needs documentation! Click "Generate README with AI".</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack card */}
        <div className="analysis-card">
          <div className="card-title">
            <Layers size={15}/> Detected Technologies ({techStack.length})
          </div>
          <div className="tech-chips">
            {techStack.map(t => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
          <button
            className="action-link"
            onClick={() => onInsertSection("Tech Stack")}
          >
            Insert Tech Stack table into README <ArrowRight size={12}/>
          </button>
        </div>

        {/* Available scripts */}
        {Object.keys(scripts).length > 0 && (
          <div className="analysis-card">
            <div className="card-title"><Terminal size={15}/> Detected package.json Scripts</div>
            <div className="scripts-list">
              {Object.entries(scripts).map(([cmd, val]) => (
                <div key={cmd} className="script-item">
                  <code>npm run {cmd}</code>
                  <span className="script-cmd">{val}</span>
                </div>
              ))}
            </div>
            <button
              className="action-link"
              onClick={() => onInsertSection("Scripts")}
            >
              Insert Scripts table into README <ArrowRight size={12}/>
            </button>
          </div>
        )}

        {/* Repository files */}
        <div className="analysis-card">
          <div className="card-title"><FolderTree size={15}/> Root File Structure ({fileNames.length} items)</div>
          <div className="files-scroll">
            {fileNames.map(f => (
              <div key={f} className="file-badge">
                <span className="file-dot"/> {f}
              </div>
            ))}
          </div>
          <button
            className="action-link"
            onClick={() => onInsertSection("Structure")}
          >
            Insert Directory Tree into README <ArrowRight size={12}/>
          </button>
        </div>
      </div>
    </div>
  );
}

