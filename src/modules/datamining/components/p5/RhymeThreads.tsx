import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

export const RhymeThreads = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;

    interface Arc {
      x1: number;
      x2: number;
      type: string;
      phase: number;
    }

    const arcs: Arc[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const types = Object.entries(data).filter(([, v]) => v > 0);
      const totalArcs = types.reduce((s, [, v]) => s + v, 0);
      const positions = Math.max(totalArcs * 2, 10);
      const spacing = (W - 60) / positions;

      let posIdx = 0;
      for (const [type, count] of types) {
        for (let i = 0; i < count; i++) {
          const x1 = 30 + posIdx * spacing;
          posIdx++;
          const gap = p.random(1, 4);
          const x2 = 30 + Math.min(posIdx + gap, positions - 1) * spacing;
          posIdx = Math.min(posIdx + 1, positions);
          arcs.push({
            x1,
            x2,
            type,
            phase: p.random(p.TWO_PI),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;
      const baseY = H - 40;

      // Baseline
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(20, baseY, W - 20, baseY);

      // Position dots
      p.noStroke();
      p.fill(180, 80);
      for (const a of arcs) {
        p.ellipse(a.x1, baseY, 3, 3);
        p.ellipse(a.x2, baseY, 3, 3);
      }

      // Arcs
      p.noFill();
      for (const a of arcs) {
        const midX = (a.x1 + a.x2) / 2;
        const arcH = (a.x2 - a.x1) * 0.5 + 20;
        const breathe = p.sin(t + a.phase) * 2;

        if (a.type === 'exact') {
          p.stroke(80, 100);
          p.strokeWeight(1.2);
          // Solid arc
          p.beginShape();
          for (let s = 0; s <= 20; s++) {
            const frac = s / 20;
            const x = p.lerp(a.x1, a.x2, frac);
            const y = baseY - p.sin(frac * p.PI) * (arcH + breathe);
            p.vertex(x, y);
          }
          p.endShape();
        } else if (a.type === 'approximate' || a.type === 'assonance') {
          p.stroke(140, 80);
          p.strokeWeight(1);
          // Dashed arc
          for (let s = 0; s < 20; s += 2) {
            const f1 = s / 20;
            const f2 = (s + 1) / 20;
            const x1d = p.lerp(a.x1, a.x2, f1);
            const y1d = baseY - p.sin(f1 * p.PI) * (arcH + breathe);
            const x2d = p.lerp(a.x1, a.x2, f2);
            const y2d = baseY - p.sin(f2 * p.PI) * (arcH + breathe);
            p.line(x1d, y1d, x2d, y2d);
          }
        } else if (a.type === 'internal') {
          p.stroke(194, 48, 48, 80);
          p.strokeWeight(0.8);
          // Dotted arc
          for (let s = 0; s <= 20; s++) {
            const frac = s / 20;
            const x = p.lerp(a.x1, a.x2, frac);
            const y = baseY - p.sin(frac * p.PI) * (arcH * 0.6 + breathe);
            p.point(x, y);
          }
        } else {
          // alliteration or unknown
          p.stroke(100, 60);
          p.strokeWeight(0.8);
          p.beginShape();
          for (let s = 0; s <= 20; s++) {
            const frac = s / 20;
            const x = p.lerp(a.x1, a.x2, frac);
            const y = baseY - p.sin(frac * p.PI) * (arcH * 0.4 + breathe);
            p.vertex(x, y);
          }
          p.endShape();
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
