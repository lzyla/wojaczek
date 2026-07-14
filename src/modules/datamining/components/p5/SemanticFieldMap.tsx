import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

interface Blob {
  key: string;
  cx: number;
  cy: number;
  r: number;
  gray: number;
}

export const SemanticFieldMap = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;

    const entries = Object.entries(data)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);

    if (entries.length === 0) return;

    const maxVal = entries[0][1];
    const blobs: Blob[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
      p.noiseSeed(7);

      // Pack blobs — simple circle packing
      for (let i = 0; i < entries.length; i++) {
        const [key, val] = entries[i];
        const r = p.map(val, 0, maxVal, 25, Math.min(W, H) * 0.25);
        let placed = false;
        let bestX = W / 2;
        let bestY = H / 2;

        // Try random positions, avoid overlap
        for (let attempt = 0; attempt < 200; attempt++) {
          const tx = p.random(r + 10, W - r - 10);
          const ty = p.random(r + 10, H - r - 10);
          let overlaps = false;
          for (const b of blobs) {
            const dist = p.dist(tx, ty, b.cx, b.cy);
            if (dist < r + b.r + 4) {
              overlaps = true;
              break;
            }
          }
          if (!overlaps) {
            bestX = tx;
            bestY = ty;
            placed = true;
            break;
          }
        }
        if (!placed) {
          // Push outward
          const angle = (i / entries.length) * p.TWO_PI;
          bestX = W / 2 + p.cos(angle) * (W * 0.25);
          bestY = H / 2 + p.sin(angle) * (H * 0.25);
        }

        const gray = i === 0 ? 51 : 100 + i * 15;
        blobs.push({ key, cx: bestX, cy: bestY, r, gray: Math.min(gray, 210) });
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.008;

      for (let bi = blobs.length - 1; bi >= 0; bi--) {
        const b = blobs[bi];
        const breathe = p.sin(t * 0.8 + bi * 1.2) * 3;
        const r = b.r + breathe;

        // Draw blob as noisy circle
        p.noStroke();

        for (let layer = 0; layer < 5; layer++) {
          const lr = r - layer * 3;
          if (lr <= 0) continue;

          if (bi === 0) {
            // Dominant field gets red accent
            p.fill(194, 48, 48, 8 + layer * 2);
          } else {
            p.fill(b.gray, 15 + layer * 3);
          }

          p.beginShape();
          const steps = 40;
          for (let a = 0; a <= steps; a++) {
            const angle = (a / steps) * p.TWO_PI;
            const noiseR = lr * (0.85 + p.noise(
              p.cos(angle) * 0.5 + bi * 5 + layer * 0.1,
              p.sin(angle) * 0.5 + bi * 5,
              t + layer * 0.05,
            ) * 0.3);
            (p as any).curveVertex(
              b.cx + p.cos(angle) * noiseR,
              b.cy + p.sin(angle) * noiseR,
            );
          }
          // Close curve
          for (let a = 0; a <= 2; a++) {
            const angle = (a / steps) * p.TWO_PI;
            const noiseR = lr * (0.85 + p.noise(
              p.cos(angle) * 0.5 + bi * 5 + layer * 0.1,
              p.sin(angle) * 0.5 + bi * 5,
              t + layer * 0.05,
            ) * 0.3);
            (p as any).curveVertex(
              b.cx + p.cos(angle) * noiseR,
              b.cy + p.sin(angle) * noiseR,
            );
          }
          p.endShape(p.CLOSE);
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
