import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

export const InfluenceSpectrum = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
    const maxVal = Math.max(...entries.map(([, v]) => v), 0.01);

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      const barCount = entries.length;
      if (barCount === 0) return;

      const barW = Math.min(40, (W - 40) / barCount - 8);
      const totalW = barCount * (barW + 8) - 8;
      const startX = (W - totalW) / 2;
      const baseY = H - 30;
      const maxH = H - 60;

      for (let i = 0; i < barCount; i++) {
        const [label, val] = entries[i];
        const frac = val / maxVal;
        const barH = frac * maxH;
        const x = startX + i * (barW + 8);
        const isTop = i === 0;

        // Noise texture on bar
        for (let dy = 0; dy < barH; dy += 2) {
          const noiseVal = p.noise(i * 0.5, dy * 0.05, t * 0.3);
          const gray = isTop
            ? p.lerp(194, 80, noiseVal * 0.5)
            : p.lerp(180, 100, noiseVal);

          if (isTop) {
            p.stroke(194, 48, 48, 40 + noiseVal * 60);
          } else {
            p.stroke(gray, 50 + noiseVal * 40);
          }
          p.strokeWeight(barW);
          p.line(x + barW / 2, baseY - dy, x + barW / 2, baseY - dy - 1.5);
        }

        // Label
        p.noStroke();
        p.textFont('DM Sans');
        p.fill(120);
        p.textSize(8);
        p.textAlign(p.CENTER, p.TOP);
        p.text(label.charAt(0).toUpperCase() + label.slice(1), x + barW / 2, baseY + 5);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
