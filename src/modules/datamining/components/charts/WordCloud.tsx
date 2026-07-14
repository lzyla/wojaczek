interface WordCloudProps {
  words: { text: string; size: number }[];
  title?: string;
}

const COLORS = ['#c23030', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#333333', '#555555'];

export const WordCloud = ({ words, title }: WordCloudProps) => {
  const maxSize = Math.max(...words.map((w) => w.size), 1);
  const minSize = Math.min(...words.map((w) => w.size), 0);
  const range = maxSize - minSize || 1;

  const mapSize = (s: number) => 12 + ((s - minSize) / range) * 28;
  const mapOpacity = (s: number) => 0.4 + ((s - minSize) / range) * 0.6;
  const mapColor = (s: number, isMax: boolean) => {
    if (isMax) return '#c23030';
    const t = (s - minSize) / range;
    const grays = ['#bbbbbb', '#999999', '#777777', '#555555', '#333333'];
    const idx = Math.min(Math.floor(t * grays.length), grays.length - 1);
    return grays[idx];
  };

  return (
    <div>
      {title && (
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-4">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-4">
        {words.map((w) => (
          <span
            key={w.text}
            className="font-cormorant leading-tight transition-transform hover:scale-110"
            style={{
              fontSize: `${mapSize(w.size)}px`,
              opacity: mapOpacity(w.size),
              color: mapColor(w.size, w.size === maxSize),
            }}
          >
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
};
