import { useRef, useEffect } from 'react';
import p5 from 'p5';

interface P5WrapperProps {
  sketch: (p: p5, container: HTMLDivElement) => void;
  className?: string;
}

export const P5Wrapper = ({ sketch, className }: P5WrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    p5Ref.current = new p5((p: p5) => {
      sketch(p, container);
    }, container);

    return () => {
      p5Ref.current?.remove();
    };
  }, [sketch]);

  return <div ref={containerRef} className={className || 'w-full'} />;
};
