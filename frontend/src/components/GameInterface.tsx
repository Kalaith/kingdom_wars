import React from 'react';
import KingdomTab from './KingdomTab';
import BuildingsTab from './BuildingsTab';
import MilitaryTab from './MilitaryTab';
import AttackTab from './AttackTab';
import ResearchTab from './ResearchTab';
import AlliancesTab from './AlliancesTab';
import { useGameStore } from '../stores/gameStore';

const GameInterface: React.FC = () => {
  const isKingdomCreated = useGameStore(state => state.isKingdomCreated);

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
