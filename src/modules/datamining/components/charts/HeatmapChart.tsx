import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface HeatmapProps {
  data: { row: string; col: string; value: number }[];
  rows: string[];
  cols: string[];
  width?: number;
  height?: number;
  title?: string;
  colorRange?: [string, string];
}

export const HeatmapChart = ({
  data,
  rows,
  cols,
  height: heightProp,
  title,
  colorRange = ['#ffffff', '#c23030'],
}: HeatmapProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => (
        <HeatmapInner
          data={data}
          rows={rows}
          cols={cols}
          width={width}
          height={heightProp}
          colorRange={colorRange}
        />
      )}
    </ChartWrapper>
  );
};

const HeatmapInner = ({
  data,
  rows,
  cols,
  width,
  height: heightProp,
  colorRange,
}: {
  data: { row: string; col: string; value: number }[];
  rows: string[];
  cols: string[];
  width: number;
  height?: number;
  colorRange: [string, string];
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const margin = { top: 40, right: 20, bottom: 10, left: 90 };
  const innerW = width - margin.left - margin.right;
  const cellH = Math.max(24, Math.min(36, 280 / rows.length));
  const innerH = rows.length * cellH;
  const height = heightProp || (innerH + margin.top + margin.bottom);

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

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand().domain(cols).range([0, innerW]).padding(0.05);
    const yScale = d3.scaleBand().domain(rows).range([0, innerH]).padding(0.05);

    const maxVal = d3.max(data, d => d.value) || 1;
    const minVal = d3.min(data, d => d.value) || 0;
    const colorScale = d3.scaleLinear<string>()
      .domain([minVal, maxVal])
      .range(colorRange)
      .interpolate(d3.interpolateRgb as any);

    // Build lookup
    const valueMap = new Map<string, number>();
    data.forEach(d => valueMap.set(`${d.row}|${d.col}`, d.value));

    // Column headers
    g.selectAll('.col-label')
      .data(cols)
      .join('text')
      .attr('class', 'col-label')
      .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.5)
      .text(d => d);

    // Row labels
    g.selectAll('.row-label')
      .data(rows)
      .join('text')
      .attr('class', 'row-label')
      .attr('x', -6)
      .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 10)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.6)
      .text(d => d);

    // Cells
    const cells: { row: string; col: string; value: number }[] = [];
    rows.forEach(row => {
      cols.forEach(col => {
        const value = valueMap.get(`${row}|${col}`) ?? 0;
        cells.push({ row, col, value });
      });
    });

    g.selectAll('rect.cell')
      .data(cells)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.col) || 0)
      .attr('y', d => yScale(d.row) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 2)
      .attr('fill', '#fff')
      .attr('stroke', '#eeeeee')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event: MouseEvent, d) {
        d3.select(this)
          .attr('stroke', '#1a1a1a')
          .attr('stroke-width', 1.5);
        tooltip.innerHTML = `<strong>${d.row} / ${d.col}</strong><br/>Wartosc: ${typeof d.value === 'number' && d.value % 1 !== 0 ? d.value.toFixed(2) : d.value}`;
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
          .attr('stroke', '#eeeeee')
          .attr('stroke-width', 0.5);
        tooltip.style.opacity = '0';
      })
      .transition()
      .duration(600)
      .delay((_d: any, i: number) => i * 5)
      .attr('fill', d => colorScale(d.value));

    // Value text inside cells (if cell is big enough)
    if (xScale.bandwidth() > 30 && yScale.bandwidth() > 18) {
      g.selectAll('text.cell-val')
        .data(cells)
        .join('text')
        .attr('class', 'cell-val')
        .attr('x', d => (xScale(d.col) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.row) || 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 8)
        .attr('fill', d => d.value > (maxVal * 0.6) ? '#fff' : '#1a1a1a')
        .attr('opacity', 0)
        .attr('pointer-events', 'none')
        .text(d => d.value % 1 !== 0 ? d.value.toFixed(1) : d.value)
        .transition()
        .duration(300)
        .delay(600)
        .attr('opacity', 0.7);
    }

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [data, rows, cols, width, innerW, innerH, margin.left, margin.top, cellH, colorRange]);

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
