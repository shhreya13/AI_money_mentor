// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import { AuthProvider } from './hooks/useAuth.jsx';
import Navbar from './components/Navbar.jsx';

import Home    from './pages/Home.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Fire    from './pages/Fire.jsx';
import Score   from './pages/Score.jsx';
import { LifeEvent, TaxWizard, CouplePlanner, MFXray } from './pages/Tools.jsx';
import Chat    from './pages/Chat.jsx';
import History from './pages/History.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight:'100vh', background:'var(--paper)', backgroundImage:'radial-gradient(ellipse 60% 40% at 80% 10%,rgba(201,168,76,.07) 0%,transparent 60%),radial-gradient(ellipse 40% 60% at 10% 90%,rgba(42,92,69,.05) 0%,transparent 50%)' }}>
          <Navbar />
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fire"     element={<Fire />} />
            <Route path="/score"    element={<Score />} />
            <Route path="/life"     element={<LifeEvent />} />
            <Route path="/tax"      element={<TaxWizard />} />
            <Route path="/couple"   element={<CouplePlanner />} />
            <Route path="/xray"     element={<MFXray />} />
            <Route path="/chat"     element={<Chat />} />
            <Route path="/history"  element={<History />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
