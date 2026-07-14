import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: {
    metaphors: number;
    comparisons: number;
    personifications: number;
    hyperboles: number;
    per100words: number;
  };
}

export const ImageryDensityField = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;

    interface Shape {
      x: number;
      y: number;
      size: number;
      type: 'circle' | 'triangle' | 'square' | 'diamond';
      phase: number;
      alpha: number;
    }

    const shapes: Shape[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const types: { type: Shape['type']; count: number }[] = [
        { type: 'circle', count: data.metaphors },
        { type: 'triangle', count: data.comparisons },
        { type: 'square', count: data.personifications },
        { type: 'diamond', count: data.hyperboles },
      ];

      for (const t of types) {
        for (let i = 0; i < Math.min(t.count, 25); i++) {
          shapes.push({
            x: p.random(25, W - 25),
            y: p.random(25, H - 25),
            size: p.random(10, 24),
            type: t.type,
            phase: p.random(p.TWO_PI),
            alpha: p.random(20, 50),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      for (const s of shapes) {
        const breathe = p.sin(t + s.phase) * 2;
        const sz = s.size + breathe;
        const isAccent = s.type === 'circle' && shapes.filter(sh => sh.type === 'circle').indexOf(s) === 0;

        if (isAccent) {
          p.fill(194, 48, 48, s.alpha);
          p.stroke(194, 48, 48, s.alpha * 0.5);
        } else {
          const gray = s.type === 'circle' ? 100 : s.type === 'triangle' ? 140 : s.type === 'square' ? 170 : 120;
          p.fill(gray, s.alpha);
          p.stroke(gray, s.alpha * 0.5);
        }
        p.strokeWeight(0.5);

        if (s.type === 'circle') {
          p.ellipse(s.x, s.y, sz, sz);
        } else if (s.type === 'triangle') {
          p.triangle(
            s.x, s.y - sz / 2,
            s.x - sz / 2, s.y + sz / 2,
            s.x + sz / 2, s.y + sz / 2,
          );
        } else if (s.type === 'square') {
          p.rectMode(p.CENTER);
          p.rect(s.x, s.y, sz, sz);
        } else {
          // diamond
          p.beginShape();
          p.vertex(s.x, s.y - sz / 2);
          p.vertex(s.x + sz / 2, s.y);
          p.vertex(s.x, s.y + sz / 2);
          p.vertex(s.x - sz / 2, s.y);
          p.endShape(p.CLOSE);
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
