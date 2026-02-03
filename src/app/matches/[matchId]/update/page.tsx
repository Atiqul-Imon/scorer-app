'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
// Lazy load socket.io to reduce initial bundle size
import type { ScoreUpdateEvent } from '@/lib/socket';
import AppLayout from '@/components/layout/AppLayout';
import ScoreInput from '@/components/ui/ScoreInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatScore, formatDate } from '@/lib/utils';
import { formatOvers, parseOvers } from '@/lib/utils';
import type { CricketMatch, UpdateScoreDto } from '@/types';
import { Save, Check } from 'lucide-react';

export default function UpdateScorePage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [score, setScore] = useState<UpdateScoreDto>({
    home: { runs: 0, wickets: 0, overs: 0, balls: 0 },
    away: { runs: 0, wickets: 0, overs: 0, balls: 0 },
    matchNote: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && matchId) {
      loadMatch();
    }
  }, [isAuthenticated, authLoading, matchId, router]);

  useEffect(() => {
    if (!match || !matchId) return;

    // Lazy load socket.io only when match is loaded
    let socketModule: typeof import('@/lib/socket') | null = null;
    let isSubscribed = true;

    const loadSocket = async () => {
      socketModule = await import('@/lib/socket');
      socketModule.connectSocket();

      const handleScoreUpdate = (data: ScoreUpdateEvent) => {
        if (isSubscribed && data.matchId === matchId) {
          setScore((prev) => ({
            home: data.score.home,
            away: data.score.away,
            matchNote: prev.matchNote, // Preserve existing note
          }));
        }
      };

      socketModule.subscribeToMatch(matchId, handleScoreUpdate);
    };

    loadSocket();

    // Cleanup on unmount
    return () => {
      isSubscribed = false;
      if (socketModule) {
        socketModule.unsubscribeFromMatch(matchId);
      }
    };
  }, [match, matchId]);

  const loadMatch = async () => {
    try {
      const response = await api.getMatch(matchId);
      const matchData = response.data;

      setMatch(matchData);

      // Check if match has been set up for ball-by-ball scoring
      // @ts-ignore - matchSetup may not be in type yet
      if (matchData.matchSetup?.isSetupComplete) {
        // Match is set up - redirect to live scoring page
        router.replace(`/matches/${matchId}/score`);
        return;
      }

      // Match not set up yet - check if it's a local match
      if (matchId.startsWith('LOCAL-')) {
        // For local matches, redirect to setup first
        router.replace(`/matches/${matchId}/setup`);
        return;
      }

      // For non-local matches or if setup check fails, use manual update
      // Initialize score from current match data
      if (matchData.currentScore) {
        setScore({
          home: {
            runs: matchData.currentScore.home.runs || 0,
            wickets: matchData.currentScore.home.wickets || 0,
            overs: matchData.currentScore.home.overs || 0,
            balls: matchData.currentScore.home.balls || 0,
          },
          away: {
            runs: matchData.currentScore.away.runs || 0,
            wickets: matchData.currentScore.away.wickets || 0,
            overs: matchData.currentScore.away.overs || 0,
            balls: matchData.currentScore.away.balls || 0,
          },
          matchNote: matchData.matchNote || '',
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!match) return;

    // Validation
    if (score.home.runs < 0 || score.away.runs < 0) {
      const errorMsg = 'Runs cannot be negative';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    if (score.home.wickets < 0 || score.home.wickets > 10) {
      const errorMsg = 'Home team wickets must be between 0 and 10';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }
    if (score.away.wickets < 0 || score.away.wickets > 10) {
      const errorMsg = 'Away team wickets must be between 0 and 10';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await api.updateScore(matchId, score);

      if (response.success) {
        // Update local match state with the new score
        if (response.data) {
          setMatch((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              currentScore: {
                home: response.data.currentScore?.home || score.home,
                away: response.data.currentScore?.away || score.away,
              },
              matchNote: response.data.matchNote || score.matchNote,
            };
          });
        }
        
        // Show success message
        success('Score updated successfully!');
        
        // Don't navigate away - stay on the page for continuous updates
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update score';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleOversChange = (team: 'home' | 'away', value: string) => {
    const overs = parseOvers(value);
    setScore({
      ...score,
      [team]: {
        ...score[team],
        overs,
      },
    });
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Update Score" showBack>
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
      <AppLayout title="Update Score" showBack>
        <Card className="p-8 text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">Match not found</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </AppLayout>
    );
  }

  const headerActions = (
    <Badge variant="success">Live</Badge>
  );

  return (
    <AppLayout
      title="Update Score"
      subtitle={`${match.teams.home.name} vs ${match.teams.away.name}`}
      showBack
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Match Info */}
        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-900">{match.series}</p>
            <p className="text-gray-600">
              {match.venue.name}, {match.venue.city}
            </p>
            <p className="text-gray-500">{formatDate(match.startTime)}</p>
          </div>
        </Card>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Home Team Score */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
            {match.teams.home.name}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <ScoreInput
              label="Runs"
              value={score.home.runs}
              onChange={(value) => setScore({ ...score, home: { ...score.home, runs: value } })}
              min={0}
              max={999}
            />

            <ScoreInput
              label="Wickets"
              value={score.home.wickets}
              onChange={(value) =>
                setScore({ ...score, home: { ...score.home, wickets: value } })
              }
              min={0}
              max={10}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overs</label>
              <Input
                type="number"
                step="0.1"
                value={formatOvers(score.home.overs)}
                onChange={(e) => handleOversChange('home', e.target.value)}
                placeholder="0.0"
                className="text-center text-lg sm:text-xl font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Away Team Score */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 truncate">
            {match.teams.away.name}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <ScoreInput
              label="Runs"
              value={score.away.runs}
              onChange={(value) => setScore({ ...score, away: { ...score.away, runs: value } })}
              min={0}
              max={999}
            />

            <ScoreInput
              label="Wickets"
              value={score.away.wickets}
              onChange={(value) =>
                setScore({ ...score, away: { ...score.away, wickets: value } })
              }
              min={0}
              max={10}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overs</label>
              <Input
                type="number"
                step="0.1"
                value={formatOvers(score.away.overs)}
                onChange={(e) => handleOversChange('away', e.target.value)}
                placeholder="0.0"
                className="text-center text-lg sm:text-xl font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Match Note */}
        <Card className="p-4">
          <Input
            label="Match Note (Optional)"
            type="text"
            value={score.matchNote}
            onChange={(e) => setScore({ ...score, matchNote: e.target.value })}
            placeholder="e.g., Rain delay, Power cut, etc."
          />
        </Card>

        {/* Current Score Display */}
        <Card className="p-3 sm:p-4 bg-primary-50">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Current Score</p>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{match.teams.home.shortName}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatScore(score.home)}
                </p>
              </div>
              <span className="text-gray-400 text-sm sm:text-base">vs</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate">{match.teams.away.shortName}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatScore(score.away)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3 pb-4 sm:pb-0">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.back()}
            disabled={saving}
            className="text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleUpdate}
            loading={saving}
            disabled={saving}
            className="flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {saving ? (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Saving</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Update Score</span>
                <span className="sm:hidden">Update</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}




