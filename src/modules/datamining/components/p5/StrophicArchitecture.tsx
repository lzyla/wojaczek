import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: {
    stanzaCount: number;
    linesPerStanza: number[];
    isRegular: boolean;
    isContinuous: boolean;
  };
}

export const StrophicArchitecture = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const stanzas = data.linesPerStanza;
    const maxLines = Math.max(...stanzas, 1);
    const blockCount = stanzas.length;
    const isRegular = data.isRegular;

    // Pre-compute block properties
    const totalLines = stanzas.reduce((s, l) => s + l, 0);
    const gap = 8;
    const totalGaps = (blockCount - 1) * gap;
    const availableH = H - 60; // top/bottom margin
    const totalBlockH = availableH - totalGaps;

    // Each block height proportional to its line count
    const blockHeights = stanzas.map(lines => (lines / totalLines) * totalBlockH);

    // Phase offsets — regular poems are in phase, irregular are spread
    const phaseOffsets = stanzas.map((_, i) => {
      if (isRegular) return 0; // All breathe together
      return p.random(0, p.TWO_PI); // Each breathes independently
    });

    const noiseSeeds = stanzas.map(() => p.random(1000));

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);

      const t = p.frameCount * 0.015;
      let yPos = 30;

      for (let i = 0; i < blockCount; i++) {
        const baseH = blockHeights[i];
        const phase = phaseOffsets[i];

        // Breathing: height oscillates
        const breatheAmt = isRegular ? 0.08 : 0.18;
        const breatheSpeed = isRegular ? 1.0 : (0.5 + p.random() * 1.5);
        const breathe = p.sin(t * breatheSpeed + phase) * baseH * breatheAmt;
        const h = Math.max(baseH + breathe, 8);

        const x = 20;
        const w = W - 40;

        // Noise-generated paper/concrete grain texture
        const seed = noiseSeeds[i];
        for (let py = 0; py < h; py += 2) {
          for (let px = 0; px < w; px += 2) {
            const n = p.noise(px * 0.03 + seed, py * 0.04 + seed, t * 0.1);
            const gray = p.map(n, 0, 1, 55, 85);
            p.noStroke();
            p.fill(gray, 160);
            p.rect(x + px, yPos + py, 2, 2);
          }
        }

        // Red accent on first line of each stanza
        p.stroke(180, 40, 40, 60);
        p.strokeWeight(1.5);
        p.line(x, yPos + 1, x + w, yPos + 1);

        // Red accent on last line of each stanza
        p.stroke(180, 40, 40, 40);
        p.strokeWeight(1);
        p.line(x, yPos + h - 1, x + w, yPos + h - 1);

        // Subtle outline
        p.noFill();
        p.stroke(0, 15);
        p.strokeWeight(0.5);
        p.rect(x, yPos, w, h);

        yPos += h + gap;
      }

    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
