import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { period: string; season: string };
}

const PERIOD_ANGLES: Record<string, number> = {
  noc: 0,           // top (midnight)
  swit: Math.PI / 4,
  rano: Math.PI / 2,
  poludnie: Math.PI,
  dzien: Math.PI,
  wieczor: (3 * Math.PI) / 2,
  zmierzch: (5 * Math.PI) / 4,
};

const PERIOD_DARK: Record<string, number> = {
  noc: 40,
  swit: 140,
  rano: 200,
  poludnie: 230,
  dzien: 220,
  wieczor: 120,
  zmierzch: 100,
};

export const TimeWheel = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.38;

    const activeAngle = PERIOD_ANGLES[data.period] ?? Math.PI;
    const activeDark = PERIOD_DARK[data.period] ?? 160;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.01;

      // Draw 4 segments
      const segments = [
        { label: 'noc', startA: -Math.PI / 4, endA: Math.PI / 4, dark: 40 },
        { label: 'rano', startA: Math.PI / 4, endA: (3 * Math.PI) / 4, dark: 200 },
        { label: 'dzien', startA: (3 * Math.PI) / 4, endA: (5 * Math.PI) / 4, dark: 230 },
        { label: 'wieczor', startA: (5 * Math.PI) / 4, endA: (7 * Math.PI) / 4, dark: 120 },
      ];

      for (const seg of segments) {
        const isActive = seg.label === data.period ||
          (data.period === 'swit' && seg.label === 'rano') ||
          (data.period === 'zmierzch' && seg.label === 'wieczor') ||
          (data.period === 'poludnie' && seg.label === 'dzien');

        p.noStroke();
        const steps = 30;
        for (let r = R; r > 10; r -= 3) {
          const frac = r / R;
          const alpha = isActive ? 30 + (1 - frac) * 40 : 5 + (1 - frac) * 10;
          if (isActive && seg.label === 'noc') {
            p.fill(40, 40, 50, alpha);
          } else if (isActive) {
            p.fill(194, 48, 48, alpha * 0.6);
          } else {
            p.fill(seg.dark, alpha * 0.5);
          }
          p.arc(cx, cy, r * 2, r * 2, seg.startA - Math.PI / 2, seg.endA - Math.PI / 2);
        }
      }

      // Clock marks
      p.stroke(180, 80);
      p.strokeWeight(0.5);
      for (let i = 0; i < 12; i++) {
        const angle = (p.TWO_PI / 12) * i - Math.PI / 2;
        const inner = R * 0.9;
        const outer = R * 0.97;
        p.line(cx + p.cos(angle) * inner, cy + p.sin(angle) * inner,
               cx + p.cos(angle) * outer, cy + p.sin(angle) * outer);
      }

      // Center dot
      p.noStroke();
      p.fill(100, 60);
      p.ellipse(cx, cy, 4, 4);

      // Indicator hand for active period
      const handAngle = activeAngle - Math.PI / 2;
      const breathe = p.sin(t) * 3;
      p.stroke(194, 48, 48, 160);
      p.strokeWeight(1.5);
      p.line(cx, cy, cx + p.cos(handAngle) * (R * 0.7 + breathe), cy + p.sin(handAngle) * (R * 0.7 + breathe));
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
