import React, { useState } from 'react';
import { Camera, Upload, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from './components/Editor';
import Balatro from './components/Balatro';

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

  // Fluid transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.95 },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.95, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-[#050505] overflow-hidden text-white font-sans">
      
      {/* Dynamic Balatro Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-80">
        <Balatro
          spinRotation={-2}
          spinSpeed={1.5}
          color1="#DE443B"
          color2="#006BB4"
          color3="#162325"
          contrast={4}
          lighting={0.4}
          spinAmount={0.25}
          pixelFilter={700}
        />
        {/* Subtle dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-md relative z-10 flex-1 px-6 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide" 
            style={{ paddingTop: 'calc(var(--safe-area-top) + 3rem)', paddingBottom: 'calc(var(--safe-area-bottom) + 9rem)' }}>
        
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div 
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center flex-1 text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mb-12 relative"
              >
                <div className="text-[0.7rem] font-bold tracking-[0.4em] uppercase text-white/40 mb-4 drop-shadow-sm">
                  The Future of Beauty
                </div>
                <h1 className="text-7xl font-black tracking-tighter text-white leading-[0.8] mb-2 drop-shadow-2xl">
                  THAY<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">NAILS</span>
                </h1>
                <div className="h-[1px] w-12 bg-white/20 mx-auto mt-6"></div>
              </motion.div>
              
              <motion.p 
                className="text-white/60 mb-16 text-lg font-light leading-relaxed tracking-wider max-w-[280px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
              >
                Elevate your style with <br/> 
                <span className="text-white/90">Precision AI Simulation</span>
              </motion.p>
              
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentTab('upload')}
                className="group relative w-full max-w-[260px] py-5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-sm font-bold uppercase tracking-[0.2em] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">Get Started</span>
              </motion.button>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-20 flex flex-col items-center gap-2 text-white/20"
              >
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent"></div>
                <span className="text-[0.6rem] uppercase tracking-widest">Scroll to Explore</span>
              </motion.div>
            </motion.div>
          )}

          {currentTab === 'upload' && (
            <motion.div 
              key="upload"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center flex-1"
            >
              <h2 className="text-4xl font-bold mb-12 tracking-tight text-center drop-shadow-md">Envie sua foto</h2>
              
              <motion.label 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full aspect-[3/4] bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-[inset_0_0_30px_rgba(255,255,255,0.05),_0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-8 cursor-pointer relative overflow-hidden group"
              >
                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <motion.div 
                  className="p-8 bg-white/10 backdrop-blur-md rounded-full text-white shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/20"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload size={48} strokeWidth={1.5} />
                </motion.div>
                
                <div className="text-center z-10">
                  <p className="text-white font-semibold text-2xl tracking-wide drop-shadow">Tirar Foto</p>
                  <p className="text-white/50 text-base mt-2">Ou escolha da galeria</p>
                </div>
              </motion.label>
              
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setCurrentTab('home')}
                className="mt-8 text-white/50 hover:text-white transition-colors"
              >
                Voltar
              </motion.button>
            </motion.div>
          )}

          {currentTab === 'editor' && (
            <motion.div
              key="editor"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col"
            >
              <Editor imageFile={selectedFile} onBack={() => { setCurrentTab('home'); setSelectedFile(null); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring" as const, bounce: 0, duration: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-[40px] rounded-t-[3rem] border-t border-white/20 flex justify-around items-center max-w-md mx-auto w-full shadow-[0_-10px_50px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 1.5rem)', paddingTop: '1.5rem' }}
      >
        <NavButton 
          icon={<Sparkles size={28} />} 
          label="Simular" 
          active={['home', 'upload', 'editor'].includes(currentTab)} 
          onClick={() => setCurrentTab('home')} 
        />
        <NavButton 
          icon={<Heart size={28} />} 
          label="Salvos" 
          active={currentTab === 'favorites'} 
          onClick={() => setCurrentTab('favorites')} 
        />
      </motion.nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 transition-colors duration-300 ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
    >
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute -top-4 w-12 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      )}
      <motion.div animate={{ scale: active ? 1.1 : 1 }} transition={{ type: "spring" as const, bounce: 0.5 }}>
        {icon}
      </motion.div>
      <span className="text-xs font-semibold tracking-wider">{label}</span>
    </motion.button>
  );
}

export default App;
