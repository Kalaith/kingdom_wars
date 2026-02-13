import React from 'react';
import KingdomTab from './game/KingdomTab';
import BuildingsTab from './game/BuildingsTab';
import MilitaryTab from './game/MilitaryTab';
import AttackTab from './game/AttackTab';
import ResearchTab from './game/ResearchTab';
import AlliancesTab from './game/AlliancesTab';
import { useGameStore } from '../stores/gameStore';

const GameInterface: React.FC = () => {
  const isKingdomCreated = useGameStore((state) => state.isKingdomCreated);

  if (!isKingdomCreated) {
    return null;
  }

  return (
    <div className="game-interface min-h-screen bg-gray-50">
      <div className="tab-content-container">
        <KingdomTab />
        <BuildingsTab />
        <MilitaryTab />
        <AttackTab />
        <ResearchTab />
        <AlliancesTab />
      </div>
    </div>
  );
};

export default GameInterface;
