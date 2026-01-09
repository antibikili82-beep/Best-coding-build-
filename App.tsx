
import React, { useState, useEffect } from 'react';
import { UserRole, Project, User, SystemConfig } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectEditor from './components/ProjectEditor';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'admin' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [config, setConfig] = useState<SystemConfig>({
    aiModel: 'gemini-3-pro-preview',
    monetizationEnabled: true,
    autoTestEnabled: true,
    maxUserProjects: 5
  });

  // Load projects from local storage or mock data
  useEffect(() => {
    const savedProjects = localStorage.getItem('nexus_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus_projects', JSON.stringify(projects));
  }, [projects]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const createProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    setCurrentView('editor');
  };

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedProject?.id === updated.id) setSelectedProject(updated);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setCurrentView('dashboard');
    }
  };

  if (!user) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-auto relative">
        {currentView === 'dashboard' && (
          <Dashboard 
            projects={projects} 
            onCreateNew={() => {
              setSelectedProject(null);
              setCurrentView('editor');
            }} 
            onSelectProject={(p) => {
              setSelectedProject(p);
              setCurrentView('editor');
            }}
            onDeleteProject={deleteProject}
          />
        )}
        
        {currentView === 'editor' && (
          <ProjectEditor 
            project={selectedProject} 
            onSave={updateProject} 
            onCreate={createProject}
            onClose={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'admin' && user.role !== UserRole.USER && (
          <AdminPanel 
            config={config} 
            onUpdateConfig={setConfig} 
            projects={projects}
            users={[]} // Mock users list
          />
        )}

        {currentView === 'settings' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 tracking-tight">User Settings</h1>
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 glass-card">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Authenticated Identity</label>
                  <p className="text-lg font-medium text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Authorization Tier</label>
                  <p className="text-lg flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      user.role === UserRole.SUPER_ADMIN ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 
                      user.role === UserRole.ADMIN ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-slate-800 border border-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Available Compute Credits</label>
                  <p className="text-3xl font-black font-mono text-emerald-400">{user.credits}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default App;
