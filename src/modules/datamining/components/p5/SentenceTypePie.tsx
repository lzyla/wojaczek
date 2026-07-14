import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

export const SentenceTypePie = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;

    // Quadrant mapping: declarative=BL, interrogative=TR, imperative=TL, exclamatory=BR
    const quadrants: { key: string; x0: number; y0: number; x1: number; y1: number }[] = [
      { key: 'imperative', x0: 0, y0: 0, x1: W / 2, y1: H / 2 },
      { key: 'interrogative', x0: W / 2, y0: 0, x1: W, y1: H / 2 },
      { key: 'declarative', x0: 0, y0: H / 2, x1: W / 2, y1: H },
      { key: 'exclamatory', x0: W / 2, y0: H / 2, x1: W, y1: H },
    ];

    interface QDot {
      x: number;
      y: number;
      quadrant: number;
      phase: number;
    }

    const qDots: QDot[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      for (let qi = 0; qi < quadrants.length; qi++) {
        const q = quadrants[qi];
        const count = data[q.key] || 0;
        const density = Math.min(count * 3, 120);
        for (let i = 0; i < density; i++) {
          qDots.push({
            x: p.random(q.x0 + 15, q.x1 - 15),
            y: p.random(q.y0 + 15, q.y1 - 15),
            quadrant: qi,
            phase: p.random(p.TWO_PI),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      // Quadrant dividers
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(W / 2, 10, W / 2, H - 10);
      p.line(10, H / 2, W - 10, H / 2);

      // Draw dots
      p.noStroke();
      for (const d of qDots) {
        const drift = p.sin(t + d.phase) * 1;
        const grays = [80, 140, 180, 120];
        const gray = grays[d.quadrant];
        // exclamatory quadrant gets red accent
        if (d.quadrant === 3) {
          p.fill(194, 48, 48, 60);
        } else {
          p.fill(gray, 70);
        }
        p.ellipse(d.x + drift, d.y + p.cos(t * 0.8 + d.phase) * 1, 4, 4);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
