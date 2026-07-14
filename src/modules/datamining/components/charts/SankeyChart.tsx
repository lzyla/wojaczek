import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface SankeyProps {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
  width?: number;
  height?: number;
  title?: string;
}

const PALETTE = ['#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#c23030', '#333333'];

export const SankeyChart = ({ nodes, links, height = 320, title }: SankeyProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <SankeyInner nodes={nodes} links={links} width={width} height={height} />}
    </ChartWrapper>
  );
};

const SankeyInner = ({
  nodes: nodeData,
  links: linkData,
  width,
  height,
}: {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
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

    if (nodeData.length === 0 || linkData.length === 0) return;

    const margin = { top: 10, right: 100, bottom: 10, left: 100 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Determine sources and targets
    const sourceIds = [...new Set(linkData.map(l => l.source))];
    const targetIds = [...new Set(linkData.map(l => l.target))];

    // Calculate total values for sizing
    const sourceValueMap = new Map<string, number>();
    const targetValueMap = new Map<string, number>();
    linkData.forEach(l => {
      sourceValueMap.set(l.source, (sourceValueMap.get(l.source) || 0) + l.value);
      targetValueMap.set(l.target, (targetValueMap.get(l.target) || 0) + l.value);
    });

    const totalValue = linkData.reduce((s, l) => s + l.value, 0);

    // Layout: position nodes on left and right columns
    const nodeWidth = 14;
    const nodePadding = 6;

    // Source nodes on left
    const sourceScale = d3.scaleBand()
      .domain(sourceIds)
      .range([0, innerH])
      .padding(0.15);

    // Target nodes on right
    const targetScale = d3.scaleBand()
      .domain(targetIds)
      .range([0, innerH])
      .padding(0.15);

    // Source node heights proportional to value
    const maxSourceVal = Math.max(...sourceIds.map(id => sourceValueMap.get(id) || 0));
    const maxTargetVal = Math.max(...targetIds.map(id => targetValueMap.get(id) || 0));
    const sourceHeightScale = d3.scaleLinear()
      .domain([0, maxSourceVal || 1])
      .range([20, sourceScale.bandwidth()]);
    const targetHeightScale = d3.scaleLinear()
      .domain([0, maxTargetVal || 1])
      .range([20, targetScale.bandwidth()]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Color: grays with first source highlighted in red
    const colorScale = (id: string) => id === sourceIds[0] ? '#c23030' : '#333333';

    // Track vertical position within each node for stacking links
    const sourceOffsets = new Map<string, number>();
    const targetOffsets = new Map<string, number>();
    sourceIds.forEach(id => {
      const h = sourceHeightScale(sourceValueMap.get(id) || 0);
      const y = (sourceScale(id) || 0) + (sourceScale.bandwidth() - h) / 2;
      sourceOffsets.set(id, y);
    });
    targetIds.forEach(id => {
      const h = targetHeightScale(targetValueMap.get(id) || 0);
      const y = (targetScale(id) || 0) + (targetScale.bandwidth() - h) / 2;
      targetOffsets.set(id, y);
    });

    // Sort links by source for consistent stacking
    const sortedLinks = [...linkData].sort((a, b) => sourceIds.indexOf(a.source) - sourceIds.indexOf(b.source));

    // Draw flow paths
    sortedLinks.forEach((link, i) => {
      const srcVal = sourceValueMap.get(link.source) || 1;
      const tgtVal = targetValueMap.get(link.target) || 1;
      const srcH = sourceHeightScale(srcVal);
      const tgtH = targetHeightScale(tgtVal);
      const linkSrcH = (link.value / srcVal) * srcH;
      const linkTgtH = (link.value / tgtVal) * tgtH;

      const sy = sourceOffsets.get(link.source) || 0;
      const ty = targetOffsets.get(link.target) || 0;

      // Update offsets
      sourceOffsets.set(link.source, sy + linkSrcH);
      targetOffsets.set(link.target, ty + linkTgtH);

      const x0 = nodeWidth;
      const x1 = innerW - nodeWidth;
      const midX = (x0 + x1) / 2;

      const path = d3.path();
      path.moveTo(x0, sy);
      path.bezierCurveTo(midX, sy, midX, ty, x1, ty);
      path.lineTo(x1, ty + linkTgtH);
      path.bezierCurveTo(midX, ty + linkTgtH, midX, sy + linkSrcH, x0, sy + linkSrcH);
      path.closePath();

      g.append('path')
        .attr('d', path.toString())
        .attr('fill', colorScale(link.source))
        .attr('opacity', 0)
        .attr('cursor', 'pointer')
        .on('mouseenter', function (event: MouseEvent) {
          d3.select(this).attr('opacity', 0.6);
          tooltip.innerHTML = `<strong>${link.source} → ${link.target}</strong><br/>Wartosc: ${link.value}<br/>${totalValue > 0 ? ((link.value / totalValue) * 100).toFixed(1) : 0}%`;
          tooltip.style.opacity = '1';
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 10}px`;
        })
        .on('mousemove', function (event: MouseEvent) {
          tooltip.style.left = `${event.clientX + 12}px`;
          tooltip.style.top = `${event.clientY - 10}px`;
        })
        .on('mouseleave', function () {
          d3.select(this).attr('opacity', 0.35);
          tooltip.style.opacity = '0';
        })
        .transition()
        .duration(600)
        .delay(i * 30)
        .attr('opacity', 0.35);
    });

    // Source nodes (left rectangles)
    sourceIds.forEach((id, i) => {
      const val = sourceValueMap.get(id) || 0;
      const h = sourceHeightScale(val);
      const y = (sourceScale(id) || 0) + (sourceScale.bandwidth() - h) / 2;

      g.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', nodeWidth).attr('height', h)
        .attr('fill', colorScale(id))
        .attr('rx', 2)
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(i * 30)
        .attr('opacity', 0.9);

      g.append('text')
        .attr('x', -6).attr('y', y + h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 10)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.7)
        .text(id);
    });

    // Target nodes (right rectangles)
    targetIds.forEach((id, i) => {
      const val = targetValueMap.get(id) || 0;
      const h = targetHeightScale(val);
      const y = (targetScale(id) || 0) + (targetScale.bandwidth() - h) / 2;

      g.append('rect')
        .attr('x', innerW - nodeWidth).attr('y', y)
        .attr('width', nodeWidth).attr('height', h)
        .attr('fill', '#555')
        .attr('rx', 2)
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(i * 30 + 100)
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', innerW - nodeWidth + nodeWidth + 6).attr('y', y + h / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('font-family', '"DM Sans", sans-serif')
        .attr('font-size', 10)
        .attr('fill', '#1a1a1a')
        .attr('opacity', 0.7)
        .text(id);
    });

    return () => {
      if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
    };
  }, [nodeData, linkData, width, height]);

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
