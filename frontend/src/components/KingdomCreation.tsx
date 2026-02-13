import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

const KingdomCreation: React.FC = () => {
  const [kingdomName, setKingdomName] = useState('');
  const [kingdomFlag, setKingdomFlag] = useState<string | null>(null);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const createKingdom = useGameStore((state) => state.createKingdom);
  const addNotification = useGameStore((state) => state.addNotification);
  const isKingdomCreated = useGameStore((state) => state.isKingdomCreated);

  const handleFlagUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setKingdomFlag(result);
        setFlagPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateKingdom = () => {
    const newErrors: { name?: string } = {};

    if (!kingdomName.trim()) {
      newErrors.name = 'Kingdom name is required';
    } else if (kingdomName.trim().length < 3) {
      newErrors.name = 'Kingdom name must be at least 3 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createKingdom(kingdomName.trim(), kingdomFlag);
    addNotification({
      type: 'success',
      message: `Welcome to ${kingdomName.trim()}! Your kingdom has been established.`,
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCreateKingdom();
    }
  };

  if (isKingdomCreated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2 font-fantasy">
            Create Your Kingdom
          </h2>
          <p className="text-slate-600">
            Begin your journey to conquest and glory
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-2"
              htmlFor="kingdomNameInput"
            >
              Kingdom Name
            </label>
            <input
              type="text"
              id="kingdomNameInput"
              value={kingdomName}
              onChange={(e) => {
                setKingdomName(e.target.value);
                if (errors.name) {
                  const restErrors = { ...errors };
                  delete restErrors.name;
                  setErrors(restErrors);
                }
              }}
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Enter your kingdom name"
              maxLength={20}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-2"
              htmlFor="flagUpload"
            >
              Kingdom Flag (Optional)
            </label>
            <input
              type="file"
              id="flagUpload"
              onChange={handleFlagUpload}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              accept="image/*"
            />
            {flagPreview && (
              <div className="mt-4 flex justify-center">
                <div className="border-2 border-slate-300 rounded-lg p-2">
                  <img
                    src={flagPreview}
                    alt="Kingdom Flag Preview"
                    className="w-24 h-16 object-cover rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateKingdom}
            disabled={!kingdomName.trim()}
            className="btn btn-primary w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Create Kingdom
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Your kingdom will be the foundation of your empire</p>
        </div>
      </div>
    </div>
  );
};

export default KingdomCreation;
