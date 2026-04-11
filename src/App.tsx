import { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import BottomTabBar, { type Tab } from './components/BottomTabBar';
import PlaceholderPage from './components/PlaceholderPage';
import HomePage from './pages/home/HomePage';
import PokedexPage from './pages/pokedex/PokedexPage';
import PartyPage from './pages/party/PartyPage';
import DashboardPage from './pages/dashboard/DashboardPage';

const tabLabels: Record<Tab, string> = {
  home: '홈',
  pokedex: '도감',
  party: '파티',
  dashboard: '대시보드',
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[430px] mx-auto">
        {activeTab === 'home' ? (
          <HomePage />
        ) : activeTab === 'pokedex' ? (
          <PokedexPage />
        ) : activeTab === 'party' ? (
          <PartyPage />
        ) : activeTab === 'dashboard' ? (
          <DashboardPage onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <div className="pb-20 pt-4">
            <PlaceholderPage title={tabLabels[activeTab]} />
          </div>
        )}
      </div>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
