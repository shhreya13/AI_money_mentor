// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Badge } from '../components/UI.jsx';

const TOOLS = [
  { path:'/fire',   icon:'🔥', title:'FIRE Path Planner',        desc:'Month-by-month roadmap to retire early with SIP amounts, asset allocation, and insurance gaps.', tag:'Most Popular', tagColor:'var(--rust)', tagBg:'rgba(184,76,42,.1)', accent:'var(--rust)' },
  { path:'/score',  icon:'📊', title:'Money Health Score',        desc:'5-minute quiz → comprehensive wellness score across 6 financial dimensions.', tag:'Start Here', tagColor:'#8a6a20', tagBg:'rgba(201,168,76,.12)', accent:'var(--gold)' },
  { path:'/life',   icon:'🎯', title:'Life Event Advisor',        desc:'Bonus, inheritance, marriage, new baby — AI advice customised to your tax bracket.', tag:'Event-Driven', tagColor:'var(--forest)', tagBg:'rgba(42,92,69,.1)', accent:'var(--forest)' },
  { path:'/tax',    icon:'🧾', title:'Tax Wizard',                desc:'Every deduction you\'re missing. Old vs new regime modelled with your exact numbers.', tag:'Save Tax', tagColor:'var(--sky)', tagBg:'rgba(42,74,107,.1)', accent:'var(--sky)' },
  { path:'/couple', icon:'💑', title:"Couple's Money Planner",   desc:'India\'s first AI joint planning tool — HRA, NPS, SIP splits, insurance optimised across both incomes.', tag:'New', tagColor:'var(--purple)', tagBg:'rgba(92,61,143,.1)', accent:'var(--purple)' },
  { path:'/xray',   icon:'🔬', title:'MF Portfolio X-Ray',        desc:'Paste CAMS statement → true XIRR, overlap, expense drag, benchmark comparison, rebalancing plan.', tag:'Deep Analysis', tagColor:'var(--teal)', tagBg:'rgba(20,114,110,.1)', accent:'var(--teal)' },
];

const STATS = [
  { num:'95%',  label:'Indians without a financial plan', color:'var(--gold)' },
  { num:'₹25K+',label:'Cost of a human advisor per year', color:'var(--rust)' },
  { num:'₹0',   label:'Cost of your AI money mentor',     color:'var(--forest)' },
  { num:'6',    label:'Specialised AI tools for every need',color:'var(--sky)' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div>
      {/* ── Hero ── */}
      <div style={{
        maxWidth:1200, margin:'0 auto', padding:'64px 28px 48px',
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center',
      }}>
        <div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.3)',
            borderRadius:20, padding:'5px 14px', marginBottom:20,
            fontFamily:"'Syne',sans-serif", fontSize:11, fontWeight:700,
            letterSpacing:'0.1em', color:'var(--gold)', textTransform:'uppercase',
          }}>✦ Powered by Claude AI · Built for India</div>

          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(36px,5vw,54px)', lineHeight:1.1, marginBottom:20 }}>
            Your <em style={{ fontStyle:'italic', color:'var(--gold)' }}>personal CFO</em>,<br/>available 24 × 7 — free
          </h1>
          <p style={{ fontSize:17, lineHeight:1.7, color:'var(--muted)', marginBottom:32, maxWidth:480 }}>
            95% of Indians have no financial plan. Professional advisors charge ₹25,000+/year. We give you the same quality guidance — free, instant, built for India.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={() => navigate('/score')} style={{
              background:'linear-gradient(135deg,var(--ink),#2a2520)', color:'var(--paper)',
              border:'none', padding:'14px 28px', borderRadius:40,
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
              cursor:'pointer', boxShadow:'0 4px 20px rgba(15,14,12,.2)',
              transition:'all .25s',
            }}
              onMouseEnter={e=>{e.target.style.transform='translateY(-2px)';e.target.style.boxShadow='0 8px 32px rgba(15,14,12,.25)'}}
              onMouseLeave={e=>{e.target.style.transform='none';e.target.style.boxShadow='0 4px 20px rgba(15,14,12,.2)'}}
            >Get My Money Score →</button>
            <button onClick={() => navigate('/fire')} style={{
              background:'transparent', color:'var(--ink)',
              border:'1.5px solid var(--border)', padding:'13px 24px', borderRadius:40,
              fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, cursor:'pointer',
              transition:'all .2s',
            }}
              onMouseEnter={e=>{e.target.style.borderColor='var(--ink)'}}
              onMouseLeave={e=>{e.target.style.borderColor='var(--border)'}}
            >Plan My FIRE Path</button>
          </div>
          {user && <p style={{ marginTop:16, fontSize:13, color:'var(--muted)' }}>Welcome back, <strong style={{ color:'var(--ink)' }}>{user.name}</strong> 👋</p>}
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background:'var(--card)', border:'1px solid var(--border)',
              borderRadius:'var(--radius)', padding:24, boxShadow:'var(--shadow)',
              marginTop: i % 2 === 1 ? 24 : 0,
              transition:'transform .2s',
            }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}
            >
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, color:s.color, lineHeight:1, marginBottom:6 }}>{s.num}</div>
              <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tool Grid ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px 40px' }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, marginBottom:6 }}>Your Financial Toolkit</h2>
        <p style={{ color:'var(--muted)', fontSize:15, marginBottom:28 }}>Six AI tools covering every dimension of your financial life</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {TOOLS.map(tool => (
            <div key={tool.path} onClick={() => navigate(tool.path)}
              style={{
                background:'var(--card)', border:'1px solid var(--border)',
                borderRadius:'var(--radius)', padding:28, cursor:'pointer',
                transition:'all .25s', position:'relative', overflow:'hidden',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';e.currentTarget.style.borderColor=tool.accent}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='var(--border)'}}
            >
              <div style={{ fontSize:32, marginBottom:14 }}>{tool.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:8 }}>{tool.title}</div>
              <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:14 }}>{tool.desc}</div>
              <span style={{ background:tool.tagBg, color:tool.tagColor, fontSize:11, fontFamily:"'Syne',sans-serif", fontWeight:700, padding:'3px 10px', borderRadius:20 }}>{tool.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px 64px' }}>
        <div style={{
          background:'linear-gradient(135deg,var(--ink) 0%,#2a2520 100%)',
          borderRadius:24, padding:'44px 40px',
          display:'grid', gridTemplateColumns:'1fr auto', gap:32, alignItems:'center',
        }}>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:'var(--paper)', marginBottom:10 }}>
              Stop losing money to missed deductions, wrong insurance, and delayed investing.
            </div>
            <div style={{ color:'rgba(245,240,232,.55)', fontSize:15 }}>
              Start with your free Money Health Score — 5 minutes, complete picture.
            </div>
          </div>
          <button onClick={() => navigate('/score')} style={{
            background:'linear-gradient(135deg,var(--gold),var(--rust))', color:'white',
            border:'none', padding:'15px 30px', borderRadius:40, cursor:'pointer',
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, whiteSpace:'nowrap',
            boxShadow:'0 4px 20px rgba(201,168,76,.35)', transition:'all .2s',
          }}>Start Free →</button>
        </div>
      </div>
    </div>
  );
}
