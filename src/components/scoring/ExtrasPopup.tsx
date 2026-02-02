'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { X } from 'lucide-react';

interface ExtrasPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (runs: number) => void;
  type: 'wide' | 'no_ball';
}

export default function ExtrasPopup({ isOpen, onClose, onConfirm, type }: ExtrasPopupProps) {
  const [selectedRuns, setSelectedRuns] = useState(0);

  const handleConfirm = () => {
    onConfirm(selectedRuns);
    setSelectedRuns(0);
  };

  const typeLabel = type === 'wide' ? 'Wide' : 'No Ball';
  const defaultRuns = 1; // Base run for wide/no-ball
  const totalRuns = defaultRuns + selectedRuns;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-sm">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{typeLabel} - Additional Runs?</h2>
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
              Did the {typeLabel.toLowerCase()} result in additional runs? (e.g., wide 4, no-ball 6)
            </p>

            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((runs) => (
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



