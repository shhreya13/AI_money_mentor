// src/pages/Tools.jsx  –  Life Event | Tax Wizard | Couple | MF X-Ray
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStream } from '../hooks/useStream.js';
import { api } from '../utils/api.js';
import { BackButton, ToolHeader, Card, SectionLabel, Input, Select, FormGrid, FormFull, Button, ResultBlock, LoadingState } from '../components/UI.jsx';

// ─── Shared result wrapper ────────────────────────────────────────────────────
function StreamResult({ text, loading, error, onReset }) {
  if (!loading && !text && !error) return null;
  return (
    <div style={{ marginTop:24 }}>
      {loading && <LoadingState />}
      {!loading && text && (
        <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22 }}>AI Analysis</h3>
            <button onClick={onReset} style={{ background:'none', border:'1px solid var(--border)', borderRadius:20, padding:'5px 14px', fontSize:12, cursor:'pointer', color:'var(--muted)' }}>Reset</button>
          </div>
          <ResultBlock text={text} />
        </>
      )}
      {error && <div style={{ padding:14, background:'rgba(184,76,42,.1)', borderRadius:10, color:'var(--rust)', fontSize:14 }}>⚠️ {error}</div>}
    </div>
  );
}

// ─── LIFE EVENT ───────────────────────────────────────────────────────────────
const EVENTS = [
  { id:'bonus',       label:'💰 Annual Bonus' },
  { id:'inheritance', label:'🏠 Inheritance' },
  { id:'marriage',    label:'💍 Getting Married' },
  { id:'baby',        label:'👶 New Baby' },
  { id:'job',         label:'🚀 New Job / Hike' },
  { id:'property',    label:'🏗️ Selling Property' },
];

export function LifeEvent() {
  const navigate = useNavigate();
  const { text, loading, error, run, reset } = useStream('/ai/life');
  const [form, setForm] = useState({ event:'bonus', amount:'500000', income:'150000', bracket:'30%', risk:'moderate', existingInvestments:'1000000', detail:'' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="🎯" title="Life Event Advisor" subtitle="Smart financial moves for every major milestone" />

      <Card style={{ marginBottom:20 }}>
        <SectionLabel>Select Your Life Event</SectionLabel>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
          {EVENTS.map(ev => (
            <button key={ev.id} onClick={() => setForm(f => ({...f, event:ev.id}))}
              style={{ padding:'12px 8px', border:`1.5px solid ${form.event===ev.id?'var(--gold)':'var(--border)'}`,
                borderRadius:10, background:form.event===ev.id?'var(--gold-dim)':'white',
                cursor:'pointer', fontSize:13, fontFamily:"'DM Sans',sans-serif",
                fontWeight:form.event===ev.id?600:400, transition:'all .2s', textAlign:'center' }}>
              {ev.label}
            </button>
          ))}
        </div>

        <SectionLabel>Your Financial Details</SectionLabel>
        <FormGrid>
          <Input label="Amount Involved (₹)" prefix="₹" type="number" value={form.amount} onChange={set('amount')} />
          <Input label="Monthly Income (₹)" prefix="₹" type="number" value={form.income} onChange={set('income')} />
          <Select label="Tax Bracket" value={form.bracket} onChange={set('bracket')} options={['5%','10%','15%','20%','25%','30%']} />
          <Select label="Risk Appetite" value={form.risk} onChange={set('risk')} options={[{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'aggressive',label:'Aggressive'}]} />
          <Input label="Existing Investments (₹)" prefix="₹" type="number" value={form.existingInvestments} onChange={set('existingInvestments')} />
          <FormFull><Input label="Additional Context (optional)" value={form.detail} onChange={set('detail')} placeholder="Existing home loan, planning to buy house, etc." /></FormFull>
        </FormGrid>
        <Button variant="gold" onClick={() => run(form)} disabled={loading} fullWidth style={{ marginTop:16 }}>
          {loading ? 'Crafting Your Plan…' : 'Get My Action Plan →'}
        </Button>
      </Card>

      <StreamResult text={text} loading={loading} error={error} onReset={reset} />
    </div>
  );
}

// ─── TAX WIZARD ───────────────────────────────────────────────────────────────
export function TaxWizard() {
  const navigate = useNavigate();
  const { text, loading, error, run, reset } = useStream('/ai/tax');
  const fileRef = useRef();
  const [form, setForm] = useState({ ctc:'1800000', basic:'720000', hra:'360000', lta:'50000', pf:'86400', other:'0', rent:'30000', city:'metro', existing80c:'0' });
  const [uploading, setUploading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/upload/form16', { method:'POST', headers: token ? { Authorization:`Bearer ${token}` } : {}, body:fd });
      const data = await res.json();
      if (data.extracted) {
        const e = data.extracted;
        setForm(f => ({
          ...f,
          ctc:   e.grossSalary  || f.ctc,
          basic: e.basicSalary  || f.basic,
          hra:   e.hra          || f.hra,
        }));
      }
    } catch { alert('Could not parse PDF — please fill in manually.'); }
    finally { setUploading(false); }
  }

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="🧾" title="Tax Wizard" subtitle="Every rupee saved in tax is a rupee earned" />

      <Card style={{ marginBottom:20 }}>
        {/* PDF Upload */}
        <div style={{ background:'rgba(42,74,107,.05)', border:'1.5px dashed rgba(42,74,107,.3)', borderRadius:12, padding:'16px 20px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>📎 Upload Form 16 PDF</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>Auto-fill salary details from your Form 16</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handlePdfUpload} style={{ display:'none' }} />
          <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ fontSize:13, padding:'8px 18px' }}>
            {uploading ? 'Parsing…' : 'Upload PDF'}
          </Button>
        </div>

        <SectionLabel>Salary Structure (Annual)</SectionLabel>
        <FormGrid>
          <Input label="Total CTC (₹)" prefix="₹" type="number" value={form.ctc} onChange={set('ctc')} />
          <Input label="Basic Salary (₹)" prefix="₹" type="number" value={form.basic} onChange={set('basic')} />
          <Input label="HRA Component (₹)" prefix="₹" type="number" value={form.hra} onChange={set('hra')} />
          <Input label="LTA (₹)" prefix="₹" type="number" value={form.lta} onChange={set('lta')} />
          <Input label="PF (Employee + Employer) (₹)" prefix="₹" type="number" value={form.pf} onChange={set('pf')} />
          <Input label="Other Allowances (₹)" prefix="₹" type="number" value={form.other} onChange={set('other')} />
          <Input label="Monthly Rent Paid (₹)" prefix="₹" type="number" value={form.rent} onChange={set('rent')} />
          <Select label="City Type" value={form.city} onChange={set('city')} options={[{value:'metro',label:'Metro (Mumbai/Delhi/Kolkata/Chennai)'},{value:'non-metro',label:'Non-Metro'}]} />
          <Input label="Existing 80C Investments (₹)" prefix="₹" type="number" value={form.existing80c} onChange={set('existing80c')} />
        </FormGrid>

        <Button variant="gold" onClick={() => run(form)} disabled={loading} fullWidth style={{ marginTop:16 }}>
          {loading ? 'Crunching Numbers…' : 'Find My Tax Savings →'}
        </Button>
      </Card>

      <StreamResult text={text} loading={loading} error={error} onReset={reset} />
    </div>
  );
}

// ─── COUPLE PLANNER ───────────────────────────────────────────────────────────
export function CouplePlanner() {
  const navigate = useNavigate();
  const { text, loading, error, run, reset } = useStream('/ai/couple');
  const [form, setForm] = useState({
    p1name:'Partner 1', p1income:'150000', p1tax:'30%',
    p2name:'Partner 2', p2income:'90000',  p2tax:'20%',
    combined_sav:'1500000', joint_goal:'Buy 2BHK in Bangalore for ₹1.2Cr in 5 years',
    loans:'Home loan EMI ₹45,000/month',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="💑" title="Couple's Money Planner" subtitle="Two incomes, one beautifully optimised plan" />

      <Card style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:20 }}>
          {[['p1','var(--forest)'],['p2','var(--sky)']].map(([p, color], pi) => (
            <div key={p}>
              <SectionLabel color={color}>{pi===0?'Partner 1':'Partner 2'}</SectionLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <Input label="Name" value={form[`${p}name`]} onChange={set(`${p}name`)} />
                <Input label="Monthly Income (₹)" prefix="₹" type="number" value={form[`${p}income`]} onChange={set(`${p}income`)} />
                <Select label="Tax Bracket" value={form[`${p}tax`]} onChange={set(`${p}tax`)} options={['5%','10%','15%','20%','25%','30%']} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:20 }}>
          <SectionLabel>Joint Goals</SectionLabel>
          <FormGrid>
            <Input label="Combined Savings (₹)" prefix="₹" type="number" value={form.combined_sav} onChange={set('combined_sav')} />
            <Input label="Existing Loans / EMIs" value={form.loans} onChange={set('loans')} />
            <FormFull><Input label="Primary Joint Goal" value={form.joint_goal} onChange={set('joint_goal')} /></FormFull>
          </FormGrid>
        </div>

        {form.p1income && form.p2income && (
          <div style={{ marginTop:14, padding:'12px 16px', background:'var(--gold-dim)', borderRadius:10, fontSize:13, display:'flex', gap:24 }}>
            <span>💰 Combined income: <strong>₹{(+form.p1income + +form.p2income).toLocaleString('en-IN')}/month</strong></span>
            <span>📊 Income split: <strong>{Math.round((+form.p1income/(+form.p1income+ +form.p2income))*100)}% / {Math.round((+form.p2income/(+form.p1income+ +form.p2income))*100)}%</strong></span>
          </div>
        )}

        <Button variant="gold" onClick={() => run(form)} disabled={loading} fullWidth style={{ marginTop:16 }}>
          {loading ? 'Optimising Your Plan…' : 'Build Our Joint Plan →'}
        </Button>
      </Card>

      <StreamResult text={text} loading={loading} error={error} onReset={reset} />
    </div>
  );
}

// ─── MF X-RAY ─────────────────────────────────────────────────────────────────
const SAMPLE = `Axis Bluechip Fund - Growth: ₹2,50,000 (Invested ₹1,80,000, 3 years ago)
Mirae Asset Large Cap - Growth: ₹1,20,000 (Invested ₹1,00,000, 2 years ago)
SBI Small Cap Fund: ₹80,000 (Invested ₹50,000, 4 years ago)
Parag Parikh Flexi Cap: ₹1,50,000 (Invested ₹1,20,000, 2.5 years ago)
HDFC Mid-Cap Opportunities: ₹60,000 (Invested ₹55,000, 1 year ago)`;

export function MFXray() {
  const navigate = useNavigate();
  const { text, loading, error, run, reset } = useStream('/ai/xray');
  const [portfolioText, setPortfolioText] = useState(SAMPLE);
  const [context, setContext] = useState('');
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  async function handleCamsUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/upload/cams', { method:'POST', headers: token ? {Authorization:`Bearer ${token}`} : {}, body:fd });
      const data = await res.json();
      if (data.portfolioText) setPortfolioText(data.portfolioText);
    } catch { alert('Could not parse PDF. Please paste text manually.'); }
    finally { setUploading(false); }
  }

  const totalInvested = portfolioText.match(/Invested ₹([\d,]+)/g)?.reduce((s,m) => s + parseInt(m.replace(/[^\d]/g,'')), 0) || 0;
  const totalCurrent = portfolioText.match(/₹([\d,]+)\s*\(/g)?.reduce((s,m) => s + parseInt(m.replace(/[^\d]/g,'')), 0) || 0;

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="🔬" title="MF Portfolio X-Ray" subtitle="Deep-dive analysis in under 10 seconds" />

      <Card style={{ marginBottom:20 }}>
        {/* PDF Upload */}
        <div style={{ background:'rgba(20,114,110,.05)', border:'1.5px dashed rgba(20,114,110,.3)', borderRadius:12, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>📎 Upload CAMS / KFintech PDF Statement</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>Auto-extract your portfolio in seconds</div>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleCamsUpload} style={{ display:'none' }} />
          <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ fontSize:13, padding:'8px 18px' }}>
            {uploading ? 'Parsing…' : 'Upload PDF'}
          </Button>
        </div>

        <SectionLabel color="var(--teal)">Or Paste Your Portfolio</SectionLabel>
        <textarea value={portfolioText} onChange={e => setPortfolioText(e.target.value)}
          style={{ width:'100%', minHeight:160, padding:'12px 14px', border:'1.5px solid var(--border)',
            borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:'none',
            resize:'vertical', background:'white', color:'var(--ink)', lineHeight:1.7 }}
          placeholder="Fund Name: ₹current_value (Invested ₹amount, X years ago)" />
        <div style={{ fontSize:12, color:'var(--muted)', marginTop:6 }}>
          💡 Format: <code>Fund Name: ₹current_value (Invested ₹amount, X years ago)</code> — one fund per line
        </div>

        <Input label="Additional Context (risk tolerance, goals, etc.)" value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. 10-year horizon, planning to add ₹20K/month SIP" style={{ marginTop:14 }} />

        {totalInvested > 0 && (
          <div style={{ marginTop:14, padding:'12px 16px', background:'rgba(20,114,110,.08)', borderRadius:10, fontSize:13, display:'flex', gap:24 }}>
            <span>💰 Total invested: <strong>₹{totalInvested.toLocaleString('en-IN')}</strong></span>
            {totalCurrent > 0 && <span>📈 Rough gain: <strong style={{ color:totalCurrent>totalInvested?'var(--forest)':'var(--rust)' }}>{totalCurrent>totalInvested?'+':''}{Math.round(((totalCurrent-totalInvested)/totalInvested)*100)}%</strong></span>}
          </div>
        )}

        <Button variant="gold" onClick={() => run({ portfolioText, context })} disabled={loading || !portfolioText} fullWidth style={{ marginTop:16 }}>
          {loading ? 'Analysing Portfolio…' : 'Run X-Ray Analysis →'}
        </Button>
      </Card>

      <StreamResult text={text} loading={loading} error={error} onReset={reset} />
    </div>
  );
}
