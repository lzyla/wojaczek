import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { aiService } from '../../services/ai/aiService';

interface MockupsViewProps {
  hasGeminiKey: boolean;
  onBack: () => void;
  onOpenKeyDialog: () => void;
  onKeyMissing: () => void;
}

export const MockupsView = ({ hasGeminiKey, onBack, onOpenKeyDialog, onKeyMissing }: MockupsViewProps) => {
  const [mockupImages, setMockupImages] = useState<string[]>([]);

  useEffect(() => {
    if (hasGeminiKey && mockupImages.length === 0) {
      aiService.generateMockups()
        .then(setMockupImages)
        .catch((error: any) => {
          console.error(error);
          if (error.message?.includes("403") || error.message?.includes("permission")) {
            onKeyMissing();
          }
        });
    }
  }, [hasGeminiKey, mockupImages.length, onKeyMissing]);

  return (
    <motion.div
      key="mockups"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-3 label-ui hover:text-seal transition-colors"
      >
        <ArrowLeft size={14} /> Powrót
      </button>

      <h2 className="text-4xl tracking-tighter">Mockupy Projektowe</h2>
      <p className="label-ui opacity-40">Wizja Artystyczna • AI Generated</p>

      {!hasGeminiKey ? (
        <div className="border border-ink p-8 no-radius text-center space-y-6">
          <p className="text-sm">Do generowania obrazów wymagany jest klucz API z włączonym bilingiem.</p>
          <button
            onClick={onOpenKeyDialog}
            className="w-full py-4 btn-square label-ui"
          >
            Wybierz Klucz API
          </button>
          <p className="text-[10px] opacity-40">
            Modele Imagen wymagają projektu Google Cloud z włączonym bilingiem.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {mockupImages.length > 0 ? mockupImages.map((img, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[9/16] bg-white border border-ink/10 no-radius overflow-hidden">
                <img src={img} alt={`Mockup ${i}`} className="w-full h-full object-cover" />
              </div>
              <span className="label-ui opacity-30">Wizualizacja 0{i + 1}</span>
            </div>
          )) : (
            <div className="py-24 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent mx-auto mb-4" />
              <span className="label-ui opacity-30">Generowanie wizji...</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
