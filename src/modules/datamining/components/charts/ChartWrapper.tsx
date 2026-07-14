import { useRef, useState, useEffect, type ReactNode } from 'react';

interface ChartWrapperProps {
  title?: string;
  className?: string;
  children: (width: number) => ReactNode;
}

export const ChartWrapper = ({ title, className = '', children }: ChartWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    setWidth(el.clientWidth);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-4">
          {title}
        </h3>
      )}
      <div ref={containerRef} className="w-full">
        {width > 0 && children(width)}
      </div>
    </div>
  );
};
