
import React from 'react';
import { SystemConfig, Project, User } from '../types';

interface AdminPanelProps {
  config: SystemConfig;
  onUpdateConfig: (c: SystemConfig) => void;
  projects: Project[];
  users: User[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, projects }) => {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-amber-500">God Mode</span> Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Global system control and environment variables.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-600/20">
            Emergency Kill-Switch
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary AI Engine</label>
                  <select 
                    value={config.aiModel}
                    onChange={(e) => onUpdateConfig({...config, aiModel: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200"
                  >
                    <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                    <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Projects Per User</label>
                  <input 
                    type="number"
                    value={config.maxUserProjects}
                    onChange={(e) => onUpdateConfig({...config, maxUserProjects: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Monetization Engine</h4>
                  <p className="text-xs text-slate-500">Enable subscription checking and credit usage.</p>
                </div>
                <button 
                  onClick={() => onUpdateConfig({...config, monetizationEnabled: !config.monetizationEnabled})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${config.monetizationEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.monetizationEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Automated QA Loop</h4>
                  <p className="text-xs text-slate-500">Run security scan on every generation by default.</p>
                </div>
                <button 
                  onClick={() => onUpdateConfig({...config, autoTestEnabled: !config.autoTestEnabled})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${config.autoTestEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.autoTestEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Projects Monitor</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs font-bold text-slate-500 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-2">Project</th>
                    <th className="py-3 px-2">Owner</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="py-4 px-2 text-white font-medium">{p.name}</td>
                      <td className="py-4 px-2 text-slate-400 italic">User_{p.id.slice(0, 4)}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'stable' ? 'text-emerald-400' : 'text-indigo-400'
                        }`}>{p.status.toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-2">
                        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-bold">Inspect</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Revenue Insights</h3>
            <p className="text-indigo-100 text-sm opacity-80 mb-4">Real-time monetization tracking.</p>
            <div className="text-3xl font-bold text-white">$14,284.50</div>
            <div className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5V3a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M2.293 12.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0L11 8.586l4.293-4.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0L8 8.414l-4.293 4.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              +12.4% this month
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">API Latency</span>
                <span className="text-emerald-400 font-mono">142ms</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Success Rate</span>
                <span className="text-emerald-400 font-mono">99.8%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Active Nodes</span>
                <span className="text-white font-mono">32/32</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
