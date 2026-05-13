import React, { useState } from 'react';
import { Upload, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoftAurora from './components/SoftAurora';
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

  // Fluid transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.95 },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, filter: 'blur(10px)', scale: 0.95, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center bg-[#050505] overflow-hidden text-white font-sans">
      
      {/* Dynamic SoftAurora Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#f7f7f7"
          color2="#e100ff"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
        {/* Subtle dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
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
                  O Futuro da Beleza
                </div>
                <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-white leading-[1.1] mb-6 drop-shadow-2xl py-4 overflow-visible">
                  THAY<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">NAILS</span>
                </h1>
                <div className="h-[1px] w-12 bg-white/20 mx-auto mt-6"></div>
              </motion.div>
              
              <motion.div 
                className="text-white/60 mb-16 text-lg font-light leading-relaxed tracking-wide max-w-[320px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
              >
                <p className="mb-4">
                  Sempre em dúvida sobre qual cor escolher? 
                  <span className="text-white/90 block mt-1 font-medium">Visualize agora a cor perfeita para você.</span>
                </p>
              </motion.div>
              
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentTab('upload')}
                className="group relative w-full max-w-[280px] py-5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-sm font-bold uppercase tracking-[0.2em] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 text-white">Começar Simulação</span>
              </motion.button>

              {/* Process Section */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-32 w-full flex flex-col items-center gap-16 pb-20"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">Como funciona</h3>
                  <p className="text-white/40 text-sm max-w-[240px] mx-auto">Transformação em três passos simples e sem esforço.</p>
                </div>

                <div className="grid grid-cols-1 gap-12 w-full">
                  <StepItem 
                    icon={<Upload className="text-primary" size={32} />}
                    title="1. Capture"
                    desc="Tire uma foto clara de suas mãos em qualquer iluminação."
                  />
                  <StepItem 
                    icon={<Palette className="text-accent" size={32} />}
                    title="2. Escolha"
                    desc="Explore dezenas de tons exclusivos e formatos modernos."
                  />
                  <StepItem 
                    icon={<Sparkles className="text-white" size={32} />}
                    title="3. Visualize"
                    desc="Veja o resultado final aplicado perfeitamente em segundos."
                  />
                </div>

                <div className="mt-8 w-full">
                  <p className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-6 text-center">Resultado Esperado</p>
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                    <img 
                      src="/nail_simulation_result_mockup_1778631005146.png" 
                      alt="Resultado da Simulação" 
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-white/60 uppercase tracking-tighter">Cor Escolhida</p>
                        <p className="text-lg font-bold">Magenta Luxury</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#e100ff] shadow-[0_0_10px_rgba(225,0,255,0.8)]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-12 flex flex-col items-center gap-2 text-white/20"
              >
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent"></div>
                <span className="text-[0.6rem] uppercase tracking-widest">Role para Explorar</span>
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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-[40px] rounded-t-[2rem] border-t border-white/20 flex justify-around items-center max-w-md mx-auto w-full shadow-[0_-10px_50px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: 'calc(var(--safe-area-bottom) + 0.8rem)', paddingTop: '0.8rem' }}
      >
        <NavButton 
          icon={<Sparkles size={22} />} 
          label="Simular" 
          active={['home', 'upload', 'editor'].includes(currentTab)} 
          onClick={() => setCurrentTab('home')} 
        />
        <NavButton 
          icon={<Heart size={22} />} 
          label="Salvos" 
          active={currentTab === 'favorites'} 
          onClick={() => setCurrentTab('favorites')} 
        />
      </motion.nav>
    </div>
  );
}

function StepItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0 shadow-lg">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-lg font-bold tracking-tight">{title}</h4>
        <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1.5 transition-colors duration-300 ${active ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
    >
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute -top-2 w-8 h-0.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      )}
      <motion.div animate={{ scale: active ? 1.1 : 1 }} transition={{ type: "spring" as const, bounce: 0.5 }}>
        {icon}
      </motion.div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </motion.button>
  );
}

export default App;
