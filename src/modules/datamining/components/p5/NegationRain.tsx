import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface NegationData {
  words: Record<string, number>;
  total: number;
  percentSentences: number;
}

interface Props {
  data: NegationData;
}

export const NegationRain = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const density = Math.min(data.percentSentences / 100, 1);
    const erasureSpeed = 0.3 + density * 2.5; // dots removed per frame

    const COLS = Math.floor(W / 6);
    const ROWS = Math.floor(H / 6);

    interface Dot {
      x: number;
      y: number;
      alive: boolean;
      alpha: number;
      flickerTime: number; // -1 = not flickering, >0 = frames until final vanish
      size: number;
    }

    let dots: Dot[] = [];
    let totalAlive: number;
    let totalDots: number;
    let frameNum = 0;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);

      const marginX = (W - (COLS - 1) * 6) / 2;
      const marginY = (H - (ROWS - 1) * 6) / 2;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          dots.push({
            x: marginX + col * 6 + p.random(-0.5, 0.5),
            y: marginY + row * 6 + p.random(-0.5, 0.5),
            alive: true,
            alpha: p.random(120, 200),
            flickerTime: -1,
            size: p.random(1, 2),
          });
        }
      }
      totalDots = dots.length;
      totalAlive = totalDots;

      // Shuffle for random erasure order
      for (let i = dots.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [dots[i], dots[j]] = [dots[j], dots[i]];
      }
    };

    p.draw = () => {
      p.background(255);
      frameNum++;

      const eraseRatio = totalAlive / totalDots;

      // Erase dots
      const toErase = Math.ceil(erasureSpeed);
      let erased = 0;
      for (const dot of dots) {
        if (erased >= toErase) break;
        if (dot.alive && dot.flickerTime < 0) {
          dot.alive = false;
          dot.alpha = 0;
          totalAlive--;
          erased++;
        }
      }

      // After ~60% erased, some dots flicker back briefly
      if (eraseRatio < 0.4 && eraseRatio > 0.05) {
        const flickerChance = 0.02 * density;
        for (const dot of dots) {
          if (!dot.alive && dot.flickerTime < 0 && p.random() < flickerChance) {
            dot.flickerTime = Math.floor(p.random(8, 25));
            dot.alpha = p.random(40, 100);
          }
        }
      }

      // Draw all dots
      p.noStroke();
      for (const dot of dots) {
        if (dot.alive) {
          // Slow fade for living dots
          dot.alpha -= 0.05;
          if (dot.alpha < 40) dot.alpha = 40;
          p.fill(60, 55, 50, dot.alpha);
          p.ellipse(dot.x, dot.y, dot.size);
        } else if (dot.flickerTime > 0) {
          // Flickering ghost dot
          dot.flickerTime--;
          const flicker = p.sin(dot.flickerTime * 0.5) * 0.5 + 0.5;
          p.fill(60, 55, 50, dot.alpha * flicker);
          p.ellipse(dot.x, dot.y, dot.size * 0.8);
          if (dot.flickerTime <= 0) {
            dot.alpha = 0;
          }
        }
      }

      // When nearly all erased, slow to a stop
      if (totalAlive <= 0) {
        // A few ghost flickers remain
        let anyFlickering = false;
        for (const dot of dots) {
          if (dot.flickerTime > 0) {
            anyFlickering = true;
            break;
          }
        }
        if (!anyFlickering) {
          p.noLoop();
        }
      }
    };
  }, [data.words, data.total, data.percentSentences]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
