import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface TreemapProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  title?: string;
}

const PALETTE = ['#c23030', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'];

export const TreemapChart = ({ data, height = 280, title }: TreemapProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <TreemapInner data={data} width={width} height={height} />}
    </ChartWrapper>
  );
};

const TreemapInner = ({
  data,
  width,
  height,
}: {
  data: { label: string; value: number }[];
  width: number;
  height: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    if (!tooltipRef.current) {
      tooltipRef.current = document.createElement('div');
      tooltipRef.current.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;background:#fff;border:1px solid #e0e0e0;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:6px;padding:6px 12px;font-size:12px;' +
        'font-family:"DM Sans",sans-serif;opacity:0;transition:opacity 0.15s;color:#1a1a1a;';
      document.body.appendChild(tooltipRef.current);
    }
    const tooltip = tooltipRef.current;

    if (data.length === 0) return;

    const total = data.reduce((s, d) => s + d.value, 0);

    // Build hierarchy
    const root = d3.hierarchy({ children: data.map(d => ({ ...d })) } as any)
      .sum((d: any) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap<any>()
      .size([width, height])
      .padding(3)
      .round(true)(root);

    const leaves = root.leaves();

    // Create defs for drop shadows
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'treemap-shadow')
      .attr('x', '-10%').attr('y', '-10%').attr('width', '120%').attr('height', '120%');
    filter.append('feDropShadow')
      .attr('dx', 0).attr('dy', 2).attr('stdDeviation', 4)
      .attr('flood-color', '#000').attr('flood-opacity', 0.15);

    const g = svg.append('g');

    // Rectangles with animated entrance from center
    const cx = width / 2;
    const cy = height / 2;

    const cells = g.selectAll('g.cell')
      .data(leaves)
      .join('g')
      .attr('class', 'cell')
      .attr('cursor', 'pointer');

    cells.append('rect')
      .attr('x', cx).attr('y', cy)
      .attr('width', 0).attr('height', 0)
      .attr('fill', (_d: any, i: number) => PALETTE[i % PALETTE.length])
      .attr('rx', 3)
      .attr('opacity', 0.85)
      .on('mouseenter', function (event: MouseEvent, d: any) {
        d3.select(this)
          .attr('filter', 'url(#treemap-shadow)')
          .attr('opacity', 1);
        const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(1) : '0';
        tooltip.innerHTML = `<strong>${d.data.label}</strong><br/>Wartosc: ${d.data.value}<br/>${pct}%`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('filter', null)
          .attr('opacity', 0.85);
        tooltip.style.opacity = '0';
      })
      .transition()
      .duration(600)
      .delay((_d: any, i: number) => i * 30)
      .ease(d3.easeBackOut.overshoot(0.2))
      .attr('x', (d: any) => d.x0)
      .attr('y', (d: any) => d.y0)
      .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d: any) => Math.max(0, d.y1 - d.y0));

    // Labels inside rectangles (delayed to appear after animation)
    setTimeout(() => {
      cells.each(function (d: any) {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        const fontSize = Math.max(8, Math.min(14, Math.sqrt(w * h) / 6));

        if (w > 30 && h > 20) {
          d3.select(this).append('text')
            .attr('x', d.x0 + w / 2)
            .attr('y', d.y0 + h / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-family', '"DM Sans", sans-serif')
            .attr('font-size', fontSize)
            .attr('font-weight', '600')
            .attr('fill', () => {
              const idx = leaves.indexOf(d);
              // First item is red (#c23030), next few are dark grays - use white
              // Lighter grays (#999, #bbb, #ddd) need dark text
              return idx <= 2 ? '#fff' : '#333333';
            })
            .attr('opacity', 0)
            .text(d.data.label.length > Math.floor(w / (fontSize * 0.6)) ? d.data.label.slice(0, Math.floor(w / (fontSize * 0.6)) - 1) + '\u2026' : d.data.label)
            .attr('pointer-events', 'none')
            .transition()
            .duration(300)
            .attr('opacity', 0.9);
        }
      });
    }, 650);

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [data, width, height]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  return <svg ref={svgRef} width={width} height={height} className="overflow-visible" />;
};
