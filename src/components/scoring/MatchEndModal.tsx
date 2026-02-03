'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X, Trophy, Award, Lock } from 'lucide-react';
import { formatScore } from '@/lib/utils';

interface MatchEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    winner: 'home' | 'away' | 'tie' | 'no_result';
    margin: string;
    keyPerformers: Array<{ playerId: string; playerName: string; role: string; performance: string }>;
    notes: string;
  }) => void;
  homeScore: { runs: number; wickets: number; overs: number; balls: number };
  awayScore: { runs: number; wickets: number; overs: number; balls: number };
  homeTeamName: string;
  awayTeamName: string;
  availablePlayers: Array<{ id: string; name: string }>;
}

export default function MatchEndModal({
  isOpen,
  onClose,
  onComplete,
  homeScore,
  awayScore,
  homeTeamName,
  awayTeamName,
  availablePlayers,
}: MatchEndModalProps) {
  const [winner, setWinner] = useState<'home' | 'away' | 'tie' | 'no_result'>('home');
  const [margin, setMargin] = useState('');
  const [keyPerformers, setKeyPerformers] = useState<Array<{ playerId: string; playerName: string; role: string; performance: string }>>([]);
  const [notes, setNotes] = useState('');
  const [addingPerformer, setAddingPerformer] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ playerId: '', role: '', performance: '' });

  if (!isOpen) return null;

  const handleAddPerformer = () => {
    if (!newPerformer.playerId || !newPerformer.role || !newPerformer.performance) return;

    const player = availablePlayers.find((p) => p.id === newPerformer.playerId);
    if (player) {
      setKeyPerformers([...keyPerformers, { ...newPerformer, playerName: player.name }]);
      setNewPerformer({ playerId: '', role: '', performance: '' });
      setAddingPerformer(false);
    }
  };

  const handleRemovePerformer = (index: number) => {
    setKeyPerformers(keyPerformers.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    onComplete({
      winner,
      margin,
      keyPerformers,
      notes,
    });
    // Reset form
    setWinner('home');
    setMargin('');
    setKeyPerformers([]);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Match Complete
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
            {/* Final Scores */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">{homeTeamName}</p>
                <p className="text-lg font-bold text-gray-100">{formatScore(homeScore)}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">{awayTeamName}</p>
                <p className="text-lg font-bold text-gray-100">{formatScore(awayScore)}</p>
              </div>
            </div>

            {/* Winner */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Match Result</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setWinner('home')}
                  className={`p-3 rounded-lg border-2 transition-all touch-target ${
                    winner === 'home'
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-semibold text-sm">{homeTeamName}</p>
                </button>
                <button
                  onClick={() => setWinner('away')}
                  className={`p-3 rounded-lg border-2 transition-all touch-target ${
                    winner === 'away'
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-semibold text-sm">{awayTeamName}</p>
                </button>
                <button
                  onClick={() => setWinner('tie')}
                  className={`p-3 rounded-lg border-2 transition-all touch-target ${
                    winner === 'tie'
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-semibold text-sm">Tie</p>
                </button>
                <button
                  onClick={() => setWinner('no_result')}
                  className={`p-3 rounded-lg border-2 transition-all touch-target ${
                    winner === 'no_result'
                      ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <p className="font-semibold text-sm">No Result</p>
                </button>
              </div>
            </div>

            {/* Margin */}
            {winner !== 'tie' && winner !== 'no_result' && (
              <div>
                <Input
                  label="Winning Margin (e.g., 'by 5 wickets', 'by 20 runs')"
                  type="text"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  placeholder="e.g., by 5 wickets"
                />
              </div>
            )}

            {/* Key Performers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Key Performers (Optional)</label>
                {!addingPerformer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingPerformer(true)}
                  >
                    Add
                  </Button>
                )}
              </div>

              {addingPerformer && (
                <div className="space-y-2 p-3 bg-gray-800 rounded-lg mb-2 border border-gray-700">
                  <select
                    value={newPerformer.playerId}
                    onChange={(e) => setNewPerformer({ ...newPerformer, playerId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-gray-100"
                  >
                    <option value="" className="bg-gray-900">Select player</option>
                    {availablePlayers.map((player) => (
                      <option key={player.id} value={player.id} className="bg-gray-900">
                        {player.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="text"
                    placeholder="Role (e.g., Best Batter)"
                    value={newPerformer.role}
                    onChange={(e) => setNewPerformer({ ...newPerformer, role: e.target.value })}
                  />
                  <Input
                    type="text"
                    placeholder="Performance (e.g., 85 runs)"
                    value={newPerformer.performance}
                    onChange={(e) => setNewPerformer({ ...newPerformer, performance: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleAddPerformer}>
                      Add
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAddingPerformer(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {keyPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg mb-2 border border-gray-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-100">{performer.playerName}</p>
                    <p className="text-xs text-gray-400">{performer.role} - {performer.performance}</p>
                  </div>
                  <button
                    onClick={() => handleRemovePerformer(index)}
                    className="p-1 text-red-400 hover:bg-red-900/30 rounded touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Match Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about the match..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm text-gray-100 placeholder-gray-500"
                rows={3}
              />
            </div>

            {/* Warning */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-yellow-400 mt-0.5" />
                <p className="text-xs text-yellow-300">
                  Once you complete the match, it will be locked and cannot be edited.
                </p>
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
                onClick={handleComplete}
                disabled={winner !== 'tie' && winner !== 'no_result' && !margin}
              >
                Complete Match
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}




