import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { distribution: number[] };
}

export const LineLengthPulse = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const dist = data.distribution;
    const maxVal = Math.max(...dist, 1);

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.03;

      const totalLines = dist.length;
      if (totalLines === 0) return;

      const lineH = Math.min(4, (H - 40) / totalLines);
      const startY = (H - totalLines * lineH) / 2;
      const maxLineW = W - 60;

      for (let i = 0; i < totalLines; i++) {
        const val = dist[i];
        const frac = val / maxVal;
        const lineW = frac * maxLineW;
        const y = startY + i * lineH;

        // Subtle pulse
        const pulse = 1 + p.sin(t + i * 0.3) * 0.02;
        const actualW = lineW * pulse;

        // Gray intensity based on value
        const gray = 200 - frac * 150;
        const isLongest = val === maxVal;

        if (isLongest) {
          p.stroke(194, 48, 48, 180);
        } else {
          p.stroke(gray, 160);
        }
        p.strokeWeight(Math.max(lineH * 0.7, 1));
        p.line(30, y, 30 + actualW, y);
      }

      // Thin vertical baseline
      p.stroke(230);
      p.strokeWeight(0.5);
      p.line(30, startY - 5, 30, startY + totalLines * lineH + 5);
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
