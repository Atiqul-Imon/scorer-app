import { useCallback } from 'react';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import type { CricketMatch } from '@/types';

export function useMatchAPI(matchId: string) {
  const loadMatch = useCallback(async (): Promise<CricketMatch | null> => {
    try {
      logger.debug('Loading match:', matchId);
      const response = await api.getMatch(matchId);
      const matchData = response.data;
      
      logger.debug('Match loaded:', {
        matchId: matchData?.matchId,
        currentScore: matchData?.currentScore,
        // @ts-ignore
        liveState: matchData?.liveState,
      });
      
      return matchData;
    } catch (error: any) {
      logger.error('Error loading match:', error);
      logger.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  }, [matchId]);

  const recordBall = useCallback(async (ballData: any): Promise<CricketMatch | null> => {
    try {
      logger.debug('Recording ball:', { matchId, ballData });
      const response = await api.recordBall(matchId, ballData);
      logger.debug('Ball recorded successfully:', response);
      
      // api.recordBall returns response.data which is { success: true, data: match }
      const matchData = response.data;
      
      if (matchData && matchData.currentScore) {
        logger.debug('Updating match with backend data:', {
          currentScore: matchData.currentScore,
        });
        return matchData;
      } else {
        logger.warn('No valid match data in response, reloading...', {
          hasMatchData: !!matchData,
          hasCurrentScore: !!matchData?.currentScore,
        });
        // Reload match if response doesn't have expected structure
        return await loadMatch();
      }
    } catch (error: any) {
      logger.error('Error recording ball:', error);
      logger.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
      });
      throw error;
    }
  }, [matchId, loadMatch]);

  const undoLastBall = useCallback(async (): Promise<CricketMatch | null> => {
    try {
      const response = await api.undoLastBall(matchId);
      return response.data;
    } catch (error: any) {
      logger.error('Error undoing ball:', error);
      throw error;
    }
  }, [matchId]);

  const updateLiveState = useCallback(async (liveState: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    currentOver?: number;
    currentBall?: number;
  }): Promise<CricketMatch | null> => {
    try {
      const response = await api.updateLiveState(matchId, liveState);
      return response.data;
    } catch (error: any) {
      logger.error('Error updating live state:', error);
      throw error;
    }
  }, [matchId]);

  return {
    loadMatch,
    recordBall,
    undoLastBall,
    updateLiveState,
  };
}

