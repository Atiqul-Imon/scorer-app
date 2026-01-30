'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { connectSocket, subscribeToMatch, unsubscribeFromMatch, type ScoreUpdateEvent } from '@/lib/socket';
import ScoreInput from '@/components/ui/ScoreInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
      connectSocket();
    }
  }, [isAuthenticated, authLoading, matchId, router]);

  useEffect(() => {
    if (!match || !matchId) return;

    const socket = connectSocket();
    let isSubscribed = true;

    const handleScoreUpdate = (data: ScoreUpdateEvent) => {
      if (isSubscribed && data.matchId === matchId) {
        setScore((prev) => ({
          home: data.score.home,
          away: data.score.away,
          matchNote: prev.matchNote, // Preserve existing note
        }));
      }
    };

    subscribeToMatch(matchId, handleScoreUpdate);

    // Cleanup on unmount
    return () => {
      isSubscribed = false;
      unsubscribeFromMatch(matchId);
      // Only disconnect if no other subscriptions
      if (socket) {
        socket.off('score-update', handleScoreUpdate);
      }
    };
  }, [match, matchId]);

  const loadMatch = async () => {
    try {
      const response = await api.getMatch(matchId);
      const matchData = response.data;

      setMatch(matchData);

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
      setError('Runs cannot be negative');
      return;
    }
    if (score.home.wickets < 0 || score.home.wickets > 10) {
      setError('Home team wickets must be between 0 and 10');
      return;
    }
    if (score.away.wickets < 0 || score.away.wickets > 10) {
      setError('Away team wickets must be between 0 and 10');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await api.updateScore(matchId, score);

      if (response.success) {
        // Show success message briefly
        setTimeout(() => {
          router.push(`/matches/${matchId}`);
        }, 1000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update score');
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Match not found</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-bottom">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Update Score</h1>
              <p className="text-sm text-gray-600">
                {match.teams.home.name} vs {match.teams.away.name}
              </p>
            </div>
            <Badge variant="success">Live</Badge>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6 space-y-6">
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
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {match.teams.home.name}
          </h2>
          <div className="space-y-4">
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
                className="text-center text-xl font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Away Team Score */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {match.teams.away.name}
          </h2>
          <div className="space-y-4">
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
                className="text-center text-xl font-bold"
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
        <Card className="p-4 bg-primary-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Score</p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <p className="text-xs text-gray-600">{match.teams.home.shortName}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatScore(score.home)}
                </p>
              </div>
              <span className="text-gray-400">vs</span>
              <div>
                <p className="text-xs text-gray-600">{match.teams.away.shortName}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatScore(score.away)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.back()}
            disabled={saving}
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
            className="flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Save className="w-4 h-4" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Update Score
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}




