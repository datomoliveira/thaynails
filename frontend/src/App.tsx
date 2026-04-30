// Build trigger
import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Heart } from 'lucide-react';
import Editor from './components/Editor';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCurrentTab('editor');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-background">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[80%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-md relative z-10 flex-1 px-5 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide" 
            style={{ paddingTop: 'calc(var(--safe-area-top) + 2rem)', paddingBottom: 'calc(var(--safe-area-bottom) + 8rem)' }}>
        {currentTab === 'home' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-28 h-28 mb-10 relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-full h-full glass-panel flex items-center justify-center text-primary border-primary/20">
                <Sparkles size={48} className="drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold mb-3 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
              ThayNails
            </h1>
            <p className="text-white/50 mb-12 text-lg font-light leading-relaxed">
              Sua beleza elevada <br/> pelo poder da <span className="text-primary font-medium">Simulação Realista</span>.
            </p>
            
            <button 
              onClick={() => setCurrentTab('upload')}
              className="btn-primary w-full max-w-[280px] flex items-center justify-center gap-3 py-4 text-lg active:scale-90 transition-transform"
            >
              <Camera size={24} />
              Começar Simulação
            </button>
          </div>
        )}

        {currentTab === 'upload' && (
          <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-3xl font-bold mb-10 tracking-tight text-center">Envie sua foto</h2>
            
            <div className="w-full aspect-[3/4] glass-panel border-2 border-primary/30 flex flex-col items-center justify-center relative overflow-hidden group">
              {/* The Stencil Guide */}
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center p-6">
                <div className="w-full h-full border-2 border-primary/20 rounded-3xl flex items-center justify-center relative bg-black/20 backdrop-blur-[2px]">
                  {/* Visual slots for fingers */}
                  <div className="absolute top-[15%] left-[15%] w-12 h-20 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"><span className="text-[8px] text-primary/60 font-bold">DEDÃO</span></div>
                  <div className="absolute top-[8%] left-[35%] w-12 h-24 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"><span className="text-[8px] text-primary/60 font-bold">INDICADOR</span></div>
                  <div className="absolute top-[5%] left-[50%] w-12 h-26 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"><span className="text-[8px] text-primary/60 font-bold">MÉDIO</span></div>
                  <div className="absolute top-[10%] left-[65%] w-12 h-24 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"><span className="text-[8px] text-primary/60 font-bold">ANELAR</span></div>
                  <div className="absolute top-[20%] left-[80%] w-10 h-18 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"><span className="text-[8px] text-primary/60 font-bold">MÍNIMO</span></div>
                  
                  <p className="absolute bottom-10 text-center text-xs text-primary font-bold animate-pulse px-6 uppercase tracking-widest">
                    Encaixe suas unhas nos círculos pontilhados
                  </p>
                </div>
              </div>

              <input type="file" className="hidden" id="file-input" accept="image/*" onChange={handleFileChange} />
              
              <label htmlFor="file-input" className="absolute inset-0 z-30 cursor-pointer flex flex-col items-center justify-center gap-4 bg-transparent active:bg-primary/5 transition-colors">
                <div className="p-6 bg-primary/20 rounded-full text-primary shadow-neon-blue group-hover:scale-110 transition-transform">
                  <Upload size={40} />
                </div>
                <p className="text-white font-bold text-lg">Tirar Foto / Galeria</p>
              </label>
            </div>
          </div>
        )}

        {currentTab === 'editor' && (
          <Editor imageFile={selectedFile} onBack={() => { setCurrentTab('home'); setSelectedFile(null); }} />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-[2.5rem] rounded-b-none border-t border-white/10 flex justify-around items-center max-w-md mx-auto w-full backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
           style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)', paddingTop: '1.25rem' }}>
        <NavButton 
          icon={<Sparkles size={28} />} 
          label="Simular" 
          active={['home', 'upload', 'editor'].includes(currentTab)} 
          onClick={() => setCurrentTab('home')} 
        />
        <NavButton 
          icon={<Heart size={28} />} 
          label="Favoritos" 
          active={currentTab === 'favorites'} 
          onClick={() => setCurrentTab('favorites')} 
        />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-white/40 hover:text-white/70'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default App;
