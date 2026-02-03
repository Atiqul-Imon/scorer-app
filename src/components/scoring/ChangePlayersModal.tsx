'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { X } from 'lucide-react';

interface Player {
  id: string;
  name: string;
}

interface ChangePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strikerId: string, nonStrikerId: string, bowlerId: string) => Promise<void>;
  availableBatters: Player[];
  availableBowlers: Player[];
  currentStrikerId?: string;
  currentNonStrikerId?: string;
  currentBowlerId?: string;
}

export default function ChangePlayersModal({
  isOpen,
  onClose,
  onSave,
  availableBatters,
  availableBowlers,
  currentStrikerId,
  currentNonStrikerId,
  currentBowlerId,
}: ChangePlayersModalProps) {
  const [strikerId, setStrikerId] = useState(currentStrikerId || '');
  const [nonStrikerId, setNonStrikerId] = useState(currentNonStrikerId || '');
  const [bowlerId, setBowlerId] = useState(currentBowlerId || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      alert('Please select all players');
      return;
    }

    if (strikerId === nonStrikerId) {
      alert('Striker and non-striker must be different');
      return;
    }

    setSaving(true);
    try {
      await onSave(strikerId, nonStrikerId, bowlerId);
      onClose();
    } catch (error) {
      console.error('Error changing players:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">Change Current Players</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg touch-target text-gray-300 hover:text-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Striker</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Non-Striker</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bowler</label>
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

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Change Players'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


