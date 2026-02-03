'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { X, Trophy } from 'lucide-react';

interface EditMatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tossWinner: 'home' | 'away', tossDecision: 'bat' | 'bowl') => Promise<void>;
  homeTeamName: string;
  awayTeamName: string;
  currentTossWinner?: 'home' | 'away';
  currentTossDecision?: 'bat' | 'bowl';
}

export default function EditMatchSetupModal({
  isOpen,
  onClose,
  onSave,
  homeTeamName,
  awayTeamName,
  currentTossWinner,
  currentTossDecision,
}: EditMatchSetupModalProps) {
  const [tossWinner, setTossWinner] = useState<'home' | 'away' | undefined>(currentTossWinner);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | undefined>(currentTossDecision);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTossWinner(currentTossWinner);
      setTossDecision(currentTossDecision);
    }
  }, [isOpen, currentTossWinner, currentTossDecision]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!tossWinner || !tossDecision) {
      alert('Please select toss winner and decision');
      return;
    }

    setSaving(true);
    try {
      await onSave(tossWinner, tossDecision);
      onClose();
    } catch (error) {
      console.error('Error saving toss:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Edit Toss Result
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg touch-target"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTossWinner('home')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tossWinner === 'home'
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{homeTeamName}</p>
                </button>
                <button
                  onClick={() => setTossWinner('away')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tossWinner === 'away'
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">{awayTeamName}</p>
                </button>
              </div>
            </div>

            {tossWinner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTossDecision('bat')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tossDecision === 'bat'
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Bat</p>
                  </button>
                  <button
                    onClick={() => setTossDecision('bowl')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tossDecision === 'bowl'
                        ? 'border-primary-600 bg-primary-50 text-primary-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">Bowl</p>
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Toss'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


