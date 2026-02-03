import { useState, useCallback } from 'react';
import type { CricketMatch } from '@/types';

export interface MatchState {
  match: CricketMatch | null;
  currentInnings: number;
  battingTeam: 'home' | 'away';
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  currentOver: number;
  currentBall: number;
}

export interface MatchStateActions {
  setMatch: (match: CricketMatch | null) => void;
  setCurrentInnings: (innings: number) => void;
  setBattingTeam: (team: 'home' | 'away') => void;
  setStrikerId: (id: string) => void;
  setNonStrikerId: (id: string) => void;
  setBowlerId: (id: string) => void;
  setCurrentOver: (over: number) => void;
  setCurrentBall: (ball: number) => void;
  initializeFromMatch: (matchData: CricketMatch) => void;
}

export function useMatchState() {
  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [battingTeam, setBattingTeam] = useState<'home' | 'away'>('home');
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [bowlerId, setBowlerId] = useState<string>('');
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);

  const initializeFromMatch = useCallback((matchData: CricketMatch) => {
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
    } else {
      // If no liveState, initialize with defaults
      setCurrentInnings(1);
      setBattingTeam('home');
      setStrikerId('');
      setNonStrikerId('');
      setBowlerId('');
      setCurrentOver(0);
      setCurrentBall(0);
    }
  }, []);

  return {
    // State
    match,
    currentInnings,
    battingTeam,
    strikerId,
    nonStrikerId,
    bowlerId,
    currentOver,
    currentBall,
    // Actions
    setMatch,
    setCurrentInnings,
    setBattingTeam,
    setStrikerId,
    setNonStrikerId,
    setBowlerId,
    setCurrentOver,
    setCurrentBall,
    initializeFromMatch,
  };
}

