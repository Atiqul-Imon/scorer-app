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
import InningsBreakModal from '@/components/scoring/InningsBreakModal';
import MatchEndModal from '@/components/scoring/MatchEndModal';
import BowlerChangeModal from '@/components/scoring/BowlerChangeModal';
import ExtrasPopup from '@/components/scoring/ExtrasPopup';
import CurrentBattersCard from '@/components/scoring/CurrentBattersCard';
import CurrentBowlerCard from '@/components/scoring/CurrentBowlerCard';
import PartnershipCard from '@/components/scoring/PartnershipCard';
import RunRateCard from '@/components/scoring/RunRateCard';
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
  const [showInningsBreak, setShowInningsBreak] = useState(false);
  const [showMatchEnd, setShowMatchEnd] = useState(false);
  const [showBowlerChange, setShowBowlerChange] = useState(false);
  const [currentBowlerOvers, setCurrentBowlerOvers] = useState(0);
  const [showExtrasPopup, setShowExtrasPopup] = useState(false);
  const [pendingExtras, setPendingExtras] = useState<{ type: 'wide' | 'no_ball'; runs: number } | null>(null);
  const [freeHit, setFreeHit] = useState(false);

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

  const loadMatch = useCallback(async () => {
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
  }, [matchId, router, showError]);

  const recordBallInternal = useCallback(
    async (runs: number, ballType: string, isWicket: boolean = false, isFreeHit: boolean = false) => {
      if (!match) return;

      // Auto-detect boundaries
      const isBoundary = runs === 4;
      const isSix = runs === 6;

      // Record the ball
      const newBall: BallAction = {
        id: `ball-${Date.now()}`,
        innings: currentInnings,
        over: currentOver,
        ball: currentBall,
        runs,
        ballType,
        isWicket,
        timestamp: new Date(),
      };

      // Update local state immediately (optimistic update)
      setBallHistory((prev) => [...prev, newBall]);

      // Calculate next over and ball
      let nextOver = currentOver;
      let nextBall = currentBall;
      let newStrikerId = strikerId;
      let newNonStrikerId = nonStrikerId;

      // Handle extras - wides and no-balls don't count as legal deliveries
      const isLegalDelivery = ballType !== 'wide' && ballType !== 'no_ball';

      if (isLegalDelivery) {
        // Legal delivery - increment ball count
        nextBall += 1;
        
        // Handle strike rotation for runs (only on legal deliveries)
        // Bye and leg_bye also rotate strike on odd runs
        if (runs % 2 === 1) {
          // Odd runs - swap strike
          [newStrikerId, newNonStrikerId] = [nonStrikerId, strikerId];
        }

        // Check if over is complete (after 6 legal deliveries)
        if (nextBall >= 6) {
          nextOver += 1;
          nextBall = 0;
          // End of over - swap strike automatically
          [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
        }
        
        // Clear free hit if it was used (on any legal delivery)
        if (isFreeHit) {
          setFreeHit(false);
        }
      } else {
        // Wide or no-ball - no ball increment, no strike change
        // But if it's a no-ball, set free hit for next delivery
        if (ballType === 'no_ball') {
          setFreeHit(true);
        }
      }

      // Update local state
      setCurrentOver(nextOver);
      setCurrentBall(nextBall);
      setStrikerId(newStrikerId);
      setNonStrikerId(newNonStrikerId);
      
      // Note: Free hit is cleared above if used, or set if no-ball
      
      // Clear free hit if it was used
      if (isFreeHit && isLegalDelivery) {
        setFreeHit(false);
      }

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
            isBoundary: isBoundary || false,
            isSix: isSix || false,
            isFreeHit: isFreeHit || false,
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
              delivery: { runs, ballType, isWicket: false, isBoundary, isSix, isFreeHit },
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
    [match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, battingTeam, bowlerId, matchId, isOnline, addToQueue, success, showError, loadMatch, freeHit, setFreeHit]
  );

  // Handle extras popup confirmation
  const handleExtrasConfirm = useCallback(
    (additionalRuns: number) => {
      if (!pendingExtras) return;
      
      // Total runs = 1 (base) + additional runs
      const totalRuns = 1 + additionalRuns;
      recordBallInternal(totalRuns, pendingExtras.type, false, freeHit);
      setShowExtrasPopup(false);
      setPendingExtras(null);
    },
    [pendingExtras, recordBallInternal, freeHit]
  );

  const recordBall = useCallback(
    async (runs: number, ballType: string, isWicket: boolean = false) => {
      if (!match) return;

      // Check if match is locked
      // @ts-ignore
      if (match.isLocked) {
        showError('Match is locked and cannot be edited');
        return;
      }

      // If wicket, show popup first
      if (isWicket) {
        setPendingWicket({ runs, ballType });
        setShowWicketPopup(true);
        return;
      }

      // If wide or no-ball, show popup to get additional runs (e.g., wide 4, no-ball 6)
      // Bye and leg_bye are recorded immediately as they count as legal deliveries
      if (ballType === 'wide' || ballType === 'no_ball') {
        setPendingExtras({ type: ballType, runs: 0 });
        setShowExtrasPopup(true);
        return;
      }
      
      // Bye and leg_bye: Record immediately (they're legal deliveries)
      // The runs value is already passed correctly

      // Record the ball immediately
      await recordBallInternal(runs, ballType, false, freeHit);
    },
    [match, freeHit, showError, recordBallInternal]
  );

  const handleWicketConfirm = useCallback(
    async (data: { dismissalType: DismissalType; fielderId?: string; incomingBatterId: string }) => {
      if (!pendingWicket || !match) return;

      // Check if match is locked
      // @ts-ignore
      if (match.isLocked) {
        showError('Match is locked and cannot be edited');
        return;
      }

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

      // Wicket is a legal delivery - increment ball
      let nextOver = currentOver;
      let nextBall = currentBall + 1;
      if (nextBall >= 6) {
        nextOver += 1;
        nextBall = 0;
        // End of over - swap strike automatically
        setStrikerId(nonStrikerId);
        setNonStrikerId(data.incomingBatterId);
      } else {
        // Incoming batter becomes striker
        setStrikerId(data.incomingBatterId);
      }
      setCurrentOver(nextOver);
      setCurrentBall(nextBall);

      // Reload match to get updated stats (for completion detection)
      if (isOnline) {
        setTimeout(() => {
          loadMatch();
        }, 500);
      }

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
          
          // Reload match to get updated stats
          setTimeout(() => {
            loadMatch();
          }, 500);
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
    [pendingWicket, match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, bowlerId, battingTeam, matchId, isOnline, addToQueue, success, showError, loadMatch, nonStrikerId]
  );

  const handleUndo = useCallback(async () => {
    if (ballHistory.length === 0) return;

    // Check if match is locked
    if (match) {
      // @ts-ignore
      if (match.isLocked) {
        showError('Match is locked and cannot be edited');
        return;
      }
    }

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
  }, [ballHistory, currentOver, matchId, isOnline, addToQueue, success, showError, match, showError]);

  // Get max overs based on format
  const getMaxOvers = useCallback(() => {
    if (!match) return 20; // Default T20
    const format = match.format?.toLowerCase() || 't20';
    if (format.includes('t20')) return 20;
    if (format.includes('odi') || format.includes('list-a')) return 50;
    return undefined; // Test/First-class - no max overs
  }, [match]);

  // Check if innings is complete
  const checkInningsComplete = useCallback(() => {
    if (!match || !match.currentScore) return false;

    const score = match.currentScore[battingTeam];
    const maxOvers = getMaxOvers();
    const isAllOut = score.wickets >= 10;
    const reachedMaxOvers = maxOvers !== undefined && score.overs >= maxOvers && score.balls === 0;

    return isAllOut || reachedMaxOvers;
  }, [match, battingTeam, getMaxOvers]);

  // Check if match is complete
  const checkMatchComplete = useCallback(() => {
    if (!match || !match.currentScore || currentInnings !== 2) return false;

    const score = match.currentScore[battingTeam];
    const maxOvers = getMaxOvers();
    const isAllOut = score.wickets >= 10;
    const reachedMaxOvers = maxOvers !== undefined && score.overs >= maxOvers && score.balls === 0;

    // Second innings complete
    if (isAllOut || reachedMaxOvers) {
      return true;
    }

    return false;
  }, [match, battingTeam, currentInnings, getMaxOvers]);

  // Check if bowler needs to be changed (max 4 overs in T20, 10 in ODI)
  const checkBowlerChange = useCallback(() => {
    if (!match || !bowlerId) return false;

    const format = match.format?.toLowerCase() || 't20';
    let maxOversPerBowler = 4; // Default T20
    if (format.includes('odi') || format.includes('list-a')) {
      maxOversPerBowler = 10;
    }

    // @ts-ignore
    const bowlerStats = match.bowlingStats?.find(
      (s: any) => s.playerId === bowlerId && s.innings === currentInnings
    );

    if (bowlerStats) {
      // Calculate total overs bowled (overs + balls/6)
      const totalOvers = bowlerStats.overs + ((bowlerStats.balls || 0) / 6);
      if (totalOvers >= maxOversPerBowler) {
        return true;
      }
    }

    return false;
  }, [match, bowlerId, currentInnings]);

  // Check for innings/match completion after score update
  useEffect(() => {
    if (!match || !match.currentScore) return;

    // Check if match is locked
    // @ts-ignore
    if (match.isLocked) {
      setShowMatchEnd(false); // Don't show if already completed
      return;
    }

    // Check innings completion
    if (currentInnings === 1 && checkInningsComplete() && !showInningsBreak) {
      setShowInningsBreak(true);
    }

    // Check match completion
    if (currentInnings === 2 && checkMatchComplete() && !showMatchEnd) {
      setShowMatchEnd(true);
    }

    // Check bowler change
    if (checkBowlerChange() && !showBowlerChange) {
      // @ts-ignore
      const bowlerStats = match.bowlingStats?.find(
        (s: any) => s.playerId === bowlerId && s.innings === currentInnings
      );
      if (bowlerStats) {
        // Calculate total overs for display
        const totalOvers = bowlerStats.overs + ((bowlerStats.balls || 0) / 6);
        setCurrentBowlerOvers(Math.floor(totalOvers * 10) / 10); // Round to 1 decimal
        setShowBowlerChange(true);
      }
    }
  }, [match, currentInnings, battingTeam, checkInningsComplete, checkMatchComplete, checkBowlerChange, showInningsBreak, showMatchEnd, showBowlerChange, bowlerId]);

  // Handle second innings start
  const handleStartSecondInnings = useCallback(
    async (openingBatter1Id: string, openingBatter2Id: string, firstBowlerId: string) => {
      try {
        const response = await api.startSecondInnings(matchId, {
          openingBatter1Id,
          openingBatter2Id,
          firstBowlerId,
        });

        setMatch(response.data);
        setCurrentInnings(2);
        // @ts-ignore
        setBattingTeam(response.data.liveState?.battingTeam || 'away');
        // @ts-ignore
        setStrikerId(response.data.liveState?.strikerId || '');
        // @ts-ignore
        setNonStrikerId(response.data.liveState?.nonStrikerId || '');
        // @ts-ignore
        setBowlerId(response.data.liveState?.bowlerId || '');
        setCurrentOver(0);
        setCurrentBall(0);
        setShowInningsBreak(false);
        success('Second innings started');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to start second innings');
      }
    },
    [matchId, success, showError]
  );

  // Handle match completion
  const handleMatchComplete = useCallback(
    async (data: {
      winner: 'home' | 'away' | 'tie' | 'no_result';
      margin: string;
      keyPerformers: Array<{ playerId: string; playerName: string; role: string; performance: string }>;
      notes: string;
    }) => {
      try {
        const response = await api.completeMatch(matchId, data);
        setMatch(response.data);
        setShowMatchEnd(false);
        success('Match completed and locked');
        router.push(`/matches/${matchId}`);
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to complete match');
      }
    },
    [matchId, success, showError, router]
  );

  // Handle bowler change
  const handleBowlerChange = useCallback(
    (newBowlerId: string) => {
      setBowlerId(newBowlerId);
      setShowBowlerChange(false);
      setCurrentBowlerOvers(0);
      success('Bowler changed');
    },
    [success]
  );

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

        {/* Current Batters */}
        {match && strikerId && nonStrikerId && (
          <CurrentBattersCard
            striker={
              // @ts-ignore
              match.battingStats?.find(
                (s: any) => s.playerId === strikerId && s.innings === currentInnings && s.team === battingTeam
              )
                ? {
                    // @ts-ignore
                    ...match.battingStats.find(
                      (s: any) => s.playerId === strikerId && s.innings === currentInnings && s.team === battingTeam
                    ),
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI']?.find(
                      (p: any) => p.id === strikerId
                    )?.name || 'Batter',
                  }
                : {
                    id: strikerId,
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI']?.find(
                      (p: any) => p.id === strikerId
                    )?.name || 'Batter',
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strikeRate: 0,
                    isOut: false,
                  }
            }
            nonStriker={
              // @ts-ignore
              match.battingStats?.find(
                (s: any) => s.playerId === nonStrikerId && s.innings === currentInnings && s.team === battingTeam
              )
                ? {
                    // @ts-ignore
                    ...match.battingStats.find(
                      (s: any) => s.playerId === nonStrikerId && s.innings === currentInnings && s.team === battingTeam
                    ),
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI']?.find(
                      (p: any) => p.id === nonStrikerId
                    )?.name || 'Batter',
                  }
                : {
                    id: nonStrikerId,
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI']?.find(
                      (p: any) => p.id === nonStrikerId
                    )?.name || 'Batter',
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strikeRate: 0,
                    isOut: false,
                  }
            }
            strikerId={strikerId}
            nonStrikerId={nonStrikerId}
          />
        )}

        {/* Current Bowler */}
        {match && bowlerId && (
          <CurrentBowlerCard
            bowler={
              // @ts-ignore
              match.bowlingStats?.find(
                (s: any) => s.playerId === bowlerId && s.innings === currentInnings
              )
                ? {
                    // @ts-ignore
                    ...match.bowlingStats.find(
                      (s: any) => s.playerId === bowlerId && s.innings === currentInnings
                    ),
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI']?.find(
                      (p: any) => p.id === bowlerId
                    )?.name || 'Bowler',
                  }
                : {
                    id: bowlerId,
                    // @ts-ignore
                    name: match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI']?.find(
                      (p: any) => p.id === bowlerId
                    )?.name || 'Bowler',
                    overs: 0,
                    balls: 0,
                    runs: 0,
                    wickets: 0,
                    economy: 0,
                  }
            }
            bowlerId={bowlerId}
          />
        )}

        {/* Partnership and Run Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Partnership */}
          {match && (
            // @ts-ignore
            match.liveState && (
              <PartnershipCard
                // @ts-ignore
                runs={match.liveState.partnershipRuns || 0}
                // @ts-ignore
                balls={match.liveState.partnershipBalls || 0}
              />
            )
          )}

          {/* Run Rates */}
          {match && match.currentScore && (
            // @ts-ignore
            match.liveState && (
              <RunRateCard
                // @ts-ignore
                currentRunRate={match.liveState.currentRunRate || 0}
                // @ts-ignore
                requiredRunRate={match.liveState.requiredRunRate}
                // @ts-ignore
                target={match.liveState.target}
                currentRuns={match.currentScore[battingTeam].runs}
                isChase={currentInnings === 2}
              />
            )
          )}
        </div>

        {/* Free Hit Indicator */}
        {freeHit && (
          <Card className="p-3 bg-yellow-100 border-2 border-yellow-400">
            <div className="text-center">
              <p className="text-sm font-bold text-yellow-900">🎯 FREE HIT</p>
              <p className="text-xs text-yellow-700">Next delivery is a free hit</p>
            </div>
          </Card>
        )}

        {/* Live Scoring Interface - Disabled if match is locked */}
        {/* @ts-ignore */}
        {!match.isLocked ? (
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
        ) : (
          <Card className="p-8 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">Match Completed</p>
            <p className="text-sm text-gray-600">This match has been locked and cannot be edited.</p>
            <Button variant="primary" className="mt-4" onClick={() => router.push(`/matches/${matchId}`)}>
              View Match Details
            </Button>
          </Card>
        )}

        {/* Wicket Popup */}
        {showWicketPopup && pendingWicket && match && (
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

        {/* Innings Break Modal */}
        {showInningsBreak && match && match.currentScore && (
          <InningsBreakModal
            isOpen={showInningsBreak}
            onClose={() => setShowInningsBreak(false)}
            onStartSecondInnings={handleStartSecondInnings}
            firstInningsScore={{
              runs: match.currentScore[battingTeam].runs,
              wickets: match.currentScore[battingTeam].wickets,
              overs: match.currentScore[battingTeam].overs,
              balls: match.currentScore[battingTeam].balls || 0,
            }}
            battingTeam={battingTeam}
            availableBatters={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI'] || []
            }
            availableBowlers={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI'] || []
            }
            teamName={
              battingTeam === 'home' ? match.teams.away.name : match.teams.home.name
            }
          />
        )}

        {/* Match End Modal */}
        {showMatchEnd && match && match.currentScore && (
          <MatchEndModal
            isOpen={showMatchEnd}
            onClose={() => setShowMatchEnd(false)}
            onComplete={handleMatchComplete}
            homeScore={{
              runs: match.currentScore.home.runs,
              wickets: match.currentScore.home.wickets,
              overs: match.currentScore.home.overs,
              balls: match.currentScore.home.balls || 0,
            }}
            awayScore={{
              runs: match.currentScore.away.runs,
              wickets: match.currentScore.away.wickets,
              overs: match.currentScore.away.overs,
              balls: match.currentScore.away.balls || 0,
            }}
            homeTeamName={match.teams.home.name}
            awayTeamName={match.teams.away.name}
            availablePlayers={
              // @ts-ignore
              [
                // @ts-ignore
                ...(match.matchSetup?.homePlayingXI || []),
                // @ts-ignore
                ...(match.matchSetup?.awayPlayingXI || []),
              ]
            }
          />
        )}

        {/* Bowler Change Modal */}
        {showBowlerChange && match && (
          <BowlerChangeModal
            isOpen={showBowlerChange}
            onClose={() => setShowBowlerChange(false)}
            onConfirm={handleBowlerChange}
            currentBowlerName={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI']?.find(
                (p: any) => p.id === bowlerId
              )?.name || 'Current Bowler'
            }
            availableBowlers={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI']?.filter(
                (p: any) => p.id !== bowlerId
              ) || []
            }
            oversBowled={currentBowlerOvers}
          />
        )}
      </div>
    </AppLayout>
  );
}

