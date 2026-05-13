/**
 * FASE 1 — Segmentação de Unhas via MediaPipe Hand Landmarker + Geometria Avançada
 */

import { useCallback, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const NAIL_LANDMARK_GROUPS: Record<string, [number, number, number]> = {
  thumb:   [4, 3, 2],
  index:   [8, 7, 6],
  middle:  [12, 11, 10],
  ring:    [16, 15, 14],
  pinky:   [20, 19, 18],
};

export interface NailPolygon {
  finger: string;
  points: { x: number; y: number }[];
}

export interface SegmentationResult {
  nails: NailPolygon[];
  imageWidth: number;
  imageHeight: number;
}

export function useNailSegmentation() {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initModel = useCallback(async () => {
    if (landmarkerRef.current) return;
    setIsLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numHands: 1,
      });
    } catch (e: any) {
      setError(`Falha ao carregar modelo: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const segmentNails = useCallback(
    async (imgElement: HTMLImageElement): Promise<SegmentationResult | null> => {
      await initModel();
      if (!landmarkerRef.current) return null;

      const result = landmarkerRef.current.detect(imgElement);
      if (!result.landmarks || result.landmarks.length === 0) {
        setError('Nenhuma mão detectada. Enquadre melhor sua mão.');
        return null;
      }

      const W = imgElement.naturalWidth;
      const H = imgElement.naturalHeight;
      const landmarks = result.landmarks[0];

      const nails: NailPolygon[] = Object.entries(NAIL_LANDMARK_GROUPS).map(
        ([finger, [tipIdx, midIdx, baseIdx]]) => {
          const tip = landmarks[tipIdx];
          const mid = landmarks[midIdx];
          const base = landmarks[baseIdx];

          // 1. Direção e Comprimento
          const dx = tip.x - mid.x;
          const dy = tip.y - mid.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const nx = dx / len;
          const ny = dy / len;
          const px = -ny;
          const py = nx;

          // 2. Detecção de Lateralidade (Thumb de lado)
          // Se o polegar está muito "fechado" em relação ao indicador, ou o vetor tip-mid está inclinado
          let sideViewFactor = 1.0;
          if (finger === 'thumb') {
            const wrist = landmarks[0];
            const distWristTip = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
            // Se o polegar está comprimido no eixo perpendicular, ele está de lado
            const fingerSpreading = Math.abs((landmarks[8].x - landmarks[4].x) * W);
            if (fingerSpreading < 100) sideViewFactor = 0.6; // Comprime a largura para simular perfil
          }

          const width = (len * W) * (finger === 'thumb' ? 0.45 : 0.38) * sideViewFactor;
          const height = (len * H) * 0.95;

          const cx = (tip.x * W + mid.x * W) / 2;
          const cy = (tip.y * H + mid.y * H) / 2;

          // 3. Gerar polígono anatômico (Borda da cutícula vs Ponta livre)
          const points = [];
          const res = 20;
          for (let i = 0; i <= res; i++) {
            const t = i / res;
            const angle = t * Math.PI;
            
            // Lado superior (ponta da unha) - mais arredondado ou quadrado dependendo da forma
            // Aqui usamos uma elipse base
            const x = Math.cos(angle) * width;
            const y = Math.sin(angle) * height * 0.5;
            
            points.push({
              x: cx + (x * px + y * nx),
              y: cy + (x * py + y * ny)
            });
          }
          
          // Lado inferior (cutícula) - mais reto ou suave
          for (let i = res; i >= 0; i--) {
            const t = i / res;
            const angle = t * Math.PI + Math.PI;
            const x = Math.cos(angle) * width;
            const y = Math.sin(angle) * height * 0.3; // Cutícula é mais rasa
            
            points.push({
              x: cx + (x * px + y * nx),
              y: cy + (x * py + y * ny)
            });
          }

          return { finger, points };
        }
      );

      return { nails, imageWidth: W, imageHeight: H };
    },
    [initModel]
  );

  return { segmentNails, isLoading, error, initModel };
}
