import React from 'react';
import { useGameStore } from '../stores/gameStore';
import type { TabType } from '../types';

const NavigationTabs: React.FC = () => {
  const currentTab = useGameStore(state => state.currentTab);
  const setCurrentTab = useGameStore(state => state.setCurrentTab);
  const isKingdomCreated = useGameStore(state => state.isKingdomCreated);

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'kingdom', label: 'Kingdom', icon: '🏰' },
    { key: 'buildings', label: 'Buildings', icon: '🏗️' },
    { key: 'military', label: 'Military', icon: '⚔️' },
    { key: 'attack', label: 'Attack', icon: '🗡️' },
    { key: 'research', label: 'Research', icon: '📚' },
    { key: 'alliances', label: 'Alliances', icon: '🤝' },
  ];

  if (!isKingdomCreated) {
    return null;
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-300 px-4 py-1">
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setCurrentTab(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm ${
              currentTab === key
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm hover:shadow-md'
            }`}
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavigationTabs;
