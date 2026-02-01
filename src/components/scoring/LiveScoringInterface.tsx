'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveScoringInterfaceProps {
  matchId: string;
  battingTeam: 'home' | 'away';
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  currentOver: number;
  currentBall: number;
  onBallRecorded: (runs: number, ballType: string, isWicket?: boolean) => void;
  onUndo: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
}

export default function LiveScoringInterface({
  matchId,
  battingTeam,
  strikerId,
  nonStrikerId,
  bowlerId,
  currentOver,
  currentBall,
  onBallRecorded,
  onUndo,
  syncStatus,
}: LiveScoringInterfaceProps) {
  const { success } = useToast();
  const [recording, setRecording] = useState(false);

  const handleRun = (runs: number) => {
    if (recording) return;
    setRecording(true);
    onBallRecorded(runs, 'normal', false);
    setTimeout(() => setRecording(false), 300);
  };

  const handleExtra = (type: 'wide' | 'no_ball' | 'bye' | 'leg_bye') => {
    if (recording) return;
    setRecording(true);
    // For bye and leg_bye, record immediately (they count as legal deliveries)
    // For wide and no-ball, popup will ask for additional runs
    onBallRecorded(1, type, false);
    setTimeout(() => setRecording(false), 300);
  };

  const handleWicket = () => {
    if (recording) return;
    // Wicket will trigger a popup, but we record 0 runs
    onBallRecorded(0, 'normal', true);
  };

  const syncStatusConfig = {
    synced: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-50', label: 'Synced' },
    syncing: { icon: Wifi, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Syncing...' },
    offline: { icon: WifiOff, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Offline' },
    error: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-50', label: 'Sync Error' },
  };

  const status = syncStatusConfig[syncStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium', status.bg, status.color)}>
        <StatusIcon className="w-4 h-4" />
        <span>{status.label}</span>
      </div>

      {/* Over Display */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Current Over</p>
          <p className="text-3xl font-bold text-gray-900">
            {currentOver}.{currentBall}
          </p>
        </div>
      </Card>

      {/* Run Buttons - Large, Color-Coded */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
          <Button
            key={runs}
            variant="primary"
            size="lg"
            onClick={() => handleRun(runs)}
            disabled={recording}
            className={cn(
              'h-16 sm:h-20 text-2xl sm:text-3xl font-bold touch-target',
              runs === 0 && 'bg-gray-600 hover:bg-gray-700',
              runs === 1 && 'bg-blue-600 hover:bg-blue-700',
              runs === 2 && 'bg-green-600 hover:bg-green-700',
              runs === 3 && 'bg-yellow-600 hover:bg-yellow-700',
              runs === 4 && 'bg-orange-600 hover:bg-orange-700',
              runs === 5 && 'bg-purple-600 hover:bg-purple-700',
              runs === 6 && 'bg-red-600 hover:bg-red-700',
            )}
          >
            {runs}
          </Button>
        ))}
      </div>

      {/* Extras and Wicket */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('wide')}
          disabled={recording}
          className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100 touch-target"
        >
          Wide
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('no_ball')}
          disabled={recording}
          className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-red-50 border-red-300 text-red-900 hover:bg-red-100 touch-target"
        >
          No Ball
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('bye')}
          disabled={recording}
          className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100 touch-target"
        >
          Bye
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('leg_bye')}
          disabled={recording}
          className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-indigo-50 border-indigo-300 text-indigo-900 hover:bg-indigo-100 touch-target"
        >
          Leg Bye
        </Button>
      </div>

      {/* Wicket Button - Prominent */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleWicket}
        disabled={recording}
        className="w-full h-16 sm:h-20 text-lg sm:text-xl font-bold bg-red-600 hover:bg-red-700 text-white touch-target"
      >
        WICKET
      </Button>

      {/* Undo Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onUndo}
        disabled={recording}
        className="w-full h-14 sm:h-16 flex items-center justify-center gap-2 touch-target"
      >
        <RotateCcw className="w-5 h-5" />
        <span className="font-semibold">Undo Last Ball</span>
      </Button>
    </div>
  );
}

