import { Menu } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
  onMenuClick: () => void;
}

export const Header = ({ onLogoClick, onMenuClick }: HeaderProps) => (
  <header className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-40 bg-white border-b border-ink/5">
    <button onClick={onLogoClick} className="font-dm font-semibold uppercase tracking-[0.1em] text-[14px] hover:text-seal transition-colors">ŚLADAMI WOJACZKA</button>
    <button onClick={onMenuClick} className="p-2 hover:text-seal transition-colors">
      <Menu size={20} strokeWidth={1.5} />
    </button>
  </header>
);
