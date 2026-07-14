import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ChartWrapper } from './ChartWrapper';

interface ForceNode extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  value?: number;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string;
  target: string;
  value?: number;
}

interface ForceGraphProps {
  nodes: { id: string; group: string; value?: number }[];
  links: { source: string; target: string; value?: number }[];
  width?: number;
  height?: number;
  title?: string;
}

const PALETTE = ['#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#c23030', '#333333'];

export const ForceGraph = ({ nodes, links, height = 350, title }: ForceGraphProps) => {
  return (
    <ChartWrapper title={title}>
      {(width) => <ForceGraphInner nodes={nodes} links={links} width={width} height={height} />}
    </ChartWrapper>
  );
};

const ForceGraphInner = ({
  nodes: nodeData,
  links: linkData,
  width,
  height,
}: {
  nodes: { id: string; group: string; value?: number }[];
  links: { source: string; target: string; value?: number }[];
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

    if (nodeData.length === 0) return;

    // Deep copy for simulation
    const nodes: ForceNode[] = nodeData.map(d => ({ ...d }));
    const links: ForceLink[] = linkData.map(d => ({ ...d }));

    // Color: default #333, no group-based coloring
    const colorScale = (_group: string) => '#333333';

    // Size scale
    const maxVal = Math.max(...nodes.map(n => n.value || 1), 1);
    const sizeScale = d3.scaleSqrt().domain([0, maxVal]).range([5, 18]);

    // Link width scale
    const maxLinkVal = Math.max(...links.map(l => l.value || 1), 1);
    const linkWidthScale = d3.scaleLinear().domain([0, maxLinkVal]).range([1, 5]);

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    // Force simulation
    const simulation = d3.forceSimulation<ForceNode>(nodes)
      .force('link', d3.forceLink<ForceNode, ForceLink>(links).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<ForceNode>().radius(d => sizeScale(d.value || 1) + 4));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#dddddd')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => linkWidthScale(d.value || 1));

    // Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => sizeScale(d.value || 1))
      .attr('fill', d => colorScale(d.group))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'grab')
      .attr('opacity', 0)
      .on('mouseenter', function (event: MouseEvent, d: ForceNode) {
        // Highlight connected links
        link.attr('stroke-opacity', (l: any) =>
          l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.1
        ).attr('stroke', (l: any) =>
          l.source.id === d.id || l.target.id === d.id ? '#c23030' : '#dddddd'
        );
        node.attr('opacity', (n: ForceNode) => {
          const connected = links.some((l: any) =>
            (l.source.id === d.id && l.target.id === n.id) ||
            (l.target.id === d.id && l.source.id === n.id)
          );
          return connected || n.id === d.id ? 1 : 0.2;
        });
        d3.select(this).attr('r', sizeScale(d.value || 1) + 3);

        tooltip.innerHTML = `<strong>${d.id}</strong><br/>Grupa: ${d.group}${d.value ? `<br/>Wartosc: ${d.value}` : ''}`;
        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mousemove', function (event: MouseEvent) {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function (_event: MouseEvent, d: ForceNode) {
        link.attr('stroke-opacity', 0.6).attr('stroke', '#dddddd');
        node.attr('opacity', 1);
        d3.select(this).attr('r', sizeScale(d.value || 1));
        tooltip.style.opacity = '0';
      });

    // Animated entrance
    node.transition()
      .duration(600)
      .delay((_d: any, i: number) => i * 20)
      .attr('opacity', 1);

    // Drag behavior
    const drag = d3.drag<SVGCircleElement, ForceNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('font-family', '"DM Sans", sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.6)
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => -(sizeScale(d.value || 1) + 6))
      .text(d => d.id.length > 12 ? d.id.slice(0, 11) + '\u2026' : d.id);

    // Tick update
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
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
