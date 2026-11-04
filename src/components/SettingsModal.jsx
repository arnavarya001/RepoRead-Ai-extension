import React, { useState } from "react";
import { Settings2, X, Check, Key, Cpu, ShieldCheck, Sparkles, Github, ExternalLink, RefreshCw } from "lucide-react";

export default function SettingsModal({ settings, onSave, onClose, notify }) {
  const [provider, setProvider] = useState(settings.provider || "Built-in Smart Engine");
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || "");
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || "");
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl || "http://localhost:11434");
  const [githubToken, setGithubToken] = useState(settings.githubToken || "");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    onSave({
      provider,
      geminiKey,
      openaiKey,
      ollamaUrl,
      githubToken
    });
    notify("Settings saved successfully");
    onClose();
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (provider === "Built-in Smart Engine") {
        setTestResult({ ok: true, msg: "Built-in Smart Engine is ready (0 latency, no key needed)." });
      } else if (provider === "Google Gemini") {
        if (!geminiKey.trim()) throw new Error("Please enter your Gemini API key.");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Say 'OK'" }] }] })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
        setTestResult({ ok: true, msg: "Connected to Gemini API successfully!" });
      } else if (provider === "OpenAI") {
        if (!openaiKey.trim()) throw new Error("Please enter your OpenAI API key.");
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${openaiKey.trim()}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} Authentication failed`);
        setTestResult({ ok: true, msg: "Connected to OpenAI API successfully!" });
      } else if (provider === "Local · Ollama") {
        const url = (ollamaUrl || "http://localhost:11434").replace(/\/$/, "");
        const res = await fetch(`${url}/api/tags`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = data.models ? data.models.length : 0;
        setTestResult({ ok: true, msg: `Connected to Ollama! Found ${count} local models.` });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: err.message || "Connection failed" });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><Settings2 size={19}/><strong>AI & Repository Settings</strong></div>
          <button className="icon-btn" onClick={onClose}><X size={17}/></button>
        </div>

        <div className="settings-body">
          <div className="form-group">
            <label className="form-label"><Cpu size={14}/> AI Generation Provider</label>
            <select
              className="form-select"
              value={provider}
              onChange={e => {
                setProvider(e.target.value);
                setTestResult(null);
              }}
            >
              <option value="Built-in Smart Engine">✨ Built-in Smart Engine (Fast, No Key Needed)</option>
              <option value="Google Gemini">🤖 Google Gemini API (Gemini 1.5 Flash)</option>
              <option value="OpenAI">⚡ OpenAI (GPT-4o Mini)</option>
              <option value="Local · Ollama">🦙 Local Ollama (Self-hosted)</option>
            </select>
            <span className="form-hint">
              {provider === "Built-in Smart Engine" && "Analyzes repository files, package dependencies, scripts, and live site with 0 latency."}
              {provider === "Google Gemini" && "Uses Google's Gemini models for deep creative README synthesis."}
              {provider === "OpenAI" && "Uses OpenAI GPT-4o-mini to draft and refine documentation."}
              {provider === "Local · Ollama" && "Runs 100% locally on your machine via Ollama."}
            </span>
          </div>

          {provider === "Google Gemini" && (
            <div className="form-group">
              <label className="form-label"><Key size={14}/> Gemini API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
              />
              <span className="form-hint">
                Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio <ExternalLink size={11}/></a>
              </span>
            </div>
          )}

          {provider === "OpenAI" && (
            <div className="form-group">
              <label className="form-label"><Key size={14}/> OpenAI API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="sk-..."
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
              />
              <span className="form-hint">
                Stored locally in extension storage. Never transmitted to third parties.
              </span>
            </div>
          )}

          {provider === "Local · Ollama" && (
            <div className="form-group">
              <label className="form-label"><Cpu size={14}/> Ollama Server URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="http://localhost:11434"
                value={ollamaUrl}
                onChange={e => setOllamaUrl(e.target.value)}
              />
              <span className="form-hint">Ensure Ollama is running (`ollama serve`).</span>
            </div>
          )}

          <div className="test-bar">
            <button
              type="button"
              className="btn secondary sm"
              onClick={testConnection}
              disabled={isTesting}
            >
              {isTesting ? <RefreshCw size={13} className="spin"/> : <Sparkles size={13}/>}
              {isTesting ? "Testing…" : "Test Provider Connection"}
            </button>
            {testResult && (
              <span className={testResult.ok ? "test-success" : "test-error"}>
                {testResult.ok ? "✓ " : "✕ "} {testResult.msg}
              </span>
            )}
          </div>

          <div className="divider-hr"/>

          <div className="form-group">
            <label className="form-label"><Github size={14}/> GitHub Personal Access Token (Optional)</label>
            <input
              type="password"
              className="form-input"
              placeholder="ghp_... or github_pat_..."
              value={githubToken}
              onChange={e => setGithubToken(e.target.value)}
            />
            <span className="form-hint">
              Optional: Increases GitHub API rate limit from 60 to 5,000 requests/hr, and enables 1-click commits directly to your repository.
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}><Check size={14}/> Save Changes</button>
        </div>
      </div>
    </div>
  );
}

