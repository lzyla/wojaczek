import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface BubbleProps {
  data: { label: string; value: number; size: number; category?: string }[];
  width?: number;
  height?: number;
  title?: string;
}

const PALETTE = ['#c23030', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd'];

export const BubbleChart = ({ data, height = 320, title }: BubbleProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <BubbleInner data={data} width={width} height={height} />}
    </ChartWrapper>
  );
};

const BubbleInner = ({
  data,
  width,
  height,
}: {
  data: { label: string; value: number; size: number; category?: string }[];
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

    // Categories for coloring
    const categories = [...new Set(data.map(d => d.category || 'default'))];
    const colorScale = d3.scaleOrdinal<string>().domain(categories).range(PALETTE);

    // Build hierarchy for pack layout
    const root = d3.hierarchy({ children: data } as any)
      .sum((d: any) => d.size || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const packLayout = d3.pack<any>()
      .size([width, height])
      .padding(4);

    packLayout(root);

    const leaves = root.leaves();
    const g = svg.append('g');

    // Bubbles with animated entrance
    const bubbles = g.selectAll('g.bubble')
      .data(leaves)
      .join('g')
      .attr('class', 'bubble')
      .attr('cursor', 'pointer');

    bubbles.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', 0)
      .attr('fill', (d: any) => colorScale(d.data.category || 'default'))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .on('mouseenter', function (event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.r + 4)
          .attr('opacity', 1);
        tooltip.innerHTML = `<strong>${d.data.label}</strong><br/>Wartosc: ${d.data.value}${d.data.category ? `<br/>Kategoria: ${d.data.category}` : ''}`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function (_event: MouseEvent, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.r)
          .attr('opacity', 0.8);
        tooltip.style.opacity = '0';
      })
      .transition()
      .duration(600)
      .delay((_d: any, i: number) => i * 25)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5))
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', (d: any) => d.r);

    // Labels inside bubbles (delayed)
    setTimeout(() => {
      bubbles.each(function (d: any) {
        const r = d.r;
        if (r < 16) return; // too small for label
        const fontSize = Math.max(8, Math.min(12, r / 3));
        const maxChars = Math.floor((r * 2) / (fontSize * 0.6));

        d3.select(this).append('text')
          .attr('x', d.x)
          .attr('y', d.y)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('font-family', '"DM Sans", sans-serif')
          .attr('font-size', fontSize)
          .attr('font-weight', '600')
          .attr('fill', '#fff')
          .attr('pointer-events', 'none')
          .attr('opacity', 0)
          .text(d.data.label.length > maxChars ? d.data.label.slice(0, maxChars - 1) + '\u2026' : d.data.label)
          .transition()
          .duration(300)
          .attr('opacity', 0.9);
      });
    }, 700);

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
