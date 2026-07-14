import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { svo: number; inversions: number; other: number };
}

export const WordOrderTension = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const total = data.svo + data.inversions + data.other || 1;

    interface Bar {
      x: number;
      tilt: number;
      height: number;
      isInversion: boolean;
      phase: number;
    }

    const bars: Bar[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const barCount = Math.min(total, 40);
      const barW = (W - 40) / barCount;
      let idx = 0;

      // Distribute bar types proportionally
      const types: ('svo' | 'inv' | 'other')[] = [];
      for (let i = 0; i < data.svo && types.length < barCount; i++) types.push('svo');
      for (let i = 0; i < data.inversions && types.length < barCount; i++) types.push('inv');
      for (let i = 0; i < data.other && types.length < barCount; i++) types.push('other');

      // Shuffle
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }

      for (const type of types) {
        const isInv = type === 'inv';
        const tilt = isInv ? p.random(0.2, 0.5) * (p.random() > 0.5 ? 1 : -1) : (type === 'other' ? p.random(-0.08, 0.08) : 0);
        bars.push({
          x: 20 + idx * barW + barW / 2,
          tilt,
          height: p.random(60, H * 0.6),
          isInversion: isInv,
          phase: p.random(p.TWO_PI),
        });
        idx++;
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;
      const baseY = H - 30;

      // Baseline
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(15, baseY, W - 15, baseY);

      for (const b of bars) {
        const sway = p.sin(t + b.phase) * 0.015;
        const angle = b.tilt + sway;

        p.push();
        p.translate(b.x, baseY);
        p.rotate(angle);

        if (b.isInversion) {
          p.stroke(194, 48, 48, 120);
          p.strokeWeight(2);
        } else {
          p.stroke(140, 80);
          p.strokeWeight(1.5);
        }
        p.line(0, 0, 0, -b.height);
        p.pop();
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
