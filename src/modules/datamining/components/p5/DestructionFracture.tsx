import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: {
    level: number;
    signals: string[];
  };
}

export const DestructionFracture = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const level = data.level; // 0-1

    const GRID = 10;
    const cellW = (W - 40) / GRID;
    const cellH = (H - 40) / GRID;
    const marginX = 20;
    const marginY = 20;

    interface Square {
      homeX: number;
      homeY: number;
      x: number;
      y: number;
      rotation: number;
      size: number;
      alpha: number;
      noiseSeed: number;
      shrinkRate: number;
    }

    let squares: Square[] = [];
    let startFrame = 0;
    const TRANSITION_FRAMES = 120; // ~5 seconds at 24fps

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(24);
      p.rectMode(p.CENTER);
      startFrame = p.frameCount;

      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          const hx = marginX + col * cellW + cellW / 2;
          const hy = marginY + row * cellH + cellH / 2;
          squares.push({
            homeX: hx,
            homeY: hy,
            x: hx,
            y: hy,
            rotation: 0,
            size: Math.min(cellW, cellH) * 0.85,
            alpha: 180,
            noiseSeed: p.random(1000),
            shrinkRate: p.random() < level * 0.3 ? p.random(0.2, 0.8) : 0,
          });
        }
      }
    };

    p.draw = () => {
      p.background(255);

      const elapsed = p.frameCount - startFrame;
      const progress = Math.min(elapsed / TRANSITION_FRAMES, 1); // 0 to 1

      // Entropy factor: combines data level with animation progress
      const entropy = level * progress;

      for (const sq of squares) {
        const t = elapsed * 0.01;

        // Drift from home position
        const driftX = (p.noise(sq.noiseSeed, t) - 0.5) * entropy * cellW * 3;
        const driftY = (p.noise(sq.noiseSeed + 100, t) - 0.5) * entropy * cellH * 3;
        sq.x = sq.homeX + driftX;
        sq.y = sq.homeY + driftY;

        // Rotation increases with entropy
        sq.rotation = (p.noise(sq.noiseSeed + 200, t) - 0.5) * entropy * p.PI * 1.5;

        // Some squares shrink and disappear
        let currentSize = sq.size;
        if (sq.shrinkRate > 0) {
          currentSize = sq.size * (1 - progress * sq.shrinkRate);
          if (currentSize < 1) continue; // Disappeared
        }

        // Opacity varies with entropy
        const alphaVariation = (p.noise(sq.noiseSeed + 300, t) - 0.5) * entropy * 150;
        const currentAlpha = Math.max(sq.alpha + alphaVariation, 10);

        // Draw square
        p.push();
        p.translate(sq.x, sq.y);
        p.rotate(sq.rotation);

        // Fill: uniform gray developing into varied opacity
        const gray = p.map(entropy, 0, 1, 140, 140 + (p.noise(sq.noiseSeed + 400) - 0.5) * 80);
        p.fill(gray, currentAlpha);
        p.noStroke();
        p.rect(0, 0, currentSize, currentSize);

        // Very subtle border
        p.noFill();
        p.stroke(0, currentAlpha * 0.15);
        p.strokeWeight(0.5);
        p.rect(0, 0, currentSize, currentSize);

        p.pop();
      }

      // Stop after transition completes
      if (progress >= 1) {
        p.noLoop();
      }
    };
  }, [data.level, data.signals]);

  return (
    <div>
      <P5Wrapper sketch={sketch} className="w-full" />
      <p className="text-[10px] text-center opacity-30 mt-2">
        Jesli potrzebujesz pomocy, zadzwon: 116 123 (Telefon Zaufania)
      </p>
    </div>
  );
};
