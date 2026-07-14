interface InfoDisplayProps {
  items: { label: string; value: string | number; sub?: string }[];
  title?: string;
}

export const InfoDisplay = ({ items, title }: InfoDisplayProps) => {
  return (
    <div>
      {title && (
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-ink/10 p-4">
            <div className="text-[10px] uppercase tracking-wider opacity-40 mb-1">{item.label}</div>
            <div className="text-lg font-bold">{item.value}</div>
            {item.sub && <div className="text-xs opacity-50 mt-1">{item.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ListDisplayProps {
  items: { primary: string; secondary?: string; tertiary?: string }[];
  title?: string;
  emptyMessage?: string;
}

export const ListDisplay = ({ items, title, emptyMessage }: ListDisplayProps) => {
  if (items.length === 0 && emptyMessage) {
    return <p className="text-sm opacity-40 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div>
      {title && (
        <h3 className="font-mono text-xs uppercase tracking-widest text-ink/40 mb-4">{title}</h3>
      )}
      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={i} className="border-b border-ink/8 py-3 px-1">
            <div className="text-sm font-medium">{item.primary}</div>
            {item.secondary && <div className="text-xs opacity-50 mt-0.5">{item.secondary}</div>}
            {item.tertiary && <div className="text-[11px] opacity-35 mt-0.5 italic">{item.tertiary}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
