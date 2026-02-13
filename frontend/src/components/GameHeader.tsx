import React from 'react';
import ResourceBar from './ResourceBar';
import NavigationTabs from './NavigationTabs';
import { useGameStore } from '../stores/gameStore';

const GameHeader: React.FC = () => {
  const isKingdomCreated = useGameStore((state) => state.isKingdomCreated);

  return (
    <header className="bg-gray-50 border-b border-gray-200">
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white py-3 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide font-fantasy">
              Kingdom Wars
            </h1>
            <p className="text-sm mt-1 opacity-90 font-light">
              Build, Conquer, Rule
            </p>
          </div>
        </div>
      </div>
      {isKingdomCreated && (
        <>
          <ResourceBar />
          <NavigationTabs />
        </>
      )}
    </header>
  );
};

export default GameHeader;
