import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { Resources, Building } from '../../types';
import { formatNumber } from '../../utils/constants';

const BuildingsTab: React.FC = () => {
  const currentTab = useGameStore((state) => state.currentTab);
  const buildings = useGameStore((state) => state.buildings);
  const upgradeBuilding = useGameStore((state) => state.upgradeBuilding);
  const canUpgradeBuilding = useGameStore((state) => state.canUpgradeBuilding);
  const getBuildingUpgradeCost = useGameStore((state) => state.getBuildingUpgradeCost);
  const canAfford = useGameStore((state) => state.canAfford);

  if (currentTab !== 'buildings') {
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

  const getBuildingIcon = (buildingKey: string): string => {
    const icons: Record<string, string> = {
      townHall: '🏛️',
      goldMine: '⛏️',
      farm: '🌾',
      lumberMill: '🪵',
      stoneQuarry: '🪨',
      barracks: '🏰',
      archeryRange: '🏹',
      stable: '🐎',
      walls: '🛡️',
      watchtower: '🗼'
    };
    return icons[buildingKey] || '🏢';
  };

  const getBuildingCategory = (buildingKey: string): string => {
    if (['goldMine', 'farm', 'lumberMill', 'stoneQuarry'].includes(buildingKey)) {
      return 'Resource Production';
    }
    if (['barracks', 'archeryRange', 'stable'].includes(buildingKey)) {
      return 'Military Buildings';
    }
    if (['walls', 'watchtower'].includes(buildingKey)) {
      return 'Defense Buildings';
    }
    return 'Core Buildings';
  };

  const handleUpgrade = (buildingKey: string) => {
    if (canUpgradeBuilding(buildingKey)) {
      upgradeBuilding(buildingKey);
    }
  };

  // Group buildings by category
  const buildingsByCategory = Object.entries(buildings).reduce((acc, [key, building]) => {
    const category = getBuildingCategory(key);
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, building: building as Building });
    return acc;
  }, {} as Record<string, Array<{ key: string; building: Building }>>);

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">Buildings</h3>
        
        {Object.entries(buildingsByCategory).map(([category, categoryBuildings]) => (
          <div key={category} className="mb-8">
            <h4 className="text-xl font-semibold text-slate-700 mb-4 border-b-2 border-slate-200 pb-2">
              {category}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryBuildings.map(({ key, building }) => {
                const upgradeCost = getBuildingUpgradeCost(key);
                const canUpgrade = canUpgradeBuilding(key);
                const isMaxLevel = building.level >= building.maxLevel;
                const canAffordUpgrade = upgradeCost ? canAfford(upgradeCost) : false;

                return (
                  <div
                    key={key}
                    className={`building-card ${
                      building.level === 0 ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getBuildingIcon(key)}</span>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm">{building.name}</h5>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-slate-500">Level</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {building.level}
                            </span>
                            <span className="text-xs text-slate-400">/ {building.maxLevel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Building Effect/Production */}
                    <div className="mb-3">
                      {building.production && building.level > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          +{formatNumber(building.production * building.level)}/min production
                        </div>
                      )}
                      {building.defense && building.level > 0 && (
                        <div className="text-xs text-blue-600 font-medium">
                          +{formatNumber(building.defense * building.level)} defense
                        </div>
                      )}
                      {building.effect && (
                        <div className="text-xs text-slate-600">
                          {building.effect}
                        </div>
                      )}
                    </div>

                    {/* Upgrade Section */}
                    {!isMaxLevel && (
                      <div className="border-t border-slate-200 pt-3">
                        {upgradeCost && (
                          <div className="mb-2">
                            <div className="text-xs text-slate-500 mb-1">Upgrade Cost:</div>
                            <div className="text-xs text-slate-700">
                              {formatCost(upgradeCost)}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleUpgrade(key)}
                          disabled={!canUpgrade || !canAffordUpgrade}
                          className={`btn w-full ${
                            canUpgrade && canAffordUpgrade
                              ? 'btn-primary hover:scale-105'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {building.level === 0 ? 'Build' : 'Upgrade'}
                          {!isMaxLevel && ` to Level ${building.level + 1}`}
                        </button>
                      </div>
                    )}

                    {isMaxLevel && (
                      <div className="border-t border-slate-200 pt-3">
                        <div className="text-center text-sm text-green-600 font-medium">
                          ✓ Max Level
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Building Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Building Tips
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Focus on resource buildings early to establish a strong economy</li>
            <li>• Build military structures to train units and defend your kingdom</li>
            <li>• Upgrade buildings to increase their effectiveness</li>
            <li>• Defensive buildings help protect against enemy attacks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BuildingsTab;
