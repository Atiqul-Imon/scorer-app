'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LiveScoringInterface from '@/components/scoring/LiveScoringInterface';
import WicketPopup, { DismissalType } from '@/components/scoring/WicketPopup';
import type { CricketMatch } from '@/types';
import { formatScore } from '@/lib/utils';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

interface BallAction {
  id: string;
  innings: number;
  over: number;
  ball: number;
  runs: number;
  ballType: string;
  isWicket: boolean;
  dismissalType?: DismissalType;
  timestamp: Date;
}

export default function LiveScoringPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [ballHistory, setBallHistory] = useState<BallAction[]>([]);
  const [showWicketPopup, setShowWicketPopup] = useState(false);
  const [pendingWicket, setPendingWicket] = useState<{ runs: number; ballType: string } | null>(null);

  const { isOnline, queueLength, addToQueue, syncQueue } = useOfflineQueue(matchId);

  // Match state
  const [currentInnings, setCurrentInnings] = useState(1);
  const [battingTeam, setBattingTeam] = useState<'home' | 'away'>('home');
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [bowlerId, setBowlerId] = useState<string>('');
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && matchId) {
      loadMatch();
    }
  }, [isAuthenticated, authLoading, matchId, router]);

  // Sync offline queue when coming online
  useEffect(() => {
    if (isOnline && queueLength > 0) {
      syncQueue(async (action) => {
        if (action.type === 'recordBall') {
          await api.recordBall(matchId, action.data);
        } else if (action.type === 'undoBall') {
          await api.undoLastBall(matchId);
        }
      });
    }
  }, [isOnline, queueLength, matchId, syncQueue]);

  // Update sync status based on online/offline
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
    } else if (queueLength > 0) {
      setSyncStatus('syncing');
    } else {
      setSyncStatus('synced');
    }
  }, [isOnline, queueLength]);

  const loadMatch = async () => {
    try {
      const response = await api.getMatch(matchId);
      const matchData = response.data;
      setMatch(matchData);

      // Initialize match state from match data
      // @ts-ignore - liveState may not be in type yet
      if (matchData.liveState) {
        // @ts-ignore
        setCurrentInnings(matchData.liveState.currentInnings || 1);
        // @ts-ignore
        setBattingTeam(matchData.liveState.battingTeam || 'home');
        // @ts-ignore
        setStrikerId(matchData.liveState.strikerId || '');
        // @ts-ignore
        setNonStrikerId(matchData.liveState.nonStrikerId || '');
        // @ts-ignore
        setBowlerId(matchData.liveState.bowlerId || '');
        // @ts-ignore
        setCurrentOver(matchData.liveState.currentOver || 0);
        // @ts-ignore
        setCurrentBall(matchData.liveState.currentBall || 0);
      }

      // Check if setup is complete
      // @ts-ignore
      if (!matchData.matchSetup?.isSetupComplete) {
        router.push(`/matches/${matchId}/setup`);
        return;
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const recordBall = useCallback(
    async (runs: number, ballType: string, isWicket: boolean = false) => {
      if (!match) return;

      // If wicket, show popup first
      if (isWicket) {
        setPendingWicket({ runs, ballType });
        setShowWicketPopup(true);
        return;
      }

      // Record the ball
      const newBall: BallAction = {
        id: `ball-${Date.now()}`,
        innings: currentInnings,
        over: currentOver,
        ball: currentBall,
        runs,
        ballType,
        isWicket: false,
        timestamp: new Date(),
      };

      // Update local state immediately (optimistic update)
      setBallHistory((prev) => [...prev, newBall]);

      // Update over and ball
      let nextOver = currentOver;
      let nextBall = currentBall + 1;

      // Handle extras - wides and no-balls don't count as legal deliveries
      let newStrikerId = strikerId;
      let newNonStrikerId = nonStrikerId;

      if (ballType === 'wide' || ballType === 'no_ball') {
        // Don't increment ball count, but increment runs
        // Ball count stays same for next delivery
      } else {
        // Normal delivery - increment ball
        if (nextBall >= 6) {
          nextOver += 1;
          nextBall = 0;
          // Swap strike at end of over
          [newStrikerId, newNonStrikerId] = [nonStrikerId, strikerId];
        }
      }

      // Handle strike rotation for runs
      if (runs % 2 === 1 && ballType !== 'wide' && ballType !== 'no_ball') {
        // Odd runs - swap strike
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
      }

      setCurrentOver(nextOver);
      setCurrentBall(nextBall);
      setStrikerId(newStrikerId);
      setNonStrikerId(newNonStrikerId);

      // Sync to backend
      try {
        setSyncStatus('syncing');
        const ballData = {
          matchId,
          innings: currentInnings,
          battingTeam,
          over: currentOver,
          ball: currentBall,
          strikerId,
          nonStrikerId,
          bowlerId,
          delivery: {
            runs,
            ballType,
            isWicket: false,
          },
          timestamp: new Date().toISOString(),
        };

        if (isOnline) {
          await api.recordBall(matchId, ballData);
          setSyncStatus('synced');
          success('Ball recorded');
        } else {
          // Save to offline queue
          await addToQueue({
            type: 'recordBall',
            matchId,
            data: ballData,
          });
          setSyncStatus('offline');
          success('Ball saved offline');
        }
      } catch (error) {
        setSyncStatus('error');
        // Try to save offline
        try {
          await addToQueue({
            type: 'recordBall',
            matchId,
            data: {
              matchId,
              innings: currentInnings,
              battingTeam,
              over: currentOver,
              ball: currentBall,
              strikerId,
              nonStrikerId,
              bowlerId,
              delivery: { runs, ballType, isWicket: false },
              timestamp: new Date().toISOString(),
            },
          });
          setSyncStatus('offline');
          success('Ball saved offline');
        } catch (offlineError) {
          showError('Failed to save ball');
        }
      }
    },
    [match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, success, showError]
  );

  const handleWicketConfirm = useCallback(
    async (data: { dismissalType: DismissalType; fielderId?: string; incomingBatterId: string }) => {
      if (!pendingWicket || !match) return;

      const newBall: BallAction = {
        id: `ball-${Date.now()}`,
        innings: currentInnings,
        over: currentOver,
        ball: currentBall,
        runs: pendingWicket.runs,
        ballType: pendingWicket.ballType,
        isWicket: true,
        dismissalType: data.dismissalType,
        timestamp: new Date(),
      };

      setBallHistory((prev) => [...prev, newBall]);
      setStrikerId(data.incomingBatterId);
      setShowWicketPopup(false);
      setPendingWicket(null);

      // Increment ball and wickets
      let nextOver = currentOver;
      let nextBall = currentBall + 1;
      if (nextBall >= 6) {
        nextOver += 1;
        nextBall = 0;
      }
      setCurrentOver(nextOver);
      setCurrentBall(nextBall);

      // Sync to backend
      try {
        const ballData = {
          matchId,
          innings: currentInnings,
          battingTeam,
          over: currentOver,
          ball: currentBall,
          strikerId,
          nonStrikerId,
          bowlerId,
          delivery: {
            runs: pendingWicket.runs,
            ballType: pendingWicket.ballType,
            isWicket: true,
            dismissalType: data.dismissalType,
            dismissedBatterId: strikerId,
            fielderId: data.fielderId,
            incomingBatterId: data.incomingBatterId,
          },
          timestamp: new Date().toISOString(),
        };

        if (isOnline) {
          await api.recordBall(matchId, ballData);
          success('Wicket recorded');
        } else {
          await addToQueue({
            type: 'recordBall',
            matchId,
            data: ballData,
          });
          success('Wicket saved offline');
        }
      } catch (error) {
        showError('Failed to record wicket');
      }
    },
    [pendingWicket, match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, bowlerId, battingTeam, matchId, isOnline, addToQueue, success, showError]
  );

  const handleUndo = useCallback(async () => {
    if (ballHistory.length === 0) return;

    const lastBall = ballHistory[ballHistory.length - 1];
    setBallHistory((prev) => prev.slice(0, -1));

    // Revert over and ball
    if (lastBall.ball === 0) {
      setCurrentOver(Math.max(0, currentOver - 1));
      setCurrentBall(5);
    } else {
      setCurrentBall(Math.max(0, lastBall.ball - 1));
    }

    // Sync undo to backend
    try {
      if (isOnline) {
        await api.undoLastBall(matchId);
        success('Last ball undone');
      } else {
        await addToQueue({
          type: 'undoBall',
          matchId,
          data: {},
        });
        success('Undo saved offline');
      }
    } catch (error) {
      showError('Failed to undo ball');
    }
  }, [ballHistory, currentOver, matchId, isOnline, addToQueue, success, showError]);

  if (authLoading || loading) {
    return (
      <AppLayout title="Live Scoring" showBack>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading match...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!match) {
    return (
      <AppLayout title="Live Scoring" showBack>
        <Card className="p-8 text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">Match not found</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </AppLayout>
    );
  }

  // Get available players from match setup
  // @ts-ignore
  const availablePlayers = match?.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI'] || [];
  // @ts-ignore
  const availableFielders = match?.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI'] || [];

  return (
    <AppLayout title="Live Scoring" showBack>
      <div className="space-y-4 pb-4">
        {/* Match Info */}
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{match.series}</p>
            <p className="text-lg font-bold text-gray-900">
              {match.teams.home.name} vs {match.teams.away.name}
            </p>
            <Badge variant="success" className="mt-2">
              Innings {currentInnings}
            </Badge>
          </div>
        </Card>

        {/* Current Score */}
        {match.currentScore && (
          <Card className="p-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">Current Score</p>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-xs text-gray-600">{match.teams[battingTeam].shortName}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatScore(match.currentScore[battingTeam])}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Live Scoring Interface */}
        <LiveScoringInterface
          matchId={matchId}
          battingTeam={battingTeam}
          strikerId={strikerId}
          nonStrikerId={nonStrikerId}
          bowlerId={bowlerId}
          currentOver={currentOver}
          currentBall={currentBall}
          onBallRecorded={recordBall}
          onUndo={handleUndo}
          syncStatus={syncStatus}
        />

        {/* Wicket Popup */}
        {showWicketPopup && pendingWicket && (
          <WicketPopup
            isOpen={showWicketPopup}
            onClose={() => {
              setShowWicketPopup(false);
              setPendingWicket(null);
            }}
            onConfirm={handleWicketConfirm}
            dismissedBatterId={strikerId}
            dismissedBatterName={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI']?.find(
                (p: any) => p.id === strikerId
              )?.name || 'Batter'
            }
            availablePlayers={availablePlayers}
            availableFielders={availableFielders}
          />
        )}
      </div>
    </AppLayout>
  );
}

