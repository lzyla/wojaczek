import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  emotions: Record<string, number>;
}

// Body zone definitions: cx/cy in normalized coords (0-1 relative to silhouette bounds)
// Multiple zones per emotion based on Nummenmaa et al. 2013
interface BodyZone {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const EMOTION_ZONES: Record<string, { zones: BodyZone[]; color: string }> = {
  gniew: {
    color: '#cc3333',
    zones: [
      { cx: 0.5, cy: 0.38, rx: 0.18, ry: 0.12 },  // chest
      { cx: 0.22, cy: 0.38, rx: 0.1, ry: 0.15 },   // left arm
      { cx: 0.78, cy: 0.38, rx: 0.1, ry: 0.15 },   // right arm
      { cx: 0.18, cy: 0.52, rx: 0.06, ry: 0.06 },   // left fist
      { cx: 0.82, cy: 0.52, rx: 0.06, ry: 0.06 },   // right fist
    ],
  },
  smutek: {
    color: '#2255aa',
    zones: [
      { cx: 0.5, cy: 0.36, rx: 0.14, ry: 0.1 },    // chest center
      { cx: 0.5, cy: 0.1, rx: 0.08, ry: 0.05 },     // eyes area
    ],
  },
  strach: {
    color: '#443366',
    zones: [
      { cx: 0.5, cy: 0.52, rx: 0.14, ry: 0.1 },    // stomach
      { cx: 0.5, cy: 0.58, rx: 0.12, ry: 0.08 },    // lower torso
    ],
  },
  czułość: {
    color: '#ddaa33',
    zones: [
      { cx: 0.5, cy: 0.34, rx: 0.12, ry: 0.1 },    // heart
      { cx: 0.18, cy: 0.52, rx: 0.07, ry: 0.06 },   // left hand
      { cx: 0.82, cy: 0.52, rx: 0.07, ry: 0.06 },   // right hand
    ],
  },
  rezygnacja: {
    color: '#228877',
    zones: [
      { cx: 0.5, cy: 0.4, rx: 0.2, ry: 0.35 },     // whole body, dim
    ],
  },
  rozpacz: {
    color: '#6644aa',
    zones: [
      { cx: 0.5, cy: 0.08, rx: 0.1, ry: 0.08 },    // head
      { cx: 0.5, cy: 0.34, rx: 0.16, ry: 0.12 },    // chest intense
    ],
  },
  ironia: {
    color: '#aa3377',
    zones: [
      { cx: 0.5, cy: 0.08, rx: 0.1, ry: 0.08 },    // head only
    ],
  },
  bunt: {
    color: '#dd7722',
    zones: [
      { cx: 0.5, cy: 0.36, rx: 0.16, ry: 0.1 },    // chest
      { cx: 0.22, cy: 0.4, rx: 0.08, ry: 0.14 },    // left arm
      { cx: 0.78, cy: 0.4, rx: 0.08, ry: 0.14 },    // right arm
      { cx: 0.38, cy: 0.78, rx: 0.08, ry: 0.15 },   // left leg
      { cx: 0.62, cy: 0.78, rx: 0.08, ry: 0.15 },   // right leg
    ],
  },
  tęsknota: {
    color: '#4477bb',
    zones: [
      { cx: 0.5, cy: 0.34, rx: 0.12, ry: 0.1 },    // heart area
      { cx: 0.5, cy: 0.08, rx: 0.08, ry: 0.06 },    // head slight
    ],
  },
  melancholia: {
    color: '#3366aa',
    zones: [
      { cx: 0.5, cy: 0.34, rx: 0.14, ry: 0.12 },   // chest
      { cx: 0.5, cy: 0.08, rx: 0.08, ry: 0.06 },    // head
    ],
  },
  obrzydzenie: {
    color: '#886633',
    zones: [
      { cx: 0.5, cy: 0.5, rx: 0.12, ry: 0.08 },    // stomach
      { cx: 0.5, cy: 0.12, rx: 0.06, ry: 0.05 },    // throat
    ],
  },
};

export const EmotionBodyMap = ({ emotions }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 400;

    const maxCount = Math.max(1, ...Object.values(emotions));

    // Silhouette bounds — centered
    const silW = Math.min(W * 0.35, 160);
    const silH = H * 0.88;
    const silX = (W - silW) / 2;
    const silY = H * 0.06;

    p.setup = () => {
      p.createCanvas(W, H);
      p.frameRate(20);
    };

    p.draw = () => {
      p.background(255);
      const t = p.frameCount * 0.015;

      // ── Draw heat zones FIRST (behind silhouette) ──
      // Use additive-style blending via multiple transparent layers
      for (const [name, count] of Object.entries(emotions)) {
        if (count <= 0) continue;
        const config = EMOTION_ZONES[name];
        if (!config) continue;

        const intensity = count / maxCount;
        const col = p.color(config.color);
        const r = p.red(col), g = p.green(col), b = p.blue(col);

        for (const zone of config.zones) {
          const cx = silX + zone.cx * silW;
          const cy = silY + zone.cy * silH;
          const rx = zone.rx * silW;
          const ry = zone.ry * silH;

          // Subtle animation per emotion type
          let pulse = 1.0;
          if (name === 'rozpacz' || name === 'gniew') {
            pulse = 1.0 + Math.sin(t * 2) * 0.06 * intensity;
          } else if (name === 'czułość') {
            pulse = 1.0 + Math.sin(t * 1.2) * 0.04 * intensity;
          } else if (name === 'strach') {
            pulse = 1.0 + (p.noise(t * 3) - 0.5) * 0.08 * intensity;
          }

          // Radial gradient via concentric ellipses
          const layers = 10;
          for (let l = layers; l >= 0; l--) {
            const frac = l / layers;
            const alpha = intensity * (1 - frac) * 55;
            p.noStroke();
            p.fill(r, g, b, alpha);
            p.ellipse(cx, cy, rx * 2 * frac * pulse, ry * 2 * frac * pulse);
          }
        }
      }

      // ── Draw silhouette outline ──
      drawSilhouette(p, silX, silY, silW, silH, t);

      // ── Labels for active zones ──
      p.textFont('DM Sans');
      p.textSize(8);
      p.fill(120);
      p.noStroke();

      const labelX = silX + silW + 16;
      let labelY = silY + 20;
      const sorted = Object.entries(emotions)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a);

      for (const [name] of sorted.slice(0, 6)) {
        const config = EMOTION_ZONES[name];
        if (!config) continue;
        const col = p.color(config.color);
        p.fill(p.red(col), p.green(col), p.blue(col), 180);
        p.ellipse(labelX - 6, labelY - 2, 5, 5);
        p.fill(120);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(name, labelX + 2, labelY - 2);
        labelY += 16;
      }
    };
  }, [emotions]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};

// ── Minimalist human silhouette drawn with bezier curves ──
function drawSilhouette(p: p5, x: number, y: number, w: number, h: number, t: number) {
  const cx = x + w / 2;

  // Breathing: subtle chest expansion
  const breathe = 1.0 + Math.sin(t * 0.8) * 0.008;

  p.noFill();
  p.stroke(180);
  p.strokeWeight(1.2);

  // Head
  const headR = w * 0.13;
  const headY = y + headR + 2;
  p.ellipse(cx, headY, headR * 2, headR * 2.2);

  // Neck
  const neckTop = headY + headR * 1.1;
  const neckBot = neckTop + h * 0.04;
  const neckW = w * 0.08;
  p.line(cx - neckW, neckTop, cx - neckW, neckBot);
  p.line(cx + neckW, neckTop, cx + neckW, neckBot);

  // Shoulders & torso
  const shoulderY = neckBot;
  const shoulderW = w * 0.4 * breathe;
  const waistY = y + h * 0.6;
  const waistW = w * 0.22;
  const hipY = y + h * 0.65;
  const hipW = w * 0.28;

  // Left body outline: shoulder → waist → hip
  p.beginShape();
  p.vertex(cx - neckW, shoulderY);
  (p as any).bezierVertex(
    cx - shoulderW, shoulderY,
    cx - shoulderW, shoulderY + h * 0.02,
    cx - shoulderW, shoulderY + h * 0.05
  );
  // Arm stub
  (p as any).bezierVertex(
    cx - shoulderW - w * 0.08, shoulderY + h * 0.18,
    cx - shoulderW - w * 0.06, shoulderY + h * 0.28,
    cx - shoulderW - w * 0.04, shoulderY + h * 0.35
  );
  p.endShape();

  // Left torso side
  p.beginShape();
  p.vertex(cx - shoulderW + w * 0.02, shoulderY + h * 0.08);
  (p as any).bezierVertex(
    cx - waistW - w * 0.04, waistY - h * 0.1,
    cx - waistW, waistY,
    cx - hipW, hipY
  );
  p.endShape();

  // Right body outline: shoulder → waist → hip
  p.beginShape();
  p.vertex(cx + neckW, shoulderY);
  (p as any).bezierVertex(
    cx + shoulderW, shoulderY,
    cx + shoulderW, shoulderY + h * 0.02,
    cx + shoulderW, shoulderY + h * 0.05
  );
  (p as any).bezierVertex(
    cx + shoulderW + w * 0.08, shoulderY + h * 0.18,
    cx + shoulderW + w * 0.06, shoulderY + h * 0.28,
    cx + shoulderW + w * 0.04, shoulderY + h * 0.35
  );
  p.endShape();

  // Right torso side
  p.beginShape();
  p.vertex(cx + shoulderW - w * 0.02, shoulderY + h * 0.08);
  (p as any).bezierVertex(
    cx + waistW + w * 0.04, waistY - h * 0.1,
    cx + waistW, waistY,
    cx + hipW, hipY
  );
  p.endShape();

  // Legs
  const legTopY = hipY;
  const legBotY = y + h * 0.96;
  const kneeY = y + h * 0.8;
  const footW = w * 0.06;

  // Left leg
  p.beginShape();
  p.vertex(cx - hipW + w * 0.04, legTopY);
  (p as any).bezierVertex(
    cx - w * 0.16, kneeY - h * 0.04,
    cx - w * 0.14, kneeY,
    cx - w * 0.13, legBotY
  );
  p.endShape();

  p.beginShape();
  p.vertex(cx - w * 0.04, legTopY);
  (p as any).bezierVertex(
    cx - w * 0.06, kneeY - h * 0.04,
    cx - w * 0.06, kneeY,
    cx - w * 0.07, legBotY
  );
  p.endShape();

  // Left foot
  p.line(cx - w * 0.13, legBotY, cx - w * 0.13 - footW, legBotY);

  // Right leg
  p.beginShape();
  p.vertex(cx + hipW - w * 0.04, legTopY);
  (p as any).bezierVertex(
    cx + w * 0.16, kneeY - h * 0.04,
    cx + w * 0.14, kneeY,
    cx + w * 0.13, legBotY
  );
  p.endShape();

  p.beginShape();
  p.vertex(cx + w * 0.04, legTopY);
  (p as any).bezierVertex(
    cx + w * 0.06, kneeY - h * 0.04,
    cx + w * 0.06, kneeY,
    cx + w * 0.07, legBotY
  );
  p.endShape();

  // Right foot
  p.line(cx + w * 0.13, legBotY, cx + w * 0.13 + footW, legBotY);
}
