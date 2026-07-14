import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { incomplete: number; noSubject: number; noPredicate: number; percent: number };
}

export const EllipsisFragments = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 320;
    const pct = Math.min(data.percent, 1);

    interface Line {
      y: number;
      broken: boolean;
      gapStart: number;
      gapEnd: number;
      lineW: number;
      phase: number;
    }

    const lines: Line[] = [];

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const totalLines = 30;
      const lineSpacing = (H - 40) / totalLines;
      const brokenCount = Math.round(totalLines * pct);

      for (let i = 0; i < totalLines; i++) {
        const broken = i < brokenCount;
        const lineW = p.random(0.4, 0.95) * (W - 60);
        const gapStart = broken ? p.random(0.2, 0.6) * lineW : 0;
        const gapEnd = broken ? gapStart + p.random(0.1, 0.3) * lineW : 0;
        lines.push({
          y: 20 + i * lineSpacing,
          broken,
          gapStart,
          gapEnd,
          lineW,
          phase: p.random(p.TWO_PI),
        });
      }
      // Shuffle to distribute broken lines
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        const tmpBroken = lines[i].broken;
        const tmpGap = lines[i].gapStart;
        const tmpGapEnd = lines[i].gapEnd;
        lines[i].broken = lines[j].broken;
        lines[i].gapStart = lines[j].gapStart;
        lines[i].gapEnd = lines[j].gapEnd;
        lines[j].broken = tmpBroken;
        lines[j].gapStart = tmpGap;
        lines[j].gapEnd = tmpGapEnd;
      }
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.02;

      for (const ln of lines) {
        const wobble = p.sin(t + ln.phase) * 0.5;
        const x0 = 30;

        if (ln.broken) {
          // Draw two segments with a gap
          p.stroke(194, 48, 48, 100);
          p.strokeWeight(1.5);
          p.line(x0, ln.y + wobble, x0 + ln.gapStart, ln.y + wobble);
          p.line(x0 + ln.gapEnd, ln.y + wobble, x0 + ln.lineW, ln.y + wobble);

          // Dashed hint in gap
          p.stroke(194, 48, 48, 30);
          p.strokeWeight(0.5);
          for (let gx = ln.gapStart; gx < ln.gapEnd; gx += 6) {
            p.point(x0 + gx + p.random(-1, 1), ln.y + wobble);
          }
        } else {
          p.stroke(160, 100);
          p.strokeWeight(1.2);
          p.line(x0, ln.y + wobble, x0 + ln.lineW, ln.y + wobble);
        }
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
