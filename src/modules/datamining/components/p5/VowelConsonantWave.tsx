import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: { vowels: number; consonants: number; ratio: number };
}

export const VowelConsonantWave = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const total = data.vowels + data.consonants;
    const vowelFrac = total > 0 ? data.vowels / total : 0.42;
    const consonantFrac = 1 - vowelFrac;
    const cy = H / 2;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(25);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      // Vowel wave — smooth sine, dominance = amplitude
      const vowelAmp = vowelFrac * 80 + 20;
      p.noFill();
      p.stroke(153, 153, 153, 120);
      p.strokeWeight(1.5);
      for (let layer = 0; layer < 4; layer++) {
        const layerAmp = vowelAmp - layer * 8;
        const alpha = 40 - layer * 8;
        p.stroke(153, 153, 153, alpha);
        p.beginShape();
        for (let x = 0; x <= W; x += 3) {
          const angle = (x / W) * p.TWO_PI * 3 + t + layer * 0.3;
          const y = cy + p.sin(angle) * layerAmp;
          p.vertex(x, y);
        }
        p.endShape();
      }

      // Consonant wave — angular sawtooth
      const consAmp = consonantFrac * 80 + 20;
      for (let layer = 0; layer < 4; layer++) {
        const layerAmp = consAmp - layer * 8;
        const alpha = 50 - layer * 10;
        if (layer === 0) {
          p.stroke(194, 48, 48, 40);
        } else {
          p.stroke(80, alpha);
        }
        p.strokeWeight(1);
        p.beginShape();
        const teeth = 20;
        for (let i = 0; i <= teeth; i++) {
          const x = (i / teeth) * W;
          // Sawtooth: rises linearly, drops sharply
          const frac = ((x / W * 5 + t * 0.5 + layer * 0.2) % 1);
          const sawVal = frac < 0.5 ? frac * 2 - 1 : 1 - (frac - 0.5) * 4;
          const y = cy + sawVal * layerAmp;
          p.vertex(x, y);
        }
        p.endShape();
      }

      // Intersection emphasis — where waves cross, mark with dots
      for (let x = 20; x < W; x += 30) {
        const angle = (x / W) * p.TWO_PI * 3 + t;
        const vowelY = cy + p.sin(angle) * vowelAmp;
        const sawFrac = ((x / W * 5 + t * 0.5) % 1);
        const sawVal = sawFrac < 0.5 ? sawFrac * 2 - 1 : 1 - (sawFrac - 0.5) * 4;
        const consY = cy + sawVal * consAmp;

        if (Math.abs(vowelY - consY) < 15) {
          p.noStroke();
          p.fill(194, 48, 48, 25);
          p.ellipse(x, (vowelY + consY) / 2, 4);
        }
      }
    };
  }, [data.vowels, data.consonants, data.ratio]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
