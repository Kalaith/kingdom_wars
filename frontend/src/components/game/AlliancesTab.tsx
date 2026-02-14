import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { formatNumber } from '../../utils/constants';

const AlliancesTab: React.FC = () => {
  const currentTab = useGameStore(state => state.currentTab);
  const alliance = useGameStore(state => state.alliance);
  const addNotification = useGameStore(state => state.addNotification);

  if (currentTab !== 'alliances') {
    return null;
  }

  // Mock alliance data
  const availableAlliances = [
    {
      id: 'dragons',
      name: 'Dragon Lords',
      members: 15,
      power: 25000,
      level: 3,
      description: 'Elite alliance of powerful kingdoms focused on conquest and dominance.',
      requirements: { minPower: 2000, minLevel: 5 },
    },
    {
      id: 'peacekeepers',
      name: 'Peacekeepers Union',
      members: 28,
      power: 35000,
      level: 4,
      description: 'Defensive alliance promoting mutual protection and resource sharing.',
      requirements: { minPower: 1000, minLevel: 3 },
    },
    {
      id: 'merchants',
      name: 'Merchant Guild',
      members: 42,
      power: 28000,
      level: 2,
      description: 'Trade-focused alliance specializing in economic growth and resource trading.',
      requirements: { minPower: 500, minLevel: 2 },
    },
    {
      id: 'warriors',
      name: 'Iron Warriors',
      members: 22,
      power: 45000,
      level: 5,
      description: 'Military alliance of seasoned warriors seeking glorious battles.',
      requirements: { minPower: 3000, minLevel: 7 },
    },
  ];

  const handleJoinAlliance = (allianceId: string) => {
    const selectedAllianceData = availableAlliances.find(a => a.id === allianceId);
    if (!selectedAllianceData) return;

    // Simulate joining alliance
    addNotification({
      type: 'success',
      message: `Alliance request sent to ${selectedAllianceData.name}! You will be notified when accepted.`,
      duration: 6000,
    });
  };

  const handleLeaveAlliance = () => {
    addNotification({
      type: 'warning',
      message: 'You have left your alliance. You can join a new one anytime.',
      duration: 5000,
    });
  };

  const getAllianceIcon = (allianceId: string): string => {
    const icons: Record<string, string> = {
      dragons: '🐉',
      peacekeepers: '🕊️',
      merchants: '💰',
      warriors: '⚔️',
    };
    return icons[allianceId] || '🤝';
  };

  const getAllianceColor = (allianceId: string): string => {
    const colors: Record<string, string> = {
      dragons: 'border-red-300 bg-red-50',
      peacekeepers: 'border-blue-300 bg-blue-50',
      merchants: 'border-yellow-300 bg-yellow-50',
      warriors: 'border-gray-300 bg-gray-50',
    };
    return colors[allianceId] || 'border-gray-300 bg-gray-50';
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-slate-800 mb-6 font-fantasy">Alliances</h3>

        {/* Current Alliance Status */}
        <div className="card p-6 mb-6">
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2">🤝</span>
            Your Alliance Status
          </h4>

          {!alliance ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🏴</div>
              <p className="text-lg font-medium">No Alliance</p>
              <p className="text-sm">Join an alliance for mutual protection and benefits!</p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <h5 className="font-bold text-green-800">{alliance.name}</h5>
                    <p className="text-green-600">Level {alliance.level} Alliance</p>
                    <p className="text-sm text-green-500">
                      {alliance.members?.length || 0} members
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLeaveAlliance}
                  className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                >
                  Leave Alliance
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Available Alliances */}
        {!alliance && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏰</span>
              Available Alliances
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAlliances.map(allianceData => (
                <div
                  key={allianceData.id}
                  className={`alliance-card border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getAllianceColor(allianceData.id)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getAllianceIcon(allianceData.id)}</span>
                      <div>
                        <h5 className="font-bold text-gray-800">{allianceData.name}</h5>
                        <div className="text-sm text-gray-500">Level {allianceData.level}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{allianceData.description}</p>

                  {/* Alliance Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>{allianceData.members} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⚡</span>
                      <span>{formatNumber(allianceData.power)} power</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-3 p-2 bg-white bg-opacity-50 rounded">
                    <div className="text-xs text-gray-600 mb-1">Requirements:</div>
                    <div className="text-xs text-gray-700">
                      Min Power: {formatNumber(allianceData.requirements.minPower)} | Min Level:{' '}
                      {allianceData.requirements.minLevel}
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinAlliance(allianceData.id)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    Request to Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alliance Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Alliance Benefits
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="benefit-card text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold text-gray-700">Mutual Protection</div>
              <div className="text-sm text-gray-500 mt-1">
                Alliance members can help defend against attacks
              </div>
            </div>

            <div className="benefit-card text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🤝</div>
              <div className="font-semibold text-gray-700">Resource Sharing</div>
              <div className="text-sm text-gray-500 mt-1">
                Share resources with alliance members in need
              </div>
            </div>

            <div className="benefit-card text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">⚔️</div>
              <div className="font-semibold text-gray-700">Coordinated Attacks</div>
              <div className="text-sm text-gray-500 mt-1">
                Launch joint attacks against powerful enemies
              </div>
            </div>
          </div>
        </div>

        {/* Alliance Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Alliance Tips
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Choose an alliance that matches your playstyle and goals</li>
            <li>• Active alliances provide better support and coordination</li>
            <li>• Higher level alliances offer better bonuses and protection</li>
            <li>• Contribute to your alliance through participation and resources</li>
            <li>• Alliance membership can be changed, but choose wisely</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlliancesTab;
