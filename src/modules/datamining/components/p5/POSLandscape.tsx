import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: Record<string, number>;
}

const LAYER_ORDER = ['NOUN', 'VERB', 'ADJ', 'ADV', 'PRON', 'ADP', 'CCONJ', 'SCONJ', 'PART', 'DET', 'NUM', 'INTJ'];
const GRAYS = ['#333', '#555', '#666', '#888', '#999', '#aaa', '#bbb', '#ccc', '#ddd', '#e0e0e0', '#eee', '#f0f0f0'];

export const POSLandscape = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 350;

    // Build sorted layers from data
    const layers = LAYER_ORDER
      .filter(k => (data[k] || 0) > 0.5)
      .map((k, i) => ({
        key: k,
        percent: data[k] || 0,
        color: GRAYS[i % GRAYS.length],
      }));

    const totalPercent = layers.reduce((s, l) => s + l.percent, 0);

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
      p.noiseSeed(42);
    };

    p.draw = () => {
      p.background(255);

      const t = p.frameCount * 0.003;
      const margin = 20;
      let yBottom = H - margin;

      for (let li = 0; li < layers.length; li++) {
        const layer = layers[li];
        const bandH = ((layer.percent / totalPercent) * (H - margin * 2));
        const yTop = yBottom - bandH;

        const col = p.color(layer.color);
        // Accent: first layer (NOUN = foundation) gets red tint
        if (li === 0) {
          col.setRed(194);
          col.setGreen(48);
          col.setBlue(48);
          col.setAlpha(40);
        } else {
          col.setAlpha(60 + li * 8);
        }

        p.fill(col);
        p.noStroke();

        p.beginShape();
        // Bottom edge (flat or previous layer's top)
        for (let x = 0; x <= W; x += 4) {
          const noiseBottom = p.noise(x * 0.008, li * 3 + 100, t) * 6;
          p.vertex(x, yBottom + noiseBottom);
        }
        // Top edge (noisy terrain)
        for (let x = W; x >= 0; x -= 4) {
          const noiseTop = p.noise(x * 0.01 + li * 5, li * 2, t * 0.8) * 12;
          p.vertex(x, yTop + noiseTop);
        }
        p.endShape(p.CLOSE);

        // Texture: scattered dots within the layer
        p.noStroke();
        const dotCount = Math.floor(bandH * 0.3);
        for (let d = 0; d < dotCount; d++) {
          const dx = p.noise(d * 0.5, li * 7, t * 0.2) * W;
          const dy = yTop + p.noise(d * 0.3 + 100, li * 7) * bandH;
          const dotAlpha = 15 + p.noise(d, li) * 25;
          if (li === 0) {
            p.fill(194, 48, 48, dotAlpha);
          } else {
            p.fill(80, dotAlpha);
          }
          p.ellipse(dx, dy, 1.5);
        }

        yBottom = yTop;
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
