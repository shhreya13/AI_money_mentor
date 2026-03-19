// src/pages/Chat.jsx  – conversational AI financial mentor
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton, Card, Spinner } from '../components/UI.jsx';
import { streamToolV2 } from '../utils/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

const STARTERS = [
  'How much should I invest in SIPs each month?',
  'Explain the difference between ELSS and PPF',
  'Should I choose old or new tax regime?',
  'How do I build a 6-month emergency fund?',
  'What is a good asset allocation for my age?',
  'How much term insurance do I need?',
];

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Namaste! 🙏 I'm your AI Money Mentor. Ask me anything about investing, tax planning, insurance, retirement, or any financial topic.\n\nI'm specialised in Indian personal finance — SEBI regulations, Indian tax laws, SIPs, EPF, NPS, and more. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const ctrlRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role:'user', content:msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    // Placeholder for assistant streaming
    setMessages(prev => [...prev, { role:'assistant', content:'', streaming:true }]);

    const apiMessages = newHistory
      .filter(m => !m.streaming)
      .map(m => ({ role:m.role, content:m.content }));

    ctrlRef.current?.abort();
    ctrlRef.current = streamToolV2('/ai/chat', { messages: apiMessages }, {
      onChunk: (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.streaming) updated[updated.length - 1] = { ...last, content: last.content + chunk };
          return updated;
        });
      },
      onDone: () => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.streaming) updated[updated.length - 1] = { ...last, streaming:false };
          return updated;
        });
        setLoading(false);
      },
      onError: (err) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role:'assistant', content:`Sorry, something went wrong: ${err.message}` };
          return updated;
        });
        setLoading(false);
      },
    });
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, marginBottom:6 }}>💬 AI Financial Advisor</h1>
        <p style={{ color:'var(--muted)', fontSize:15 }}>Ask anything about money, investing, tax, or financial planning</p>
      </div>

      <Card style={{ padding:0, overflow:'hidden', display:'flex', flexDirection:'column', height:'65vh' }}>
        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--rust))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, marginRight:10, marginTop:4 }}>💰</div>
              )}
              <div style={{
                maxWidth:'78%', padding:'12px 16px',
                borderRadius: m.role==='user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role==='user' ? 'var(--ink)' : 'white',
                border: m.role==='assistant' ? '1px solid var(--border)' : 'none',
                color: m.role==='user' ? 'var(--paper)' : 'var(--ink)',
                fontSize:14, lineHeight:1.7,
              }}>
                {m.content
                  ? m.content.split('\n').map((line, j) => (
                      <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br/>}</span>
                    ))
                  : m.streaming && <Spinner size={18} />
                }
                {m.streaming && m.content && (
                  <span style={{ display:'inline-block', width:7, height:14, background:'var(--gold)', animation:'pulse 1s infinite', marginLeft:2, verticalAlign:'middle' }} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Starters (only when 1 message) */}
        {messages.length === 1 && (
          <div style={{ padding:'0 16px 12px', display:'flex', flexWrap:'wrap', gap:8 }}>
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ padding:'7px 14px', background:'var(--gold-dim)', border:'1px solid rgba(201,168,76,.3)', borderRadius:20, fontSize:12, cursor:'pointer', color:'var(--ink)', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                onMouseEnter={e=>e.target.style.background='rgba(201,168,76,.25)'}
                onMouseLeave={e=>e.target.style.background='var(--gold-dim)'}
              >{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ borderTop:'1px solid var(--border)', padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-end' }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask about SIPs, tax planning, insurance, retirement…"
            rows={1} style={{
              flex:1, padding:'10px 14px', border:'1.5px solid var(--border)',
              borderRadius:20, fontFamily:"'DM Sans',sans-serif", fontSize:14,
              outline:'none', resize:'none', background:'white', lineHeight:1.5,
              transition:'border-color .2s', maxHeight:100, overflowY:'auto',
            }}
            onFocus={e=>e.target.style.borderColor='var(--gold)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{
              width:40, height:40, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,var(--gold),var(--rust))', color:'white',
              fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, transition:'all .2s',
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >→</button>
        </div>
      </Card>

      <div style={{ marginTop:12, fontSize:12, color:'var(--muted)', textAlign:'center' }}>
        AI advice is for informational purposes only. Consult a SEBI-registered advisor for personalised guidance.
      </div>
    </div>
  );
}
