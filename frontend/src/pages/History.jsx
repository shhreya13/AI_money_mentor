// src/pages/History.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { BackButton, Card, LoadingState } from '../components/UI.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const TOOL_META = {
  fire:   { icon:'🔥', label:'FIRE Plan',         color:'var(--rust)'   },
  score:  { icon:'📊', label:'Health Score',       color:'var(--gold)'   },
  life:   { icon:'🎯', label:'Life Event',         color:'var(--forest)' },
  tax:    { icon:'🧾', label:'Tax Wizard',         color:'var(--sky)'    },
  couple: { icon:'💑', label:"Couple's Plan",      color:'var(--purple)' },
  xray:   { icon:'🔬', label:'MF X-Ray',           color:'var(--teal)'   },
  chat:   { icon:'💬', label:'Chat',               color:'var(--muted)'  },
};

function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/ai/history').then(d => setSessions(d.rows || [])).finally(() => setLoading(false));
  }, [user]);

  async function loadDetail(id) {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    setSelected(id);
    const d = await api.get(`/ai/history/${id}`);
    setDetail(d);
  }

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, marginBottom:8 }}>📋 Your History</h1>
      <p style={{ color:'var(--muted)', fontSize:15, marginBottom:28 }}>All your past AI analyses and conversations</p>

      {loading && <LoadingState message="Loading your history…" />}

      {!loading && sessions.length === 0 && (
        <Card style={{ textAlign:'center', padding:48 }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🌱</div>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, marginBottom:8 }}>No history yet</div>
          <div style={{ color:'var(--muted)', marginBottom:20 }}>Run your first analysis to see results here</div>
          <Link to="/score" style={{ background:'linear-gradient(135deg,var(--gold),var(--rust))', color:'white', padding:'12px 24px', borderRadius:40, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, textDecoration:'none' }}>Get My Money Score →</Link>
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {sessions.map(s => {
          const meta = TOOL_META[s.tool] || { icon:'🤖', label:s.tool, color:'var(--muted)' };
          const isOpen = selected === s.id;
          return (
            <div key={s.id}>
              <Card onClick={() => loadDetail(s.id)}
                style={{ cursor:'pointer', transition:'all .2s', borderColor:isOpen?meta.color:'var(--border)' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-lg)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow)'}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ fontSize:24 }}>{meta.icon}</div>
                    <div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:meta.color }}>{meta.label}</div>
                      <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{fmtDate(s.created_at)}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:18, color:'var(--muted)', transition:'transform .2s', transform:isOpen?'rotate(180deg)':'none' }}>⌄</span>
                </div>
              </Card>

              {isOpen && detail && (
                <Card style={{ marginTop:4, borderTop:'none', borderRadius:'0 0 var(--radius) var(--radius)', background:'var(--cream)', animation:'fadeUp 0.2s ease' }}>
                  {detail.result_text ? (
                    <div style={{ fontSize:13, lineHeight:1.8, color:'var(--ink)', whiteSpace:'pre-wrap', maxHeight:400, overflowY:'auto' }}>
                      {detail.result_text}
                    </div>
                  ) : (
                    <div style={{ color:'var(--muted)', fontSize:13 }}>No result stored for this session.</div>
                  )}
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
