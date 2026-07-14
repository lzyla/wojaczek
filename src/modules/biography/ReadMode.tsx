import { BIOGRAPHY_SECTIONS } from './biographyData';

export const ReadMode = () => (
  <div className="space-y-16">
    {BIOGRAPHY_SECTIONS.map((section, i) => (
      <div key={section.id}>
        {/* Section separator */}
        {i > 0 && (
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 border-t border-ink/8" />
            <span className="label-ui text-mist text-[9px]">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex-1 border-t border-ink/8" />
          </div>
        )}

        {/* Section title */}
        <span className="label-ui text-mist-dark text-[10px] block mb-6">
          {section.title.toUpperCase()}
        </span>

        {/* Section text */}
        <div className="space-y-5">
          {section.content.split('\n\n').map((paragraph, j) => (
            <p
              key={j}
              className={`text-[15px] leading-[1.75] text-ink/85 text-justify hyphens-auto ${
                j === 0 ? 'dropcap' : ''
              }`}
              lang="pl"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    ))}
  </div>
);
