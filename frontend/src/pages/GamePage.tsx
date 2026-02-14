import React, { useEffect } from 'react';
import GameHeader from '../components/GameHeader';
import KingdomCreation from '../components/KingdomCreation';
import GameInterface from '../components/GameInterface';
import Notifications from '../components/Notifications';
import { useGameStore } from '../stores/gameStore';

export const GamePage: React.FC = () => {
  const loadGame = useGameStore(state => state.loadGame);

  useEffect(() => {
    // Load saved game state on app start
    loadGame();
  }, [loadGame]);

  return (
    <div className="app min-h-screen bg-gray-100">
      <GameHeader />
      <KingdomCreation />
      <GameInterface />
      <Notifications />
    </div>
  );
};
