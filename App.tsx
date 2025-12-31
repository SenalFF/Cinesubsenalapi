
import React, { useState } from 'react';
import { generateExpressScript } from './services/codeGenerator';
import { 
  Search, Code, Info, Download, 
  Copy, Check, Terminal, ShieldCheck, Activity, 
  RefreshCw, BookOpen, Zap, Cloud,
  Layers, ChevronRight, Play, Server, Cpu,
  Globe, Database, ExternalLink, Settings,
  MessageSquare, Layout, Rocket
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'docs'>('preview');
  const [copied, setCopied] = useState(false);
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [liveResponse, setLiveResponse] = useState<any>(null);
  
  const endpoints = [
    { 
      id: 'health', 
      name: '/health', 
      method: 'GET',
      icon: <Activity className="w-5 h-5" />, 
      desc: "Diagnostics and target connectivity check.",
      payload: { 
        success: true, 
        engine: "Senal Tech v2.0", 
        status: "Operational", 
        latency: "142ms", 
        target: "cinesubz.co" 
      },
      usage: "Check if the scraper engine and target site are online."
    },
    { 
      id: 'search', 
      name: '/search', 
      method: 'GET',
      icon: <Search className="w-5 h-5" />, 
      desc: "Search movies, series, and cartoons.",
      params: "?q=Spider-Man",
      payload: {
        success: true,
        count: 1,
        results: [{
          title: "Spider-Man: No Way Home",
          type: "movie",
          rating: "8.2",
          poster_url: "https://cinesubz.co/wp-content/uploads/spiderman.jpg",
          movie_url: "https://cinesubz.co/movies/spiderman-no-way-home/"
        }]
      },
      usage: "Search for any media item using keywords."
    },
    { 
      id: 'details', 
      name: '/details', 
      method: 'GET',
      icon: <Info className="w-5 h-5" />, 
      desc: "Deep metadata and download link extraction.",
      params: "?url=https://cinesubz.co/movies/item/",
      payload: {
        success: true,
        data: {
          movie_info: { title: "Spiderman", year: "2021", rating: "8.2" },
          download_links: [
            { quality: "720p", size: "1.2GB", countdown_url: "https://cinesubz.co/api-720p/123" }
          ]
        }
      },
      usage: "Extract full details and quality options using a movie_url."
    },
    { 
      id: 'download', 
      name: '/download', 
      method: 'GET',
      icon: <Download className="w-5 h-5" />, 
      desc: "Final resolver for direct cloud links.",
      params: "?url=https://cinesubz.co/api-720p/123",
      payload: {
        success: true,
        count: 2,
        download_options: [
          { type: "direct", label: "Sonic Cloud", download_url: "https://cloud.sonic-cloud.online/..." },
          { type: "mega", label: "Mega Mirror", download_url: "https://mega.nz/file/..." }
        ]
      },
      usage: "The ultimate resolver to get the final download/stream links."
    }
  ];

  const handleTest = (ep: any) => {
    setChecking(ep.id);
    setLiveResponse(null);
    setTimeout(() => {
      setChecking(null);
      setLiveResponse(ep.payload);
    }, 700);
  };

  const copyToClipboard = (text: string, isVercel: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isVercel) {
      setCopiedVercel(true);
      setTimeout(() => setCopiedVercel(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 antialiased">
      {/* Senal Tech Header */}
      <header className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center justify-center p-6 mb-8 rounded-[2.5rem] bg-red-600/10 border border-red-500/20 shadow-2xl group overflow-hidden relative">
          <div className="absolute inset-0 shimmer opacity-30"></div>
          <Cpu className="w-16 h-16 text-red-500 group-hover:scale-110 transition-transform duration-500 relative z-10" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">
          Senal <span className="text-red-500">Tech</span>
        </h1>
        <p className="text-slate-500 text-xl font-bold tracking-widest uppercase">
          movie tv series cartoons ultimate
        </p>
        <div className="mt-8 flex justify-center gap-6">
          <span className="px-5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" /> Global Scraper
          </span>
          <span className="px-5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Rocket className="w-4 h-4 text-yellow-500" /> Vercel Ready
          </span>
        </div>
      </header>

      {/* Main Tab Controller */}
      <div className="flex justify-center mb-12">
        <nav className="inline-flex p-2 bg-slate-900/50 border border-slate-800 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
          {[
            { id: 'preview', label: 'Dashboard', icon: <Layout className="w-4 h-4" /> },
            { id: 'docs', label: 'API Docs', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'code', label: 'Engine Code', icon: <Code className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-10 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 font-black text-sm ${
                activeTab === tab.id 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' 
                  : 'text-slate-500 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* View: Dashboard / Live Terminal */}
      {activeTab === 'preview' ? (
        <div className="grid lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 px-4">
              <Settings className="w-4 h-4" /> Test Bench
            </h3>
            {endpoints.map(ep => (
              <button
                key={ep.id}
                onClick={() => handleTest(ep)}
                className={`w-full text-left p-8 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden ${
                  checking === ep.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 glass hover:border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${checking === ep.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 group-hover:text-red-500'} transition-all`}>
                      {ep.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-black font-mono text-slate-600 uppercase tracking-widest block mb-0.5">{ep.method}</span>
                      <h4 className="text-2xl font-black text-slate-100">{ep.name}</h4>
                    </div>
                  </div>
                  {checking === ep.id ? <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" /> : <ChevronRight className="w-6 h-6 text-slate-700 group-hover:translate-x-2 transition-transform" />}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{ep.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7">
            <div className="glass rounded-[3rem] border border-slate-800 h-full flex flex-col overflow-hidden shadow-2xl relative">
              <div className="bg-slate-900/90 px-10 py-8 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-6 h-6 text-red-500" />
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-0.5">Live Output Terminal</span>
                    <h4 className="text-xs font-bold text-slate-300">AWAITING_INPUT</h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                </div>
              </div>
              <div className="flex-1 p-10 overflow-auto custom-scrollbar bg-black/20">
                {liveResponse ? (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex gap-4 mb-8">
                      <div className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">Status 200 OK</div>
                      <div className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">json_response</div>
                    </div>
                    <pre className="text-sm text-red-400/90 font-mono leading-loose whitespace-pre-wrap">{JSON.stringify(liveResponse, null, 2)}</pre>
                  </div>
                ) : checking ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-mono text-sm tracking-[0.2em] animate-pulse">Requesting from CineSubz Database...</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 opacity-40">
                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                      <Play className="w-10 h-10 text-slate-700 ml-1.5" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-500 mb-2">Terminal Idle</h4>
                      <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed italic">Click an endpoint on the left to simulate a real-world API call and view the extracted JSON schema.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'docs' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="glass p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl">
            <h2 className="text-4xl font-black mb-12 flex items-center gap-6">
              <BookOpen className="text-red-500 w-12 h-12" /> Developer Documentation
            </h2>
            
            <div className="space-y-16">
              {endpoints.map((ep, i) => (
                <section key={ep.id} className="relative">
                  <div className="absolute -left-12 top-0 text-slate-800 font-black text-6xl opacity-20">{i+1}</div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-xs font-black font-mono">GET</span>
                    <h3 className="text-3xl font-black text-white">{ep.name}</h3>
                  </div>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-3xl">{ep.usage}</p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-8 bg-black/40 rounded-[2rem] border border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> CURL Usage
                        </h4>
                        <code className="text-sm text-blue-400 font-mono break-all leading-relaxed">
                          curl "https://your-api.com{ep.name}{ep.params || ''}"
                        </code>
                      </div>
                      <div className="p-8 bg-black/40 rounded-[2rem] border border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Globe className="w-3 h-3" /> Fetch Usage
                        </h4>
                        <pre className="text-xs text-yellow-500/90 font-mono leading-relaxed overflow-auto">
{`fetch('https://api.com${ep.name}${ep.params || ''}')
  .then(res => res.json())
  .then(data => console.log(data));`}
                        </pre>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800">
                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Sample Response
                      </h4>
                      <pre className="text-xs text-red-400/80 font-mono leading-loose">
                        {JSON.stringify(ep.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-20 pt-16 border-t border-slate-800">
              <h2 className="text-4xl font-black mb-8 flex items-center gap-6">
                <Cloud className="text-blue-500 w-12 h-12" /> Vercel One-Click Deploy
              </h2>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Senal Tech v2.0 is fully optimized for Vercel Serverless. Copy the configuration below into a file named <code className="text-slate-200">vercel.json</code>.
                  </p>
                  <button 
                    onClick={() => copyToClipboard(`{ "version": 2, "builds": [{ "src": "index.js", "use": "@vercel/node" }], "routes": [{ "src": "/(.*)", "dest": "index.js" }] }`, true)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black border border-slate-700 transition-all text-white group"
                  >
                    {copiedVercel ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 group-hover:text-red-500" />}
                    {copiedVercel ? 'DEPLOY CONFIG COPIED' : 'COPY VERCEL.JSON CONFIG'}
                  </button>
                </div>
                <div className="p-8 bg-black/50 rounded-[2rem] border border-slate-800">
                  <pre className="text-xs text-slate-400 font-mono leading-relaxed">
{`{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "index.js" }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View: Engine Code */
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <div className="glass rounded-[3.5rem] border border-slate-800 overflow-hidden relative shadow-2xl">
            <div className="absolute top-10 right-12 z-10 flex gap-6">
              <button
                onClick={() => copyToClipboard(generateExpressScript())}
                className="flex items-center gap-4 px-10 py-5 bg-red-600 hover:bg-red-700 text-sm font-black text-white rounded-2xl shadow-2xl transition-all active:scale-95 group"
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                {copied ? 'CORE COPIED' : 'COPY SENAL TECH CORE'}
              </button>
            </div>
            <div className="bg-slate-900/90 px-12 py-10 border-b border-slate-800 flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-red-600/10 shadow-inner">
                <Terminal className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-1 block">Production Engine Logic</span>
                <h3 className="text-3xl font-black text-white tracking-tighter">senal_tech_core_v2.js</h3>
              </div>
            </div>
            <div className="p-0">
              <pre className="p-16 text-sm text-slate-300 overflow-auto max-h-[800px] leading-[1.8] custom-scrollbar bg-black/10 selection:bg-red-500/30">
                {generateExpressScript()}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      <footer className="mt-32 text-center">
        <div className="inline-flex flex-col items-center gap-6">
          <div className="flex gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <Globe className="w-6 h-6" />
            <Database className="w-6 h-6" />
            <Server className="w-6 h-6" />
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[1em]">
            © {new Date().getFullYear()} Senal Tech • Ultimate API Control Center
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
