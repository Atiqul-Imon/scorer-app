'use client';

import { useEffect, useState, useCallback, lazy, Suspense, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LiveScoringInterface from '@/components/scoring/LiveScoringInterface';
import CurrentBattersCard from '@/components/scoring/CurrentBattersCard';
import CurrentBowlerCard from '@/components/scoring/CurrentBowlerCard';
import PartnershipCard from '@/components/scoring/PartnershipCard';
import RunRateCard from '@/components/scoring/RunRateCard';
import type { CricketMatch } from '@/types';
import { formatScore } from '@/lib/utils';
import { Wifi, WifiOff, RotateCcw, Settings, Edit, Users, Target, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useMatchState } from '@/hooks/useMatchState';
import { useMatchAPI } from '@/hooks/useMatchAPI';
import { useMatchModals } from '@/hooks/useMatchModals';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';

// Type import for DismissalType (must be static import for types)
import type { DismissalType } from '@/components/scoring/WicketPopup';

// Lazy load modals for code splitting
const WicketPopup = lazy(() => import('@/components/scoring/WicketPopup'));
const InningsBreakModal = lazy(() => import('@/components/scoring/InningsBreakModal'));
const MatchEndModal = lazy(() => import('@/components/scoring/MatchEndModal'));
const BowlerChangeModal = lazy(() => import('@/components/scoring/BowlerChangeModal'));
const ExtrasPopup = lazy(() => import('@/components/scoring/ExtrasPopup'));
const ManualScoreModal = lazy(() => import('@/components/scoring/ManualScoreModal'));
const PlayerManagementModal = lazy(() => import('@/components/scoring/PlayerManagementModal'));
const ChangePlayersModal = lazy(() => import('@/components/scoring/ChangePlayersModal'));
const EditMatchSetupModal = lazy(() => import('@/components/scoring/EditMatchSetupModal'));

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

  // Use custom hooks for state management
  const matchState = useMatchState();
  const matchAPI = useMatchAPI(matchId);
  const modals = useMatchModals();
  const networkStatus = useNetworkStatus();

  // Local component state
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [ballHistory, setBallHistory] = useState<BallAction[]>([]);
  const [pendingWicket, setPendingWicket] = useState<{ runs: number; ballType: string } | null>(null);
  const [currentBowlerOvers, setCurrentBowlerOvers] = useState(0);
  const [pendingExtras, setPendingExtras] = useState<{ type: 'wide' | 'no_ball' | 'bye' | 'leg_bye'; runs: number } | null>(null);
  const [freeHit, setFreeHit] = useState(false);

  // Destructure from hooks for easier access
  const {
    match,
    currentInnings,
    battingTeam,
    strikerId,
    nonStrikerId,
    bowlerId,
    currentOver,
    currentBall,
    setMatch,
    setCurrentInnings,
    setBattingTeam,
    setStrikerId,
    setNonStrikerId,
    setBowlerId,
    setCurrentOver,
    setCurrentBall,
    initializeFromMatch,
  } = matchState;

  const {
    showWicketPopup,
    showInningsBreak,
    showMatchEnd,
    showBowlerChange,
    showExtrasPopup,
    showManualScore,
    showPlayerManagement,
    showChangePlayers,
    showEditSetup,
    showSettingsMenu,
    openWicketPopup,
    closeWicketPopup,
    openInningsBreak,
    closeInningsBreak,
    openMatchEnd,
    closeMatchEnd,
    openBowlerChange,
    closeBowlerChange,
    openExtrasPopup,
    closeExtrasPopup,
    openManualScore,
    closeManualScore,
    openPlayerManagement,
    closePlayerManagement,
    openChangePlayers,
    closeChangePlayers,
    openEditSetup,
    closeEditSetup,
    toggleSettingsMenu,
    closeSettingsMenu,
  } = modals;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && matchId) {
      loadMatch();
    }
  }, [isAuthenticated, authLoading, matchId, router]);

  // Simple sync status - just track if API call is in progress

  const loadMatch = useCallback(async () => {
    try {
      setLoading(true);
      const matchData = await matchAPI.loadMatch();
      
      if (matchData) {
        setMatch(matchData);
        initializeFromMatch(matchData);

        // Check if setup is complete
        // @ts-ignore
        if (!matchData.matchSetup?.isSetupComplete) {
          router.push(`/matches/${matchId}/setup`);
          return;
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [matchAPI, setMatch, initializeFromMatch, matchId, router, showError]);

  const recordBallInternal = useCallback(
    async (runs: number, ballType: string, isWicket: boolean = false, isFreeHit: boolean = false) => {
      if (!match) return;

      // Check if match is live
      if (match.status !== 'live') {
        showError(`Match is ${match.status}. Please set the match status to "live" before scoring.`);
        return;
      }

      // Check network status
      if (!networkStatus.isOnline) {
        showError('Cannot record ball while offline. Please check your connection.');
        return;
      }

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

      // Update match score optimistically
      setMatch((prev) => {
        if (!prev || !prev.currentScore) return prev;
        const updatedScore = { ...prev.currentScore };
        const battingScore = { ...updatedScore[battingTeam] };
        
        // Add runs to team score (all runs count towards team total)
        // This includes: normal runs, wides, no-balls, byes, leg-byes
        battingScore.runs += runs;
        
        // Handle wickets
        if (isWicket) {
          battingScore.wickets += 1;
        }
        
        // Update over/ball for legal deliveries only
        // Legal deliveries: normal, bye, leg_bye
        // Illegal deliveries: wide, no_ball (don't count as balls)
        const isLegalDelivery = ballType !== 'wide' && ballType !== 'no_ball';
        if (isLegalDelivery) {
          const nextBall = currentBall + 1;
          if (nextBall >= 6) {
            battingScore.overs = currentOver + 1;
            battingScore.balls = 0;
          } else {
            battingScore.overs = currentOver;
            battingScore.balls = nextBall;
          }
        }
        
        updatedScore[battingTeam] = battingScore;
        
        return {
          ...prev,
          currentScore: updatedScore,
        };
      });

      // Calculate next over and ball
      let nextOver = currentOver;
      let nextBall = currentBall;
      let newStrikerId = strikerId;
      let newNonStrikerId = nonStrikerId;

      // Handle extras - wides and no-balls don't count as legal deliveries
      const isLegalDelivery = ballType !== 'wide' && ballType !== 'no_ball';

      // Strike rotation based on total runs (for all delivery types)
      // Wide and no-ball: Strike rotates if total runs are odd (e.g., wide 4 = 5 runs = odd = rotate)
      // Normal, bye, leg_bye: Strike rotates if runs are odd
      if (runs % 2 === 1) {
        // Odd runs - swap strike
        [newStrikerId, newNonStrikerId] = [nonStrikerId, strikerId];
      }

      if (isLegalDelivery) {
        // Legal delivery - increment ball count
        nextBall += 1;

        // Check if over is complete (after 6 legal deliveries)
        if (nextBall >= 6) {
          nextOver += 1;
          nextBall = 0;
          // End of over - swap strike automatically (overrides any previous rotation)
          [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
        }
        
        // Clear free hit if it was used (on any legal delivery)
        if (isFreeHit) {
          setFreeHit(false);
        }
      } else {
        // Wide or no-ball - no ball increment, but strike may rotate based on runs
        // If it's a no-ball, set free hit for next delivery
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

      // Sync to backend - direct API call (no offline queue)
      try {
        setSyncStatus('syncing');
        
        // Validate required fields before making API call
        if (!strikerId || strikerId.trim() === '') {
          throw new Error('Striker ID is required. Please complete match setup.');
        }
        if (!nonStrikerId || nonStrikerId.trim() === '') {
          throw new Error('Non-striker ID is required. Please complete match setup.');
        }
        if (!bowlerId || bowlerId.trim() === '') {
          throw new Error('Bowler ID is required. Please complete match setup.');
        }
        
        const ballData = {
          matchId,
          innings: currentInnings,
          battingTeam,
          over: currentOver, // Use current over (before increment)
          ball: currentBall, // Use current ball (before increment)
          strikerId, // Use current striker (before rotation)
          nonStrikerId, // Use current non-striker (before rotation)
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
        
        logger.debug('Recording ball:', { matchId, ballData });
        
        // Make API call using hook
        const matchData = await matchAPI.recordBall(ballData);
        
        if (matchData && matchData.currentScore) {
          // Replace entire match object with backend response (source of truth)
          setMatch(matchData);
          
          // Update local state from liveState
          initializeFromMatch(matchData);
          
          // Update sync status only after successful update
          setSyncStatus('synced');
          success('Ball recorded');
        } else {
          // If response doesn't have valid data, reload match
          setSyncStatus('synced'); // Still mark as synced to clear the syncing state
          setTimeout(() => {
            loadMatch();
          }, 500);
        }
      } catch (error: any) {
        logger.error('Error recording ball:', error);
        logger.error('Error details:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
        });
        
        setSyncStatus('error');
        
        // Show detailed error message
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to record ball';
        logger.error('Error message:', errorMessage);
        
        // If it's a validation error about missing setup, redirect to setup
        if (errorMessage.includes('setup') || errorMessage.includes('striker') || errorMessage.includes('bowler')) {
          showError(`${errorMessage}. Please complete match setup.`);
          setTimeout(() => {
            router.push(`/matches/${matchId}/setup`);
          }, 2000);
          return;
        }
        
        // Show error to user
        showError(errorMessage);
      }
    },
    [match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, battingTeam, bowlerId, matchId, success, showError, loadMatch, freeHit, setFreeHit, router, networkStatus.isOnline, matchAPI, setMatch, initializeFromMatch, setCurrentOver, setCurrentBall, setStrikerId, setNonStrikerId]
  );

  // Handle extras popup confirmation
  const handleExtrasConfirm = useCallback(
    (additionalRuns: number) => {
      if (!pendingExtras) return;
      
      // For wide/no-ball: Total runs = 1 (base) + additional runs
      // For bye/leg_bye: Total runs = just the selected runs (no base run)
      const totalRuns = (pendingExtras.type === 'wide' || pendingExtras.type === 'no_ball') 
        ? 1 + additionalRuns 
        : additionalRuns;
      recordBallInternal(totalRuns, pendingExtras.type, false, freeHit);
      closeExtrasPopup();
      setPendingExtras(null);
    },
    [pendingExtras, recordBallInternal, freeHit]
  );

  const recordBall = useCallback(
    async (runs: number, ballType: string, isWicket: boolean = false) => {
      if (!match) {
        showError('Match data not loaded');
        return;
      }

      // Check if match is locked
      // @ts-ignore
      if (match.isLocked) {
        showError('Match is locked and cannot be edited');
        return;
      }

      // Validate required fields for scoring
      if (!strikerId || !nonStrikerId || !bowlerId) {
        showError('Please complete match setup: select opening batters and first bowler');
        router.push(`/matches/${matchId}/setup`);
        return;
      }

      // If wicket, show popup first
      if (isWicket) {
        setPendingWicket({ runs, ballType });
        openWicketPopup();
        return;
      }

      // If wide, no-ball, bye, or leg_bye, show popup to get runs
      // Wide/no-ball: base 1 run + additional runs
      // Bye/leg_bye: just the runs (1-6)
      if (ballType === 'wide' || ballType === 'no_ball' || ballType === 'bye' || ballType === 'leg_bye') {
        setPendingExtras({ type: ballType, runs: 0 });
        openExtrasPopup();
        return;
      }

      // Normal delivery: Record immediately
      await recordBallInternal(runs, ballType, false, freeHit);
    },
    [match, freeHit, showError, recordBallInternal, strikerId, nonStrikerId, bowlerId, matchId, router]
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
      closeWicketPopup();
      setPendingWicket(null);

      // Wicket is a legal delivery - increment ball
      let nextOver = currentOver;
      let nextBall = currentBall + 1;
      
      // Handle incoming batter position based on runs
      // If odd runs: incoming batter at non-striker's end (current non-striker becomes striker)
      // If even runs: incoming batter at striker's end (becomes striker)
      let newStrikerId = strikerId;
      let newNonStrikerId = nonStrikerId;
      
      if (pendingWicket.runs % 2 === 1) {
        // Odd runs: incoming batter at non-striker's end
        newStrikerId = nonStrikerId;
        newNonStrikerId = data.incomingBatterId;
      } else {
        // Even runs: incoming batter at striker's end
        newStrikerId = data.incomingBatterId;
        // Non-striker stays the same
      }
      
      if (nextBall >= 6) {
        nextOver += 1;
        nextBall = 0;
        // End of over - swap strike automatically
        [newStrikerId, newNonStrikerId] = [newNonStrikerId, newStrikerId];
      }
      
      setStrikerId(newStrikerId);
      setNonStrikerId(newNonStrikerId);
      setCurrentOver(nextOver);
      setCurrentBall(nextBall);

      // Reload match to get updated stats (for completion detection)
      setTimeout(() => {
        loadMatch();
      }, 500);

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

        // Sync to backend - direct API call
        setSyncStatus('syncing');
        const response = await api.recordBall(matchId, ballData);
        success('Wicket recorded');
        
        // Update match state from response
        if (response.data) {
          setMatch(response.data);
          // @ts-ignore
          if (response.data.liveState) {
            // @ts-ignore
            setCurrentInnings(response.data.liveState.currentInnings || currentInnings);
            // @ts-ignore
            setBattingTeam(response.data.liveState.battingTeam || battingTeam);
            // @ts-ignore
            setStrikerId(response.data.liveState.strikerId || strikerId);
            // @ts-ignore
            setNonStrikerId(response.data.liveState.nonStrikerId || nonStrikerId);
            // @ts-ignore
            setBowlerId(response.data.liveState.bowlerId || bowlerId);
            // @ts-ignore
            setCurrentOver(response.data.liveState.currentOver ?? currentOver);
            // @ts-ignore
            setCurrentBall(response.data.liveState.currentBall ?? currentBall);
          }
        }
        
        setSyncStatus('synced');
        // Reload match after a short delay
        setTimeout(() => {
          loadMatch();
        }, 300);
      } catch (error: any) {
        logger.error('Error recording wicket:', error);
        showError(error?.response?.data?.message || error?.message || 'Failed to record wicket');
      }
    },
    [pendingWicket, match, currentInnings, currentOver, currentBall, strikerId, nonStrikerId, bowlerId, battingTeam, matchId, success, showError, loadMatch]
  );

  const handleUndoInternal = useCallback(async () => {
    if (ballHistory.length === 0) return;

    // Check network status
    if (!networkStatus.isOnline) {
      showError('Cannot undo while offline. Please check your connection.');
      return;
    }

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

    // Sync undo to backend - direct API call
    try {
      setSyncStatus('syncing');
      await api.undoLastBall(matchId);
      success('Last ball undone');
      setSyncStatus('synced');
      // Reload match to get updated state
      await loadMatch();
    } catch (error: any) {
      logger.error('Error undoing ball:', error);
      setSyncStatus('error');
      showError(error?.response?.data?.message || error?.message || 'Failed to undo ball');
    }
  }, [ballHistory, currentOver, matchId, success, showError, match, loadMatch, networkStatus.isOnline, setCurrentOver, setCurrentBall]);

  // Prevent rapid undo clicks
  const handleUndo = usePreventDoubleClick(handleUndoInternal, 500);

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
      closeMatchEnd(); // Don't show if already completed
      return;
    }

    // Check innings completion
    if (currentInnings === 1 && checkInningsComplete() && !showInningsBreak) {
      openInningsBreak();
    }

    // Check match completion
    if (currentInnings === 2 && checkMatchComplete() && !showMatchEnd) {
      openMatchEnd();
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
        openBowlerChange();
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
        closeInningsBreak();
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
        closeMatchEnd();
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
      closeBowlerChange();
      setCurrentBowlerOvers(0);
      success('Bowler changed');
    },
    [success]
  );

  // Handle manual score entry
  const handleManualScore = useCallback(
    async (data: {
      runs: number;
      wickets: number;
      overs: number;
      balls: number;
      strikerId?: string;
      nonStrikerId?: string;
      bowlerId?: string;
    }) => {
      try {
        // Update score via API
        const updateData: any = {
          home: match?.currentScore?.home || { runs: 0, wickets: 0, overs: 0, balls: 0 },
          away: match?.currentScore?.away || { runs: 0, wickets: 0, overs: 0, balls: 0 },
          innings: currentInnings,
        };
        
        // Update the batting team's score
        updateData[battingTeam] = {
          runs: data.runs,
          wickets: data.wickets,
          overs: data.overs,
          balls: data.balls,
        };

        // Include live state updates if players are provided
        if (data.strikerId || data.nonStrikerId || data.bowlerId || data.overs !== undefined || data.balls !== undefined) {
          updateData.liveState = {
            strikerId: data.strikerId,
            nonStrikerId: data.nonStrikerId,
            bowlerId: data.bowlerId,
            currentOver: data.overs,
            currentBall: data.balls,
          };
        }
        
        await api.updateScore(matchId, updateData);

        // Update local state
        if (data.strikerId) setStrikerId(data.strikerId);
        if (data.nonStrikerId) setNonStrikerId(data.nonStrikerId);
        if (data.bowlerId) setBowlerId(data.bowlerId);
        setCurrentOver(data.overs);
        setCurrentBall(data.balls);

        // Reload match
        await loadMatch();
        success('Score updated manually');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to update score');
      }
    },
    [matchId, battingTeam, match, currentInnings, loadMatch, success, showError]
  );

  // Handle player management
  const handlePlayerManagement = useCallback(
    async (homePlayers: Array<{ id: string; name: string }>, awayPlayers: Array<{ id: string; name: string }>) => {
      try {
        // Update match setup with new players
        await api.completeMatchSetup(matchId, {
          matchId,
          homePlayingXI: homePlayers,
          awayPlayingXI: awayPlayers,
        });
        await loadMatch();
        success('Players updated');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to update players');
      }
    },
    [matchId, loadMatch, success, showError]
  );

  // Handle change current players
  const handleChangePlayers = useCallback(
    async (newStrikerId: string, newNonStrikerId: string, newBowlerId: string) => {
      try {
        // Update live state via API
        await api.updateLiveState(matchId, {
          strikerId: newStrikerId,
          nonStrikerId: newNonStrikerId,
          bowlerId: newBowlerId,
        });

        // Update local state
        setStrikerId(newStrikerId);
        setNonStrikerId(newNonStrikerId);
        setBowlerId(newBowlerId);
        
        // Reload match to get updated state
        await loadMatch();
        success('Players changed');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to change players');
      }
    },
    [matchId, loadMatch, success, showError]
  );

  // Handle edit match setup (toss)
  const handleEditSetup = useCallback(
    async (tossWinner: 'home' | 'away', tossDecision: 'bat' | 'bowl') => {
      try {
        await api.completeMatchSetup(matchId, {
          matchId,
          toss: {
            winner: tossWinner,
            decision: tossDecision,
          },
        });
        await loadMatch();
        success('Toss updated');
      } catch (error: any) {
        showError(error.response?.data?.message || 'Failed to update toss');
      }
    },
    [matchId, loadMatch, success, showError]
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

  // Get available players for modals
  // @ts-ignore
  const availableBattersForModals = match?.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI'] || [];
  // @ts-ignore
  const availableBowlersForModals = match?.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI'] || [];

  return (
    <AppLayout 
      title="Live Scoring" 
      showBack
      headerActions={
        <div className="flex items-center gap-2">
          {/* Network Status Indicator */}
          {!networkStatus.isOnline && (
            <Badge variant="error" className="text-xs">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
          {networkStatus.wasOffline && networkStatus.isOnline && (
            <Badge variant="success" className="text-xs animate-pulse">
              <Wifi className="w-3 h-3 mr-1" />
              Back Online
            </Badge>
          )}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettingsMenu}
              className="touch-target"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          {showSettingsMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={closeSettingsMenu}
              />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                <button
                  onClick={() => {
                    openManualScore();
                    closeSettingsMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Manual Score Entry
                </button>
                <button
                  onClick={() => {
                    openChangePlayers();
                    closeSettingsMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Change Players
                </button>
                <button
                  onClick={() => {
                    openPlayerManagement();
                    closeSettingsMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Manage Players
                </button>
                <button
                  onClick={() => {
                    openEditSetup();
                    closeSettingsMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Toss
                </button>
              </div>
            </>
          )}
        </div>
      }
    >
      {/* Desktop Layout: Side-by-side, Mobile: Stacked */}
      <div className="flex flex-col lg:flex-row lg:gap-6 lg:items-start">
        {/* Left Column: Match Info & Stats (Desktop) / Top Section (Mobile) */}
        <div className="flex-1 space-y-4 pb-4 lg:pb-0 lg:max-w-md xl:max-w-lg">
          {/* Status Warning - Show if match is not live */}
          {match.status !== 'live' && (
            <Card className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-100 mb-1">Match is {match.status}</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {match.status === 'upcoming' 
                      ? 'Please set the match status to "live" before you can start scoring. Go to match details to change the status.'
                      : match.status === 'completed'
                      ? 'This match has been completed and is locked. You cannot record any more balls.'
                      : 'This match is not live. Please set the status to "live" to continue scoring.'}
                  </p>
                  {match.status === 'upcoming' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/matches/${matchId}`)}
                      className="w-full sm:w-auto"
                    >
                      Go to Match Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Match Info */}
          <Card className="p-4 lg:p-6 bg-gradient-to-br from-primary-500/10 to-gray-800 border-primary-500/20">
            <div className="text-center">
              <p className="text-sm lg:text-base text-gray-300 mb-2">{match.series}</p>
              <p className="text-lg lg:text-xl font-bold text-gray-100">
                {match.teams.home.name} vs {match.teams.away.name}
              </p>
              <Badge variant="success" className="mt-2">
                Innings {currentInnings}
              </Badge>
            </div>
          </Card>

          {/* Current Score */}
          {match.currentScore && (
            <Card className="p-4 lg:p-6">
              <div className="text-center">
                <p className="text-xs lg:text-sm text-gray-300 mb-2">Current Score</p>
                <div className="flex items-center justify-center gap-4">
                  <div>
                    <p className="text-xs lg:text-sm text-gray-400">{match.teams[battingTeam].shortName}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-100">
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
            <Card className="p-3 lg:p-4 bg-yellow-500/20 border-2 border-yellow-500/50">
              <div className="text-center">
                <p className="text-sm lg:text-base font-bold text-yellow-400">🎯 FREE HIT</p>
                <p className="text-xs lg:text-sm text-yellow-300">Next delivery is a free hit</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Scoring Interface (Desktop) / Bottom Section (Mobile) */}
        <div className="flex-1 lg:flex-shrink-0 lg:w-96 xl:w-[28rem] space-y-4 pb-4 lg:pb-0 lg:sticky lg:top-20">
          {/* Live Scoring Interface - Disabled if match is locked or not live */}
          {/* @ts-ignore */}
          {!match.isLocked && match.status === 'live' ? (
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
              <p className="text-lg font-semibold text-gray-100 mb-2">
                {match.status === 'completed' ? 'Match Completed' : 'Match Not Live'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {match.status === 'completed' 
                  ? 'This match has been completed and is locked. You cannot record any more balls.'
                  : match.status === 'upcoming'
                  ? 'This match is in upcoming status. Please set it to "live" before scoring.'
                  : 'This match is not live. Please set the status to "live" to continue scoring.'}
              </p>
              <Button variant="primary" className="mt-4" onClick={() => router.push(`/matches/${matchId}`)}>
                Go to Match Details
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Modals - Outside main layout */}
      <Suspense fallback={null}>
        {/* Wicket Popup */}
        {showWicketPopup && pendingWicket && match && (
          <WicketPopup
            isOpen={showWicketPopup}
            onClose={() => {
              closeWicketPopup();
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

        {/* Extras Popup */}
        {showExtrasPopup && pendingExtras && (
          <ExtrasPopup
            isOpen={showExtrasPopup}
            onClose={() => {
              closeExtrasPopup();
              setPendingExtras(null);
            }}
            onConfirm={handleExtrasConfirm}
            type={pendingExtras.type}
          />
        )}

        {/* Innings Break Modal */}
        {showInningsBreak && match && match.currentScore && (
          <InningsBreakModal
            isOpen={showInningsBreak}
            onClose={closeInningsBreak}
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
            onClose={closeMatchEnd}
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
            onClose={closeBowlerChange}
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

        {/* Manual Score Entry Modal */}
        {showManualScore && match && match.currentScore && (
          <ManualScoreModal
            isOpen={showManualScore}
            onClose={closeManualScore}
            onSave={handleManualScore}
            currentScore={{
              runs: match.currentScore[battingTeam].runs,
              wickets: match.currentScore[battingTeam].wickets,
              overs: match.currentScore[battingTeam].overs,
              balls: match.currentScore[battingTeam].balls || 0,
            }}
            availableBatters={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI'] || []
            }
            availableBowlers={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI'] || []
            }
            currentStrikerId={strikerId}
            currentNonStrikerId={nonStrikerId}
            currentBowlerId={bowlerId}
          />
        )}

        {/* Player Management Modal */}
        {showPlayerManagement && match && (
          <PlayerManagementModal
            isOpen={showPlayerManagement}
            onClose={closePlayerManagement}
            onSave={handlePlayerManagement}
            homePlayers={
              // @ts-ignore
              match.matchSetup?.homePlayingXI || []
            }
            awayPlayers={
              // @ts-ignore
              match.matchSetup?.awayPlayingXI || []
            }
            homeTeamName={match.teams.home.name}
            awayTeamName={match.teams.away.name}
          />
        )}

        {/* Change Players Modal */}
        {showChangePlayers && match && (
          <ChangePlayersModal
            isOpen={showChangePlayers}
            onClose={closeChangePlayers}
            onSave={handleChangePlayers}
            availableBatters={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'homePlayingXI' : 'awayPlayingXI'] || []
            }
            availableBowlers={
              // @ts-ignore
              match.matchSetup?.[battingTeam === 'home' ? 'awayPlayingXI' : 'homePlayingXI'] || []
            }
            currentStrikerId={strikerId}
            currentNonStrikerId={nonStrikerId}
            currentBowlerId={bowlerId}
          />
        )}

        {/* Edit Match Setup Modal */}
        {showEditSetup && match && (
          <EditMatchSetupModal
            isOpen={showEditSetup}
            onClose={closeEditSetup}
            onSave={handleEditSetup}
            homeTeamName={match.teams.home.name}
            awayTeamName={match.teams.away.name}
            // @ts-ignore
            currentTossWinner={match.matchSetup?.tossWinner}
            // @ts-ignore
            currentTossDecision={match.matchSetup?.tossDecision}
          />
        )}
      </Suspense>
    </AppLayout>
  );
}

