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
          spinSpeed={7}
          color1="#DE443B"
          color2="#006BB4"
          color3="#162325"
          contrast={3.5}
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
                className="w-32 h-32 mb-10 relative"
                initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring" as const, bounce: 0.5 }}
              >
                <div className="absolute inset-0 bg-primary/40 rounded-[2rem] blur-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.1),_0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center text-white overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/10 before:to-transparent">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={56} strokeWidth={1.5} className="drop-shadow-[0_0_25px_rgba(255,255,255,1)]" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1 
                className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                ThayNails
              </motion.h1>
              
              <motion.p 
                className="text-white/70 mb-14 text-xl font-light leading-relaxed tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Beleza elevada com <br/> <strong className="text-white font-semibold">Simulação Realista</strong>.
              </motion.p>
              
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 240, 255, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTab('upload')}
                className="relative overflow-hidden w-full max-w-[300px] flex items-center justify-center gap-3 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-xl font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                <Camera size={26} className="text-white" />
                Começar
              </motion.button>
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
