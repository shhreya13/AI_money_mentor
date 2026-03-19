// src/pages/Auth.jsx  – Login + Register
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api.js';
import { Button, Input, Card, Toast } from '../components/UI.jsx';

function AuthShell({ children, title, sub }) {
  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, marginBottom:8 }}>{title}</div>
          <div style={{ color:'var(--muted)', fontSize:15 }}>{sub}</div>
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  );
}

export function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <AuthShell title="Welcome back" sub="Sign in to your Money Mentor">
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
        {error && <div style={{ background:'rgba(184,76,42,.1)', border:'1px solid rgba(184,76,42,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--rust)' }}>{error}</div>}
        <Button type="submit" variant="gold" disabled={loading} fullWidth>
          {loading ? 'Signing in…' : 'Sign In →'}
        </Button>
        <div style={{ textAlign:'center', fontSize:13, color:'var(--muted)' }}>
          No account? <Link to="/register" style={{ color:'var(--gold)', fontWeight:600 }}>Sign up free</Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const data = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <AuthShell title="Create your account" sub="Free forever. No credit card needed.">
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Priya Sharma" required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required />
        {error && <div style={{ background:'rgba(184,76,42,.1)', border:'1px solid rgba(184,76,42,.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--rust)' }}>{error}</div>}
        <Button type="submit" variant="gold" disabled={loading} fullWidth>
          {loading ? 'Creating account…' : 'Create Free Account →'}
        </Button>
        <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.5 }}>
          By signing up you agree to our Terms of Service.<br/>Your data is encrypted and never sold.
        </div>
        <div style={{ textAlign:'center', fontSize:13, color:'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--gold)', fontWeight:600 }}>Sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}
