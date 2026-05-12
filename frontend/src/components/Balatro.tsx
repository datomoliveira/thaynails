import React, { useRef, useEffect } from 'react';

interface BalatroProps {
  spinRotation?: number;
  spinSpeed?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  contrast?: number;
  lighting?: number;
  spinAmount?: number;
  pixelFilter?: number;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
};

export const Balatro: React.FC<BalatroProps> = ({
  spinRotation = -2,
  spinSpeed = 7,
  color1 = '#DE443B',
  color2 = '#006BB4',
  color3 = '#162325',
  contrast = 3.5,
  lighting = 0.4,
  spinAmount = 0.25,
  pixelFilter = 700,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uSpinRotation;
      uniform float uSpinSpeed;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uContrast;
      uniform float uLighting;
      uniform float uSpinAmount;
      uniform float uPixelFilter;

      vec2 hash( vec2 p ) {
        p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
      }

      float noise( in vec2 p ) {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
        vec2 i = floor( p + (p.x+p.y)*K1 );
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0*K2;
        vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
        vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
        return dot( n, vec3(70.0) );
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        if(uPixelFilter > 0.0) {
           uv = floor(uv * uPixelFilter) / uPixelFilter;
        }
        uv = uv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        float t = uTime * uSpinSpeed * 0.1;
        float rot = uSpinRotation * length(uv) * uSpinAmount;
        float s = sin(rot + t);
        float c = cos(rot + t);
        uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);

        float n = noise(uv * 2.0 + t);
        float n2 = noise(uv * 4.0 - t * 0.5);
        
        float v = n * 0.5 + n2 * 0.5;
        v = v * uContrast;
        
        vec3 col = mix(uColor1, uColor2, smoothstep(-1.0, 1.0, v));
        col = mix(col, uColor3, smoothstep(0.0, 1.0, n2 + 0.5));
        
        col += vec3(uLighting) * max(0.0, sin(v * 10.0 + t * 2.0));

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program || !vs || !fs) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      uTime: gl.getUniformLocation(program, 'uTime'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uSpinRotation: gl.getUniformLocation(program, 'uSpinRotation'),
      uSpinSpeed: gl.getUniformLocation(program, 'uSpinSpeed'),
      uColor1: gl.getUniformLocation(program, 'uColor1'),
      uColor2: gl.getUniformLocation(program, 'uColor2'),
      uColor3: gl.getUniformLocation(program, 'uColor3'),
      uContrast: gl.getUniformLocation(program, 'uContrast'),
      uLighting: gl.getUniformLocation(program, 'uLighting'),
      uSpinAmount: gl.getUniformLocation(program, 'uSpinAmount'),
      uPixelFilter: gl.getUniformLocation(program, 'uPixelFilter'),
    };

    let animationFrameId: number;
    let startTime = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = (time: number) => {
      gl.uniform1f(uniforms.uTime, (time - startTime) / 1000);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.uSpinRotation, spinRotation);
      gl.uniform1f(uniforms.uSpinSpeed, spinSpeed);
      gl.uniform3fv(uniforms.uColor1, hexToRgb(color1));
      gl.uniform3fv(uniforms.uColor2, hexToRgb(color2));
      gl.uniform3fv(uniforms.uColor3, hexToRgb(color3));
      gl.uniform1f(uniforms.uContrast, contrast);
      gl.uniform1f(uniforms.uLighting, lighting);
      gl.uniform1f(uniforms.uSpinAmount, spinAmount);
      gl.uniform1f(uniforms.uPixelFilter, pixelFilter);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    spinRotation,
    spinSpeed,
    color1,
    color2,
    color3,
    contrast,
    lighting,
    spinAmount,
    pixelFilter,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default Balatro;
