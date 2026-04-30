/**
 * FASE 2 — Coloração Realista via HTML5 Canvas + Blend Modes
 * FASE 3 — Placeholder para Inpainting (Nail Art futura)
 *
 * Pipeline:
 *  1. Recebe a foto original + os polígonos de unhas (da Fase 1)
 *  2. Desenha a foto no canvas (camada base)
 *  3. Preenche cada polígono de unha com a cor HEX escolhida usando
 *     globalCompositeOperation = 'multiply' → tinge mantendo reflexos e texturas
 *  4. Adiciona um brilho suave simulando o top coat do esmalte
 *
 * FASE 3 (placeholder):
 *  A função `applyNailArt` está isolada e pronta para ser conectada
 *  ao Stable Diffusion Inpainting quando for necessário.
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { NailPolygon } from '../hooks/useNailSegmentation';

interface NailCanvasProps {
  imageSrc: string;
  nails: NailPolygon[];
  colorHex: string;
  imageWidth: number;
  imageHeight: number;
}

export interface NailCanvasRef {
  exportImage: () => string | null;
}

const NailCanvas = forwardRef<NailCanvasRef, NailCanvasProps>(
  ({ imageSrc, nails, colorHex, imageWidth, imageHeight }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
      exportImage: () => canvasRef.current?.toDataURL('image/jpeg', 0.95) ?? null,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !imageSrc || nails.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width  = imageWidth;
      canvas.height = imageHeight;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      img.onload = () => {
        // ─── CAMADA 1: Foto original ─────────────────────────────────────
        ctx.clearRect(0, 0, imageWidth, imageHeight);
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

        // ─── CAMADA 2: Cor da unha (Blend Mode "multiply") ───────────────
        // O modo "multiply" escurece multiplicando os valores dos pixels.
        // Isso preserva os reflexos claros da foto original (a luz passa),
        // e tinge as áreas escuras da textura da unha. Resultado: hiper-realista.
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = colorHex;

        nails.forEach((nail) => {
          if (nail.points.length < 3) return;
          ctx.beginPath();
          ctx.moveTo(nail.points[0].x, nail.points[0].y);
          nail.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fill();
        });

        // ─── CAMADA 3: Brilho (simula top coat / gloss) ──────────────────
        // Volta ao modo normal para desenhar um reflexo branco suave no
        // terço superior de cada una, simulando o brilho do esmalte.
        ctx.globalCompositeOperation = 'source-over';

        nails.forEach((nail) => {
          if (nail.points.length < 3) return;

          // Centro X/Y da unha
          const avgX = nail.points.reduce((s, p) => s + p.x, 0) / nail.points.length;
          const avgY = nail.points.reduce((s, p) => s + p.y, 0) / nail.points.length;
          const topY = Math.min(...nail.points.map((p) => p.y));

          // Gradiente radial no topo da unha
          const gloss = ctx.createRadialGradient(
            avgX, topY + (avgY - topY) * 0.25, 2,
            avgX, topY + (avgY - topY) * 0.25, (avgY - topY) * 0.6
          );
          gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
          gloss.addColorStop(1, 'rgba(255,255,255,0)');

          ctx.fillStyle = gloss;
          ctx.beginPath();
          ctx.moveTo(nail.points[0].x, nail.points[0].y);
          nail.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.fill();
        });

        // ─── BORDA SUAVE para não cortar bruscamente ─────────────────────
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1.5;
        nails.forEach((nail) => {
          if (nail.points.length < 3) return;
          ctx.beginPath();
          ctx.moveTo(nail.points[0].x, nail.points[0].y);
          nail.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
        });
      };
    }, [imageSrc, nails, colorHex, imageWidth, imageHeight]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '1rem',
        }}
      />
    );
  }
);

NailCanvas.displayName = 'NailCanvas';
export default NailCanvas;

// ─────────────────────────────────────────────────────────────────────────────
// FASE 3 — Placeholder: Inpainting para Nail Art (Glitter, Mármore, etc.)
// ─────────────────────────────────────────────────────────────────────────────
//
// Quando a usuária pedir uma textura complexa (ex: "glitter", "mármore"),
// descomente e use esta função. Ela monta a máscara de precisão e envia
// para um endpoint de Stable Diffusion Inpainting.
//
// export async function applyNailArt(
//   originalImageBase64: string,
//   nails: NailPolygon[],
//   imageWidth: number,
//   imageHeight: number,
//   nailArtPrompt: string   // ex: "glitter gold, sparkling, macro photo"
// ): Promise<string> {
//
//   // 1. Gera a máscara (branco = área da unha, preto = resto)
//   const maskCanvas = document.createElement('canvas');
//   maskCanvas.width  = imageWidth;
//   maskCanvas.height = imageHeight;
//   const mCtx = maskCanvas.getContext('2d')!;
//   mCtx.fillStyle = 'black';
//   mCtx.fillRect(0, 0, imageWidth, imageHeight);
//   mCtx.fillStyle = 'white';
//   nails.forEach((nail) => {
//     mCtx.beginPath();
//     mCtx.moveTo(nail.points[0].x, nail.points[0].y);
//     nail.points.slice(1).forEach((p) => mCtx.lineTo(p.x, p.y));
//     mCtx.closePath();
//     mCtx.fill();
//   });
//   const maskBase64 = maskCanvas.toDataURL('image/png');
//
//   // 2. Envia para o Worker que chama o Stable Diffusion Inpainting
//   const response = await fetch('/api/inpaint', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       image: originalImageBase64,
//       mask:  maskBase64,
//       prompt: nailArtPrompt,
//     }),
//   });
//   const data = await response.json();
//   return data.imageUrl; // URL da imagem gerada com a nail art
// }
