import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { ViewId } from '../types';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
}

const MENU_ITEMS: { id: ViewId; label: string }[] = [
  { id: 'biography', label: 'Rafał Wojaczek' },
  { id: 'poems', label: 'Teksty' },
  { id: 'list', label: 'Ślady' },
  { id: 'map', label: 'Mapa' },
  { id: 'info', label: 'O aplikacji' },
];

export const MenuOverlay = ({ isOpen, onClose, onNavigate }: MenuOverlayProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="absolute inset-0 bg-white z-[100] flex flex-col justify-center px-12"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-6 w-12 h-12 flex items-center justify-center"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <nav className="space-y-7">
          {MENU_ITEMS.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className="block text-left"
            >
              <span className="text-2xl font-cormorant font-bold tracking-tight hover:text-seal transition-colors">
                {item.label}
              </span>
            </motion.button>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);
