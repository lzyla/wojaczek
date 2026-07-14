import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: {
    temporalne: string[];
    modalne: string[];
    sposobu: string[];
    top: { word: string; count: number }[];
  };
}

export const AdverbDots = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;

    interface Dot {
      x: number;
      y: number;
      band: number;
      phase: number;
      size: number;
    }

    const dots: Dot[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const bandH = H / 3;
      const bands = [
        { items: data.temporalne, band: 0 },
        { items: data.modalne, band: 1 },
        { items: data.sposobu, band: 2 },
      ];

      for (const b of bands) {
        const count = b.items.length;
        for (let i = 0; i < count; i++) {
          dots.push({
            x: p.random(20, W - 20),
            y: b.band * bandH + p.random(15, bandH - 15),
            band: b.band,
            phase: p.random(p.TWO_PI),
            size: p.random(3, 6),
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;
      const bandH = H / 3;

      // Band separators
      p.stroke(235);
      p.strokeWeight(0.5);
      p.line(0, bandH, W, bandH);
      p.line(0, bandH * 2, W, bandH * 2);

      // Dots
      for (const d of dots) {
        const drift = p.sin(t + d.phase) * 1.5;
        const gray = d.band === 0 ? 160 : d.band === 1 ? 100 : 60;
        const isAccent = d.band === 0 && dots.filter(dd => dd.band === 0).indexOf(d) === 0;
        p.noStroke();
        if (isAccent) {
          p.fill(194, 48, 48, 120);
        } else {
          p.fill(gray, 80);
        }
        p.ellipse(d.x + drift, d.y + p.cos(t * 0.7 + d.phase) * 1, d.size, d.size);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
