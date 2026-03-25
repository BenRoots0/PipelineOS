// ═══════════════════════════════════════════════════════════════
// SERVICE: API  |  api.js
// Pipeline OS · v4.1 · src/services/api.js
// Thin wrapper around the Anthropic Claude API
// ═══════════════════════════════════════════════════════════════

const ANTHROPIC_BASE = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

/**
 * Call the Claude API.
 * @param {string} apiKey
 * @param {object} payload  - { model?, max_tokens, system?, messages }
 * @returns {Promise<object>} raw Anthropic response
 */
export async function claudeCall(apiKey, payload) {
  const body = {
    model: payload.model || DEFAULT_MODEL,
    max_tokens: payload.max_tokens || 1024,
    messages: payload.messages,
  };
  if (payload.system) body.system = payload.system;

  const resp = await fetch(ANTHROPIC_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }
  return resp.json();
}

/**
 * Extract text content from a Claude response.
 */
export function extractText(data) {
  return (data.content || []).map(c => c.text || '').join('');
}

// Expose to window
window.claudeCall = claudeCall;
window.extractText = extractText;
