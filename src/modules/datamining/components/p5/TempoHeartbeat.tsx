import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { syllables: number; estimatedSeconds: number; tempoCategory: string };
}

export const TempoHeartbeat = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;

    // Calculate beats per second based on tempo
    const bps = data.syllables / Math.max(data.estimatedSeconds, 1);
    // Normalize: slow ~1-2 bps, fast ~4-6 bps
    const speed = Math.max(0.3, Math.min(3, bps / 2));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.03 * speed;
      const midY = H / 2;

      // ECG line
      p.noFill();
      p.strokeWeight(1.5);

      const points: { x: number; y: number }[] = [];

      for (let x = 0; x < W; x += 2) {
        const phase = (x / W) * p.TWO_PI * 3 + t;
        let y = midY;

        // Create heartbeat-like pattern
        const beatPhase = phase % p.TWO_PI;
        if (beatPhase < 0.3) {
          // flat before
          y = midY;
        } else if (beatPhase < 0.5) {
          // small dip
          const f = (beatPhase - 0.3) / 0.2;
          y = midY + p.sin(f * p.PI) * 15;
        } else if (beatPhase < 0.8) {
          // sharp peak up
          const f = (beatPhase - 0.5) / 0.3;
          y = midY - p.sin(f * p.PI) * (40 + speed * 15);
        } else if (beatPhase < 1.1) {
          // dip down
          const f = (beatPhase - 0.8) / 0.3;
          y = midY + p.sin(f * p.PI) * 20;
        } else if (beatPhase < 1.4) {
          // small bump
          const f = (beatPhase - 1.1) / 0.3;
          y = midY - p.sin(f * p.PI) * 10;
        }
        // else flat

        points.push({ x, y });
      }

      // Draw the line
      p.beginShape();
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        // Color: peaks in red, flat in gray
        const distFromMid = Math.abs(pt.y - midY);
        if (distFromMid > 25) {
          p.stroke(194, 48, 48, 180);
        } else {
          p.stroke(140, 120);
        }
        p.vertex(pt.x, pt.y);
      }
      p.endShape();

      // Baseline
      p.stroke(230);
      p.strokeWeight(0.3);
      p.line(0, midY, W, midY);
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
