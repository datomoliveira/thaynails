import React, { useState } from 'react';
import { ArrowLeft, Palette, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHAPES = [
  { id: 'almond', name: 'Amendoada', icon: '💅' },
  { id: 'stiletto', name: 'Stiletto', icon: '🔪' },
  { id: 'square', name: 'Quadrada', icon: '⬛' },
];

  const COLORS = [
  { id: 'red', hex: '#FF0000', name: 'Vermelho' },
  { id: 'pink', hex: '#FF2A7A', name: 'Rosa' },
  { id: 'blue', hex: '#00F0FF', name: 'Azul Thay' }, // Updated to Thay's favorite
  { id: 'black', hex: '#000000', name: 'Preto' },
  { id: 'nude', hex: '#D2B48C', name: 'Nude' },
  { id: 'white', hex: '#FFFFFF', name: 'Branco' },
];

export default function Editor({ imageFile, onBack }: { imageFile: File | null, onBack: () => void }) {
  const [step, setStep] = useState<'shape' | 'color' | 'result'>('shape');
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ imageUrl: string, analysis: string, nails?: { polygon: number[][] }[] } | null>(null);

  const previewUrl = React.useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);

  const handleApplyShape = () => {
    if (!selectedShape) return;
    setStep('color');
  };

  const handleApplyColor = async () => {
    if (!selectedColor || !imageFile) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('shape', selectedShape);
      formData.append('color', selectedColor);

      const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';
      const response = await fetch(`${WORKER_URL}/api/simulate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha na simulação');

      const data = await response.json();
      setSimulationResult({
        imageUrl: data.imageUrl,
        analysis: data.analysis,
        nails: data.nails
      });
      setStep('result');
    } catch (e) {
      console.error(e);
      alert('Erro ao processar simulação. Verifique sua conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-11 h-11 rounded-full glass-button flex items-center justify-center text-white active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">
          {step === 'shape' && 'Formato'}
          {step === 'color' && 'Cor'}
          {step === 'result' && 'Pronto!'}
        </h2>
        <div className="w-11"></div>
      </div>

      {/* Image Preview Area */}
      <div className="w-full aspect-[3/4] glass-panel mb-8 relative overflow-hidden flex items-center justify-center border-white/5 group">
        <img 
          src={simulationResult?.imageUrl || previewUrl || "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=600&auto=format&fit=crop"} 
          alt="Preview" 
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />

        {/* Virtual Paint Overlay */}
        {simulationResult?.nails && (
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="none"
          >
            {simulationResult.nails.map((nail, i) => (
              <polygon
                key={i}
                points={nail.polygon.map(([y, x]) => `${x},${y}`).join(' ')}
                fill={COLORS.find(c => c.id === selectedColor)?.hex || '#FF0000'}
                className="transition-all duration-1000"
                style={{ 
                  mixBlendMode: 'multiply', 
                  opacity: 0.85,
                  filter: 'blur(0.5px)' 
                }}
              />
            ))}
          </svg>
        )}
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping"></div>
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-6 relative z-10" />
              </div>
              <p className="text-primary font-bold text-xl tracking-widest animate-pulse">PROCESSANDO SIMULAÇÃO</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {step === 'shape' && (
            <motion.div 
              key="shape-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                {SHAPES.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => setSelectedShape(shape.id)}
                    className={`flex flex-col items-center justify-center py-6 rounded-3xl border-2 transition-all duration-300 active:scale-95 ${
                      selectedShape === shape.id 
                        ? 'bg-primary/20 border-primary text-white shadow-neon-blue' 
                        : 'glass-panel border-white/5 text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-3xl mb-2">{shape.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{shape.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-auto">
                <button 
                  onClick={handleApplyShape}
                  disabled={!selectedShape}
                  className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3"
                >
                  <Sparkles size={24} />
                  Continuar para Cores
                </button>
              </div>
            </motion.div>
          )}

          {step === 'color' && (
            <motion.div 
              key="color-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-5 mb-8">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`h-20 rounded-3xl flex items-center justify-center transition-all duration-300 relative active:scale-90 border-2 ${
                      selectedColor === color.id ? 'border-white scale-105 z-10' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.id && (
                      <div className="absolute inset-[-8px] rounded-[2rem] border-2 border-white/30"></div>
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                      ['white', 'nude'].includes(color.id) ? 'text-black/60' : 'text-white/60'
                    }`}>
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="mt-auto">
                <button 
                  onClick={handleApplyColor}
                  disabled={!selectedColor || isProcessing}
                  className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-light"
                >
                  <Palette size={24} />
                  Analisar e Pintar Unhas
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <motion.div 
              key="result-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1"
            >
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-6 overflow-y-auto max-h-[150px]">
                <h3 className="text-primary font-bold mb-2">Simulação Concluída</h3>
                <p className="text-white/80 text-sm italic leading-relaxed">
                  {simulationResult?.analysis || "Sua unha foi simulada com sucesso."}
                </p>
              </div>
              
              <div className="mt-auto pt-4 flex gap-3">
                <button 
                  onClick={() => setStep('shape')}
                  className="flex-1 glass-button py-3 text-white/80 font-medium"
                >
                  Refazer
                </button>
                <button className="flex-1 btn-primary">
                  Salvar nos Favoritos
                </button>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
