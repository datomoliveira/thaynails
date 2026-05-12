/**
 * Editor — Pipeline Completo ThayNails
 * Liquid Glass Edition
 */

import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Palette, Sparkles, AlertTriangle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNailSegmentation, type SegmentationResult } from '../hooks/useNailSegmentation';
import NailCanvas, { type NailCanvasRef } from './NailCanvas';

const SHAPES = [
  { id: 'almond',   name: 'Amendoada', icon: '💅' },
  { id: 'stiletto', name: 'Stiletto',  icon: '🔪' },
  { id: 'square',   name: 'Quadrada',  icon: '⬛' },
];

const COLORS = [
  { id: 'red',   hex: '#CC1A1A', name: 'Vermelho' },
  { id: 'pink',  hex: '#E8185A', name: 'Rosa' },
  { id: 'blue',  hex: '#00C5D4', name: 'Azul Thay' },
  { id: 'black', hex: '#1A1A1A', name: 'Preto' },
  { id: 'nude',  hex: '#C8956C', name: 'Nude' },
  { id: 'white', hex: '#F0EEE8', name: 'Branco' },
];

type Step = 'shape' | 'color' | 'result';

// Animation variants for extreme fluidity
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, bounce: 0.4 } }
};

export default function Editor({
  imageFile,
  onBack,
}: {
  imageFile: File | null;
  onBack: () => void;
}) {
  const [step, setStep]               = useState<Step>('shape');
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isProcessing, setIsProcessing]   = useState(false);
  const [statusMsg, setStatusMsg]         = useState('');
  const [error, setError]                 = useState<string | null>(null);
  const [segResult, setSegResult]         = useState<SegmentationResult | null>(null);

  const { segmentNails } = useNailSegmentation();
  const canvasRef = useRef<NailCanvasRef>(null);

  const previewUrl = React.useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  const handleApplyShape = () => {
    if (!selectedShape) return;
    setStep('color');
  };

  const handlePaint = useCallback(async () => {
    if (!selectedColor || !previewUrl) return;

    setIsProcessing(true);
    setError(null);
    setSegResult(null);

    try {
      setStatusMsg('Analisando contornos...');
      const img = await loadImage(previewUrl);

      setStatusMsg('Aplicando IA Vision...');
      const result = await segmentNails(img);

      if (!result || result.nails.length === 0) {
        setError('Não foi possível detectar as unhas com precisão. Tente uma foto com melhor iluminação.');
        return;
      }

      setStatusMsg('Renderizando camadas...');
      setSegResult(result);
      setStep('result');
    } catch (e: any) {
      setError(e.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  }, [selectedColor, previewUrl, segmentNails]);

  const handleSave = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `thaynails-${Date.now()}.jpg`;
    a.click();
  }, []);

  const activeColor = COLORS.find((c) => c.id === selectedColor);

  return (
    <div className="flex flex-col w-full h-full relative">

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" as const, stiffness: 100 }}
        className="flex items-center justify-between mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 drop-shadow-sm">
          {step === 'shape'  && 'Formato'}
          {step === 'color'  && 'Cores'}
          {step === 'result' && 'Resultado'}
        </h2>
        <div className="w-12" />
      </motion.div>

      {/* Preview / Canvas Area */}
      <motion.div 
        layoutId="preview-container"
        className="w-full h-[45vh] min-h-[300px] bg-white/5 backdrop-blur-2xl rounded-[2.5rem] mb-8 relative overflow-hidden flex items-center justify-center border border-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.02),_0_15px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Subtle internal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {step !== 'result' && previewUrl && (
            <motion.img
              key="preview-img"
              initial={{ scale: 1.1, filter: 'blur(10px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              exit={{ scale: 0.9, filter: 'blur(10px)', opacity: 0 }}
              transition={{ duration: 0.6 }}
              src={previewUrl}
              alt="Sua mão"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          )}

          {step === 'result' && segResult && previewUrl && activeColor && (
            <motion.div
              key="result-canvas"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="w-full h-full"
            >
              <NailCanvas
                ref={canvasRef}
                imageSrc={previewUrl}
                nails={segResult.nails}
                colorHex={activeColor.hex}
                imageWidth={segResult.imageWidth}
                imageHeight={segResult.imageHeight}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-30"
            >
              <div className="relative flex items-center justify-center">
                {/* Liquid spinner rings */}
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute w-24 h-24 rounded-full border-t-2 border-primary border-opacity-80"
                />
                <motion.div 
                  animate={{ rotate: -360, scale: [1.2, 1, 1.2] }} 
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute w-20 h-20 rounded-full border-b-2 border-accent border-opacity-80"
                />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Sparkles className="w-8 h-8 text-white relative z-10 animate-pulse" />
              </div>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white mt-8 font-semibold text-lg tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
              >
                {statusMsg}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-6 left-6 right-6 bg-red-500/20 backdrop-blur-3xl p-5 rounded-3xl z-40 border border-red-500/50 shadow-[0_10px_40px_rgba(255,0,0,0.2)]"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                <p className="text-sm text-white/90 font-medium leading-relaxed flex-1">{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls */}
      <div className="flex-1 flex flex-col relative z-20">
        <AnimatePresence mode="wait">

          {/* Step 1: Shape */}
          {step === 'shape' && (
            <motion.div
              key="shape"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                {SHAPES.map((shape) => (
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    key={shape.id}
                    onClick={() => setSelectedShape(shape.id)}
                    className={`relative overflow-hidden flex flex-col items-center justify-center py-8 rounded-[2rem] border transition-colors duration-300 ${
                      selectedShape === shape.id
                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                        : 'bg-white/5 backdrop-blur-xl border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    {selectedShape === shape.id && (
                      <motion.div layoutId="shape-glow" className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent" />
                    )}
                    <span className="text-4xl mb-3 relative z-10 drop-shadow-lg">{shape.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider relative z-10">{shape.name}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto">
                <motion.button
                  whileHover={{ scale: selectedShape ? 1.02 : 1 }}
                  whileTap={{ scale: selectedShape ? 0.98 : 1 }}
                  onClick={handleApplyShape}
                  disabled={!selectedShape}
                  className="w-full relative overflow-hidden py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                  {selectedShape && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40" 
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <Sparkles size={24} /> Continuar
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Color */}
          {step === 'color' && (
            <motion.div
              key="color"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-5 mb-8">
                {COLORS.map((color) => (
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, rotate: Math.random() * 4 - 2 }}
                    whileTap={{ scale: 0.9 }}
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className="group relative h-24 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                    style={{ backgroundColor: color.hex }}
                  >
                    {/* Glassy reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 rounded-[2rem]"></div>
                    
                    {selectedColor === color.id && (
                      <motion.div 
                        layoutId="color-outline"
                        className="absolute inset-[-6px] rounded-[2.3rem] border-[3px] border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]" 
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] font-black uppercase tracking-tighter drop-shadow-md ${
                        ['white', 'nude'].includes(color.id) ? 'text-black/80' : 'text-white'
                      }`}
                    >
                      {color.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto">
                <motion.button
                  whileHover={{ scale: (!selectedColor || isProcessing) ? 1 : 1.02 }}
                  whileTap={{ scale: (!selectedColor || isProcessing) ? 1 : 0.98 }}
                  onClick={handlePaint}
                  disabled={!selectedColor || isProcessing}
                  className="w-full relative overflow-hidden py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)] group"
                >
                  {selectedColor && !isProcessing && (
                    <motion.div 
                      className="absolute inset-0"
                      style={{ backgroundColor: activeColor?.hex, opacity: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3 drop-shadow-lg">
                    <Palette size={24} /> Transformar Unhas
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.4 } }}
              className="flex flex-col flex-1"
            >
              <div className="mt-auto pt-4 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setStep('color'); setSegResult(null); }}
                  className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-4 text-white font-semibold text-lg shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
                >
                  Voltar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,240,255,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex-[2] relative overflow-hidden rounded-2xl py-4 text-white font-bold text-lg border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-accent/60"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Download size={22} /> Salvar Foto
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Utilitário ───────────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
    img.src = src;
  });
}
