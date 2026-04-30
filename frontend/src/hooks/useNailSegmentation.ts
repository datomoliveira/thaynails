/**
 * FASE 1 — Segmentação de Unhas via MediaPipe Hand Landmarker
 * 
 * O MediaPipe detecta 21 landmarks (pontos chave) em cada mão.
 * Usamos os pontos das falanges distais (ponta de cada dedo) para
 * construir uma máscara de precisão cirúrgica para cada unha.
 *
 * Landmarks usados por dedo:
 *  - Polegar:   4  (ponta)
 *  - Indicador: 8  (ponta)
 *  - Médio:     12 (ponta)
 *  - Anelar:    16 (ponta)
 *  - Mínimo:    20 (ponta)
 *
 *  Para construir a "região" da unha, usamos a ponta + o ponto médio
 *  da falange proximal de cada dedo para criar um polígono realista.
 */

import { useCallback, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Par de índices: [ponta, meio da falange, base da falange]
const NAIL_LANDMARK_GROUPS: Record<string, [number, number, number]> = {
  thumb:   [4, 3, 2],
  index:   [8, 7, 6],
  middle:  [12, 11, 10],
  ring:    [16, 15, 14],
  pinky:   [20, 19, 18],
};

export interface NailPolygon {
  finger: string;
  /** Pontos do polígono em pixels absolutos da imagem original */
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

  /** Inicializa o modelo MediaPipe (só uma vez) */
  const initModel = useCallback(async () => {
    if (landmarkerRef.current) return; // Já inicializado

    setIsLoading(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numHands: 2,
      });
    } catch (e: any) {
      setError(`Falha ao carregar modelo: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Gera os polígonos de cada unha a partir de um HTMLImageElement.
   * Retorna null se a mão não for detectada.
   */
  const segmentNails = useCallback(
    async (imgElement: HTMLImageElement): Promise<SegmentationResult | null> => {
      await initModel();
      if (!landmarkerRef.current) return null;

      setError(null);
      const result = landmarkerRef.current.detect(imgElement);

      if (!result.landmarks || result.landmarks.length === 0) {
        setError('Nenhuma mão detectada. Enquadre melhor sua mão.');
        return null;
      }

      const W = imgElement.naturalWidth;
      const H = imgElement.naturalHeight;
      const landmarks = result.landmarks[0]; // Usa a primeira mão detectada

      const nails: NailPolygon[] = Object.entries(NAIL_LANDMARK_GROUPS).map(
        ([finger, [tipIdx, midIdx, baseIdx]]) => {
          const tip  = landmarks[tipIdx];
          const mid  = landmarks[midIdx];
          const base = landmarks[baseIdx];

          // Vetor da direção do dedo (de base → ponta)
          const dirX = tip.x - base.x;
          const dirY = tip.y - base.y;
          const len  = Math.sqrt(dirX * dirX + dirY * dirY) || 0.001;

          // Perpendicular normalizado
          const perpX = -dirY / len;
          const perpY =  dirX / len;

          // Largura da unha = ~40% do comprimento da falange
          const halfWidth = (len * W) * 0.40;

          // 4 pontos base + arredondamento na ponta (8 pontos no total)
          const tipX  = tip.x  * W;
          const tipY  = tip.y  * H;
          const midX  = mid.x  * W;
          const midY  = mid.y  * H;

          const points = [
            // Base esquerda
            { x: midX - perpX * halfWidth, y: midY - perpY * halfWidth * (H / W) },
            // Ponta esquerda
            { x: tipX - perpX * halfWidth * 0.7, y: tipY - perpY * halfWidth * 0.7 * (H / W) },
            // Ponta centro
            { x: tipX, y: tipY - (len * H * 0.15) },
            // Ponta direita
            { x: tipX + perpX * halfWidth * 0.7, y: tipY + perpY * halfWidth * 0.7 * (H / W) },
            // Base direita
            { x: midX + perpX * halfWidth, y: midY + perpY * halfWidth * (H / W) },
          ];

          return { finger, points };
        }
      );

      return { nails, imageWidth: W, imageHeight: H };
    },
    [initModel]
  );

  return { segmentNails, isLoading, error, initModel };
}
