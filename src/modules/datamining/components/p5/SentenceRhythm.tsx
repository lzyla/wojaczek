import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { distribution: number[]; mean: number; median: number };
}

export const SentenceRhythm = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const dist = data.distribution;
    if (!dist.length) return;

    const maxLen = Math.max(...dist, 1);
    const totalBars = dist.length;
    const gap = 1;
    const availW = W - 40;
    const barMaxW = Math.max(2, (availW - (totalBars - 1) * gap) / totalBars);

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      const startX = 20;
      let x = startX;

      for (let i = 0; i < dist.length; i++) {
        const len = dist[i];
        const normW = Math.max(1, (len / maxLen) * barMaxW);
        const barH = H - 40;

        // Gray based on length
        const gray = p.map(len, 0, maxLen, 210, 51);
        const isLong = len > data.mean * 1.5;
        const isShort = len < data.mean * 0.5;

        // Subtle vertical sway
        const sway = p.sin(t + i * 0.3) * 1;

        p.noStroke();
        if (isLong) {
          // Accent red for notably long sentences
          p.fill(194, 48, 48, 80);
        } else if (isShort) {
          p.fill(gray, 120);
        } else {
          p.fill(gray, 90);
        }

        p.rect(x + sway, 20, normW, barH);
        x += normW + gap;
      }

      // Mean line
      const meanBarIdx = dist.findIndex((_, i) => {
        const cumLen = dist.slice(0, i + 1).reduce((s, v) => s + v, 0);
        return cumLen / dist.reduce((s, v) => s + v, 0) >= 0.5;
      });
      if (meanBarIdx >= 0) {
        const meanX = startX + meanBarIdx * (barMaxW + gap);
        p.stroke(194, 48, 48, 40);
        p.strokeWeight(0.5);
        // Dashed line via drawingContext
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([3, 3]);
        p.line(meanX, 15, meanX, H - 15);
        (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);
      }
    };
  }, [data.distribution, data.mean, data.median]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
