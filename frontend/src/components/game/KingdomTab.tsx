import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/constants';

const KingdomTab: React.FC = () => {
  const currentTab = useGameStore(state => state.currentTab);
  const kingdom = useGameStore(state => state.kingdom);
  const getProductionRates = useGameStore(state => state.getProductionRates);
  const getArmyPower = useGameStore(state => state.getArmyPower);

  const productionRates = getProductionRates();
  const armyPower = getArmyPower();

  if (currentTab !== 'kingdom') {
    return null;
  }

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">Kingdom Overview</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Kingdom Overview */}
          <div className="card p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                {kingdom.flag ? (
                  <img
                    src={kingdom.flag}
                    alt="Kingdom Flag"
                    className="w-16 h-12 object-cover rounded border-2 border-slate-300"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center text-2xl">
                    🏰
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {kingdom.name || 'Your Kingdom'}
                </h3>
                <p className="text-slate-600">Level 1 Kingdom</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Population</span>
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-2">
                  {formatNumber(kingdom.population)}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Happiness</span>
                  <span className="text-2xl">😊</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">{kingdom.happiness}%</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Power</span>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-2xl font-bold text-purple-600 mt-2">
                  {formatNumber(kingdom.power + armyPower)}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Army Power</span>
                  <span className="text-2xl">⚔️</span>
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  {formatNumber(armyPower)}
                </div>
              </div>
            </div>
          </div>

          {/* Resource Production */}
          <div className="card p-6">
            <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Resource Production
            </h4>

            <div className="space-y-4">
              <div className="production-item flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🏛️</span>
                  <span className="font-medium text-gray-700">Gold</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-600">
                    +{formatNumber(productionRates.gold)}/min
                  </div>
                  <div className="text-xs text-gray-500">
                    +{formatNumber(productionRates.gold * 60)}/hour
                  </div>
                </div>
              </div>

              <div className="production-item flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🌾</span>
                  <span className="font-medium text-gray-700">Food</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    +{formatNumber(productionRates.food)}/min
                  </div>
                  <div className="text-xs text-gray-500">
                    +{formatNumber(productionRates.food * 60)}/hour
                  </div>
                </div>
              </div>

              <div className="production-item flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🪵</span>
                  <span className="font-medium text-gray-700">Wood</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-600">
                    +{formatNumber(productionRates.wood)}/min
                  </div>
                  <div className="text-xs text-gray-500">
                    +{formatNumber(productionRates.wood * 60)}/hour
                  </div>
                </div>
              </div>

              <div className="production-item flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🪨</span>
                  <span className="font-medium text-gray-700">Stone</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-600">
                    +{formatNumber(productionRates.stone)}/min
                  </div>
                  <div className="text-xs text-gray-500">
                    +{formatNumber(productionRates.stone * 60)}/hour
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Kingdom Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">ℹ️</span>
            Kingdom Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🏛️</div>
              <div className="font-semibold text-gray-700">Established</div>
              <div className="text-sm text-gray-500">Ready to expand</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold text-gray-700">Peaceful</div>
              <div className="text-sm text-gray-500">No active conflicts</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-700">Growing</div>
              <div className="text-sm text-gray-500">Economy developing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KingdomTab;
