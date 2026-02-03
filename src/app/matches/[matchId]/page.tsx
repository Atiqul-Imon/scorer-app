'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
// Lazy load socket.io to reduce initial bundle size
import type { ScoreUpdateEvent } from '@/lib/socket';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatScore, formatDate } from '@/lib/utils';
import type { CricketMatch } from '@/types';
import { MapPin, Users, Edit2, Trophy, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function MatchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setMatch((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              currentScore: data.score,
            };
          });
        }
      };

      socketModule.subscribeToMatch(matchId, handleScoreUpdate);
    };

    loadSocket();

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
      setMatch(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Match Details" showBack>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading match...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !match) {
    return (
      <AppLayout title="Match Details" showBack>
        <Card className="p-8 text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">{error || 'Match not found'}</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </AppLayout>
    );
  }

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  
  // Determine which page to link to based on match setup
  // @ts-ignore - matchSetup may not be in type yet
  const isSetupComplete = match.matchSetup?.isSetupComplete;
  const isLocalMatch = matchId.startsWith('LOCAL-');
  
  const getScorePageUrl = () => {
    if (isLocalMatch && !isSetupComplete) {
      return `/matches/${matchId}/setup`;
    } else if (isLocalMatch && isSetupComplete) {
      return `/matches/${matchId}/score`;
    } else {
      return `/matches/${matchId}/update`;
    }
  };

  const headerActions = isLive ? (
    <Link href={getScorePageUrl()}>
      <Button variant="primary" size="sm" className="flex items-center gap-1.5 touch-target">
        <Edit2 className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isLocalMatch && !isSetupComplete ? 'Setup' : isLocalMatch && isSetupComplete ? 'Score' : 'Update'}
        </span>
        <span className="sm:hidden">
          {isLocalMatch && !isSetupComplete ? 'Setup' : isLocalMatch && isSetupComplete ? 'Score' : 'Update'}
        </span>
      </Button>
    </Link>
  ) : null;

  return (
    <AppLayout
      title={`${match.teams.home.name} vs ${match.teams.away.name}`}
      subtitle={match.series}
      showBack
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Current Score (if live or completed) */}
        {(isLive || isCompleted) && match.currentScore && (
          <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-4">Current Score</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <p className="text-sm text-gray-600 mb-1">{match.teams.home.name}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatScore(match.currentScore.home)}
                    </p>
                  </div>
                  <div className="px-4">
                    <span className="text-gray-400 text-xl">vs</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-sm text-gray-600 mb-1">{match.teams.away.name}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatScore(match.currentScore.away)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Match Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-600" />
            Match Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Series/League</p>
                <p className="text-base font-medium text-gray-900">{match.series}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="text-base font-medium text-gray-900">{formatDate(match.startTime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Format</p>
                <p className="text-base font-medium text-gray-900">
                  {match.format.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Teams */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Teams
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{match.teams.home.name}</p>
                <p className="text-sm text-gray-600">{match.teams.home.shortName}</p>
              </div>
              {match.currentScore?.home && (
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {formatScore(match.currentScore.home)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{match.teams.away.name}</p>
                <p className="text-sm text-gray-600">{match.teams.away.shortName}</p>
              </div>
              {match.currentScore?.away && (
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {formatScore(match.currentScore.away)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Venue */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Venue
          </h2>
          <div className="space-y-2">
            <p className="text-base font-medium text-gray-900">{match.venue.name}</p>
            <p className="text-sm text-gray-600">
              {match.venue.city}
              {match.venue.country && `, ${match.venue.country}`}
            </p>
            {match.venue.address && (
              <p className="text-sm text-gray-500">{match.venue.address}</p>
            )}
          </div>
        </Card>

        {/* Location (if local match) */}
        {match.localLocation && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h2>
            <div className="space-y-2">
              {match.localLocation.city && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">City:</span> {match.localLocation.city}
                </p>
              )}
              {match.localLocation.district && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">District:</span> {match.localLocation.district}
                </p>
              )}
              {match.localLocation.area && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Area:</span> {match.localLocation.area}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* League (if applicable) */}
        {match.localLeague && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">League</h2>
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-900">{match.localLeague.name}</p>
              <p className="text-sm text-gray-600">
                {match.localLeague.level} • Season {match.localLeague.season}
              </p>
            </div>
          </Card>
        )}

        {/* Match Note */}
        {match.matchNote && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Match Note</h3>
            <p className="text-sm text-gray-700">{match.matchNote}</p>
          </Card>
        )}

        {/* Actions */}
        {!isLive && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.push('/matches')}
          >
            Back to Matches
          </Button>
        )}
      </div>
    </AppLayout>
  );
}

