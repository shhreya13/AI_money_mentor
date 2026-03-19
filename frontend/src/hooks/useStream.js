// src/hooks/useStream.js  – reusable SSE streaming hook
import { useState, useRef, useCallback } from 'react';
import { streamToolV2 } from '../utils/api.js';

export function useStream(path) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const ctrlRef = useRef(null);

  const run = useCallback((body) => {
    // Cancel any in-flight request
    ctrlRef.current?.abort();
    setText(''); setError(''); setDone(false); setLoading(true);

    ctrlRef.current = streamToolV2(path, body, {
      onChunk: (chunk) => setText(prev => prev + chunk),
      onDone:  ()      => { setLoading(false); setDone(true); },
      onError: (err)   => { setError(err.message); setLoading(false); },
    });
  }, [path]);

  const reset = useCallback(() => {
    ctrlRef.current?.abort();
    setText(''); setError(''); setDone(false); setLoading(false);
  }, []);

  return { text, loading, error, done, run, reset };
}
