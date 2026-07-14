import { useCallback } from 'react';
import p5 from 'p5';
import { P5Wrapper } from './P5Wrapper';

interface Props {
  data: [string, number][]; // [bigram, count]
}

interface Node {
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: number;
  color: { r: number; g: number; b: number };
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

// Goethe-inspired palette for word clusters
const PALETTE = [
  { r: 40, g: 40, b: 40 },     // dark gray
  { r: 80, g: 80, b: 80 },     // medium gray
  { r: 120, g: 120, b: 120 },  // light gray
  { r: 60, g: 60, b: 60 },     // gray
  { r: 194, g: 48, b: 48 },    // red accent
  { r: 100, g: 100, b: 100 },  // gray
  { r: 50, g: 50, b: 50 },     // dark
  { r: 70, g: 70, b: 70 },     // mid
];

export const BigramNetwork = ({ data }: Props) => {
  const sketch = useCallback((p: p5, container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = 450;
    const bigrams = data.filter(([b]) => b && !b.startsWith('*')).slice(0, 25);
    const maxCount = Math.max(...bigrams.map(([, c]) => c), 1);

    // Build graph
    const nodeMap = new Map<string, Node>();
    const edges: Edge[] = [];

    bigrams.forEach(([bigram, count]) => {
      const parts = bigram.split(' ');
      if (parts.length < 2) return;
      const [w1, w2] = parts;

      if (!nodeMap.has(w1)) {
        nodeMap.set(w1, {
          word: w1,
          x: W * 0.2 + Math.random() * W * 0.6,
          y: H * 0.2 + Math.random() * H * 0.6,
          vx: 0, vy: 0,
          size: 0,
          connections: 0,
          color: PALETTE[nodeMap.size % PALETTE.length],
        });
      }
      if (!nodeMap.has(w2)) {
        nodeMap.set(w2, {
          word: w2,
          x: W * 0.2 + Math.random() * W * 0.6,
          y: H * 0.2 + Math.random() * H * 0.6,
          vx: 0, vy: 0,
          size: 0,
          connections: 0,
          color: PALETTE[nodeMap.size % PALETTE.length],
        });
      }

      const n1 = nodeMap.get(w1)!;
      const n2 = nodeMap.get(w2)!;
      n1.connections += count;
      n2.connections += count;
      n1.size = Math.max(n1.size, count);
      n2.size = Math.max(n2.size, count);

      edges.push({ from: w1, to: w2, weight: count });
    });

    const nodes = Array.from(nodeMap.values());
    // Normalize sizes
    const maxSize = Math.max(...nodes.map(n => n.connections), 1);
    nodes.forEach(n => { n.size = 8 + (n.connections / maxSize) * 20; });

    let hoveredNode: Node | null = null;
    let dragNode: Node | null = null;

    p.setup = () => {
      const c = p.createCanvas(W, H);
      p.frameRate(30);
      c.elt.addEventListener('mousemove', (e: MouseEvent) => {
        const mx = e.offsetX, my = e.offsetY;
        if (dragNode) {
          dragNode.x = mx;
          dragNode.y = my;
          dragNode.vx = 0;
          dragNode.vy = 0;
          return;
        }
        hoveredNode = null;
        for (const n of nodes) {
          if (p.dist(mx, my, n.x, n.y) < n.size + 5) {
            hoveredNode = n;
            break;
          }
        }
      });
      c.elt.addEventListener('mousedown', (e: MouseEvent) => {
        const mx = e.offsetX, my = e.offsetY;
        for (const n of nodes) {
          if (p.dist(mx, my, n.x, n.y) < n.size + 5) {
            dragNode = n;
            break;
          }
        }
      });
      c.elt.addEventListener('mouseup', () => { dragNode = null; });
      c.elt.addEventListener('mouseleave', () => { hoveredNode = null; dragNode = null; });

      // Touch support
      c.elt.addEventListener('touchstart', (e: TouchEvent) => {
        const rect = c.elt.getBoundingClientRect();
        const mx = e.touches[0].clientX - rect.left;
        const my = e.touches[0].clientY - rect.top;
        for (const n of nodes) {
          if (p.dist(mx, my, n.x, n.y) < n.size + 10) {
            dragNode = n;
            hoveredNode = n;
            break;
          }
        }
      }, { passive: true });
      c.elt.addEventListener('touchmove', (e: TouchEvent) => {
        if (dragNode) {
          e.preventDefault();
          const rect = c.elt.getBoundingClientRect();
          dragNode.x = e.touches[0].clientX - rect.left;
          dragNode.y = e.touches[0].clientY - rect.top;
          dragNode.vx = 0;
          dragNode.vy = 0;
        }
      }, { passive: false });
      c.elt.addEventListener('touchend', () => { dragNode = null; });
    };

    p.draw = () => {
      p.background(255);

      // Physics simulation — force-directed layout
      const REPULSION = 2000;
      const SPRING = 0.005;
      const DAMPING = 0.85;
      const CENTER_PULL = 0.001;

      // Node-node repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) dist = 1;
          const force = REPULSION / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (a !== dragNode) { a.vx += fx; a.vy += fy; }
          if (b !== dragNode) { b.vx -= fx; b.vy -= fy; }
        }
      }

      // Edge spring forces
      for (const edge of edges) {
        const a = nodeMap.get(edge.from)!;
        const b = nodeMap.get(edge.to)!;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const targetDist = 60 + (1 - edge.weight / maxCount) * 80;
        const force = (dist - targetDist) * SPRING * edge.weight;
        const fx = (dx / Math.max(dist, 1)) * force;
        const fy = (dy / Math.max(dist, 1)) * force;
        if (a !== dragNode) { a.vx += fx; a.vy += fy; }
        if (b !== dragNode) { b.vx -= fx; b.vy -= fy; }
      }

      // Center pull + boundary + apply velocity
      for (const n of nodes) {
        if (n === dragNode) continue;
        n.vx += (W / 2 - n.x) * CENTER_PULL;
        n.vy += (H / 2 - n.y) * CENTER_PULL;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx;
        n.y += n.vy;
        n.x = p.constrain(n.x, 30, W - 30);
        n.y = p.constrain(n.y, 30, H - 30);
      }

      // Draw edges
      for (const edge of edges) {
        const a = nodeMap.get(edge.from)!;
        const b = nodeMap.get(edge.to)!;
        const isHighlighted = hoveredNode && (hoveredNode === a || hoveredNode === b);
        const weight = edge.weight / maxCount;

        if (isHighlighted) {
          p.stroke(158, 42, 43, 150);
          p.strokeWeight(1 + weight * 4);
        } else {
          p.stroke(0, 0, 0, 15 + weight * 40);
          p.strokeWeight(0.5 + weight * 2.5);
        }
        p.line(a.x, a.y, b.x, b.y);

      }

      // Draw nodes
      for (const n of nodes) {
        const isHovered = hoveredNode === n;
        const { r, g, b } = n.color;

        // Glow
        if (isHovered) {
          p.noStroke();
          p.fill(r, g, b, 20);
          p.ellipse(n.x, n.y, n.size * 3);
          p.fill(r, g, b, 10);
          p.ellipse(n.x, n.y, n.size * 4.5);
        }

        // Node circle
        p.fill(r, g, b, isHovered ? 220 : 140);
        p.noStroke();
        p.ellipse(n.x, n.y, n.size * 2);

        // Inner dot
        p.fill(255, 255, 255, isHovered ? 200 : 100);
        p.ellipse(n.x, n.y, n.size * 0.6);

      }

      // Word labels on nodes — essential for graph readability
      p.textFont('DM Sans');
      p.textAlign(p.CENTER);
      p.noStroke();
      for (const n of nodes) {
        p.fill(120);
        p.textSize(9);
        p.textStyle(p.NORMAL);
        p.text(n.word, n.x, n.y - n.size - 4);
      }
    };
  }, [data]);

  return <P5Wrapper sketch={sketch} className="w-full rounded-lg overflow-hidden" />;
};
