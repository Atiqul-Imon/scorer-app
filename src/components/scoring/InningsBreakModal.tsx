'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { X, Trophy, TrendingUp } from 'lucide-react';
import { formatScore } from '@/lib/utils';

interface InningsBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSecondInnings: (openingBatter1Id: string, openingBatter2Id: string, firstBowlerId: string) => void;
  firstInningsScore: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  battingTeam: 'home' | 'away';
  availableBatters: Array<{ id: string; name: string }>;
  availableBowlers: Array<{ id: string; name: string }>;
  teamName: string;
}

export default function InningsBreakModal({
  isOpen,
  onClose,
  onStartSecondInnings,
  firstInningsScore,
  battingTeam,
  availableBatters,
  availableBowlers,
  teamName,
}: InningsBreakModalProps) {
  const [openingBatter1Id, setOpeningBatter1Id] = useState<string>('');
  const [openingBatter2Id, setOpeningBatter2Id] = useState<string>('');
  const [firstBowlerId, setFirstBowlerId] = useState<string>('');

  if (!isOpen) return null;

  const canStart = openingBatter1Id && openingBatter2Id && firstBowlerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Innings Break
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg touch-target text-gray-300 hover:text-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* First Innings Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">First Innings Summary</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-100">
                  {teamName}: {formatScore(firstInningsScore)}
                </p>
                <p className="text-xs text-gray-400">
                  {firstInningsScore.wickets} wickets • {firstInningsScore.overs}.{firstInningsScore.balls} overs
                </p>
              </div>
            </div>

            {/* Second Innings Setup */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-100">Setup Second Innings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opening Batter 1 (Striker)</label>
                <select
                  value={openingBatter1Id}
                  onChange={(e) => setOpeningBatter1Id(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select batter</option>
                  {availableBatters
                    .filter((p) => p.id !== openingBatter2Id)
                    .map((player) => (
                      <option key={player.id} value={player.id} className="bg-gray-800">
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opening Batter 2 (Non-Striker)</label>
                <select
                  value={openingBatter2Id}
                  onChange={(e) => setOpeningBatter2Id(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select batter</option>
                  {availableBatters
                    .filter((p) => p.id !== openingBatter1Id)
                    .map((player) => (
                      <option key={player.id} value={player.id} className="bg-gray-800">
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Bowler</label>
                <select
                  value={firstBowlerId}
                  onChange={(e) => setFirstBowlerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select bowler</option>
                  {availableBowlers.map((player) => (
                    <option key={player.id} value={player.id} className="bg-gray-800">
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  onStartSecondInnings(openingBatter1Id, openingBatter2Id, firstBowlerId);
                  // Reset form
                  setOpeningBatter1Id('');
                  setOpeningBatter2Id('');
                  setFirstBowlerId('');
                }}
                disabled={!canStart}
              >
                Start Second Innings
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}




