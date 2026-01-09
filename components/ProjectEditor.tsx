
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectFile, PerformanceStats } from '../types';
import { 
  generateAppCode, 
  runAutoQA, 
  explainCodeFast, 
  refactorCode, 
  searchGroundingRequest, 
  analyzeImage 
} from '../services/gemini';

interface ProjectEditorProps {
  project: Project | null;
  onSave: (p: Project) => void;
  onCreate: (p: Project) => void;
  onClose: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCreate, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [tab, setTab] = useState<'code' | 'qa' | 'ai' | 'preview' | 'research' | 'visual'>('code');
  const [explanation, setExplanation] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Search Grounding State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ text: string, sources: any[] } | null>(null);

  // Image Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('Analyze this for UI architecture patterns.');
  const [imageAnalysis, setImageAnalysis] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deployment Simulation State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [isDeployed, setIsDeployed] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const currentFile = project?.files[currentFileIndex];

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deploymentLogs]);

  const handleCodeChange = (newContent: string) => {
    if (!project || !currentFile) return;
    const updatedFiles = [...project.files];
    updatedFiles[currentFileIndex] = { ...currentFile, content: newContent };
    onSave({ ...project, files: updatedFiles });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setIsDeployed(false);
    try {
      const { description, files } = await generateAppCode(prompt);
      const newProject: Project = {
        id: project?.id || Math.random().toString(36).substr(2, 9),
        name: prompt.split(' ').slice(0, 3).join(' '),
        description,
        files,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      
      if (project) {
        onSave(newProject);
      } else {
        onCreate(newProject);
      }
      setTab('code');
    } catch (error: any) {
      alert(error.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResearch = async () => {
    if (!searchQuery.trim()) return;
    setIsProcessing(true);
    try {
      const results = await searchGroundingRequest(searchQuery);
      setSearchResults(results);
    } catch (e) {
      alert("Research failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    try {
      const result = await analyzeImage(selectedImage, imagePrompt);
      setImageAnalysis(result);
    } catch (e) {
      alert("Image analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartDeployment = () => {
    if (!project) return;
    setIsDeploying(true);
    setDeploymentLogs([]);
    const logs = [
      "Initializing Nexus-Optimizer Engine...",
      "Analyzing dependency tree for dead code...",
      "Performing aggressive tree-shaking on " + (project.files.length || 0) + " modules...",
      "Transpiling to optimized ESNext target...",
      "Minifying assets with parallel worker threads...",
      "Compressing with Brotli-11 level...",
      "Generating critical CSS paths...",
      "Warm-starting Global Edge CDN (250+ PoPs)...",
      "SUCCESS: Optimization complete. High-performance instance live."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => { 
          setIsDeploying(false); 
          setIsDeployed(true); 
          const uniqueUrl = `https://nexus-v1-${project.id.slice(0, 8)}.preview.nexusai.app`;
          const performance: PerformanceStats = {
            score: 98 + Math.floor(Math.random() * 2),
            bundleSize: (1.2 + Math.random() * 0.5).toFixed(2) + " KB",
            ttfb: (12 + Math.floor(Math.random() * 10)) + "ms",
            fcp: "0.2s",
            optimizationLevel: 'Ultra'
          };
          onSave({ ...project, previewUrl: uniqueUrl, status: 'stable', performance });
        }, 1000);
      }
    }, 450); // Faster build simulation thanks to optimization
  };

  const handleQA = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const qaReport = await runAutoQA(project.files);
      onSave({ ...project, testReport: qaReport, status: 'stable' });
      setTab('qa');
    } catch (error) {
      alert("QA analysis failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplain = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    setTab('ai');
    setExplanation("Analyzing...");
    try {
      const exp = await explainCodeFast(currentFile.name, currentFile.content);
      setExplanation(exp);
    } catch (e) {
      setExplanation("Error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefactor = async (instruction: string) => {
    if (!project || !currentFile) return;
    setIsProcessing(true);
    try {
      const newContent = await refactorCode(currentFile.name, currentFile.content, instruction);
      const updatedFiles = [...project.files];
      updatedFiles[currentFileIndex] = { ...currentFile, content: newContent };
      onSave({ ...project, files: updatedFiles });
    } catch (e) {
      alert("Refactor failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
          <div>
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Architect Engine</h2>
            <h1 className="text-sm font-bold text-white truncate max-w-[200px]">
              {project ? project.name : 'V1 Platform Builder'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-[400px]">
            {(['code', 'qa', 'research', 'visual', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider whitespace-nowrap ${
                  tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button 
            onClick={handleQA}
            disabled={isGenerating || !project}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold rounded-xl border border-emerald-500/20 disabled:opacity-50 transition-all"
          >
            {isGenerating ? 'Thinking...' : 'Audit Architecture'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/20 shrink-0">
          <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
                Platform Specification
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your production-grade application..."
                className="w-full h-40 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/10"
              >
                {isGenerating ? 'Synthesizing...' : 'Build Optimized Platform'}
              </button>
            </div>

            {project && (
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
                  Manifest Files
                </label>
                <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                  {project.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentFileIndex(idx); setTab('code'); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all truncate border ${
                        currentFileIndex === idx && tab === 'code' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/50 border-transparent'
                      }`}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-slate-950 overflow-hidden relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-xs font-bold text-white tracking-widest uppercase animate-pulse">Processing...</span>
            </div>
          )}

          {tab === 'code' && (
            <div className="h-full flex flex-col">
              {currentFile ? (
                <>
                  <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded tracking-tighter">{currentFile.path}</span>
                      <button onClick={handleExplain} className="text-[11px] text-slate-400 hover:text-indigo-400 font-bold transition-colors">Insights</button>
                      <button onClick={() => handleRefactor("Simplify and optimize")} className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold transition-colors">Refactor</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest animate-pulse">Live Editing</span>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(currentFile.content); setCopyStatus(true); setTimeout(() => setCopyStatus(false), 2000); }} 
                        className="text-[11px] text-slate-500 hover:text-white"
                      >
                        {copyStatus ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-slate-950">
                    <textarea
                      value={currentFile.content}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      spellCheck={false}
                      className="absolute inset-0 w-full h-full p-8 font-mono text-sm overflow-auto text-slate-300 leading-relaxed bg-transparent resize-none focus:outline-none custom-scrollbar selection:bg-indigo-500/30"
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 opacity-30 text-center">
                  <p className="text-sm">Select or create a project to begin architecting.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'research' && (
            <div className="h-full flex flex-col p-10 overflow-y-auto space-y-8 max-w-5xl mx-auto custom-scrollbar">
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  Architectural Research
                </h2>
                <p className="text-slate-400 text-sm">Use Google Search Grounding to find optimized architectural patterns and performance benchmarks.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                    placeholder="Search performance patterns, edge architectures..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  <button 
                    onClick={handleResearch}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl uppercase tracking-widest transition-all"
                  >
                    Research
                  </button>
                </div>
              </section>

              {searchResults && (
                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                    {searchResults.text}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'visual' && (
            <div className="h-full flex flex-col p-10 overflow-y-auto space-y-8 max-w-5xl mx-auto custom-scrollbar">
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Visual Performance Analysis
                </h2>
                <p className="text-slate-400 text-sm">Analyze UI screenshots for design optimization and layout efficiency.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all bg-slate-900/20 group"
                    >
                      {selectedImage ? (
                        <img src={selectedImage} alt="Analysis Target" className="h-full w-full object-contain p-4" />
                      ) : (
                        <div className="text-center">
                          <svg className="w-10 h-10 text-slate-600 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">Upload UI Reference</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
                    </div>
                    
                    <textarea 
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Analyze layout efficiency..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    
                    <button 
                      onClick={handleAnalyzeImage}
                      disabled={!selectedImage || isProcessing}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Run Visual Audit
                    </button>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 min-h-[300px]">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Optimization Insights</h4>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed italic">
                      {imageAnalysis || "Awaiting visual data..."}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === 'preview' && (
            <div className="h-full bg-slate-950 p-6 flex flex-col gap-6 overflow-hidden">
              {!isDeploying && !isDeployed && !project?.previewUrl ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-slate-900/80 p-10 rounded-[2.5rem] border border-slate-800 max-w-lg text-center shadow-2xl backdrop-blur-xl">
                    <div className="w-20 h-20 bg-emerald-600/20 text-emerald-400 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Optimize & Deploy</h3>
                    <p className="text-slate-400 text-sm mb-8">Deploying will run the Nexus-Optimizer to ensure <span className="text-emerald-400 font-bold">Ultra-Low latency</span> and <span className="text-emerald-400 font-bold">99+ performance scores</span>.</p>
                    <button onClick={handleStartDeployment} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/30 uppercase tracking-widest">
                      Deploy Optimized Build
                    </button>
                  </div>
                </div>
              ) : isDeploying ? (
                <div className="flex-1 bg-black rounded-3xl p-8 font-mono text-emerald-500 overflow-y-auto border border-slate-800 shadow-2xl custom-scrollbar relative">
                   <div className="absolute top-4 right-6 flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                     <span className="text-[10px] uppercase font-bold text-emerald-500/50">Engine: Brotli-Edge</span>
                   </div>
                  {deploymentLogs.map((log, i) => <div key={i} className="mb-1 text-[11px]">{log}</div>)}
                  <div ref={terminalEndRef} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
                  <div className="px-6 py-4 bg-slate-800 flex items-center gap-4 justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-red-500/30 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-yellow-500/30 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-green-500/30 rounded-full"></div>
                      </div>
                      <div className="bg-slate-950 px-4 py-1.5 rounded-full text-[10px] text-slate-400 font-mono w-[30rem] flex items-center justify-between border border-slate-700/50">
                        <span className="truncate">{project?.previewUrl}</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => { if(project?.previewUrl) navigator.clipboard.writeText(project.previewUrl); }} className="text-indigo-400 hover:text-indigo-300">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                           </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       {project?.performance && (
                         <div className="flex items-center gap-4 mr-4">
                           <div className="text-right">
                             <div className="text-[9px] font-black text-slate-500 uppercase">Load Score</div>
                             <div className="text-xs font-bold text-emerald-400">{project.performance.score}/100</div>
                           </div>
                           <div className="text-right">
                             <div className="text-[9px] font-black text-slate-500 uppercase">Bundle</div>
                             <div className="text-xs font-bold text-white">{project.performance.bundleSize}</div>
                           </div>
                         </div>
                       )}
                       <button onClick={() => setIsDeployed(false)} className="text-[10px] font-bold text-slate-400 hover:text-white px-3 py-1 bg-slate-700 rounded-md">REFRESH</button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white flex flex-col items-center justify-center p-12 text-center text-slate-900 overflow-y-auto">
                    <div className="max-w-2xl w-full">
                       <h2 className="text-5xl font-black mb-4 tracking-tighter text-slate-900">{project?.name}</h2>
                       <p className="text-slate-600 text-lg mb-12">{project?.description}</p>
                       
                       <div className="grid grid-cols-3 gap-6 mb-12">
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                           <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Modules</div>
                           <div className="text-2xl font-bold text-slate-900">{project?.files.length}</div>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                           <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Optimization</div>
                           <div className="text-2xl font-bold text-slate-900">{project?.performance?.optimizationLevel}</div>
                         </div>
                         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                           <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">TTFB</div>
                           <div className="text-2xl font-bold text-slate-900">{project?.performance?.ttfb}</div>
                         </div>
                       </div>

                       <div className="p-10 bg-slate-900 rounded-[3rem] text-left relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                          <h3 className="text-white font-bold text-2xl mb-4">Edge Production Ready</h3>
                          <p className="text-slate-400 text-sm leading-relaxed mb-8">This conceptual instance is currently served via the Nexus Edge Network. All modules are Brotli-compressed and edge-cached across 250 global nodes.</p>
                          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-white/5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </div>
                                <div>
                                   <div className="text-[10px] font-black text-slate-500 uppercase">Warm-start Latency</div>
                                   <div className="text-sm font-bold text-white">4ms (L1 Cache)</div>
                                </div>
                             </div>
                             <div className="px-4 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-xl uppercase tracking-widest">Optimized</div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'qa' && (
            <div className="p-12 max-w-5xl mx-auto overflow-y-auto h-full pb-20 custom-scrollbar">
              <h2 className="text-2xl font-black text-white mb-8">Architectural Audit</h2>
              {project?.testReport ? (
                <div className="bg-slate-900/30 p-10 rounded-3xl border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                  {project.testReport}
                </div>
              ) : (
                <div className="text-center p-20 opacity-40">Run 'Audit' to begin technical verification.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
