// Unified storage adapter supporting chrome.storage.local and window.localStorage

export const storage = {
  async get(key, defaultValue = null) {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (res) => {
          resolve(res && res[key] !== undefined ? res[key] : defaultValue);
        });
      });
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (_) {
      return localStorage.getItem(key) || defaultValue;
    }
  },

  async set(key, value) {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    }
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch (_) {}
  },

  async remove(key) {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], resolve);
      });
    }
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  }
};

