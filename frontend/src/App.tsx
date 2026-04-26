import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Heart } from 'lucide-react';
import Editor from './components/Editor';

function App() {
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-background select-none touch-none">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[80%] h-[40%] bg-accent/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-md relative z-10 flex-1 px-5 flex flex-col" 
            style={{ paddingTop: 'calc(var(--safe-area-top) + 2rem)', paddingBottom: 'calc(var(--safe-area-bottom) + 6rem)' }}>
        {currentTab === 'home' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-full max-w-[300px] mb-8 relative aspect-square">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
              <img 
                src="/hero.png" 
                alt="ThayNails" 
                className="relative z-10 w-full h-full object-contain mask-image-linear-gradient"
              />
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
            
            <div className="w-full aspect-[3/4] glass-panel border-dashed border-2 border-primary/30 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-primary/5 active:scale-95 transition-all"
                 onClick={() => setCurrentTab('editor')}>
              <div className="p-6 bg-primary/10 rounded-full text-primary shadow-neon-blue">
                <Upload size={40} />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-lg">Tirar Foto ou Galeria</p>
                <p className="text-white/40 text-sm mt-1">Clique para iniciar</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'editor' && (
          <Editor onBack={() => setCurrentTab('home')} />
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
