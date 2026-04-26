import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Heart } from 'lucide-react';
import Editor from './components/Editor';

function App() {
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <div className="min-h-screen pb-24 relative flex flex-col items-center">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-md relative z-10 flex-1 px-4 pt-8 flex flex-col">
        {currentTab === 'home' && (
          <div className="flex flex-col items-center justify-center flex-1 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 mb-8 relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-full h-full glass-panel flex items-center justify-center text-primary">
                <Sparkles size={40} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">ThayNails</h1>
            <p className="text-white/60 mb-10 text-lg">Seu simulador de unhas com IA.</p>
            
            <button 
              onClick={() => setCurrentTab('upload')}
              className="btn-primary w-full max-w-xs flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Começar Simulação
            </button>
          </div>
        )}

        {currentTab === 'upload' && (
          <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-semibold mb-8">Envie sua foto</h2>
            
            <div className="w-full max-w-xs aspect-[3/4] glass-panel border-dashed border-2 border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-colors"
                 onClick={() => setCurrentTab('editor')}>
              <div className="p-4 bg-white/5 rounded-full text-white/50">
                <Upload size={32} />
              </div>
              <p className="text-white/50 text-sm">Toque para selecionar da galeria</p>
            </div>
          </div>
        )}

        {currentTab === 'editor' && (
          <Editor onBack={() => setCurrentTab('home')} />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 glass-panel rounded-t-3xl rounded-b-none border-b-0 border-x-0 border-white/10 flex justify-around items-center max-w-md mx-auto w-full backdrop-blur-2xl">
        <NavButton 
          icon={<Sparkles size={24} />} 
          label="Simular" 
          active={currentTab === 'home' || currentTab === 'upload' || currentTab === 'editor'} 
          onClick={() => setCurrentTab('home')} 
        />
        <NavButton 
          icon={<Heart size={24} />} 
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
