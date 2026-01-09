
import React from 'react';
import { User, UserRole } from '../types';

interface LandingPageProps {
  onLogin: (u: User) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const handleAuth = (role: UserRole) => {
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      email: role === UserRole.SUPER_ADMIN ? 'admin@nexus.ai' : 'builder@nexus.ai',
      role,
      credits: role === UserRole.SUPER_ADMIN ? 999999 : 50
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="max-w-4xl w-full text-center relative z-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white mx-auto mb-8 shadow-2xl shadow-indigo-600/30">
          N
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          Architect the Future <br />with NexusAI
        </h1>
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform builder that codes, tests, and deploys high-performance web applications automatically. Zero bugs. Maximum speed. God-mode control.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => handleAuth(UserRole.USER)}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group"
          >
            Start Building Free
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button 
            onClick={() => handleAuth(UserRole.SUPER_ADMIN)}
            className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Access Admin God-Mode
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {[
            { title: 'AI Builder Engine', desc: 'Generate full-stack React code from natural language prompts.' },
            { title: 'Auto QA Loop', desc: 'Integrated AI testing that detects and fixes broken logic instantly.' },
            { title: '1-Click Deploy', desc: 'Go from concept to production on global infrastructure in seconds.' }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <div className="text-indigo-500 font-bold mb-2 uppercase text-xs tracking-widest">Module {i+1}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-20 text-slate-600 text-sm">
        &copy; 2024 NexusAI Architect Platform. Built for the era of intelligence.
      </footer>
    </div>
  );
};

export default LandingPage;
