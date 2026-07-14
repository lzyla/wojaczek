import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

const GROUP_CONFIG: {
  key: string;
  band: number; // vertical band position 0-3
}[] = [
  { key: 'szumiace', band: 0 },
  { key: 'syczace',  band: 1 },
  { key: 'nosowe',   band: 2 },
  { key: 'plynne',   band: 3 },
];

export const PhoneticSpectrum = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;

    interface Mark {
      type: 'szumiace' | 'syczace' | 'nosowe' | 'plynne';
      x: number;
      y: number;
      drawn: boolean;
      params: Record<string, number>;
    }

    let marks: Mark[] = [];
    let drawIdx = 0;

    p.setup = () => {
      p.createCanvas(W, H);
      p.background(255);
      p.frameRate(20);

      const bandH = H / 4;

      // Generate marks for each type
      for (const cfg of GROUP_CONFIG) {
        const count = data[cfg.key] || 0;
        const bandY = cfg.band * bandH + bandH * 0.15;
        const bandRange = bandH * 0.7;

        for (let i = 0; i < count; i++) {
          const baseX = p.random(20, W - 20);
          const baseY = bandY + p.random(bandRange);

          const params: Record<string, number> = {};

          switch (cfg.key) {
            case 'szumiace':
              // Broad horizontal smears
              params.width = p.random(40, 120);
              params.height = p.random(3, 8);
              params.gray = p.random(140, 190);
              params.alpha = p.random(30, 70);
              break;
            case 'syczace':
              // Sharp diagonal lines
              params.length = p.random(15, 50);
              params.angle = p.random(-0.6, 0.6);
              params.weight = p.random(0.5, 2);
              params.gray = p.random(30, 80);
              break;
            case 'nosowe':
              // Soft circles
              params.radius = p.random(5, 18);
              params.gray = p.random(120, 170);
              params.alpha = p.random(25, 60);
              break;
            case 'plynne':
              // Long bezier curves
              params.cx1 = baseX + p.random(-60, 60);
              params.cy1 = baseY + p.random(-30, 30);
              params.cx2 = baseX + p.random(-60, 60);
              params.cy2 = baseY + p.random(-30, 30);
              params.ex = baseX + p.random(-80, 80);
              params.ey = baseY + p.random(-20, 20);
              params.gray = p.random(160, 200);
              params.weight = p.random(0.5, 1.5);
              break;
          }

          marks.push({
            type: cfg.key as Mark['type'],
            x: baseX,
            y: baseY,
            drawn: false,
            params,
          });
        }
      }

      // Shuffle for mixed drawing order
      for (let i = marks.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [marks[i], marks[j]] = [marks[j], marks[i]];
      }
    };

    p.draw = () => {
      // Draw 1-3 marks per frame for animation
      const marksPerFrame = Math.max(1, Math.ceil(marks.length / 80));

      for (let step = 0; step < marksPerFrame; step++) {
        if (drawIdx >= marks.length) {
          p.noLoop();
          return;
        }

        const mark = marks[drawIdx];
        drawIdx++;

        switch (mark.type) {
          case 'szumiace': {
            // Broad horizontal smears — like charcoal
            const { width: mw, height: mh, gray, alpha } = mark.params;
            p.noStroke();
            // Multiple overlapping rectangles for blur effect
            for (let layer = 0; layer < 6; layer++) {
              const lx = mark.x - mw / 2 + p.random(-3, 3);
              const ly = mark.y - mh / 2 + p.random(-2, 2);
              const lw = mw + p.random(-8, 8);
              const lh = mh + p.random(-1, 1);
              p.fill(gray, alpha * 0.4);
              p.rect(lx, ly, lw, lh);
            }
            break;
          }

          case 'syczace': {
            // Sharp diagonal lines — crisp
            const { length: ml, angle, weight, gray } = mark.params;
            const ex = mark.x + p.cos(angle + p.HALF_PI) * ml;
            const ey = mark.y + p.sin(angle + p.HALF_PI) * ml;
            p.stroke(gray, 200);
            p.strokeWeight(weight);
            p.line(mark.x, mark.y, ex, ey);
            break;
          }

          case 'nosowe': {
            // Soft circles — gaussian blur effect via layered circles
            const { radius, gray, alpha } = mark.params;
            p.noStroke();
            for (let layer = 0; layer < 8; layer++) {
              const lr = radius * (1 + layer * 0.2);
              const la = alpha * p.map(layer, 0, 8, 0.5, 0.05);
              p.fill(gray, la);
              p.ellipse(
                mark.x + p.random(-1, 1),
                mark.y + p.random(-1, 1),
                lr * 2
              );
            }
            break;
          }

          case 'plynne': {
            // Long bezier curves — flowing
            const { cx1, cy1, cx2, cy2, ex, ey, gray, weight } = mark.params;
            p.noFill();
            p.stroke(gray, 100);
            p.strokeWeight(weight);
            p.bezier(mark.x, mark.y, cx1, cy1, cx2, cy2, ex, ey);
            break;
          }
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
