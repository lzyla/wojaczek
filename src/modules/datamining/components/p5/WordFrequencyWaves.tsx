import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: [string, number][];
}

export const WordFrequencyWaves = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;
    const words = data.slice(0, 30); // More words for richer seismograph
    const maxFreq = Math.max(...words.map(([, f]) => f), 1);

    const LINE_LAYERS = 6; // Number of accumulated line layers
    let lineBuffers: { points: number[] }[] = [];
    let currentWordIdx = 0;
    let xPos = 0;
    let currentPoints: number[] = [];
    const centerY = H / 2;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(24);
      p.background(255);
      currentPoints = [];
      xPos = 0;
    };

    p.draw = () => {
      // Very slight fade — older lines become ghostly
      p.noStroke();
      p.fill(255, 255, 255, 8);
      p.rect(0, 0, W, H);

      // Draw older layers
      for (let li = 0; li < lineBuffers.length; li++) {
        const buf = lineBuffers[li];
        const age = lineBuffers.length - li;
        const alpha = p.map(age, 0, LINE_LAYERS, 40, 5);

        p.noFill();
        p.stroke(60, 55, 50, alpha);
        p.strokeWeight(0.5);
        p.beginShape();
        for (let i = 0; i < buf.points.length; i++) {
          p.vertex(i * 2, buf.points[i]);
        }
        p.endShape();
      }

      // Draw current line being built
      const pixelsPerFrame = 4;

      for (let step = 0; step < pixelsPerFrame; step++) {
        if (xPos >= W) {
          // Line complete — archive it and start new
          lineBuffers.push({ points: [...currentPoints] });
          if (lineBuffers.length > LINE_LAYERS) lineBuffers.shift();
          currentPoints = [];
          xPos = 0;
          currentWordIdx = (currentWordIdx + 3) % Math.max(words.length, 1);
        }

        // Base noise tremor
        const tremor = (p.noise(xPos * 0.02, p.frameCount * 0.01) - 0.5) * 15;

        // Word frequency deflection
        const wordIdx = (currentWordIdx + Math.floor(xPos / (W / Math.max(words.length, 1)))) % Math.max(words.length, 1);
        const [, freq] = words[wordIdx] || ['', 1];
        const normalized = freq / maxFreq;

        // Spikes: most frequent words create visible vertical deflection
        const spike = normalized * 60 * (p.noise(xPos * 0.1, wordIdx * 10) > 0.5 ? 1 : -1);

        // Micro-deflection with noise
        const micro = (p.noise(xPos * 0.05 + wordIdx, p.frameCount * 0.005) - 0.5) * 20 * normalized;

        const y = centerY + tremor + spike * 0.4 + micro;
        currentPoints.push(y);
        xPos += 2;
      }

      // Draw current line
      p.noFill();
      p.stroke(40, 35, 30, 80);
      p.strokeWeight(1);
      p.beginShape();
      for (let i = 0; i < currentPoints.length; i++) {
        p.vertex(i * 2, currentPoints[i]);
      }
      p.endShape();

      // Subtle center reference line
      p.stroke(0, 0, 0, 8);
      p.strokeWeight(0.5);
      p.line(0, centerY, W, centerY);

    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
