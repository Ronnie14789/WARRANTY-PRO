import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';

interface TopbarProps {
  darkMode: boolean;
  onToggleMode: () => void;
}

export const Topbar = ({ darkMode, onToggleMode }: TopbarProps) => (
  <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
    <div>
      <h2 className="text-lg font-semibold">Warranty Claim Investigation Management</h2>
      <p className="text-sm text-slate-500">Enterprise workflow for vehicle warranty claims</p>
    </div>
    <Button variant="outline" size="sm" onClick={onToggleMode}>
      {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
      {darkMode ? 'Light' : 'Dark'}
    </Button>
  </header>
);
