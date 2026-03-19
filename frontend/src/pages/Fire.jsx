// src/pages/Fire.jsx
import { useState } from 'react';
import { useStream } from '../hooks/useStream.js';
import { BackButton, ToolHeader, Card, SectionLabel, Input, Select, FormGrid, FormFull, Button, ResultBlock, LoadingState } from '../components/UI.jsx';
import { useNavigate } from 'react-router-dom';

export default function Fire() {
  const navigate = useNavigate();
  const { text, loading, error, run, reset } = useStream('/ai/fire');

  const [form, setForm] = useState({
    age: '28', retireAge: '45',
    income: '120000', expenses: '70000', savings: '500000',
    risk: 'moderate',
    goals: 'Buy 2BHK in Bangalore at 35 for ₹1.2Cr, fund child education at 45, travel post-retirement',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    run(form);
  }

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="🔥" title="FIRE Path Planner" subtitle="Your personalised month-by-month roadmap to financial independence" />

      <form onSubmit={submit}>
        <Card style={{ marginBottom:20 }}>
          <SectionLabel>Your Profile</SectionLabel>
          <FormGrid>
            <Input label="Current Age" type="number" value={form.age} onChange={set('age')} placeholder="28" required />
            <Input label="Target Retirement Age" type="number" value={form.retireAge} onChange={set('retireAge')} placeholder="45" required />
            <Input label="Monthly Income" prefix="₹" type="number" value={form.income} onChange={set('income')} placeholder="120000" required />
            <Input label="Monthly Expenses" prefix="₹" type="number" value={form.expenses} onChange={set('expenses')} placeholder="70000" required />
            <Input label="Total Existing Corpus" prefix="₹" type="number" value={form.savings} onChange={set('savings')} placeholder="500000" required />
            <Select label="Risk Appetite" value={form.risk} onChange={set('risk')}
              options={[{value:'conservative',label:'Conservative'},{value:'moderate',label:'Moderate'},{value:'aggressive',label:'Aggressive'}]} />
            <FormFull>
              <Input label="Life Goals (describe freely)" value={form.goals} onChange={set('goals')} placeholder="Buy home at 35, child education fund, world travel…" />
            </FormFull>
          </FormGrid>

          {/* Live preview */}
          {form.income && form.expenses && (
            <div style={{ marginTop:16, padding:'12px 16px', background:'var(--gold-dim)', borderRadius:10, fontSize:13, display:'flex', gap:24 }}>
              <span>💰 Monthly surplus: <strong>₹{(+form.income - +form.expenses).toLocaleString('en-IN')}</strong></span>
              <span>📅 Years to retirement: <strong>{+form.retireAge - +form.age}</strong></span>
              <span>📈 Savings rate: <strong>{Math.round(((+form.income - +form.expenses) / +form.income) * 100)}%</strong></span>
            </div>
          )}
        </Card>

        <Button type="submit" variant="gold" disabled={loading} fullWidth>
          {loading ? 'Building Your Roadmap…' : 'Generate My FIRE Roadmap →'}
        </Button>
      </form>

      {error && <div style={{ marginTop:16, padding:14, background:'rgba(184,76,42,.1)', borderRadius:10, color:'var(--rust)', fontSize:14 }}>⚠️ {error}</div>}

      {loading && (
        <div style={{ marginTop:24 }}>
          <LoadingState message="Calculating your FIRE number and building roadmap…" />
          {text && (
            <Card style={{ marginTop:16, padding:20 }}>
              <div style={{ fontSize:14, lineHeight:1.8, color:'var(--muted)', whiteSpace:'pre-wrap' }}>
                {text}<span style={{ display:'inline-block', width:8, height:14, background:'var(--gold)', animation:'pulse 1s infinite', marginLeft:2, verticalAlign:'middle' }} />
              </div>
            </Card>
          )}
        </div>
      )}

      {!loading && text && (
        <div style={{ marginTop:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22 }}>Your FIRE Roadmap</h3>
            <button onClick={reset} style={{ background:'none', border:'1px solid var(--border)', borderRadius:20, padding:'5px 14px', fontSize:12, cursor:'pointer', color:'var(--muted)' }}>Reset</button>
          </div>
          <ResultBlock text={text} />
        </div>
      )}
    </div>
  );
}
