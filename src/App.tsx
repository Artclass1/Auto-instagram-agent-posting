import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  LineChart, 
  Settings, 
  Instagram,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquareHeart,
  Bot
} from 'lucide-react';
import { generateContentCalendar, generateMarketInsights, type PostIdea } from './lib/ai';
import { cn } from './lib/utils';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'insights'>('dashboard');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [posts, setPosts] = useState<PostIdea[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [autoEngageEnabled, setAutoEngageEnabled] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      setIsAiGenerating(true);
      try {
        const genInsights = await generateMarketInsights();
        setInsights(genInsights);
        
        const genPosts = await generateContentCalendar(new Date());
        setPosts(genPosts);
      } catch (e) {
        console.error(e);
      } finally {
        setIsAiGenerating(false);
      }
    }
    loadInitialData();

    // Listen for OAuth success message from the popup
    const handleMessage = (event: MessageEvent) => {
      // Allow messages from our own domain (handling both dev and cross-origin scenarios)
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log("Instagram authentication successful", event.data.code);
        setInstagramConnected(true);
        // Normally, you would now fetch the user's Instagram profile
      }
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        alert('Instagram Authentication Failed: ' + event.data.error);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectInstagram = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your Instagram account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Failed to initialize Instagram connection.');
    }
  };

  const handleGenerateNewContent = async () => {
    setIsAiGenerating(true);
    try {
      const genPosts = await generateContentCalendar(new Date());
      setPosts(genPosts);
    } catch(e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-natural-surface border-r border-natural-border flex flex-col p-8 md:min-h-screen sticky top-0 md:h-screen overflow-y-auto z-10 hidden md:flex">
        <div className="mb-12">
          <h1 className="text-2xl font-serif italic text-natural-primary tracking-tight">Aura AI</h1>
          <p className="text-[10px] uppercase tracking-widest text-natural-text-light mt-1">Sustainable Living</p>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-natural-text-light font-semibold">Agent Control</p>
            <NavItem 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <NavItem 
              label="Content Engine" 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')} 
            />
            <NavItem 
              label="Market Trends" 
              active={activeTab === 'insights'} 
              onClick={() => setActiveTab('insights')} 
            />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-natural-text-light font-semibold">Social Connect</p>
            <div className="flex items-center gap-2 p-3 bg-natural-surface-alt rounded-xl border border-natural-border cursor-pointer transition-colors hover:bg-natural-surface" onClick={handleConnectInstagram}>
              {instagramConnected ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FFDC80] via-[#F77737] to-[#833AB4] flex-shrink-0 flex items-center justify-center text-white"><Instagram size={14} /></div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">@aura.nashik</p>
                    <p className="text-[10px] text-green-600">Connected & Active</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-natural-border flex-shrink-0 flex items-center justify-center text-natural-text-muted"><Instagram size={14} /></div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate text-natural-text-muted">Not Connected</p>
                    <p className="text-[10px] text-natural-text-light">Click to Connect</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="pt-6 border-t border-natural-border">
          <div className="text-[11px] text-natural-text-light">
            <p>AI Agent Archi-01</p>
            <button className="mt-1 flex items-center gap-1 italic underline text-natural-primary hover:text-natural-text">
              <Settings size={12} /> Settings & Protocols
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-natural-surface border-b border-natural-border p-4 -mx-6 -mt-6 mb-6 sticky top-0 z-20 flex justify-between items-center">
           <div>
              <h1 className="font-serif italic text-lg tracking-tight text-natural-primary">Aura AI</h1>
           </div>
           <div className="flex gap-4 text-natural-text-light">
             <button onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-natural-primary' : ''}/></button>
             <button onClick={() => setActiveTab('calendar')}><CalendarIcon size={20} className={activeTab === 'calendar' ? 'text-natural-primary' : ''}/></button>
             <button onClick={() => setActiveTab('insights')}><LineChart size={20} className={activeTab === 'insights' ? 'text-natural-primary' : ''}/></button>
           </div>
        </div>

        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
          {activeTab === 'dashboard' && (
            <DashboardView 
              instagramConnected={instagramConnected} 
              onConnect={handleConnectInstagram}
              autoEngageEnabled={autoEngageEnabled}
              onToggleAutoEngage={() => setAutoEngageEnabled(!autoEngageEnabled)}
              nextPost={posts[0]}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              posts={posts} 
              isGenerating={isAiGenerating} 
              onGenerateNew={handleGenerateNewContent} 
            />
          )}

          {activeTab === 'insights' && (
            <InsightsView 
              insights={insights} 
              isGenerating={isAiGenerating}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon?: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 text-sm font-medium transition-colors w-full text-left",
        active 
          ? "text-natural-primary" 
          : "text-natural-text-muted hover:text-natural-primary"
      )}
    >
      {active && <span className="w-2 h-2 rounded-full bg-natural-primary flex-shrink-0"></span>}
      {!active && <span className="w-2 h-2 rounded-full bg-transparent flex-shrink-0"></span>}
      {icon && icon}
      {label}
    </button>
  );
}

// -------------------------------------------------------------
// DASHBOARD VIEW
// -------------------------------------------------------------
function DashboardView({ instagramConnected, onConnect, autoEngageEnabled, onToggleAutoEngage, nextPost }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col flex-1"
    >
      <header className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end mb-10 w-full gap-4">
        <div>
          <h2 className="text-4xl font-serif italic text-natural-primary">Daily Sequence</h2>
          <p className="text-natural-text-muted mt-2">Manage Aura's automated presence in the Nashik market.</p>
        </div>
        <div className="hidden sm:flex gap-4">
          <button className="px-6 py-2 border border-natural-primary text-natural-primary rounded-full text-sm font-medium hover:bg-natural-surface-alt transition-colors">Pause Agent</button>
          <button className="px-6 py-2 bg-natural-primary text-white rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors">Generate Now</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Next Post Card -> Main Focus Area */}
        <div className="lg:col-span-7 bg-natural-surface rounded-[32px] p-6 shadow-sm border border-natural-border flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] uppercase tracking-widest text-natural-text-light font-bold">Live Post Preview</span>
            {nextPost && <span className="px-3 py-1 bg-natural-surface-alt2 rounded-full text-[10px] font-bold text-natural-primary">UP NEXT</span>}
          </div>
          
          {nextPost ? (
            <>
              <div className="w-full aspect-[4/3] bg-natural-border rounded-2xl overflow-hidden relative group flex items-center justify-center">
                 <div className="absolute inset-0 flex items-center justify-center flex-col text-natural-text-muted p-6 text-center">
                   <p className="font-serif italic text-lg">{nextPost.topic}</p>
                   <p className="text-xs mt-2">Image generated by AI</p>
                 </div>
              </div>
              <div className="mt-6 flex-1 flex flex-col">
                <p className="text-sm leading-relaxed text-natural-primary line-clamp-4">
                  <span className="font-bold">@aura.nashik</span> {nextPost.caption}
                </p>
                <div className="mt-auto pt-4 flex justify-between items-center text-xs text-natural-text-muted">
                    <span>Scheduled for: {format(parseISO(nextPost.date), 'EEEE, MMM d')}</span>
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 bg-natural-surface-alt2 rounded-2xl border-2 border-dashed border-natural-border text-center">
                <p className="text-natural-text-muted mb-2">No posts scheduled.</p>
                <button className="px-4 py-2 bg-natural-primary text-white rounded-full text-xs font-medium">Generate Calendar</button>
             </div>
          )}
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Engagement Monitor */}
          <div className="bg-natural-surface rounded-[24px] p-6 border border-natural-border shadow-sm">
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-xs uppercase tracking-widest text-natural-text-light font-bold">Live Engagement</h3>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={autoEngageEnabled} onChange={onToggleAutoEngage} disabled={!instagramConnected} />
                  <div className="w-9 h-5 bg-natural-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-natural-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-natural-primary opacity-100 disabled:opacity-50"></div>
               </label>
            </div>
            
            {!instagramConnected ? (
               <div className="text-center py-4">
                 <p className="text-xs text-natural-text-muted mb-4">Connect your brand account to enable auto-engagement and replies.</p>
                 <button onClick={onConnect} className="w-full bg-natural-surface-alt hover:bg-natural-border border border-natural-border text-natural-primary font-medium py-2 rounded-full transition-colors text-xs">Connect Instagram</button>
               </div>
            ) : (
                <div className="space-y-4">
                  <div className="flex gap-3 pb-3 border-b border-natural-surface-alt2">
                    <div className="w-8 h-8 rounded-full bg-[#CC7A5C] flex-shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold">rahul_arch</p>
                      <p className="text-[11px] text-natural-text-muted">Cost of maintenance per sqft?</p>
                      <p className="text-[10px] text-green-600 mt-1 italic">Agent: "Minimal due to sustainable design..."</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-natural-text-light flex-shrink-0"></div>
                    <div>
                      <p className="text-xs font-bold">nashik_realty</p>
                      <p className="text-[11px] text-natural-text-muted">Love the minimal design!</p>
                      <p className="text-[10px] text-natural-text-light mt-1">Agent: Reacting with heart...</p>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Market Trends Summary */}
          <div className="bg-natural-primary text-natural-bg rounded-[24px] p-6 shadow-md flex-1">
            <h3 className="text-xs uppercase tracking-widest text-natural-bg/60 font-bold mb-4">Market Trends (Nashik)</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-sm">Sustainable Materials</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">+12%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Smart Glass Tech</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">Trending</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-sm">Biophilic Design</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white">High Intent</span>
              </li>
            </ul>
            <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-natural-bg/70 leading-snug">
              Agent updating strategy continuously based on local search intent.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// CALENDAR VIEW
// -------------------------------------------------------------
function CalendarView({ posts, isGenerating, onGenerateNew }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 flex flex-col flex-1"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-4xl font-serif italic text-natural-primary">Content Engine</h2>
          <p className="text-natural-text-muted mt-2">7-day automated posting schedule.</p>
        </div>
        <button 
          onClick={onGenerateNew}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-natural-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center"
        >
          {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </button>
      </header>

      {isGenerating ? (
        <div className="py-20 flex flex-col items-center justify-center text-natural-text-muted">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-sm font-medium">AI is analyzing real estate trends and writing captions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post: PostIdea) => (
            <div key={post.id} className="bg-natural-surface border border-natural-border p-6 rounded-[24px] flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="md:w-48 shrink-0 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-natural-text-light mb-2">Schedule</div>
                  <div className="text-lg font-serif text-natural-primary">{format(parseISO(post.date), 'EEEE')}</div>
                  <div className="text-sm text-natural-text-muted">{format(parseISO(post.date), 'MMM d, yyyy')}</div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-natural-primary bg-natural-surface-alt2 px-3 py-1 rounded-full">
                    {post.status}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-natural-primary mb-2">{post.topic}</h3>
                  <p className="text-sm text-natural-text whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                </div>
                
                <div className="bg-natural-surface-alt p-4 rounded-xl border border-natural-border mt-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-natural-text-light mb-2">
                    <Sparkles size={12} />
                    AI Image Generation
                  </div>
                  <p className="text-sm text-natural-text-muted italic leading-relaxed">{post.imagePrompt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// -------------------------------------------------------------
// INSIGHTS VIEW
// -------------------------------------------------------------
function InsightsView({ insights, isGenerating }: { insights: string[], isGenerating: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 flex flex-col flex-1"
    >
      <header className="mb-2">
        <h2 className="text-4xl font-serif italic text-natural-primary">Market Intelligence</h2>
        <p className="text-natural-text-muted mt-2">Nashik architectural trends and content strategy recommendations.</p>
      </header>

      {isGenerating ? (
        <div className="py-20 flex flex-col items-center justify-center text-natural-text-muted">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-sm font-medium">Analyzing market data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-natural-primary text-natural-bg border border-natural-border p-8 rounded-[32px] shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-serif italic text-natural-bg text-xl">
                0{idx + 1}
              </div>
              <p className="text-natural-bg/90 leading-relaxed text-sm">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
