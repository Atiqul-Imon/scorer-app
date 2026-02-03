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
  // Store the total runs selected by user (1-5 for wide/no-ball, 1-6 for bye/leg_bye)
  const [selectedTotalRuns, setSelectedTotalRuns] = useState(1);

  const handleConfirm = () => {
    // For wide/no-ball: convert total runs to additional runs (total - 1 base run)
    // For bye/leg_bye: total runs is what we pass directly
    const additionalRuns = (type === 'wide' || type === 'no_ball') 
      ? selectedTotalRuns - 1 
      : selectedTotalRuns;
    onConfirm(additionalRuns);
    setSelectedTotalRuns(1); // Reset to 1 for next time
  };

  const typeLabel = type === 'wide' ? 'Wide' : type === 'no_ball' ? 'No Ball' : type === 'bye' ? 'Bye' : 'Leg Bye';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 safe-area">
      <Card className="w-full max-w-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              {typeLabel} - Select Runs
            </h2>
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
              {type === 'wide' || type === 'no_ball' 
                ? `How many total runs from the ${typeLabel.toLowerCase()}? (e.g., wide 1, wide 4, no-ball 6)`
                : `How many runs from the ${typeLabel.toLowerCase()}? (1-6 runs)`}
            </p>

            <div className={`grid gap-2 ${(type === 'wide' || type === 'no_ball') ? 'grid-cols-5' : 'grid-cols-6'}`}>
              {((type === 'wide' || type === 'no_ball') 
                ? [1, 2, 3, 4, 5] 
                : [1, 2, 3, 4, 5, 6]).map((totalRuns) => (
                <Button
                  key={totalRuns}
                  variant={selectedTotalRuns === totalRuns ? 'primary' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedTotalRuns(totalRuns)}
                  className="h-12 text-lg font-bold touch-target"
                >
                  {totalRuns}
                </Button>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" size="lg" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
                Confirm ({selectedTotalRuns} {selectedTotalRuns === 1 ? 'run' : 'runs'})
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}



