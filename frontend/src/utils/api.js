// src/utils/api.js  – fetch helpers + SSE streaming client
import { getToken } from '../hooks/useAuth.jsx';

const BASE = '';  // proxied via vite → localhost:4000

function headers(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// ─── REST helpers ─────────────────────────────────────────────────────────────
export async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: headers(),
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  get:  (path)       => apiFetch(path, { method: 'GET'  }),
  put:  (path, body) => apiFetch(path, { method: 'PUT',  body }),
};

// ─── SSE streaming ────────────────────────────────────────────────────────────
/**
 * streamTool(path, body, { onChunk, onDone, onError })
 * Streams SSE events from backend.
 * Returns an AbortController so caller can cancel.
 */
export function streamTool(path, body, { onChunk, onDone, onError }) {
  const ctrl = new AbortController();

  (async () => {
    try {
      const res = await fetch(BASE + path, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Stream request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventName = line.slice(7).trim();
            // next line should be data:
            continue;
          }
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));
              // detect event from previous line context via buf parsing
              if ('text' in payload) onChunk?.(payload.text);
              else if ('sessionId' in payload || Object.keys(payload).length === 0) onDone?.(payload);
              else if ('message' in payload) throw new Error(payload.message);
            } catch (e) {
              if (e.message !== 'Unexpected end of JSON input') onError?.(e);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError?.(err);
    }
  })();

  return ctrl;
}

// ─── Proper SSE parser (handles interleaved event/data lines) ─────────────────
export function streamToolV2(path, body, { onChunk, onDone, onError }) {
  const ctrl = new AbortController();

  (async () => {
    try {
      const res = await fetch(BASE + path, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Stream request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const messages = buf.split('\n\n');
        buf = messages.pop() ?? '';

        for (const msg of messages) {
          let eventType = 'message';
          let dataStr = '';
          for (const line of msg.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataStr  = line.slice(6).trim();
          }
          if (!dataStr) continue;
          try {
            const payload = JSON.parse(dataStr);
            if (eventType === 'chunk') onChunk?.(payload.text);
            else if (eventType === 'done')  onDone?.(payload);
            else if (eventType === 'error') throw new Error(payload.message);
          } catch (e) {
            if (!e.message?.includes('JSON')) onError?.(e);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') onError?.(err);
    }
  })();

  return ctrl;
}
