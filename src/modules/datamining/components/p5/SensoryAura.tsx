import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

const SENSE_CONFIG: {
  key: string;
  color: [number, number, number];
  noiseSpeed: number;
  noiseScale: number;
}[] = [
  { key: 'wzrok',  color: [240, 220, 120], noiseSpeed: 0.008, noiseScale: 0.6 },
  { key: 'sluch',  color: [130, 170, 220], noiseSpeed: 0.012, noiseScale: 0.8 },
  { key: 'dotyk',  color: [210, 140, 160], noiseSpeed: 0.006, noiseScale: 1.0 },
  { key: 'smak',   color: [140, 190, 130], noiseSpeed: 0.010, noiseScale: 0.5 },
  { key: 'zapach', color: [180, 160, 210], noiseSpeed: 0.007, noiseScale: 1.2 },
];

export const SensoryAura = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const cx = W / 2;
    const cy = H / 2;

    const maxVal = Math.max(...Object.values(data), 0.01);

    // Offset each blob so they don't all sit at center
    const blobOffsets = SENSE_CONFIG.map((_, i) => ({
      ox: p.cos(i * p.TWO_PI / SENSE_CONFIG.length + 0.3) * 40,
      oy: p.sin(i * p.TWO_PI / SENSE_CONFIG.length + 0.3) * 30,
    }));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);

      const t = p.frameCount * 0.01;

      for (let si = 0; si < SENSE_CONFIG.length; si++) {
        const cfg = SENSE_CONFIG[si];
        const val = data[cfg.key] || 0;
        const baseR = p.map(val, 0, maxVal, 30, Math.min(W, H) * 0.35);
        const off = blobOffsets[si];

        // Breathing
        const breathe = p.sin(t * 1.5 + si * 1.2) * 10;
        const r = baseR + breathe;

        const blobCx = cx + off.ox + p.sin(t * 0.7 + si) * 8;
        const blobCy = cy + off.oy + p.cos(t * 0.5 + si * 0.8) * 6;

        // Draw blob as many overlapping low-alpha shapes for watercolor effect
        const layers = 12;
        for (let layer = 0; layer < layers; layer++) {
          const layerR = r * (1 - layer * 0.04);
          const alpha = 4 + (layer === 0 ? 3 : 0);

          p.fill(cfg.color[0], cfg.color[1], cfg.color[2], alpha);
          p.noStroke();

          p.beginShape();
          const steps = 60;
          for (let a = 0; a <= steps; a++) {
            const angle = (a / steps) * p.TWO_PI;
            const noiseVal = p.noise(
              p.cos(angle) * cfg.noiseScale + si * 10 + layer * 0.1,
              p.sin(angle) * cfg.noiseScale + si * 10 + layer * 0.1,
              t * cfg.noiseSpeed * 20 + layer * 0.05
            );
            const displacement = layerR * (0.7 + noiseVal * 0.6);
            const px = blobCx + p.cos(angle) * displacement;
            const py = blobCy + p.sin(angle) * displacement;
            (p as any).curveVertex(px, py);
          }
          // Close with extra curve vertices
          for (let a = 0; a <= 2; a++) {
            const angle = (a / steps) * p.TWO_PI;
            const noiseVal = p.noise(
              p.cos(angle) * cfg.noiseScale + si * 10 + layer * 0.1,
              p.sin(angle) * cfg.noiseScale + si * 10 + layer * 0.1,
              t * cfg.noiseSpeed * 20 + layer * 0.05
            );
            const displacement = layerR * (0.7 + noiseVal * 0.6);
            (p as any).curveVertex(
              blobCx + p.cos(angle) * displacement,
              blobCy + p.sin(angle) * displacement
            );
          }
          p.endShape(p.CLOSE);
        }
      }

      // Intersection glow — where blobs overlap, add brightness
      // Approximate with a central glow
      const overlapCount = SENSE_CONFIG.filter(cfg => (data[cfg.key] || 0) > maxVal * 0.3).length;
      if (overlapCount >= 2) {
        const glowAlpha = p.map(overlapCount, 2, 5, 3, 10);
        p.fill(255, 255, 240, glowAlpha);
        p.noStroke();
        p.ellipse(cx, cy, 100 + overlapCount * 20);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
