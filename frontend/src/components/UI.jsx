// src/components/UI.jsx  – shared design system components

import { useState } from 'react';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 36, color = 'var(--gold)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid var(--border)`,
      borderTopColor: color,
      animation: 'spin 0.75s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── LoadingState ──────────────────────────────────────────────────────────────
export function LoadingState({ message = 'Your AI mentor is analysing…' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'64px 20px' }}>
      <Spinner size={44} />
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:15, color:'var(--ink)', fontWeight:500 }}>{message}</div>
        <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>Powered by Claude AI</div>
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant='primary', onClick, disabled, style={}, type='button', fullWidth }) {
  const base = {
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14,
    borderRadius: 40, padding: '13px 28px', transition: 'all 0.22s',
    opacity: disabled ? 0.55 : 1, letterSpacing: '0.03em',
    width: fullWidth ? '100%' : undefined, ...style,
  };
  const variants = {
    primary:  { background: 'linear-gradient(135deg,var(--ink) 0%,#2a2520 100%)', color:'var(--paper)', boxShadow:'0 4px 20px rgba(15,14,12,.18)' },
    gold:     { background: 'linear-gradient(135deg,var(--gold),var(--rust))', color:'white', boxShadow:'0 4px 20px rgba(201,168,76,.3)' },
    ghost:    { background: 'transparent', color:'var(--ink)', border:'1.5px solid var(--border)' },
    danger:   { background: 'var(--rust)', color:'white' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, prefix, type='text', value, onChange, placeholder, name, required }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{label}{required && <span style={{color:'var(--rust)'}}> *</span>}</label>}
      <div style={{ position:'relative' }}>
        {prefix && <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--muted)', fontWeight:500, pointerEvents:'none' }}>{prefix}</span>}
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          style={{
            width:'100%', padding: prefix ? '11px 14px 11px 28px' : '11px 14px',
            border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)',
            background:'white', fontSize:14, color:'var(--ink)', outline:'none',
            transition:'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, name }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{label}</label>}
      <select name={name} value={value} onChange={onChange} style={{
        padding:'11px 14px', border:'1.5px solid var(--border)',
        borderRadius:'var(--radius-sm)', background:'white',
        fontSize:14, color:'var(--ink)', outline:'none',
      }}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

// ─── FormGrid ─────────────────────────────────────────────────────────────────
export function FormGrid({ children, cols = 2 }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }}>{children}</div>;
}

export function FormFull({ children }) {
  return <div style={{ gridColumn:'1/-1' }}>{children}</div>;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style={}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:'var(--radius)', padding:28,
      boxShadow:'var(--shadow)', ...style,
      cursor: onClick ? 'pointer' : undefined,
    }}>
      {children}
    </div>
  );
}

// ─── SectionTitle (inside form card) ─────────────────────────────────────────
export function SectionLabel({ children, color='var(--gold)' }) {
  return (
    <div style={{
      fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:12,
      letterSpacing:'0.08em', textTransform:'uppercase', color,
      marginBottom:18, display:'flex', alignItems:'center', gap:8,
    }}>
      <span>◆</span> {children}
    </div>
  );
}

// ─── BackButton ───────────────────────────────────────────────────────────────
export function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:8, background:'none', border:'none',
      cursor:'pointer', color:'var(--muted)', fontSize:14, marginBottom:20,
      padding:0, fontFamily:"'DM Sans',sans-serif", transition:'color 0.2s',
    }}
      onMouseEnter={e=>e.currentTarget.style.color='var(--ink)'}
      onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}
    >
      ← Back to Dashboard
    </button>
  );
}

// ─── ToolHeader ───────────────────────────────────────────────────────────────
export function ToolHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ fontSize:40, marginBottom:10 }}>{icon}</div>
      <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, marginBottom:8 }}>{title}</h1>
      <p style={{ color:'var(--muted)', fontSize:15 }}>{subtitle}</p>
    </div>
  );
}

// ─── ResultBlock – parses AI markdown into styled sections ───────────────────
export function ResultBlock({ text }) {
  if (!text) return null;
  const sections = text.split(/\n(?=#{1,3} )/);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {sections.map((sec, i) => {
        const lines = sec.trim().split('\n');
        const heading = lines[0].replace(/^#{1,3}\s*/, '');
        const body = lines.slice(1).join('\n').trim();
        return (
          <Card key={i} style={{ animationDelay:`${i*0.07}s`, animation:'fadeUp 0.4s ease both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold),var(--rust))', flexShrink:0 }} />
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, letterSpacing:'0.05em', textTransform:'uppercase' }}>{heading}</div>
            </div>
            <div style={{ fontSize:14, lineHeight:1.8, color:'#3a3630' }}>
              {body.split('\n').map((line, j) => {
                if (!line.trim()) return <br key={j} />;
                if (line.match(/^[-•]\s/)) return (
                  <div key={j} style={{ display:'flex', gap:8, marginBottom:7 }}>
                    <span style={{ color:'var(--gold)', flexShrink:0, fontSize:10, marginTop:5 }}>◆</span>
                    <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-•]\s*/,'').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }} />
                  </div>
                );
                if (line.startsWith('>')) return (
                  <div key={j} style={{ background:'rgba(201,168,76,.1)', borderLeft:'3px solid var(--gold)', padding:'10px 14px', borderRadius:'0 8px 8px 0', margin:'10px 0', fontSize:13 }}
                    dangerouslySetInnerHTML={{ __html: line.slice(1).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }} />
                );
                return <p key={j} style={{ marginBottom:7 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }} />;
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── StreamingIndicator ───────────────────────────────────────────────────────
export function StreamingIndicator() {
  return (
    <span style={{ display:'inline-flex', gap:3, alignItems:'center', marginLeft:4 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:4, height:4, borderRadius:'50%', background:'var(--gold)',
          animation:`pulse 1.2s ease ${i*0.2}s infinite`,
        }} />
      ))}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type='success', onClose }) {
  if (!message) return null;
  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:9999,
      background: type==='error' ? 'var(--rust)' : 'var(--forest)',
      color:'white', padding:'12px 20px', borderRadius:12,
      fontSize:14, fontWeight:500, boxShadow:'var(--shadow-lg)',
      animation:'fadeUp 0.3s ease', display:'flex', alignItems:'center', gap:12,
    }}>
      <span>{type === 'error' ? '⚠️' : '✓'} {message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:16, padding:0 }}>×</button>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = 'var(--gold)', height = 6 }) {
  return (
    <div style={{ height, background:'var(--border)', borderRadius:height, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,value)}%`, background:color, borderRadius:height, transition:'width 1s ease' }} />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color='var(--gold)', bg='var(--gold-dim)' }) {
  return (
    <span style={{
      background:bg, color, fontSize:11, fontFamily:"'Syne',sans-serif",
      fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:'0.04em',
    }}>
      {children}
    </span>
  );
}
