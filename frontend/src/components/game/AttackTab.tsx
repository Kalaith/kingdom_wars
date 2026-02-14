import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { gameData } from '../../data/gameData';
import type { EnemyKingdom, Resources } from '../../types';
import { formatNumber } from '../../utils/constants';

const AttackTab: React.FC = () => {
  const currentTab = useGameStore(state => state.currentTab);
  const army = useGameStore(state => state.army);
  const getArmyPower = useGameStore(state => state.getArmyPower);
  const addResources = useGameStore(state => state.addResources);
  const addNotification = useGameStore(state => state.addNotification);

  const [selectedTarget, setSelectedTarget] = useState<EnemyKingdom | null>(null);
  const [attackInProgress, setAttackInProgress] = useState(false);

  if (currentTab !== 'attack') {
    return null;
  }

  const armyPower = getArmyPower();
  const armyValues = Object.values(army).filter((count): count is number => count !== undefined);
  const hasArmy = armyValues.some(count => count > 0);

  const getRecommendation = (enemyPower: number): { text: string; color: string } => {
    const powerRatio = armyPower / enemyPower;

    if (powerRatio >= 1.5) return { text: 'Easy Victory', color: 'text-green-600' };
    if (powerRatio >= 1.2) return { text: 'Likely Victory', color: 'text-green-500' };
    if (powerRatio >= 0.8) return { text: 'Fair Fight', color: 'text-yellow-600' };
    if (powerRatio >= 0.5) return { text: 'Difficult', color: 'text-orange-600' };
    return { text: 'Very Risky', color: 'text-red-600' };
  };

  const simulateBattle = (
    enemy: EnemyKingdom
  ): { victory: boolean; resourcesGained: Resources; losses: number } => {
    const powerRatio = armyPower / enemy.power;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const adjustedRatio = powerRatio * randomFactor;

    const victory = adjustedRatio > 1;

    // Calculate resources gained
    const lootPercentage = victory ? 0.1 + Math.random() * 0.15 : 0.02 + Math.random() * 0.05;
    const resourcesGained = {
      gold: Math.floor(enemy.resources.gold * lootPercentage),
      food: Math.floor(enemy.resources.food * lootPercentage),
      wood: Math.floor(enemy.resources.wood * lootPercentage),
      stone: Math.floor(enemy.resources.stone * lootPercentage),
    };

    // Calculate losses (percentage of army lost)
    const lossPercentage = victory ? Math.random() * 0.1 : 0.2 + Math.random() * 0.3;

    return { victory, resourcesGained, losses: lossPercentage };
  };

  const handleAttack = async (enemy: EnemyKingdom) => {
    if (!hasArmy || attackInProgress) return;

    setAttackInProgress(true);
    setSelectedTarget(enemy);

    // Simulate battle delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const battleResult = simulateBattle(enemy);

    if (battleResult.victory) {
      addResources(battleResult.resourcesGained);
      addNotification({
        type: 'success',
        message: `Victory against ${enemy.name}! Gained ${formatNumber(battleResult.resourcesGained.gold)} gold and other resources.`,
        duration: 8000,
      });
    } else {
      addNotification({
        type: 'error',
        message: `Defeat against ${enemy.name}. Your army suffered heavy losses.`,
        duration: 8000,
      });
    }

    // Apply army losses (simplified - just reduce unit counts)
    if (battleResult.losses > 0) {
      // This would need more complex logic to actually remove units
      addNotification({
        type: 'warning',
        message: `You lost ${Math.floor(battleResult.losses * 100)}% of your attacking force.`,
        duration: 6000,
      });
    }

    setAttackInProgress(false);
    setSelectedTarget(null);
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">
          Attack Other Kingdoms
        </h3>

        {/* Army Status */}
        <div className="card p-6 mb-6">
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2">⚔️</span>
            Your Army Status
          </h4>

          {!hasArmy ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">⚔️</div>
              <p className="text-lg font-medium">No Army Available</p>
              <p className="text-sm">Train some units in the Military tab before attacking!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl mb-2">💪</div>
                <div className="font-semibold text-slate-700">Total Power</div>
                <div className="text-xl font-bold text-red-600">{formatNumber(armyPower)}</div>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-slate-700">Total Units</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatNumber(armyValues.reduce((sum, count) => sum + count, 0))}
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold text-slate-700">Battle Ready</div>
                <div className="text-xl font-bold text-green-600">Yes</div>
              </div>
            </div>
          )}
        </div>

        {/* Enemy Kingdoms */}
        {hasArmy && (
          <div className="card p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">🏰</span>
              Enemy Kingdoms
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameData.enemyKingdoms.map((enemy: EnemyKingdom, index: number) => {
                const recommendation = getRecommendation(enemy.power);
                const isBeingAttacked = selectedTarget?.name === enemy.name && attackInProgress;

                return (
                  <div
                    key={index}
                    className={`enemy-kingdom border rounded-lg p-4 transition-all duration-200 ${
                      isBeingAttacked
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-gray-800 text-lg">{enemy.name}</h5>
                        <div className="text-sm text-gray-500">Enemy Kingdom</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-700">
                          Power: {formatNumber(enemy.power)}
                        </div>
                        <div className={`text-sm font-medium ${recommendation.color}`}>
                          {recommendation.text}
                        </div>
                      </div>
                    </div>

                    {/* Enemy Resources */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Available Resources:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <span>🏛️</span>
                          <span>{formatNumber(enemy.resources.gold)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🌾</span>
                          <span>{formatNumber(enemy.resources.food)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🪵</span>
                          <span>{formatNumber(enemy.resources.wood)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🪨</span>
                          <span>{formatNumber(enemy.resources.stone)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Battle Prediction */}
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Battle Prediction:</div>
                      <div className="flex justify-between text-sm">
                        <span>Your Power: {formatNumber(armyPower)}</span>
                        <span>Enemy Power: {formatNumber(enemy.power)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${armyPower > enemy.power ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{
                            width: `${Math.min(100, (armyPower / enemy.power) * 50)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Attack Button */}
                    <button
                      onClick={() => handleAttack(enemy)}
                      disabled={attackInProgress}
                      className={`w-full px-4 py-2 rounded font-medium transition-all duration-200 ${
                        isBeingAttacked
                          ? 'bg-red-600 text-white cursor-not-allowed'
                          : attackInProgress
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
                      }`}
                    >
                      {isBeingAttacked ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Attacking...</span>
                        </div>
                      ) : attackInProgress ? (
                        'Battle in Progress'
                      ) : (
                        `⚔️ Attack ${enemy.name}`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attack Tips */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <h5 className="font-semibold text-red-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Battle Tips
          </h5>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Attack kingdoms with lower power for easier victories</li>
            <li>• Successful attacks will yield resources from the enemy kingdom</li>
            <li>• Your army may suffer losses even in victory</li>
            <li>• Build a stronger army to take on more powerful enemies</li>
            <li>• Each battle outcome has some randomness - be prepared!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AttackTab;
