'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { X } from 'lucide-react';

interface ExtrasPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (runs: number) => void;
  type: 'wide' | 'no_ball' | 'bye' | 'leg_bye';
}

export default function ExtrasPopup({ isOpen, onClose, onConfirm, type }: ExtrasPopupProps) {
  // For bye/leg_bye, default to 1 run. For wide/no-ball, default to 0 (base 1 run already counted)
  const [selectedRuns, setSelectedRuns] = useState((type === 'bye' || type === 'leg_bye') ? 1 : 0);

  const handleConfirm = () => {
    onConfirm(selectedRuns);
    setSelectedRuns(0);
  };

  const typeLabel = type === 'wide' ? 'Wide' : type === 'no_ball' ? 'No Ball' : type === 'bye' ? 'Bye' : 'Leg Bye';
  // For wide/no-ball: base 1 run + additional runs
  // For bye/leg_bye: just the runs (no base run)
  const defaultRuns = (type === 'wide' || type === 'no_ball') ? 1 : 0;
  const totalRuns = defaultRuns + selectedRuns;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {type === 'wide' || type === 'no_ball' 
                ? `${typeLabel} - Additional Runs?`
                : typeLabel}
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
            <p className="text-sm text-gray-600">
              {type === 'wide' || type === 'no_ball' 
                ? `Did the ${typeLabel.toLowerCase()} result in additional runs? (e.g., wide 4, no-ball 6)`
                : `How many runs from the ${typeLabel.toLowerCase()}? (1-6 runs)`}
            </p>

            <div className="grid grid-cols-6 gap-2">
              {(type === 'wide' || type === 'no_ball' 
                ? [0, 1, 2, 3, 4] 
                : [1, 2, 3, 4, 5, 6]).map((runs) => (
                <Button
                  key={runs}
                  variant={selectedRuns === runs ? 'primary' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedRuns(runs)}
                  className="h-12 text-lg font-bold touch-target"
                >
                  {runs}
                </Button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
                Confirm ({totalRuns} runs)
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}



