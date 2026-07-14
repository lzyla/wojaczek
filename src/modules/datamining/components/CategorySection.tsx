import type { AnalysisCategory, AnalysisType } from '../types';
import { AnalysisCard } from './AnalysisCard';

interface CategorySectionProps {
  category: AnalysisCategory;
  onSelect: (analysis: AnalysisType) => void;
}

export const CategorySection = ({ category, onSelect }: CategorySectionProps) => {
  return (
    <div className="mb-2">
      <div className="grid grid-cols-1 gap-0">
        {category.analyses.map((analysis) => (
          <AnalysisCard
            key={analysis.id}
            analysis={analysis}
            onClick={() => onSelect(analysis)}
          />
        ))}
      </div>
    </div>
  );
};
