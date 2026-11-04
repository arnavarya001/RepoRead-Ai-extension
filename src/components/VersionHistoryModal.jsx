import React from "react";
import { History, X, Save, Clock, ArrowLeft, Copy, Trash2 } from "lucide-react";

export default function VersionHistoryModal({ history = [], onRestore, onClear, onClose, notify }) {
  const copyVersion = (text) => {
    navigator.clipboard.writeText(text);
    notify("Version copied to clipboard");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal history-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><History size={18}/><strong>Version History</strong></div>
          <button className="icon-btn" onClick={onClose}><X size={17}/></button>
        </div>

        <p className="modal-copy">
          Snapshots are automatically recorded whenever you generate or majorly update your documentation.
        </p>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              <Clock size={28}/>
              <p>No previous versions recorded yet.</p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item.id || idx} className="history-entry">
                <div className="history-icon"><Save size={15}/></div>
                <div className="history-info">
                  <strong>{item.title || `Snapshot #${history.length - idx}`}</strong>
                  <span className="history-meta">
                    {item.timestamp} · {item.wordCount || 0} words ({item.charCount || 0} chars)
                  </span>
                  <div className="history-snippet">{item.content.slice(0, 110)}…</div>
                </div>
                <div className="history-item-actions">
                  <button
                    className="btn secondary sm"
                    onClick={() => copyVersion(item.content)}
                    title="Copy this version"
                  >
                    <Copy size={12}/>
                  </button>
                  <button
                    className="btn primary sm"
                    onClick={() => {
                      onRestore(item.content);
                      onClose();
                    }}
                    title="Restore this version into editor"
                  >
                    <ArrowLeft size={12}/> Restore
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions-between">
          {history.length > 0 ? (
            <button className="btn danger sm" onClick={onClear}>
              <Trash2 size={13}/> Clear History
            </button>
          ) : <div/>}
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

