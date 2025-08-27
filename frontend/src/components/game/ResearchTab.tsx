import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { gameData } from '../../data/gameData';
import type { Resources, Technology } from '../../types';
import { formatNumber } from '../../utils/constants';

const ResearchTab: React.FC = () => {
  const currentTab = useGameStore((state: any) => state.currentTab);
  const research = useGameStore((state: any) => state.research);
  const startResearch = useGameStore((state: any) => state.startResearch);
  const canResearch = useGameStore((state: any) => state.canResearch);
  const canAfford = useGameStore((state: any) => state.canAfford);

  if (currentTab !== 'research') {
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

  const getTechIcon = (techKey: string): string => {
    const icons: Record<string, string> = {
      ironWorking: '⚒️',
      masonry: '🧱',
      agriculture: '🌱',
      mining: '⛏️'
    };
    return icons[techKey] || '🔬';
  };

  const getTechCategory = (techKey: string): string => {
    if (['ironWorking'].includes(techKey)) return 'Military';
    if (['masonry'].includes(techKey)) return 'Defense';
    if (['agriculture', 'mining'].includes(techKey)) return 'Economy';
    return 'General';
  };

  const handleStartResearch = (techKey: string) => {
    if (canResearch(techKey)) {
      startResearch(techKey);
    }
  };

  // Group technologies by category
  const techsByCategory = Object.entries(gameData.technologies).reduce((acc, [key, tech]) => {
    const category = getTechCategory(key);
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, tech: tech as Technology });
    return acc;
  }, {} as Record<string, Array<{ key: string; tech: Technology }>>);

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">Technology Research</h3>
        
        {/* Research Status */}
        {research.inProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔬</span>
              <div>
                <h4 className="font-semibold text-blue-800">Research in Progress</h4>
                <p className="text-blue-600">
                  Currently researching: {gameData.technologies[research.inProgress]?.name}
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse"></div>
                </div>
                <p className="text-sm text-blue-500 mt-1">Research will complete automatically</p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Research */}
        {research.completed.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <span className="mr-2">✅</span>
              Completed Research
            </h4>
            <div className="flex flex-wrap gap-2">
              {research.completed.map((techKey: string) => {
                const tech = gameData.technologies[techKey];
                if (!tech) return null;
                
                return (
                  <div key={techKey} className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded">
                    <span>{getTechIcon(techKey)}</span>
                    <span className="text-sm text-green-700">{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Research */}
        {Object.entries(techsByCategory).map(([category, categoryTechs]) => (
          <div key={category} className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">
              {category} Technologies
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTechs.map(({ key, tech }) => {
                const isCompleted = research.completed.includes(key);
                const isInProgress = research.inProgress === key;
                const canResearchTech = canResearch(key);
                const canAffordTech = canAfford(tech.cost);

                return (
                  <div
                    key={key}
                    className={`tech-card bg-white rounded-lg shadow-lg p-4 transition-all duration-200 hover:shadow-xl ${
                      isCompleted ? 'bg-green-50 border-2 border-green-200' : 
                      isInProgress ? 'bg-blue-50 border-2 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTechIcon(key)}</span>
                        <div>
                          <h5 className="font-bold text-gray-800">{tech.name}</h5>
                          <div className="text-xs text-gray-500">{category}</div>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="text-green-600 text-xl">✅</div>
                      )}
                      {isInProgress && (
                        <div className="text-blue-600 text-xl animate-spin">🔬</div>
                      )}
                    </div>

                    {/* Tech Effect */}
                    <div className="mb-3">
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {tech.effect}
                      </div>
                    </div>

                    {/* Research Cost */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">Research Cost:</div>
                      <div className="text-sm text-gray-700">
                        {formatCost(tech.cost)}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isCompleted ? (
                      <div className="text-center text-sm text-green-600 font-medium py-2">
                        ✓ Researched
                      </div>
                    ) : isInProgress ? (
                      <div className="text-center text-sm text-blue-600 font-medium py-2">
                        🔬 Researching...
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartResearch(key)}
                        disabled={!canResearchTech || !canAffordTech || research.inProgress !== null}
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                          canResearchTech && canAffordTech && research.inProgress === null
                            ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {!canAffordTech ? 'Insufficient Resources' :
                         research.inProgress ? 'Research in Progress' :
                         'Start Research'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Research Tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
          <h5 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Research Tips
          </h5>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Research technologies to gain permanent bonuses for your kingdom</li>
            <li>• Only one research can be active at a time - choose wisely!</li>
            <li>• Economic technologies boost resource production</li>
            <li>• Military technologies make your army stronger</li>
            <li>• Research completes automatically after starting</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResearchTab;
