import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { count: number; top: { cluster: string; count: number }[] };
}

export const ConsonantCrystals = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;

    interface Crystal {
      x: number;
      y: number;
      size: number;
      sides: number;
      rotation: number;
      rotSpeed: number;
      gray: number;
    }

    const crystals: Crystal[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const count = Math.min(data.count, 80);
      for (let i = 0; i < count; i++) {
        crystals.push({
          x: p.random(20, W - 20),
          y: p.random(20, H - 20),
          size: p.random(4, 14),
          sides: Math.floor(p.random(3, 7)),
          rotation: p.random(p.TWO_PI),
          rotSpeed: p.random(-0.005, 0.005),
          gray: p.random(60, 180),
        });
      }
    };

    p.draw = () => {
      p.background(255);

      for (const c of crystals) {
        c.rotation += c.rotSpeed;

        const isTopCluster = crystals.indexOf(c) < Math.min(data.top.length, 5);

        p.push();
        p.translate(c.x, c.y);
        p.rotate(c.rotation);

        if (isTopCluster) {
          p.stroke(194, 48, 48, 140);
          p.fill(194, 48, 48, 15);
        } else {
          p.stroke(c.gray, 100);
          p.fill(c.gray, 8);
        }
        p.strokeWeight(0.8);

        // Draw angular crystal shape
        p.beginShape();
        for (let s = 0; s < c.sides; s++) {
          const angle = (p.TWO_PI / c.sides) * s;
          const r = c.size * (0.7 + 0.3 * ((s % 2 === 0) ? 1 : 0.6));
          p.vertex(p.cos(angle) * r, p.sin(angle) * r);
        }
        p.endShape(p.CLOSE);

        p.pop();
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
