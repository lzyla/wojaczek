import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface BarChartProps {
  data: { label: string; value: number }[];
  comparison?: { label: string; value: number }[];
  maxBars?: number;
  title?: string;
  colorful?: boolean;
  sortBy?: 'value' | 'alpha' | 'none';
}

const ACCENT = '#c23030';
const GRAYS = ['#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#555555', '#777777', '#999999'];

export const BarChart = ({ data, comparison, maxBars = 15, title, colorful = false, sortBy = 'none' }: BarChartProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => (
        <BarChartInner
          data={data}
          comparison={comparison}
          maxBars={maxBars}
          width={width}
          colorful={colorful}
          sortBy={sortBy}
        />
      )}
    </ChartWrapper>
  );
};

const BarChartInner = ({
  data,
  comparison,
  maxBars,
  width,
  colorful,
  sortBy,
}: {
  data: { label: string; value: number }[];
  comparison?: { label: string; value: number }[];
  maxBars: number;
  width: number;
  colorful: boolean;
  sortBy: 'value' | 'alpha' | 'none';
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  let sorted = [...data];
  if (sortBy === 'value') sorted.sort((a, b) => b.value - a.value);
  else if (sortBy === 'alpha') sorted.sort((a, b) => a.label.localeCompare(b.label));
  const sliced = sorted.slice(0, maxBars);

  const totalValue = sliced.reduce((s, d) => s + d.value, 0);
  const compMap = new Map((comparison || []).map(d => [d.label, d.value]));

  const margin = { top: 4, right: 60, bottom: 4, left: 120 };
  const barHeight = 24;
  const gap = 5;
  const height = sliced.length * (barHeight + gap) + margin.top + margin.bottom;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create tooltip div
    if (!tooltipRef.current) {
      tooltipRef.current = document.createElement('div');
      tooltipRef.current.style.cssText =
        'position:fixed;pointer-events:none;z-index:9999;background:#fff;border:1px solid #e0e0e0;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:6px;padding:6px 12px;font-size:12px;' +
        'font-family:"DM Sans",sans-serif;opacity:0;transition:opacity 0.15s;color:#1a1a1a;';
      document.body.appendChild(tooltipRef.current);
    }
    const tooltip = tooltipRef.current;

    // Defs for gradients
    const defs = svg.append('defs');
    // Find index of max value for red accent
    const maxVal = Math.max(...sliced.map(d => d.value));
    const maxIdx = sliced.findIndex(d => d.value === maxVal);

    sliced.forEach((_d, i) => {
      const baseColor = colorful
        ? (i === maxIdx ? ACCENT : GRAYS[(i > maxIdx ? i - 1 : i) % GRAYS.length])
        : '#333333';
      const darkColor = d3.color(baseColor)?.darker(0.4)?.formatHex() || baseColor;

      const grad = defs.append('linearGradient')
        .attr('id', `bar-grad-${i}`)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', baseColor);
      grad.append('stop').attr('offset', '100%').attr('stop-color', darkColor);
    });

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const innerW = width - margin.left - margin.right;

    const allValues = [...sliced.map(d => d.value), ...(comparison || []).map(d => d.value)];
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(allValues) || 1])
      .range([0, innerW]);

    const yScale = d3.scaleBand()
      .domain(sliced.map(d => d.label))
      .range([0, sliced.length * (barHeight + gap)])
      .padding(0.15);

    // Grid lines (subtle, dashed)
    const ticks = xScale.ticks(5);
    g.selectAll('.grid-line')
      .data(ticks)
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', sliced.length * (barHeight + gap))
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.1);

    // Bars with animation
    g.selectAll('.bar')
      .data(sliced)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.label) || 0)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', (_d: any, i: number) => `url(#bar-grad-${i})`)
      .attr('rx', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d: any) {
        d3.select(this).attr('opacity', 0.85);
        const pct = totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : '0';
        tooltip.innerHTML = `<strong>${d.label}</strong><br/>Wartosc: ${typeof d.value === 'number' && d.value % 1 !== 0 ? d.value.toFixed(2) : d.value}<br/>${pct}% calosci`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
        setTooltip({ x: event.clientX, y: event.clientY, label: d.label, value: d.value });
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1);
        tooltip.style.opacity = '0';
        setTooltip(null);
      })
      .transition()
      .duration(600)
      .delay((_d: any, i: number) => i * 40)
      .ease(d3.easeBackOut.overshoot(0.3))
      .attr('width', (d: any) => Math.max(0, xScale(d.value)));

    // Comparison overlay dots
    if (comparison && comparison.length > 0) {
      g.selectAll('.comp-dot')
        .data(sliced)
        .join('circle')
        .attr('class', 'comp-dot')
        .attr('cx', (d) => {
          const cv = compMap.get(d.label);
          return cv !== undefined ? xScale(cv) : 0;
        })
        .attr('cy', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
        .attr('r', d => compMap.has(d.label) ? 4 : 0)
        .attr('fill', 'none')
        .attr('stroke', '#888')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay(600)
        .attr('opacity', 0.7);
    }

    // Labels (left)
    g.selectAll('.label')
      .data(sliced)
      .join('text')
      .attr('class', 'label')
      .attr('x', -8)
      .attr('y', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 11)
      .attr('fill', '#1a1a1a')
      .text(d => {
        const maxLen = Math.floor(margin.left / 7);
        return d.label.length > maxLen ? d.label.slice(0, maxLen - 1) + '\u2026' : d.label;
      });

    // Percentage labels at end of bars (appear after animation)
    g.selectAll('.pct-label')
      .data(sliced)
      .join('text')
      .attr('class', 'pct-label')
      .attr('x', d => xScale(d.value) + 6)
      .attr('y', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 10)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0)
      .text(d => {
        const pct = totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(0) : '0';
        const val = typeof d.value === 'number' && d.value % 1 !== 0 ? d.value.toFixed(1) : d.value;
        return `${val} (${pct}%)`;
      })
      .transition()
      .duration(300)
      .delay((_d: any, i: number) => 600 + i * 40)
      .attr('opacity', 0.5);

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = '0';
      }
    };
  }, [sliced, width, margin.left, margin.right, margin.top, barHeight, gap, colorful, comparison, totalValue]);

  useEffect(() => {
    return () => {
      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    />
  );
};
