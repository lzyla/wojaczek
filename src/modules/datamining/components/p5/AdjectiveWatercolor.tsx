import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { zmyslowe: number; oceniajace: number; opisowe: number };
}

export const AdjectiveWatercolor = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const total = data.zmyslowe + data.oceniajace + data.opisowe || 1;

    interface Wash {
      cx: number;
      cy: number;
      r: number;
      color: [number, number, number];
      phase: number;
    }

    const washes: Wash[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      // zmyslowe = warm pink, oceniajace = cool blue, opisowe = neutral gray
      const zmR = Math.sqrt(data.zmyslowe / total) * Math.min(W, H) * 0.5;
      const ocR = Math.sqrt(data.oceniajace / total) * Math.min(W, H) * 0.5;
      const opR = Math.sqrt(data.opisowe / total) * Math.min(W, H) * 0.5;

      washes.push(
        { cx: W * 0.35, cy: H * 0.45, r: Math.max(zmR, 20), color: [194, 48, 48], phase: 0 },
        { cx: W * 0.6, cy: H * 0.4, r: Math.max(ocR, 20), color: [80, 100, 160], phase: 2 },
        { cx: W * 0.5, cy: H * 0.6, r: Math.max(opR, 20), color: [140, 140, 140], phase: 4 },
      );
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      for (const w of washes) {
        const layers = 25;
        for (let i = layers; i >= 0; i--) {
          const frac = i / layers;
          const r = w.r * frac;
          const alpha = 6 + (1 - frac) * 4;
          const wobble = p.noise(w.cx * 0.005, t + w.phase + i * 0.1) * 12;
          p.noStroke();
          p.fill(w.color[0], w.color[1], w.color[2], alpha);
          p.ellipse(
            w.cx + p.sin(t + w.phase) * 3 + wobble,
            w.cy + p.cos(t * 0.7 + w.phase) * 3,
            r * 2 + wobble,
            r * 2 * 0.85 + p.noise(t + i) * 10,
          );
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
