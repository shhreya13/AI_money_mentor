// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useState } from 'react';

const TABS = [
  { path: '/',        label: 'Dashboard' },
  { path: '/fire',    label: '🔥 FIRE' },
  { path: '/score',   label: '📊 Score' },
  { path: '/tax',     label: '🧾 Tax' },
  { path: '/life',    label: '🎯 Life Events' },
  { path: '/couple',  label: '💑 Couple' },
  { path: '/xray',    label: '🔬 MF X-Ray' },
  { path: '/chat',    label: '💬 Chat' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <nav style={{
      position:'sticky', top:0, zIndex:100,
      background:'rgba(245,240,232,0.93)', backdropFilter:'blur(14px)',
      borderBottom:'1px solid var(--border)',
      padding:'0 24px', height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'var(--ink)' }}>
          AI <span style={{ background:'linear-gradient(135deg,var(--gold),var(--rust))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Money</span> Mentor
        </span>
        <span style={{ background:'linear-gradient(135deg,var(--gold),var(--rust))', color:'white', fontSize:10, fontFamily:"'Syne',sans-serif", fontWeight:700, padding:'2px 8px', borderRadius:20, letterSpacing:'0.06em' }}>ET</span>
      </Link>

      {/* Center tabs – desktop */}
      <div style={{ display:'flex', gap:2, background:'var(--cream)', borderRadius:40, padding:4, border:'1px solid var(--border)', overflow:'hidden' }}>
        {TABS.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <Link key={tab.path} to={tab.path} style={{
              padding:'6px 14px', borderRadius:40,
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--paper)' : 'var(--muted)',
              fontSize:13, fontWeight: active ? 600 : 400,
              fontFamily:"'DM Sans',sans-serif",
              textDecoration:'none', whiteSpace:'nowrap',
              transition:'all 0.2s',
            }}>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Right: auth */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {user ? (
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--cream)', border:'1px solid var(--border)',
              borderRadius:40, padding:'6px 14px 6px 8px', cursor:'pointer',
            }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--rust))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:13, fontWeight:500 }}>{user.name?.split(' ')[0]}</span>
              <span style={{ fontSize:10, color:'var(--muted)' }}>▾</span>
            </button>
            {showMenu && (
              <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow-lg)', minWidth:160, overflow:'hidden', zIndex:200 }}>
                <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--muted)' }}>{user.email}</div>
                <Link to="/history" onClick={() => setShowMenu(false)} style={{ display:'block', padding:'10px 16px', fontSize:14, color:'var(--ink)', textDecoration:'none' }}>📋 My History</Link>
                <button onClick={handleLogout} style={{ width:'100%', textAlign:'left', padding:'10px 16px', fontSize:14, color:'var(--rust)', background:'none', border:'none', cursor:'pointer' }}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={{ fontSize:14, color:'var(--muted)', fontWeight:500 }}>Sign In</Link>
            <Link to="/register" style={{ background:'var(--ink)', color:'var(--paper)', padding:'8px 18px', borderRadius:40, fontSize:13, fontFamily:"'Syne',sans-serif", fontWeight:700, textDecoration:'none' }}>Sign Up Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}
