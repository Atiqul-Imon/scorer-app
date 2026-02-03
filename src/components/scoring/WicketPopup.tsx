'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

export type DismissalType =
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt'
  | 'retired_out'
  | 'handled_ball'
  | 'obstructing_field'
  | 'timed_out';

interface Player {
  id: string;
  name: string;
}

interface WicketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    dismissalType: DismissalType;
    fielderId?: string;
    incomingBatterId: string;
  }) => void;
  dismissedBatterId: string;
  dismissedBatterName: string;
  availablePlayers: Player[];
  availableFielders: Player[];
}

const dismissalTypes: Array<{ value: DismissalType; label: string; requiresFielder: boolean }> = [
  { value: 'bowled', label: 'Bowled', requiresFielder: false },
  { value: 'caught', label: 'Caught', requiresFielder: true },
  { value: 'lbw', label: 'LBW', requiresFielder: false },
  { value: 'run_out', label: 'Run Out', requiresFielder: true },
  { value: 'stumped', label: 'Stumped', requiresFielder: true },
  { value: 'hit_wicket', label: 'Hit Wicket', requiresFielder: false },
  { value: 'retired_hurt', label: 'Retired Hurt', requiresFielder: false },
  { value: 'retired_out', label: 'Retired Out', requiresFielder: false },
  { value: 'handled_ball', label: 'Handled Ball', requiresFielder: false },
  { value: 'obstructing_field', label: 'Obstructing Field', requiresFielder: false },
  { value: 'timed_out', label: 'Timed Out', requiresFielder: false },
];

export default function WicketPopup({
  isOpen,
  onClose,
  onConfirm,
  dismissedBatterId,
  dismissedBatterName,
  availablePlayers,
  availableFielders,
}: WicketPopupProps) {
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled');
  const [fielderId, setFielderId] = useState<string>('');
  const [incomingBatterId, setIncomingBatterId] = useState<string>('');

  if (!isOpen) return null;

  const selectedDismissal = dismissalTypes.find((d) => d.value === dismissalType);
  const requiresFielder = selectedDismissal?.requiresFielder || false;

  const handleConfirm = () => {
    if (!incomingBatterId) {
      return; // Cannot proceed without incoming batter
    }
    if (requiresFielder && !fielderId) {
      return; // Cannot proceed without fielder if required
    }
    onConfirm({
      dismissalType,
      fielderId: requiresFielder ? fielderId : undefined,
      incomingBatterId,
    });
    // Reset form
    setDismissalType('bowled');
    setFielderId('');
    setIncomingBatterId('');
  };

  const remainingPlayers = availablePlayers.filter((p) => p.id !== dismissedBatterId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">Wicket - {dismissedBatterName}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg touch-target text-gray-300 hover:text-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Dismissal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Dismissal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {dismissalTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={dismissalType === type.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDismissalType(type.value)}
                    className="text-xs sm:text-sm"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Fielder (if required) */}
            {requiresFielder && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Fielder</label>
                <select
                  value={fielderId}
                  onChange={(e) => setFielderId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                >
                  <option value="" className="bg-gray-800">Select fielder</option>
                  {availableFielders.map((player) => (
                    <option key={player.id} value={player.id} className="bg-gray-800">
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Incoming Batter */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Incoming Batter *</label>
              <select
                value={incomingBatterId}
                onChange={(e) => setIncomingBatterId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base text-gray-100"
                required
              >
                <option value="" className="bg-gray-800">Select incoming batter</option>
                {remainingPlayers.map((player) => (
                  <option key={player.id} value={player.id} className="bg-gray-800">
                    {player.name}
                  </option>
                ))}
              </select>
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
                onClick={handleConfirm}
                disabled={!incomingBatterId || (requiresFielder && !fielderId)}
              >
                Confirm Wicket
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}




