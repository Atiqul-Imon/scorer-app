'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ManualScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
  }) => Promise<void>;
  currentScore: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  availableBatters: Array<{ id: string; name: string }>;
  availableBowlers: Array<{ id: string; name: string }>;
  currentStrikerId?: string;
  currentNonStrikerId?: string;
  currentBowlerId?: string;
}

export default function ManualScoreModal({
  isOpen,
  onClose,
  onSave,
  currentScore,
  availableBatters,
  availableBowlers,
  currentStrikerId,
  currentNonStrikerId,
  currentBowlerId,
}: ManualScoreModalProps) {
  const [runs, setRuns] = useState(currentScore.runs.toString());
  const [wickets, setWickets] = useState(currentScore.wickets.toString());
  const [overs, setOvers] = useState(currentScore.overs.toString());
  const [balls, setBalls] = useState(currentScore.balls.toString());
  const [strikerId, setStrikerId] = useState(currentStrikerId || '');
  const [nonStrikerId, setNonStrikerId] = useState(currentNonStrikerId || '');
  const [bowlerId, setBowlerId] = useState(currentBowlerId || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRuns(currentScore.runs.toString());
      setWickets(currentScore.wickets.toString());
      setOvers(currentScore.overs.toString());
      setBalls(currentScore.balls.toString());
      setStrikerId(currentStrikerId || '');
      setNonStrikerId(currentNonStrikerId || '');
      setBowlerId(currentBowlerId || '');
    }
  }, [isOpen, currentScore, currentStrikerId, currentNonStrikerId, currentBowlerId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const runsNum = parseInt(runs) || 0;
    const wicketsNum = parseInt(wickets) || 0;
    const oversNum = parseFloat(overs) || 0;
    const ballsNum = parseInt(balls) || 0;

    if (runsNum < 0) {
      alert('Runs cannot be negative');
      return;
    }
    if (wicketsNum < 0 || wicketsNum > 10) {
      alert('Wickets must be between 0 and 10');
      return;
    }
    if (oversNum < 0) {
      alert('Overs cannot be negative');
      return;
    }
    if (ballsNum < 0 || ballsNum > 5) {
      alert('Balls must be between 0 and 5');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        runs: runsNum,
        wickets: wicketsNum,
        overs: oversNum,
        balls: ballsNum,
        strikerId: strikerId || undefined,
        nonStrikerId: nonStrikerId || undefined,
        bowlerId: bowlerId || undefined,
      });
      onClose();
    } catch (error) {
      logger.error('Error saving manual score:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">Manual Score Entry</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg touch-target text-gray-300 hover:text-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Use this to jump to a specific score/over (e.g., if you started scoring late)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Runs</label>
                <Input
                  type="number"
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  min="0"
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Wickets</label>
                <Input
                  type="number"
                  value={wickets}
                  onChange={(e) => setWickets(e.target.value)}
                  min="0"
                  max="10"
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Overs</label>
                <Input
                  type="number"
                  value={overs}
                  onChange={(e) => setOvers(e.target.value)}
                  min="0"
                  step="0.1"
                  className="text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Balls</label>
                <Input
                  type="number"
                  value={balls}
                  onChange={(e) => setBalls(e.target.value)}
                  min="0"
                  max="5"
                  className="text-base"
                />
              </div>
            </div>

            {availableBatters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Striker</label>
                <select
                  value={strikerId}
                  onChange={(e) => setStrikerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select striker</option>
                  {availableBatters
                    .filter((p) => p.id !== nonStrikerId)
                    .map((player) => (
                      <option key={player.id} value={player.id} className="bg-gray-800">
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {availableBatters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Non-Striker</label>
                <select
                  value={nonStrikerId}
                  onChange={(e) => setNonStrikerId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select non-striker</option>
                  {availableBatters
                    .filter((p) => p.id !== strikerId)
                    .map((player) => (
                      <option key={player.id} value={player.id} className="bg-gray-800">
                        {player.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {availableBowlers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bowler</label>
                <select
                  value={bowlerId}
                  onChange={(e) => setBowlerId(e.target.value)}
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
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Score'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


