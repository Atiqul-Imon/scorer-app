'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { X, RefreshCw } from 'lucide-react';

interface BowlerChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBowlerId: string) => void;
  currentBowlerName: string;
  availableBowlers: Array<{ id: string; name: string }>;
  oversBowled: number;
}

export default function BowlerChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentBowlerName,
  availableBowlers,
  oversBowled,
}: BowlerChangeModalProps) {
  const [newBowlerId, setNewBowlerId] = useState<string>('');

  if (!isOpen) return null;

  const canChange = !!newBowlerId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Change Bowler
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
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{currentBowlerName}</span> has bowled{' '}
                <span className="font-semibold">{oversBowled.toFixed(1)}</span> overs.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select New Bowler</label>
              <select
                value={newBowlerId}
                onChange={(e) => setNewBowlerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              >
                <option value="">Select bowler</option>
                {availableBowlers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  onConfirm(newBowlerId);
                  setNewBowlerId('');
                }}
                disabled={!canChange}
              >
                Change Bowler
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

