'use client';

import { memo, useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';

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
  syncStatus: 'synced' | 'syncing' | 'error';
}

function LiveScoringInterface({
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

  // Prevent rapid clicks with debouncing
  const handleRun = usePreventDoubleClick(
    useCallback((runs: number) => {
      if (recording) return;
      setRecording(true);
      onBallRecorded(runs, 'normal', false);
      setTimeout(() => setRecording(false), 300);
    }, [recording, onBallRecorded]),
    400 // 400ms minimum between clicks
  );

  const handleExtra = usePreventDoubleClick(
    useCallback((type: 'wide' | 'no_ball' | 'bye' | 'leg_bye') => {
      if (recording) return;
      setRecording(true);
      // For bye and leg_bye, we need to allow scorer to specify runs (1-6)
      // For wide and no-ball, popup will ask for additional runs
      // Pass a callback to allow the parent to show a popup for bye/leg_bye runs
      onBallRecorded(1, type, false);
      setTimeout(() => setRecording(false), 300);
    }, [recording, onBallRecorded]),
    400
  );

  const handleWicket = usePreventDoubleClick(
    useCallback(() => {
      if (recording) return;
      // Wicket will trigger a popup, but we record 0 runs
      onBallRecorded(0, 'normal', true);
    }, [recording, onBallRecorded]),
    500 // Longer delay for wicket (more critical action)
  );

  const syncStatusConfig = {
    synced: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-50', label: 'Synced' },
    syncing: { icon: Wifi, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Syncing...' },
    error: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-50', label: 'Error' },
  };

  const status = syncStatusConfig[syncStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Sync Status */}
      <div className={cn('flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 rounded-lg text-sm lg:text-base font-medium', status.bg, status.color)}>
        <StatusIcon className="w-4 h-4 lg:w-5 lg:h-5" />
        <span>{status.label}</span>
      </div>

      {/* Over Display */}
      <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
        <div className="text-center">
          <p className="text-xs lg:text-sm text-gray-300 mb-1 lg:mb-2">Current Over</p>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-100">
            {currentOver}.{currentBall}
          </p>
        </div>
      </Card>

      {/* Run Buttons - Responsive Grid */}
      <div className="grid grid-cols-4 lg:grid-cols-4 gap-3 lg:gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map((runs) => (
          <Button
            key={runs}
            variant="primary"
            size="lg"
            onClick={() => handleRun(runs)}
            disabled={recording}
            className={cn(
              'h-16 sm:h-20 lg:h-24 xl:h-28 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold touch-target transition-all hover:scale-105 active:scale-95',
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
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('wide')}
          disabled={recording}
          className="h-14 sm:h-16 lg:h-18 xl:h-20 text-base sm:text-lg lg:text-xl font-semibold bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 touch-target transition-all hover:scale-105 active:scale-95"
        >
          Wide
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('no_ball')}
          disabled={recording}
          className="h-14 sm:h-16 lg:h-18 xl:h-20 text-base sm:text-lg lg:text-xl font-semibold bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 touch-target transition-all hover:scale-105 active:scale-95"
        >
          No Ball
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('bye')}
          disabled={recording}
          className="h-14 sm:h-16 lg:h-18 xl:h-20 text-base sm:text-lg lg:text-xl font-semibold bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 touch-target transition-all hover:scale-105 active:scale-95"
        >
          Bye
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleExtra('leg_bye')}
          disabled={recording}
          className="h-14 sm:h-16 lg:h-18 xl:h-20 text-base sm:text-lg lg:text-xl font-semibold bg-indigo-500/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/30 touch-target transition-all hover:scale-105 active:scale-95"
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
        className="w-full h-16 sm:h-20 lg:h-24 xl:h-28 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-red-600 hover:bg-red-700 text-white touch-target transition-all hover:scale-105 active:scale-95"
      >
        WICKET
      </Button>

      {/* Undo Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onUndo}
        disabled={recording}
        className="w-full h-14 sm:h-16 lg:h-18 xl:h-20 flex items-center justify-center gap-2 text-base sm:text-lg lg:text-xl font-semibold touch-target transition-all hover:scale-105 active:scale-95"
      >
        <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
        <span>Undo Last Ball</span>
      </Button>
    </div>
  );
}

export default memo(LiveScoringInterface);

