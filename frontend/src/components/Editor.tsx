/**
 * Editor — Pipeline Completo ThayNails
 *
 * Fluxo:
 *  1. Usuária escolhe formato e cor
 *  2. Ao clicar em "Pintar Unhas":
 *     a) Carrega a imagem no DOM (HTMLImageElement)
 *     b) Roda o MediaPipe Hand Landmarker (Fase 1) — client-side, sem custo de API
 *     c) Recebe os polígonos de precisão cirúrgica de cada unha
 *     d) Exibe o NailCanvas (Fase 2) que aplica a cor via Blend Modes
 *  3. Usuária pode salvar ou refazer
 */

import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Palette, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
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

  // URL de preview da imagem original (não enviamos nada para servidor)
  const previewUrl = React.useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile]
  );

  const handleApplyShape = () => {
    if (!selectedShape) return;
    setStep('color');
  };

  /**
   * Pipeline principal: Fase 1 (segmentação) → renderiza Fase 2 (canvas)
   * Tudo client-side. Nenhuma chamada de API. Zero tokens gastos.
   */
  const handlePaint = useCallback(async () => {
    if (!selectedColor || !previewUrl) return;

    setIsProcessing(true);
    setError(null);
    setSegResult(null);

    try {
      // ── Carrega a imagem no DOM ──────────────────────────────────────
      setStatusMsg('Carregando imagem...');
      const img = await loadImage(previewUrl);

      // ── Fase 1: MediaPipe detecta as unhas ──────────────────────────
      setStatusMsg('Detectando unhas com IA...');
      const result = await segmentNails(img);

      if (!result || result.nails.length === 0) {
        setError('Não foi possível detectar as unhas. Tente uma foto com a mão bem iluminada e enquadrada.');
        return;
      }

      // ── Fase 2: Canvas vai renderizar automaticamente via props ─────
      setStatusMsg('Aplicando cor...');
      setSegResult(result);
      setStep('result');
    } catch (e: any) {
      setError(e.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  }, [selectedColor, previewUrl, segmentNails]);

  /** Exporta o canvas como imagem para compartilhar/salvar */
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
    <div className="flex flex-col w-full h-full animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full glass-button flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">
          {step === 'shape'  && 'Formato'}
          {step === 'color'  && 'Cor'}
          {step === 'result' && 'Resultado 💅'}
        </h2>
        <div className="w-11" />
      </div>

      {/* Área de Preview / Canvas */}
      <div className="w-full h-[42vh] min-h-[280px] glass-panel mb-6 relative overflow-hidden flex items-center justify-center border-white/5">

        {/* Imagem original (fase shape/color) */}
        {step !== 'result' && previewUrl && (
          <img
            src={previewUrl}
            alt="Sua mão"
            className="w-full h-full object-contain opacity-90"
          />
        )}

        {/* Canvas com unhas pintadas (fase result) */}
        {step === 'result' && segResult && previewUrl && activeColor && (
          <NailCanvas
            ref={canvasRef}
            imageSrc={previewUrl}
            nails={segResult.nails}
            colorHex={activeColor.hex}
            imageWidth={segResult.imageWidth}
            imageHeight={segResult.imageHeight}
          />
        )}

        {/* Loading */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center z-20 gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping" />
                <Loader2 className="w-14 h-14 text-primary animate-spin relative z-10" />
              </div>
              <p className="text-primary font-bold text-base tracking-widest animate-pulse uppercase">
                {statusMsg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 bg-red-500/90 backdrop-blur-md p-4 rounded-xl z-20 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-white mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium leading-tight">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-white/60 hover:text-white text-lg leading-none">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* Passo 1: Formato */}
          {step === 'shape' && (
            <motion.div
              key="shape"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                {SHAPES.map((shape) => (
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
                  className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  <Sparkles size={22} />
                  Continuar para Cores
                </button>
              </div>
            </motion.div>
          )}

          {/* Passo 2: Cor */}
          {step === 'color' && (
            <motion.div
              key="color"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="grid grid-cols-3 gap-4 mb-8">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`h-20 rounded-3xl flex items-center justify-center transition-all duration-300 relative active:scale-90 border-2 ${
                      selectedColor === color.id ? 'border-white scale-105 z-10' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.id && (
                      <div className="absolute inset-[-8px] rounded-[2rem] border-2 border-white/30" />
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-tighter ${
                        ['white', 'nude'].includes(color.id) ? 'text-black/60' : 'text-white/70'
                      }`}
                    >
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-auto">
                <button
                  onClick={handlePaint}
                  disabled={!selectedColor || isProcessing}
                  className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  <Palette size={22} />
                  Pintar Unhas
                </button>
              </div>
            </motion.div>
          )}

          {/* Passo 3: Resultado */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col flex-1"
            >
              <div className="mt-auto pt-4 flex gap-3">
                <button
                  onClick={() => { setStep('color'); setSegResult(null); }}
                  className="flex-1 glass-button py-3 text-white/80 font-medium"
                >
                  Trocar Cor
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary py-3 font-bold"
                >
                  💾 Salvar
                </button>
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
