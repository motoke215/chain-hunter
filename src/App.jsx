import { useState, useCallback, useRef, useEffect } from "react";

// ─── Provider Configurations ──────────────────────────────────────────────────
const PROVIDERS = {
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    icon: "D",
    color: "#4f46e5",
    url: "https://api.deepseek.com/v1/chat/completions",
    type: "openai",
    models: [
      { id: "deepseek-v4-flash", name: "DeepSeek-V4 (非推理)" },
      { id: "deepseek-reasoner", name: "DeepSeek-R1 (推理)" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  minimax: {
    id: "minimax",
    name: "MiniMax",
    icon: "M",
    color: "#f97316",
    url: "https://api.minimax.chat/v1/chat/completions",
    type: "openai",
    models: [
      { id: "m27", name: "MiniMax M2.7" },
      { id: "abab6.5s-chat", name: "ABAB6.5s (旧)" },
    ],
    keyLabel: "API Key",
    keyHint: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  siliconflow: {
    id: "siliconflow",
    name: "硅基流动",
    icon: "S",
    color: "#7c3aed",
    url: "https://api.siliconflow.cn/v1/chat/completions",
    type: "openai",
    models: [
      { id: "deepseek-ai/DeepSeek-V4-Flash", name: "DeepSeek-V4-Flash" },
      { id: "deepseek-ai/DeepSeek-V3.2", name: "DeepSeek-V3.2" },
      { id: "Pro/deepseek-ai/DeepSeek-V3.2", name: "DeepSeek-V3.2 (Pro)" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: "C",
    color: "#d4a843",
    url: "https://api.anthropic.com/v1/messages",
    type: "anthropic",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-opus-4-20250514", name: "Claude Opus 4" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-ant-api03-...",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "O",
    color: "#10a37f",
    url: "https://api.openai.com/v1/chat/completions",
    type: "openai",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "o3-mini", name: "o3 Mini" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-proj-...",
  },
  zhipu: {
    id: "zhipu",
    name: "智谱 AI",
    icon: "Z",
    color: "#2563eb",
    url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    type: "openai",
    models: [
      { id: "glm-5-turbo", name: "GLM-5-Turbo (最新)" },
      { id: "glm-4-plus", name: "GLM-4 Plus" },
      { id: "glm-4-flash", name: "GLM-4 Flash (免费)" },
    ],
    keyLabel: "API Key",
    keyHint: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxx",
  },
  moonshot: {
    id: "moonshot",
    name: "月之暗面 Kimi",
    icon: "K",
    color: "#8b5cf6",
    url: "https://api.moonshot.cn/v1/chat/completions",
    type: "openai",
    models: [
      { id: "moonshot-v1-auto", name: "Moonshot v1 (自动)" },
      { id: "moonshot-v1-8k", name: "Moonshot v1 8K" },
      { id: "moonshot-v1-32k", name: "Moonshot v1 32K" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  qwen: {
    id: "qwen",
    name: "通义千问",
    icon: "Q",
    color: "#6366f1",
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    type: "openai",
    models: [
      { id: "qwen3.7-max", name: "Qwen3.7-Max (最新)" },
      { id: "qwen-plus", name: "Qwen Plus" },
      { id: "qwen-turbo", name: "Qwen Turbo" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
  baichuan: {
    id: "baichuan",
    name: "百川智能",
    icon: "B",
    color: "#eab308",
    url: "https://api.baichuan-ai.com/v1/chat/completions",
    type: "openai",
    models: [
      { id: "Baichuan4", name: "Baichuan4" },
      { id: "Baichuan3-Turbo", name: "Baichuan3 Turbo" },
    ],
    keyLabel: "API Key",
    keyHint: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
};

const DEFAULT_PROVIDER = "deepseek";
const PROVIDER_ORDER = ["deepseek", "minimax", "siliconflow", "anthropic", "openai", "zhipu", "moonshot", "qwen", "baichuan"];

// ─── Styles ───────────────────────────────────────────────────────────────────
// ─── Fonts ───────────────────────────────────────────────────────────────────
// Using system font fallback + inline critical font subset
const FONT_FAMILY = "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO_FAMILY = "'IBM Plex Mono', 'Cascadia Code', 'Fira Code', monospace";
const FONTS = ""; // Google Fonts loaded dynamically to avoid blocking

const css = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #060810;
    --surface:  #0d1117;
    --card:     #111827;
    --border:   #1e2a3a;
    --gold:     #d4a843;
    --gold-dim: #8a6b28;
    --amber:    #f59e0b;
    --green:    #10b981;
    --red:      #ef4444;
    --blue:     #3b82f6;
    --text:     #e2e8f0;
    --muted:    #64748b;
    --dim:      #374151;
    --up:       #22c55e;
    --down:     #ef4444;
    font-family: ${FONT_FAMILY};
  }
  body { background: var(--bg); color: var(--text); overflow-x: hidden; font-family: ${FONT_FAMILY}; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--dim); border-radius: 2px; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* Header */
  .header {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .header-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px; letter-spacing: 3px;
    color: var(--gold);
    text-shadow: 0 0 20px rgba(212,168,67,0.4);
  }
  .header-sub { font-size: 11px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; }
  .header-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .header-model-badge {
    padding: 3px 10px;
    background: rgba(212,168,67,0.1);
    border: 1px solid var(--gold-dim);
    border-radius: 12px;
    font-size: 10px; color: var(--gold);
    font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px;
    cursor: pointer; transition: all 0.2s;
    max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .header-model-badge:hover { background: rgba(212,168,67,0.2); }
  .header-settings-btn {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(30,42,58,0.8);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  }
  .header-settings-btn:hover { border-color: var(--gold-dim); color: var(--gold); background: rgba(212,168,67,0.08); }

  /* Input area */
  .input-section {
    padding: 16px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .input-model-bar {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 12px; padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .input-model-label { font-size: 11px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; white-space: nowrap; }
  .input-model-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    color: var(--text); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .input-model-btn:hover { border-color: var(--gold-dim); color: var(--gold); }
  .input-model-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
  .input-model-name { font-family: 'IBM Plex Mono', monospace; color: var(--gold); }
  .input-row { display: flex; gap: 10px; align-items: flex-start; }
  .input-box {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px 14px;
    color: var(--text);
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 14px;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    min-height: 60px;
    max-height: 120px;
  }
  .input-box:focus { border-color: var(--gold-dim); }
  .input-box::placeholder { color: var(--muted); font-size: 13px; }
  .analyze-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #b8860b, #d4a843);
    border: none; border-radius: 6px;
    color: #000; font-weight: 700;
    font-size: 14px; cursor: pointer;
    white-space: nowrap;
    font-family: 'Noto Sans SC', sans-serif;
    transition: all 0.2s;
    min-width: 90px;
  }
  .analyze-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(212,168,67,0.4); }
  .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .quick-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .quick-tag {
    padding: 3px 10px;
    background: rgba(30,42,58,0.8);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px; color: var(--muted);
    cursor: pointer; transition: all 0.15s;
  }
  .quick-tag:hover { border-color: var(--gold-dim); color: var(--gold); background: rgba(212,168,67,0.08); }

  /* Main layout */
  .main { display: flex; flex: 1; overflow: hidden; position: relative; }

  /* Chain panel */
  .chain-panel {
    width: 340px; min-width: 280px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    padding: 16px 12px;
    flex-shrink: 0;
  }
  .chain-title {
    font-size: 18px; font-weight: 700;
    color: var(--gold);
    margin-bottom: 4px;
    font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px;
  }
  .chain-summary {
    font-size: 12px; color: var(--muted); line-height: 1.6;
    margin-bottom: 16px; padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  /* Tier */
  .tier { margin-bottom: 6px; }
  .tier-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 8px;
  }
  .tier-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 28px;
    border-radius: 4px;
    font-size: 13px; font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 1px;
  }
  .tier-badge.upstream { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; }
  .tier-badge.midstream { background: rgba(212,168,67,0.12); border: 1px solid rgba(212,168,67,0.3); color: var(--gold); }
  .tier-badge.downstream { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }

  .tier-line {
    width: 1px; height: 100%;
    background: linear-gradient(to bottom, transparent, var(--border) 20%, var(--border) 80%, transparent);
    margin: 0 6px;
  }

  /* Sub-cards */
  .sub-cards { display: flex; flex-direction: column; gap: 5px; margin-left: 12px; position: relative; }
  .sub-cards::before {
    content: '';
    position: absolute; left: -8px; top: 8px; bottom: 8px;
    width: 1px; background: var(--border);
  }
  .sub-card {
    position: relative;
    padding: 9px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.18s;
    display: flex; align-items: center; justify-content: space-between;
  }
  .sub-card::before {
    content: '';
    position: absolute; left: -8px; top: 50%;
    width: 8px; height: 1px;
    background: var(--border);
  }
  .sub-card:hover { border-color: var(--gold-dim); background: rgba(212,168,67,0.05); }
  .sub-card.active {
    border-color: var(--gold);
    background: rgba(212,168,67,0.1);
    box-shadow: 0 0 12px rgba(212,168,67,0.15);
  }
  .sub-card-name { font-size: 13px; font-weight: 500; flex: 1; }
  .sub-card-count {
    font-size: 11px; color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    background: var(--bg); padding: 2px 6px; border-radius: 3px;
  }
  .sub-card.active .sub-card-count { background: rgba(212,168,67,0.2); color: var(--gold); }

  /* Tier connector arrow */
  .tier-arrow {
    display: flex; align-items: center; justify-content: center;
    padding: 4px 0; color: var(--dim);
    font-size: 14px;
  }

  /* Detail panel */
  .detail-panel {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg);
  }

  /* Empty state */
  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; min-height: 300px;
    color: var(--dim); gap: 12px;
  }
  .empty-icon { font-size: 48px; opacity: 0.3; }
  .empty-text { font-size: 14px; text-align: center; line-height: 1.8; }

  /* Detail header */
  .detail-header {
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 20px; padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .detail-tier-badge { padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
  .detail-tier-badge.upstream { background: rgba(59,130,246,0.15); color: #60a5fa; }
  .detail-tier-badge.midstream { background: rgba(212,168,67,0.12); color: var(--gold); }
  .detail-tier-badge.downstream { background: rgba(16,185,129,0.12); color: #34d399; }
  .detail-name { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .detail-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .detail-count-bar { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
  .detail-count-num { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--gold); line-height: 1; }
  .detail-count-label { font-size: 11px; color: var(--muted); }

  /* Company cards */
  .company-list { display: flex; flex-direction: column; gap: 12px; }
  .company-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    transition: border-color 0.2s;
    animation: slideIn 0.3s ease both;
  }
  .company-card:hover { border-color: rgba(212,168,67,0.3); }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .company-card:nth-child(1) { animation-delay: 0ms; }
  .company-card:nth-child(2) { animation-delay: 50ms; }
  .company-card:nth-child(3) { animation-delay: 100ms; }
  .company-card:nth-child(4) { animation-delay: 150ms; }
  .company-card:nth-child(5) { animation-delay: 200ms; }
  .company-card:nth-child(n+6) { animation-delay: 250ms; }

  .company-top {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; cursor: pointer;
  }
  .company-rank {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px;
    color: var(--dim); width: 24px; flex-shrink: 0; text-align: center;
    line-height: 1;
  }
  .company-rank.top3 { color: var(--gold); }
  .company-info { flex: 1; min-width: 0; }
  .company-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
  .company-name { font-size: 15px; font-weight: 700; }
  .company-ticker {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px; color: var(--gold);
    background: rgba(212,168,67,0.08);
    border: 1px solid rgba(212,168,67,0.2);
    padding: 1px 6px; border-radius: 3px;
  }
  .company-exchange {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: var(--muted);
    background: var(--bg); padding: 1px 5px; border-radius: 2px;
  }
  .multi-badge {
    font-size: 10px; padding: 2px 6px; border-radius: 10px;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.4);
    color: #fbbf24;
    font-weight: 600;
  }
  .company-businesses { display: flex; gap: 4px; flex-wrap: wrap; }
  .business-tag {
    font-size: 11px; padding: 2px 7px; border-radius: 3px;
    background: rgba(30,42,58,0.8); border: 1px solid var(--border);
    color: var(--muted);
  }
  .business-tag.primary { border-color: rgba(212,168,67,0.3); color: #d4a843; background: rgba(212,168,67,0.06); }

  /* Relevance bar */
  .relevance-col { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .relevance-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 16px; font-weight: 600;
    line-height: 1;
  }
  .relevance-num.high { color: var(--up); }
  .relevance-num.mid { color: var(--gold); }
  .relevance-num.low { color: var(--muted); }
  .relevance-bar-wrap { width: 60px; height: 3px; background: var(--dim); border-radius: 2px; overflow: hidden; }
  .relevance-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  .relevance-bar.high { background: var(--up); }
  .relevance-bar.mid { background: var(--gold); }
  .relevance-bar.low { background: var(--muted); }
  .relevance-label { font-size: 10px; color: var(--dim); font-family: 'IBM Plex Mono', monospace; }

  /* Company expand */
  .company-body {
    padding: 0 16px 14px 52px;
    font-size: 13px; color: var(--muted);
    line-height: 1.8;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }
  .company-body-desc { margin-bottom: 10px; }
  .multi-biz-section { margin-top: 10px; }
  .multi-biz-title {
    font-size: 11px; font-weight: 700; color: var(--gold);
    letter-spacing: 1px; margin-bottom: 6px;
    font-family: 'IBM Plex Mono', monospace;
    text-transform: uppercase;
  }
  .multi-biz-list { display: flex; flex-direction: column; gap: 5px; }
  .multi-biz-item {
    display: flex; gap: 8px; align-items: flex-start;
    background: rgba(212,168,67,0.04);
    border: 1px solid rgba(212,168,67,0.1);
    border-radius: 4px; padding: 6px 10px;
    font-size: 12px;
  }
  .multi-biz-dot { color: var(--gold); flex-shrink: 0; margin-top: 1px; }
  .multi-biz-content { color: var(--text); opacity: 0.8; }
  .multi-biz-label { color: var(--gold); font-weight: 600; margin-right: 4px; }

  /* Loading state */
  .loading-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; min-height: 300px; gap: 16px;
  }
  .loading-spinner {
    width: 36px; height: 36px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; }
  .loading-steps { font-size: 12px; color: var(--dim); }

  /* Welcome screen */
  .welcome {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; min-height: 400px; gap: 16px; text-align: center;
  }
  .welcome-logo {
    font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 4px;
    background: linear-gradient(135deg, #8a6b28, #d4a843, #f5c842, #d4a843);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    line-height: 1;
  }
  .welcome-sub { font-size: 14px; color: var(--muted); line-height: 1.8; max-width: 360px; }
  .welcome-features { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .welcome-feat { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--dim); }
  .welcome-feat-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

  /* Chain empty (no data yet) */
  .chain-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 200px; gap: 8px; color: var(--dim);
  }
  .chain-empty-text { font-size: 12px; text-align: center; line-height: 1.6; }

  /* Error */
  .error-msg {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 6px; padding: 10px 14px;
    font-size: 13px; color: #fca5a5;
    margin-top: 8px;
  }

  /* ─── Settings Modal ─── */
  .settings-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .settings-modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 90%; max-width: 680px; max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.25s ease;
  }
  .settings-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--surface); z-index: 1;
  }
  .settings-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 2px;
    color: var(--gold);
    display: flex; align-items: center; gap: 8px;
  }
  .settings-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid var(--border);
    border-radius: 6px; color: var(--muted); cursor: pointer;
    font-size: 16px; transition: all 0.2s;
  }
  .settings-close:hover { border-color: var(--red); color: var(--red); }
  .settings-body { padding: 20px; }
  .settings-section { margin-bottom: 20px; }
  .settings-section-title {
    font-size: 12px; font-weight: 700; color: var(--muted);
    letter-spacing: 2px; margin-bottom: 10px;
    font-family: 'IBM Plex Mono', monospace;
    text-transform: uppercase;
  }

  /* Provider grid */
  .provider-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px;
  }
  .provider-card {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 12px 8px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .provider-card:hover { border-color: var(--muted); background: rgba(255,255,255,0.02); }
  .provider-card.selected {
    border-color: var(--gold);
    background: rgba(212,168,67,0.08);
    box-shadow: 0 0 12px rgba(212,168,67,0.1);
  }
  .provider-card.has-key { border-style: solid; }
  .provider-icon {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; font-weight: 700;
    color: #fff;
  }
  .provider-name {
    font-size: 11px; font-weight: 600; text-align: center;
    line-height: 1.2;
  }
  .provider-key-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green);
    flex-shrink: 0;
  }
  .provider-key-dot.missing { background: var(--dim); }

  /* Settings form */
  .settings-form { display: flex; flex-direction: column; gap: 14px; }
  .settings-field { display: flex; flex-direction: column; gap: 4px; }
  .settings-label {
    font-size: 11px; font-weight: 600; color: var(--muted);
    font-family: 'IBM Plex Mono', monospace;
    display: flex; align-items: center; gap: 6px;
  }
  .settings-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }
  .settings-input:focus { border-color: var(--gold-dim); }
  .settings-input::placeholder { color: var(--dim); font-size: 11px; }
  .settings-input-row { display: flex; gap: 8px; }
  .settings-input-row .settings-input { flex: 1; }
  .settings-input-readonly {
    background: rgba(0,0,0,0.3);
    color: var(--dim);
    cursor: default;
    user-select: all;
  }
  .settings-input-readonly:focus { border-color: var(--border); }
  .settings-select {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--text);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
  }
  .settings-select:focus { border-color: var(--gold-dim); }
  .settings-toggle-btn {
    padding: 8px 12px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--muted);
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .settings-toggle-btn:hover { border-color: var(--gold-dim); color: var(--gold); }
  .settings-save-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, #b8860b, #d4a843);
    border: none; border-radius: 6px;
    color: #000; font-weight: 700;
    font-size: 14px; cursor: pointer;
    font-family: 'Noto Sans SC', sans-serif;
    transition: all 0.2s;
    align-self: flex-end;
  }
  .settings-save-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(212,168,67,0.4); }

  /* Key missing warning */
  .key-warning {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 12px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 6px;
    font-size: 12px; color: #fbbf24;
  }
  .key-warning-icon { font-size: 14px; flex-shrink: 0; }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .main { flex-direction: column; }
    .chain-panel { width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 45vh; }
    .detail-panel { padding: 14px; }
    .welcome-logo { font-size: 32px; }
    .header-logo { font-size: 18px; }
    .company-body { padding-left: 16px; }
    .settings-modal { width: 95%; max-height: 90vh; }
    .provider-grid { grid-template-columns: repeat(3, 1fr); }
    .header-model-badge { max-width: 100px; font-size: 9px; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relevanceClass = (r) => r >= 85 ? "high" : r >= 60 ? "mid" : "low";

const QUICK_EXAMPLES = [
  "苹果产业链", "新能源汽车", "AI芯片", "光伏产业",
  "军工国防", "医疗器械", "消费电子", "储能电池",
];

const TIER_LABELS = { upstream: "上游", midstream: "中游", downstream: "下游" };
const TIER_ORDER = ["upstream", "midstream", "downstream"];

// ─── localStorage helpers ────────────────────────────────────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem("chain_hunter_settings");
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return {};
}

function saveSettings(settings) {
  try {
    localStorage.setItem("chain_hunter_settings", JSON.stringify(settings));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert("存储空间已满，请清理浏览器缓存后重试");
    }
  }
}

// ─── API Call ─────────────────────────────────────────────────────────────────
async function analyzeIndustry(input, providerId, model, apiKey) {
  const provider = PROVIDERS[providerId];
  if (!provider) throw new Error(`未知的AI提供商: ${providerId}`);

  const systemPrompt = `你是一位顶级的A股行业研究分析师，专注于产业链分析和上市公司研究。
用户会输入一段新闻、行业名称、概念或链接描述，你需要进行深度产业链分析。

返回严格的JSON格式，不要有任何额外文字、注释或markdown代码块。结构如下：

{
  "title": "产业链名称（简洁，如：新能源汽车产业链）",
  "summary": "产业链整体概述，200字以内，包含市场规模(万亿/亿)、核心驱动力、当前投资逻辑、景气度判断",
  "upstream": [
    {
      "id": "chip_upstream",
      "name": "细分赛道名称（精确到具体产品/技术，如：锂矿采选、碳化硅衬底、线控底盘）",
      "description": "该细分赛道深度分析：1) 技术路线对比（优劣势），2) 市场规模区间（XX亿-XX亿）及增速，3) 竞争格局（CR3/CR5），4) 壁垒来源（技术/资源/认证），5) 国产替代进程",
      "companies": [
        {
          "name": "公司完整名称",
          "ticker": "股票代码",
          "exchange": "A股/港股/美股/北交所",
          "relevance": 95,
          "businesses": ["核心相关业务", "次要相关业务"],
          "isMultiBusiness": false,
          "description": "深度分析：1) 在该细分赛道的市场份额（国内/全球），2) 核心竞争优势（技术壁垒/成本/客户认证），3) 主要客户/竞争对手，4) 营收占比估算，5) 最新动态（扩产/技术突破/订单），200字以上",
          "multiBusinessNote": []
        }
      ]
    }
  ],
  "midstream": [...],
  "downstream": [...]
}

重要规则：
1. 只列出A股上市公司（沪深北交所），不列港股美股等其他市场
2. relevance为0-100的整数，表示公司与该细分赛道的关联度，低于60的不列出
3. 如果一家公司在多个细分赛道都有业务（isMultiBusiness=true），在multiBusinessNote中说明各块业务：[{"segment": "细分赛道名", "detail": "业务说明，占比估算"}]
4. businesses数组第一个是最核心的业务标签
5. 上游：原材料/零部件/设备；中游：制造/组装/集成；下游：品牌/终端/服务
6. 每个层级列出所有细分的赛道，不要合并，要细分到每个具体产品/元件/工艺环节
7. ticker格式：A股6位数字（如000001），北交所加BJ
8. description必须包含具体数据（市场份额、营收占比、产能、毛利率等），避免空洞描述
9. 必须包含各细分赛道当前景气度（上行/平稳/下行）和驱动因素
10. 描述使用中文，专业但易懂，有具体数据支撑
11. 细分赛道至少列出8-15个，不要少于8个`;

  let response, resultText;

  if (provider.type === "anthropic") {
    // ── Anthropic native API ──
    response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 32768,
        system: systemPrompt,
        messages: [{ role: "user", content: `请分析以下输入的产业链：\n\n${input}` }],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 400) {
        throw new Error(`请求参数错误(400)：模型或参数不被支持，请尝试更换模型`);
      } else if (status === 401 || status === 403) {
        throw new Error(`认证失败(${status})：API Key无效或权限不足，请检查Key`);
      } else if (status >= 500) {
        throw new Error(`服务器错误(${status})：提供商服务暂时异常，请稍后重试或换模型`);
      } else {
        throw new Error(`API错误(${status})：请检查API Key和网络状态`);
      }
    }

    const data = await response.json();
    resultText = data.content?.find(b => b.type === "text")?.text || "";
  } else {
    // ── OpenAI-compatible API (DeepSeek, MiniMax, SiliconFlow, OpenAI, Zhipu, Moonshot, Qwen, Baichuan) ──
    response = await fetch(provider.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 32768,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `请分析以下输入的产业链：\n\n${input}` },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 400) {
        throw new Error(`请求参数错误(400)：模型或参数不被支持，请尝试更换模型`);
      } else if (status === 401 || status === 403) {
        throw new Error(`认证失败(${status})：API Key无效或权限不足，请检查Key`);
      } else if (status >= 500) {
        throw new Error(`服务器错误(${status})：提供商服务暂时异常，请稍后重试或换模型`);
      } else {
        throw new Error(`API错误(${status})：请检查API Key和网络状态`);
      }
    }

    const data = await response.json();
    resultText = data.choices?.[0]?.message?.content || "";
  }

  if (!resultText.trim()) throw new Error("AI返回内容为空，请检查模型和API Key");

  if (!resultText.trim()) throw new Error("AI返回内容为空，请检查模型和API Key");

  // Strip possible markdown fences
  const clean = resultText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ isOpen, onClose, settings, onSave }) {
  const [selectedProvider, setSelectedProvider] = useState(settings.provider || DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModel] = useState(settings.model || "");
  const [apiKeys, setApiKeys] = useState(settings.apiKeys || {});
  const [showKey, setShowKey] = useState({});
  const modalRef = useRef(null);

  const provider = PROVIDERS[selectedProvider];

  // Init model if not set
  useEffect(() => {
    if (provider && (!selectedModel || !provider.models.find(m => m.id === selectedModel))) {
      setSelectedModel(provider.models[0]?.id || "");
    }
  }, [selectedProvider, provider, selectedModel]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Close on overlay click
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    onSave({
      provider: selectedProvider,
      model: selectedModel,
      apiKeys: { ...apiKeys },
    });
    onClose();
  };

  const toggleShowKey = (pid) => {
    setShowKey(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={handleOverlay}>
      <div className="settings-modal" ref={modalRef}>
        <div className="settings-header">
          <div className="settings-title">
            <span>⚙</span> AI 模型配置
          </div>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          {/* Provider Selection */}
          <div className="settings-section">
            <div className="settings-section-title">▸ 选择 AI 提供商</div>
            <div className="provider-grid">
              {PROVIDER_ORDER.map(pid => {
                const p = PROVIDERS[pid];
                const isSelected = pid === selectedProvider;
                const hasKey = !!apiKeys[pid];
                return (
                  <div
                    key={pid}
                    className={`provider-card${isSelected ? " selected" : ""}${hasKey ? " has-key" : ""}`}
                    onClick={() => setSelectedProvider(pid)}
                  >
                    <div className="provider-icon" style={{ background: p.color }}>
                      {p.icon}
                    </div>
                    <div className="provider-name">{p.name}</div>
                    <div className={`provider-key-dot${hasKey ? "" : " missing"}`} title={hasKey ? "已配置密钥" : "未配置密钥"} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Provider Config */}
          {provider && (
            <div className="settings-section">
              <div className="settings-section-title">
                ▸ 配置 {provider.name}
              </div>
              <div className="settings-form">
                {/* API Key */}
                <div className="settings-field">
                  <div className="settings-label">
                    <span style={{ color: provider.color }}>●</span>
                    {provider.keyLabel}
                  </div>
                  <div className="settings-input-row">
                    <input
                      className="settings-input"
                      type={showKey[selectedProvider] ? "text" : "password"}
                      value={apiKeys[selectedProvider] || ""}
                      onChange={e => setApiKeys(prev => ({ ...prev, [selectedProvider]: e.target.value }))}
                      placeholder={provider.keyHint}
                      autoComplete="off"
                    />
                    <button
                      className="settings-toggle-btn"
                      onClick={() => toggleShowKey(selectedProvider)}
                    >
                      {showKey[selectedProvider] ? "隐藏" : "显示"}
                    </button>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="settings-field">
                  <div className="settings-label">
                    <span style={{ color: provider.color }}>●</span>
                    模型选择
                  </div>
                  <select
                    className="settings-select"
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                  >
                    {provider.models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* URL Display (auto-generated, read-only) */}
                <div className="settings-field">
                  <div className="settings-label">
                    <span style={{ color: provider.color }}>●</span>
                    API 端点 (自动生成)
                  </div>
                  <input
                    className="settings-input settings-input-readonly"
                    value={provider.url}
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                {/* Key missing warning */}
                {!apiKeys[selectedProvider] && (
                  <div className="key-warning">
                    <span className="key-warning-icon">⚠</span>
                    <span>请填入 {provider.name} 的 API Key，否则分析将失败</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button className="settings-save-btn" onClick={handleSave}>
              保存配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function RelevanceBar({ value }) {
  const cls = relevanceClass(value);
  return (
    <div className="relevance-col">
      <span className={`relevance-num ${cls}`}>{value}<span style={{fontSize:"10px",color:"var(--dim)"}}>%</span></span>
      <div className="relevance-bar-wrap">
        <div className={`relevance-bar ${cls}`} style={{ width: `${value}%` }} />
      </div>
      <span className="relevance-label">关联度</span>
    </div>
  );
}

function CompanyCard({ company, rank, tier }) {
  const [expanded, setExpanded] = useState(false);
  const isTop3 = rank <= 3;

  return (
    <div className="company-card">
      <div className="company-top" onClick={() => setExpanded(e => !e)}>
        <div className={`company-rank ${isTop3 ? "top3" : ""}`}>{rank}</div>
        <div className="company-info">
          <div className="company-name-row">
            <span className="company-name">{company.name}</span>
            <span className="company-ticker">{company.ticker}</span>
            <span className="company-exchange">{company.exchange}</span>
            {company.isMultiBusiness && (
              <span className="multi-badge">多业务</span>
            )}
          </div>
          <div className="company-businesses">
            {(company.businesses || []).map((b, i) => (
              <span key={i} className={`business-tag ${i === 0 ? "primary" : ""}`}>{b}</span>
            ))}
          </div>
        </div>
        <RelevanceBar value={company.relevance} />
      </div>
      {expanded && (
        <div className="company-body">
          <div className="company-body-desc">{company.description}</div>
          {company.isMultiBusiness && company.multiBusinessNote?.length > 0 && (
            <div className="multi-biz-section">
              <div className="multi-biz-title">跨赛道业务分布</div>
              <div className="multi-biz-list">
                {company.multiBusinessNote.map((item, i) => (
                  <div key={i} className="multi-biz-item">
                    <span className="multi-biz-dot">◆</span>
                    <span className="multi-biz-content">
                      <span className="multi-biz-label">{item.segment}：</span>
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubCard({ segment, tier, isActive, onClick }) {
  return (
    <div className={`sub-card ${isActive ? "active" : ""}`} onClick={onClick}>
      <span className="sub-card-name">{segment.name}</span>
      <span className="sub-card-count">{segment.companies?.length ?? 0}家</span>
    </div>
  );
}

function ChainTier({ tier, segments, selected, onSelect }) {
  return (
    <div className="tier">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span className={`tier-badge ${tier}`}>{TIER_LABELS[tier]}</span>
      </div>
      <div className="sub-cards">
        {segments.map(seg => (
          <SubCard
            key={seg.id}
            segment={seg}
            tier={tier}
            isActive={selected?.id === seg.id}
            onClick={() => onSelect({ ...seg, tier })}
          />
        ))}
      </div>
    </div>
  );
}

function DetailPanel({ selected }) {
  if (!selected) {
    return (
      <div className="detail-panel">
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <div className="empty-text">
            点击左侧任意细分赛道<br />查看相关上市公司
          </div>
        </div>
      </div>
    );
  }

  const companies = selected.companies || [];

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className={`detail-tier-badge ${selected.tier}`}>{TIER_LABELS[selected.tier]}</span>
          </div>
          <div className="detail-name">{selected.name}</div>
          <div className="detail-desc">{selected.description}</div>
        </div>
        <div className="detail-count-bar">
          <div>
            <div className="detail-count-num">{companies.length}</div>
            <div className="detail-count-label">相关公司</div>
          </div>
        </div>
      </div>
      <div className="company-list">
        {companies.map((co, i) => (
          <CompanyCard key={co.ticker + i} company={co} rank={i + 1} tier={selected.tier} />
        ))}
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="welcome">
      <div className="welcome-logo">产业链猎手</div>
      <div className="welcome-sub">
        输入新闻、行业名称或概念，<br />
        AI 自动拆解产业链各细分赛道<br />
        并匹配关联上市公司
      </div>
      <div className="welcome-features">
        {[
          "上中下游完整产业链图谱",
          "细分赛道关联公司排序",
          "公司核心业务深度解析",
          "跨赛道多业务公司标注",
          "支持9大主流AI模型切换",
        ].map((f, i) => (
          <div key={i} className="welcome-feat">
            <div className="welcome-feat-dot" />
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);

  // Settings state
  const [settings, setSettings] = useState(() => {
    const saved = loadSettings();
    return {
      provider: saved.provider || DEFAULT_PROVIDER,
      model: saved.model || PROVIDERS[DEFAULT_PROVIDER].models[0].id,
      apiKeys: saved.apiKeys || {},
    };
  });

  // Persist settings on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const currentProvider = PROVIDERS[settings.provider];
  const currentApiKey = settings.apiKeys[settings.provider] || "";

  const handleAnalyze = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    if (!currentApiKey) {
      setError(`请先配置 ${currentProvider?.name || "AI模型"} 的 API Key（点击右上角齿轮图标）`);
      setShowSettings(true);
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    setSelected(null);
    try {
      const result = await analyzeIndustry(q, settings.provider, settings.model, currentApiKey);
      setData(result);
      // Auto-select first segment
      const firstTier = TIER_ORDER.find(t => result[t]?.length > 0);
      if (firstTier && result[firstTier]?.length > 0) {
        setSelected({ ...result[firstTier][0], tier: firstTier });
      }
    } catch (e) {
      setError(`分析失败：${e.message}。请检查网络或重试。`);
    } finally {
      setLoading(false);
    }
  }, [input, settings.provider, settings.model, currentApiKey, currentProvider]);

  const handleKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
  };

  const currentModelName = currentProvider?.models.find(m => m.id === settings.model)?.name || settings.model;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="app">
        {/* Header */}
        <div className="header">
          <div>
            <div className="header-logo">CHAIN HUNTER</div>
            <div className="header-sub">产业链分析 · 上市公司映射</div>
          </div>
          <div className="header-right">
            <div className="header-model-badge" onClick={() => setShowSettings(true)} title="点击更换模型">
              {currentProvider?.icon || "?"} {currentModelName}
            </div>
            <button className="header-settings-btn" onClick={() => setShowSettings(true)} title="AI模型配置">
              ⚙
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={setSettings}
        />

        {/* Input */}
        <div className="input-section">
          <div className="input-model-bar">
            <span className="input-model-label">当前模型</span>
            <button className="input-model-btn" onClick={() => setShowSettings(true)}>
              <span className="input-model-dot" />
              <span>{currentProvider?.name}</span>
              <span className="input-model-name">· {currentModelName}</span>
              <span style={{color:"var(--dim)",marginLeft:"2px"}}>▼</span>
            </button>
          </div>
          <div className="input-row">
            <textarea
              ref={textareaRef}
              className="input-box"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="输入新闻内容、行业名称（如：新能源汽车）、概念或链接描述...  Ctrl+Enter 分析"
              rows={2}
            />
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
            >
              {loading ? "分析中..." : "⚡ 分析"}
            </button>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="quick-tags">
            <span style={{ fontSize: "11px", color: "var(--dim)", alignSelf: "center" }}>示例：</span>
            {QUICK_EXAMPLES.map(ex => (
              <span
                key={ex}
                className="quick-tag"
                onClick={() => { setInput(ex); }}
              >
                {ex}
              </span>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="main">
          {/* Left: Chain Panel */}
          <div className="chain-panel">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <div className="loading-text">AI 正在解析产业链...</div>
                <div className="loading-steps">梳理上中下游结构 · 匹配上市公司</div>
              </div>
            ) : data ? (
              <>
                <div className="chain-title">{data.title}</div>
                <div className="chain-summary">{data.summary}</div>
                {TIER_ORDER.map((tier, ti) => (
                  data[tier]?.length > 0 && (
                    <div key={tier}>
                      {ti > 0 && (
                        <div className="tier-arrow">↓</div>
                      )}
                      <ChainTier
                        tier={tier}
                        segments={data[tier]}
                        selected={selected}
                        onSelect={setSelected}
                      />
                    </div>
                  )
                ))}
              </>
            ) : (
              <div className="chain-empty">
                <div style={{ fontSize: '32px', opacity: 0.2 }}>&#x2B21;</div>
                <div className="chain-empty-text">
                  产业链图谱<br />将在分析后显示
                </div>
              </div>
            )}
          </div>

          {/* Right: Detail Panel */}
          {loading ? (
            <div className="detail-panel">
              <div className="loading-state">
                <div style={{ opacity: 0.4 }}>
                  <div className="loading-spinner" style={{ borderTopColor: "var(--blue)" }} />
                </div>
                <div className="loading-text">等待分析完成...</div>
              </div>
            </div>
          ) : data ? (
            <DetailPanel selected={selected} />
          ) : (
            <div className="detail-panel">
              <WelcomeScreen />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
