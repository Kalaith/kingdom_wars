import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { gameData } from '../../data/gameData';
import type { Resources, TrainingQueueItem } from '../../types';
import { formatNumber } from '../../utils/constants';

const MilitaryTab: React.FC = () => {
  const currentTab = useGameStore((state) => state.currentTab);
  const army = useGameStore((state) => state.army);
  const buildings = useGameStore((state) => state.buildings);
  const trainingQueue = useGameStore((state) => state.trainingQueue);
  const trainUnit = useGameStore((state) => state.trainUnit);
  const canAfford = useGameStore((state) => state.canAfford);
  
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  if (currentTab !== 'military') {
    return null;
  }

  const formatCost = (cost: Partial<Resources>): string => {
    const parts: string[] = [];
    if (cost.gold) parts.push(`${formatNumber(cost.gold)} 🏛️`);
    if (cost.food) parts.push(`${formatNumber(cost.food)} 🌾`);
    if (cost.wood) parts.push(`${formatNumber(cost.wood)} 🪵`);
    if (cost.stone) parts.push(`${formatNumber(cost.stone)} 🪨`);
    return parts.join(', ');
  };

  const getUnitIcon = (unitType: string): string => {
    const icons: Record<string, string> = {
      soldier: '🗡️',
      spearman: '🛡️',
      archer: '🏹',
      crossbowman: '🎯',
      knight: '🐎'
    };
    return icons[unitType] || '⚔️';
  };

  const canTrainUnit = (unitType: string): boolean => {
    const unit = gameData.units[unitType];
    if (!unit) return false;
    
    const requiredBuilding = buildings[unit.building];
    return requiredBuilding !== undefined && requiredBuilding.level > 0;
  };

  const handleQuantityChange = (unitType: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [unitType]: Math.max(1, quantity)
    }));
  };

  const handleTrainUnit = (unitType: string) => {
    const quantity = selectedQuantities[unitType] || 1;
    if (trainUnit(unitType, quantity)) {
      setSelectedQuantities(prev => ({
        ...prev,
        [unitType]: 1
      }));
    }
  };

  const getTotalCost = (unitType: string, quantity: number): Partial<Resources> => {
    const unit = gameData.units[unitType];
    if (!unit) return {};
    
    return {
      gold: (unit.cost.gold || 0) * quantity,
      food: (unit.cost.food || 0) * quantity,
      wood: (unit.cost.wood || 0) * quantity,
      stone: (unit.cost.stone || 0) * quantity
    };
  };

  const getTimeRemaining = (completionTime: number): string => {
    const remaining = Math.max(0, completionTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">Military Forces</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Train Units */}
          <div className="card p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">🏋️</span>
              Train Units
            </h4>
            
            <div className="space-y-4">
              {Object.entries(gameData.units).map(([unitType, unit]) => {
                const canTrain = canTrainUnit(unitType);
                const quantity = selectedQuantities[unitType] || 1;
                const totalCost = getTotalCost(unitType, quantity);
                const canAffordTraining = canAfford(totalCost);
                
                return (
                  <div
                    key={unitType}
                    className={`unit-card ${
                      canTrain ? 'border-slate-200' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getUnitIcon(unitType)}</span>
                        <div>
                          <h5 className="font-semibold text-slate-800">{unit.name}</h5>
                          <div className="text-xs text-slate-500">
                            ATK: {unit.attack} | DEF: {unit.defense} | HP: {unit.health}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">
                          {unit.trainingTime}s each
                        </div>
                      </div>
                    </div>
                    
                    {!canTrain && (
                      <div className="text-red-600 text-sm mb-2">
                        Requires: {gameData.buildings[unit.building]?.name}
                      </div>
                    )}
                    
                    {canTrain && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(unitType, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1 text-xs text-slate-600">
                          Cost: {formatCost(totalCost)}
                        </div>
                        <button
                          onClick={() => handleTrainUnit(unitType)}
                          disabled={!canAffordTraining}
                          className={`btn btn-sm ${
                            canAffordTraining
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Train
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Army */}
          <div className="card p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">⚔️</span>
              Your Army
            </h4>
            
            {Object.keys(army).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">🏴</div>
                <p>No units trained yet</p>
                <p className="text-sm">Train some units to build your army!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(army).map(([unitType, count]) => {
                  const unit = gameData.units[unitType];
                  if (!unit || count === 0) return null;
                  
                  return (
                    <div key={unitType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getUnitIcon(unitType)}</span>
                        <div>
                          <div className="font-semibold text-slate-800">{unit.name}</div>
                          <div className="text-xs text-slate-500">
                            ATK: {unit.attack} | DEF: {unit.defense} | HP: {unit.health}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800">{formatNumber(count)}</div>
                        <div className="text-xs text-slate-500">units</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Training Queue */}
        {trainingQueue.length > 0 && (
          <div className="card p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">⏱️</span>
              Training Queue
            </h4>
            
            <div className="space-y-3">
              {trainingQueue.map((item: TrainingQueueItem) => {
                const unit = gameData.units[item.unitType];
                if (!unit) return null;
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getUnitIcon(item.unitType)}</span>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {item.quantity}x {unit.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Training in {gameData.buildings[item.building]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {getTimeRemaining(item.completionTime)}
                      </div>
                      <div className="text-xs text-slate-500">remaining</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Military Tips */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-8">
          <h5 className="font-semibold text-red-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Military Tips
          </h5>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Train a diverse army with different unit types for maximum effectiveness</li>
            <li>• Higher-tier units are more powerful but cost more resources</li>
            <li>• Build military buildings to unlock new unit types</li>
            <li>• Keep training units to grow your army and increase your power</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MilitaryTab;
