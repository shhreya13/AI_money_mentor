// src/pages/Score.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { BackButton, ToolHeader, Card, Button, LoadingState, ProgressBar } from '../components/UI.jsx';

const QUESTIONS = [
  { id:'emergency', q:'How many months of expenses do you have in liquid savings?',
    opts:['0–1 months','2–3 months','4–6 months','6+ months'] },
  { id:'insurance', q:'What insurance do you currently have?',
    opts:['Neither term nor health','Only health insurance','Only term insurance','Both term + health insurance'] },
  { id:'investment', q:'Where do you currently invest?',
    opts:['Only FD / Savings account','Some mutual funds','Diversified MF + direct stocks','Fully diversified across asset classes'] },
  { id:'debt', q:'What is your monthly EMI-to-income ratio?',
    opts:['Above 50% (high debt)','30–50%','10–30%','Below 10% or debt-free'] },
  { id:'tax', q:'How actively do you plan your taxes?',
    opts:['Never think about it','Only Section 80C basics','80C + a few others','Comprehensive tax planning every year'] },
  { id:'retirement', q:'Are you investing for retirement?',
    opts:['Not at all','Only mandatory EPF','EPF + some NPS / MF','Clear corpus target with regular SIPs'] },
];

const DIM_COLORS = { emergency:'#2a5c45', insurance:'#c9a84c', investment:'#2a4a6b', debt:'#b84c2a', tax:'#5c3d8f', retirement:'#14726e' };
const DIM_ICONS  = { emergency:'🏦', insurance:'🛡️', investment:'📈', debt:'💳', tax:'🧾', retirement:'🏖️' };

export default function Score() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function selectOpt(qid, opt) {
    const newAns = { ...answers, [qid]: opt };
    setAnswers(newAns);

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      // All answered → compute score
      setLoading(true); setError('');
      try {
        const res = await api.post('/ai/score', newAns);
        setResult(res);
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    }
  }

  function restart() { setStep(0); setAnswers({}); setResult(null); setError(''); }

  const gradeColor = g => ({ 'A+':'#2a5c45', A:'#2a5c45', 'B+':'#c9a84c', B:'#c9a84c', C:'#b84c2a', D:'#b84c2a' }[g] || 'var(--ink)');

  if (loading) return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <LoadingState message="Calculating your Money Health Score…" />
    </div>
  );

  if (result) return (
    <div style={{ maxWidth:700, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="📊" title="Your Money Health Score" subtitle="Here's how your finances shape up across 6 dimensions" />

      {/* Big score */}
      <Card style={{ textAlign:'center', padding:'40px 28px', marginBottom:20 }}>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:80, lineHeight:1, background:'linear-gradient(135deg,var(--gold),var(--rust))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          {result.score}
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:gradeColor(result.grade), marginTop:4 }}>
          Grade {result.grade}
        </div>
        <div style={{ color:'var(--muted)', fontSize:15, marginTop:10, maxWidth:460, margin:'10px auto 0' }}>{result.summary}</div>
      </Card>

      {/* 6 dimensions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
        {Object.entries(result.dims || {}).map(([key, val]) => (
          <Card key={key} style={{ padding:16, textAlign:'center' }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{DIM_ICONS[key]}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:DIM_COLORS[key] }}>{val.score}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--ink)', marginBottom:8 }}>{key}</div>
            <ProgressBar value={val.score} color={DIM_COLORS[key]} />
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:8, lineHeight:1.4 }}>{val.insight}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:'flex', gap:12 }}>
        <Button variant="gold" onClick={() => navigate('/fire')} style={{ flex:1 }}>Build My FIRE Plan →</Button>
        <Button variant="ghost" onClick={restart} style={{ flex:1 }}>Retake Assessment</Button>
      </div>
    </div>
  );

  // Quiz
  const q = QUESTIONS[step];
  const progress = (step / QUESTIONS.length) * 100;

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:'40px 28px' }}>
      <BackButton onClick={() => navigate('/')} />
      <ToolHeader icon="📊" title="Money Health Score" subtitle={`Question ${step + 1} of ${QUESTIONS.length}`} />

      {/* Progress */}
      <div style={{ marginBottom:24 }}>
        <ProgressBar value={progress} />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--muted)', marginTop:6 }}>
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <Card>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, lineHeight:1.4, marginBottom:24 }}>
          {DIM_ICONS[q.id]} {q.q}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {q.opts.map(opt => (
            <button key={opt} onClick={() => selectOpt(q.id, opt)}
              style={{
                padding:'14px 18px', border:`1.5px solid ${answers[q.id]===opt?'var(--gold)':'var(--border)'}`,
                borderRadius:12, background: answers[q.id]===opt ? 'var(--gold-dim)' : 'white',
                color:'var(--ink)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                fontSize:14, textAlign:'left', transition:'all .2s',
                fontWeight: answers[q.id]===opt ? 600 : 400,
              }}
              onMouseEnter={e=>{if(answers[q.id]!==opt){e.target.style.borderColor='var(--muted)'}}}
              onMouseLeave={e=>{if(answers[q.id]!==opt){e.target.style.borderColor='var(--border)'}}}
            >{opt}</button>
          ))}
        </div>
      </Card>

      {step > 0 && (
        <button onClick={() => setStep(s=>s-1)} style={{ marginTop:12, background:'none', border:'none', color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
          ← Previous question
        </button>
      )}

      {error && <div style={{ marginTop:12, padding:12, background:'rgba(184,76,42,.1)', borderRadius:8, color:'var(--rust)', fontSize:13 }}>{error}</div>}
    </div>
  );
}
