import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface PoemBranch {
  id: string;
  title: string;
  hurst: number | null;
  alpha: number | null;
  lines: number;
  emotion?: string;
  intensity?: number;
  wordCount?: number;
}

interface Props {
  poems: PoemBranch[];
  corpusHurst: number;
}

const GOETHE: Record<string, string> = {
  gniew: '#cc3333', smutek: '#2255aa', rezygnacja: '#228877',
  ironia: '#aa3377', czułość: '#ddaa33', rozpacz: '#6644aa',
  melancholia: '#3366aa', tęsknota: '#4477bb', obrzydzenie: '#886633',
  bunt: '#dd7722', strach: '#443366', euforia: '#ddaa33', radość: '#ddaa33',
};

export const FractalTree = ({ poems, corpusHurst }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const maxR = W * 0.85;
    const H = maxR * 2 + 20;
    const cx = W / 2;
    const cy = maxR + 10;

    const valid = poems.filter(po => po.hurst !== null);
    if (valid.length === 0) return;

    const maxWords = Math.max(...valid.map(po => po.wordCount || 50), 1);
    const maxH = Math.max(...valid.map(po => Math.abs(po.hurst || 0)), 0.01);

    // Sort by emotion for visual grouping
    const emotionOrder = ['gniew', 'bunt', 'ironia', 'obrzydzenie', 'rozpacz', 'smutek', 'melancholia', 'tęsknota', 'rezygnacja', 'strach', 'czułość', 'radość', 'euforia'];
    const sorted = [...valid].sort((a, b) => {
      const ai = emotionOrder.indexOf(a.emotion || '');
      const bi = emotionOrder.indexOf(b.emotion || '');
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    interface Spoke {
      angle: number;
      innerR: number;
      outerR: number;
      midR: number;
      color: string;
      alpha: number;
      thickness: number;
      poem: PoemBranch;
      // Sub-branches (fractal detail)
      branches: { x: number; y: number; len: number; angle: number }[];
    }

    let spokes: Spoke[] = [];
    let hoveredSpoke: Spoke | null = null;
    let mousePos = { x: 0, y: 0 };

    function buildSpokes() {
      const result: Spoke[] = [];
      const n = sorted.length;
      const minR = 10;
      const spokeMaxR = maxR - 10;

      for (let i = 0; i < n; i++) {
        const po = sorted[i];
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;

        // Length: word count maps to radius
        const wordRatio = (po.wordCount || 50) / maxWords;
        const outerR = minR + wordRatio * (spokeMaxR - minR) * 0.9;

        // Hurst controls sub-branch chaos
        const h = Math.abs(po.hurst || 0.5);
        const emotionColor = GOETHE[po.emotion || ''] || '#888888';
        const intensity = po.intensity || 0.5;

        // Generate fractal sub-branches at tip
        const branches: { x: number; y: number; len: number; angle: number }[] = [];
        const tipX = cx + Math.cos(angle) * outerR;
        const tipY = cy + Math.sin(angle) * outerR;
        const numBranches = Math.min(Math.floor(h * 10) + 3, 9);
        const branchSpread = p.map(h, 0, 1.5, 0.8, 0.2);

        for (let b = 0; b < numBranches; b++) {
          const bAngle = angle + (b - numBranches / 2) * branchSpread * 0.3;
          const bLen = outerR * 0.22 * (1 + b * 0.25);
          branches.push({ x: tipX, y: tipY, len: bLen, angle: bAngle });
        }

        result.push({
          angle,
          innerR: minR,
          outerR,
          midR: minR + (outerR - minR) * 0.5,
          color: emotionColor,
          alpha: p.map(intensity, 0, 1, 60, 200),
          thickness: p.map(wordRatio, 0, 1, 2, 6),
          poem: po,
          branches,
        });
      }
      return result;
    }

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.frameRate(1);
      spokes = buildSpokes();

      c.elt.addEventListener('mousemove', (e: MouseEvent) => {
        mousePos = { x: e.offsetX, y: e.offsetY };
        let minDist = 25;
        hoveredSpoke = null;
        for (const s of spokes) {
          const tipX = cx + Math.cos(s.angle) * s.outerR;
          const tipY = cy + Math.sin(s.angle) * s.outerR;
          const d = Math.sqrt((mousePos.x - tipX) ** 2 + (mousePos.y - tipY) ** 2);
          if (d < minDist) {
            minDist = d;
            hoveredSpoke = s;
          }
        }
        p.redraw();
      });
      c.elt.addEventListener('mouseleave', () => { hoveredSpoke = null; p.redraw(); });

      // Touch support for mobile
      c.elt.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault();
        const rect = c.elt.getBoundingClientRect();
        const tx = e.touches[0].clientX - rect.left;
        const ty = e.touches[0].clientY - rect.top;
        mousePos = { x: tx, y: ty };
        let minDist = 35; // Larger touch target
        hoveredSpoke = null;
        for (const s of spokes) {
          const tipX = cx + Math.cos(s.angle) * s.outerR;
          const tipY = cy + Math.sin(s.angle) * s.outerR;
          const d = Math.sqrt((tx - tipX) ** 2 + (ty - tipY) ** 2);
          if (d < minDist) {
            minDist = d;
            hoveredSpoke = s;
          }
        }
        p.redraw();
      }, { passive: false });

      p.noLoop();
      p.redraw();
    };

    p.draw = () => {
      p.background(255);

      // Concentric reference circles
      p.noFill();
      p.stroke(240);
      p.strokeWeight(0.5);
      const maxR = Math.min(W, H) / 2 - 40;
      for (let r = 50; r <= maxR; r += 60) {
        p.ellipse(cx, cy, r * 2, r * 2);
      }

      // Center dot
      p.noStroke();
      p.fill(200);
      p.ellipse(cx, cy, 6, 6);

      // Draw all spokes
      for (const s of spokes) {
        const isHovered = hoveredSpoke === s;
        const col = p.color(s.color);
        const r = p.red(col), g = p.green(col), b = p.blue(col);

        // Main spoke line
        const x1 = cx + Math.cos(s.angle) * s.innerR;
        const y1 = cy + Math.sin(s.angle) * s.innerR;
        const x2 = cx + Math.cos(s.angle) * s.outerR;
        const y2 = cy + Math.sin(s.angle) * s.outerR;

        p.stroke(r, g, b, isHovered ? 255 : s.alpha);
        p.strokeWeight(isHovered ? s.thickness + 1.5 : s.thickness);
        p.line(x1, y1, x2, y2);

        // Sub-branches at tip (fractal detail)
        p.strokeWeight(Math.max(s.thickness * 0.5, 0.5));
        for (const br of s.branches) {
          const bx2 = br.x + Math.cos(br.angle) * br.len;
          const by2 = br.y + Math.sin(br.angle) * br.len;
          p.stroke(r, g, b, isHovered ? 180 : s.alpha * 0.5);
          p.line(br.x, br.y, bx2, by2);
        }

        // Tip dot
        p.noStroke();
        p.fill(r, g, b, isHovered ? 255 : s.alpha * 0.8);
        p.ellipse(x2, y2, isHovered ? 10 : 4);
      }

      // Tooltip on hover
      if (hoveredSpoke) {
        const s = hoveredSpoke;
        const tipX = cx + Math.cos(s.angle) * s.outerR;
        const tipY = cy + Math.sin(s.angle) * s.outerR;

        // Background box — large tooltip
        const title = s.poem.title || s.poem.id;
        const info = `H = ${s.poem.hurst}  ·  ${s.poem.lines} wersów`;
        const emotion = s.poem.emotion || '';
        const boxW = Math.max(title.length * 10, 220);
        const boxH = emotion ? 64 : 48;

        // Position tooltip so it doesn't go off-screen
        let tx = tipX + 12;
        let ty = tipY - boxH - 4;
        if (tx + boxW > W - 10) tx = tipX - boxW - 12;
        if (ty < 10) ty = tipY + 12;

        p.fill(255, 245);
        p.stroke(200);
        p.strokeWeight(1);
        p.rect(tx, ty, boxW, boxH, 4);

        p.noStroke();
        p.fill(30);
        p.textFont('DM Sans');
        p.textSize(14);
        p.textStyle(p.BOLD);
        p.textAlign(p.LEFT, p.TOP);
        p.text(title, tx + 12, ty + 10);

        p.textStyle(p.NORMAL);
        p.textSize(12);
        p.fill(100);
        p.text(info, tx + 12, ty + 30);

        if (emotion) {
          p.fill(p.color(GOETHE[emotion] || '#888'));
          p.textSize(11);
          p.text(emotion, tx + 12, ty + 48);
        }
      }
    };
  }, [poems, corpusHurst]);

  return <P5Wrapper sketch={sketch} className="w-full" />;
};
