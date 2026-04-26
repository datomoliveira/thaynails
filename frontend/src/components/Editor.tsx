import React, { useState } from 'react';
import { ArrowLeft, Check, Palette, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHAPES = [
  { id: 'almond', name: 'Amendoada', icon: '💅' },
  { id: 'stiletto', name: 'Stiletto', icon: '🔪' },
  { id: 'square', name: 'Quadrada', icon: '⬛' },
];

const COLORS = [
  { id: 'red', hex: '#E60000', name: 'Vermelho Clássico' },
  { id: 'pink', hex: '#FF2A7A', name: 'Rosa Thay' },
  { id: 'blue', hex: '#0066FF', name: 'Azul Vibrante' },
  { id: 'black', hex: '#1A1A1A', name: 'Preto Intenso' },
  { id: 'nude', hex: '#E5C5B5', name: 'Nude Chic' },
  { id: 'white', hex: '#F0F0F0', name: 'Branco Paz' },
];

export default function Editor({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'shape' | 'color' | 'result'>('shape');
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplyShape = () => {
    if (!selectedShape) return;
    setStep('color');
  };

  const handleApplyColor = async () => {
    if (!selectedColor) return;
    
    setIsProcessing(true);
    
    // Simular chamada ao Cloudflare Worker
    try {
      // Em um cenário real, aqui seria o fetch para a API
      await new Promise(resolve => setTimeout(resolve, 2500));
      setStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 rounded-full glass-button text-white/70">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">
          {step === 'shape' && 'Escolha o Formato'}
          {step === 'color' && 'Escolha a Cor'}
          {step === 'result' && 'Resultado'}
        </h2>
        <div className="w-9"></div> {/* Spacer */}
      </div>

      {/* Image Preview Area */}
      <div className="w-full aspect-[3/4] glass-panel mb-6 relative overflow-hidden flex items-center justify-center">
        {/* Mockup da imagem da mão */}
        <img 
          src="https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=600&auto=format&fit=crop" 
          alt="Mão" 
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Overlay de carregamento */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-white/80 font-medium">IA trabalhando...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* Step 1: Shape Selection */}
          {step === 'shape' && (
            <motion.div 
              key="shape-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-3 mb-6">
                {SHAPES.map(shape => (
                  <button
                    key={shape.id}
                    onClick={() => setSelectedShape(shape.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                      selectedShape === shape.id 
                        ? 'bg-primary/20 border-primary text-white shadow-neon-blue' 
                        : 'glass-panel border-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl mb-2">{shape.icon}</span>
                    <span className="text-xs font-medium">{shape.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-auto pt-4">
                <button 
                  onClick={handleApplyShape}
                  disabled={!selectedShape}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Aplicar Formato
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Color Selection */}
          {step === 'color' && (
            <motion.div 
              key="color-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative group`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.id && (
                      <div className="absolute inset-[-6px] rounded-full border-2 border-white/50 animate-pulse"></div>
                    )}
                    {selectedColor === color.id && <Check size={20} color={color.hex === '#F0F0F0' ? '#000' : '#FFF'} />}
                  </button>
                ))}
              </div>
              
              <div className="mt-auto pt-4">
                <button 
                  onClick={handleApplyColor}
                  disabled={!selectedColor || isProcessing}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Palette size={20} />
                  Colorir com IA
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
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center mb-6">
                <h3 className="text-primary font-medium mb-1">Incrível!</h3>
                <p className="text-white/70 text-sm">Sua unha foi simulada com sucesso.</p>
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
