import { Home, BookOpen, Users, BarChart3 } from 'lucide-react';

type Tab = 'home' | 'pokedex' | 'party' | 'dashboard';

interface BottomTabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { key: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'home', label: '홈', icon: Home },
  { key: 'pokedex', label: '도감', icon: BookOpen },
  { key: 'party', label: '파티', icon: Users },
  { key: 'dashboard', label: '대시보드', icon: BarChart3 },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[430px] mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export type { Tab };
export default BottomTabBar;
