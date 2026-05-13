import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;

export async function initHandDetector() {
  if (handLandmarker) return handLandmarker;
  
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "IMAGE",
    numHands: 1
  });
  
  return handLandmarker;
}

export async function detectHand(imageElement: HTMLImageElement) {
  const detector = await initHandDetector();
  const result = detector.detect(imageElement);
  return result;
}
