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
import { MapPin, Users, Edit2, Trophy, Clock, Calendar, Award, Globe, AlertCircle, PlayCircle, CheckCircle2, Power, PowerOff, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function MatchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleStatusUpdate = async (newStatus: 'upcoming' | 'live' | 'completed' | 'cancelled') => {
    if (!match) return;
    
    setUpdatingStatus(true);
    try {
      const response = await api.updateMatchStatus(matchId, newStatus);
      setMatch(response.data);
      const statusLabels: Record<string, string> = {
        'upcoming': 'Match set to upcoming',
        'live': 'Match is now live!',
        'completed': 'Match marked as completed',
        'cancelled': 'Match cancelled',
      };
      success(statusLabels[newStatus] || 'Status updated successfully');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update match status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!match) return;
    
    if (!confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteMatch(matchId);
      success('Match deleted successfully');
      router.push('/matches');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete match');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Match Details" showBack>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading match...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !match) {
    return (
      <AppLayout title="Match Details" showBack>
        <Card className="p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">{error || 'Match not found'}</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </AppLayout>
    );
  }

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';
  
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

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge variant="success" className="flex items-center gap-1.5">
          <PlayCircle className="w-3 h-3" />
          Live
        </Badge>
      );
    } else if (isCompleted) {
      return (
        <Badge variant="default" className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="info" className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Upcoming
        </Badge>
      );
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
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Status Badge & Current Score */}
        <div className="space-y-4">
          {/* Pending Status Message for Upcoming Matches */}
          {isUpcoming && isLocalMatch && (
            <Card className="p-4 bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-100 mb-1">Match is Pending</h3>
                  <p className="text-sm text-gray-300">
                    This match is currently in <strong>upcoming</strong> status. Complete the setup and start scoring when ready. 
                    You can change the status to <strong>live</strong> when the match begins.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Status Badge */}
          <div className="flex justify-center lg:justify-start">
            {getStatusBadge()}
          </div>

          {/* Current Score (if live or completed) */}
          {(isLive || isCompleted) && match.currentScore && (
            <Card className="p-6 lg:p-8 bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-gray-800 border-primary-500/30">
              <div className="text-center">
                <p className="text-xs lg:text-sm text-gray-400 mb-4 uppercase tracking-wide">Current Score</p>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-left">
                    <p className="text-xs lg:text-sm text-gray-400 mb-2 truncate">{match.teams.home.name}</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-100">
                      {formatScore(match.currentScore.home)}
                    </p>
                  </div>
                  <div className="px-2">
                    <span className="text-gray-500 text-lg lg:text-xl font-medium">VS</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs lg:text-sm text-gray-400 mb-2 truncate">{match.teams.away.name}</p>
                    <p className="text-3xl lg:text-4xl font-bold text-gray-100">
                      {formatScore(match.currentScore.away)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Two Column Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Match Information */}
            <Card className="p-6 lg:p-8 bg-gradient-to-br from-primary-500/10 to-gray-800 border-primary-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-100">Match Information</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Series/League</p>
                    <p className="text-base font-medium text-gray-100 truncate">{match.series}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Start Time</p>
                    <p className="text-base font-medium text-gray-100">{formatDate(match.startTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Format</p>
                    <p className="text-base font-medium text-gray-100">
                      {match.format.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Venue */}
            <Card className="p-6 lg:p-8 bg-gradient-to-br from-green-500/10 to-gray-800 border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-100">Venue</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-base font-semibold text-gray-100 mb-1">{match.venue.name}</p>
                  <p className="text-sm text-gray-400">
                    {match.venue.city}
                    {match.venue.country && `, ${match.venue.country}`}
                  </p>
                </div>
                {match.venue.address && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">{match.venue.address}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Teams */}
            <Card className="p-6 lg:p-8 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-100">Teams</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100 truncate">{match.teams.home.name}</p>
                    <p className="text-sm text-gray-400 truncate">{match.teams.home.shortName}</p>
                  </div>
                  {match.currentScore?.home && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xl lg:text-2xl font-bold text-gray-100">
                        {formatScore(match.currentScore.home)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center py-2">
                  <span className="text-gray-500 text-sm font-medium">VS</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100 truncate">{match.teams.away.name}</p>
                    <p className="text-sm text-gray-400 truncate">{match.teams.away.shortName}</p>
                  </div>
                  {match.currentScore?.away && (
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xl lg:text-2xl font-bold text-gray-100">
                        {formatScore(match.currentScore.away)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Location (if local match) */}
            {match.localLocation && (
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-gray-800 border-purple-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">Location Details</h2>
                </div>
                <div className="space-y-3">
                  {match.localLocation.city && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">City</p>
                        <p className="text-sm font-medium text-gray-100">{match.localLocation.city}</p>
                      </div>
                    </div>
                  )}
                  {match.localLocation.district && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">District</p>
                        <p className="text-sm font-medium text-gray-100">{match.localLocation.district}</p>
                      </div>
                    </div>
                  )}
                  {match.localLocation.area && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-1">Area</p>
                        <p className="text-sm font-medium text-gray-100">{match.localLocation.area}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* League (if applicable) */}
            {match.localLeague && (
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 to-gray-800 border-amber-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">League</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-semibold text-gray-100 mb-1">{match.localLeague.name}</p>
                    <p className="text-sm text-gray-400">
                      {match.localLeague.level} • Season {match.localLeague.season}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Match Note */}
        {match.matchNote && (
          <Card className="p-6 lg:p-8 bg-gradient-to-br from-yellow-500/10 to-gray-800 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-100 mb-2">Match Note</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{match.matchNote}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Status Management & Actions */}
        {isLocalMatch && (
          <Card className="p-6 lg:p-8 bg-gray-800/50 border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Match Management</h3>
            
            {/* Status Control Buttons */}
            <div className="space-y-4">
              {isUpcoming && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 mb-3">Change match status:</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleStatusUpdate('live')}
                      disabled={updatingStatus}
                      className="flex-1"
                    >
                      {updatingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Start Live Scoring
                        </>
                      )}
                    </Button>
                    <Link href={getScorePageUrl()} className="flex-1">
                      <Button variant="outline" size="lg" fullWidth>
                        {!isSetupComplete ? 'Complete Setup' : 'Go to Scoring'}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {isLive && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 mb-3">Match is currently live. Manage status:</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={getScorePageUrl()} className="flex-1">
                      <Button variant="primary" size="lg" fullWidth>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Continue Scoring
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleStatusUpdate('upcoming')}
                      disabled={updatingStatus}
                      className="flex-1"
                    >
                      {updatingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Stop Live
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updatingStatus}
                      className="flex-1"
                    >
                      {updatingStatus ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark Completed
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-300 mb-2">
                      <strong className="text-gray-100">Match Completed:</strong> This match has been completed and is now locked. 
                      You cannot modify or delete completed matches.
                    </p>
                  </div>
                </div>
              )}

              {/* Delete Button (only for non-completed matches) */}
              {!isCompleted && (
                <div className="pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDelete}
                    disabled={deleting || updatingStatus}
                    className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Match
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Back Button */}
              <div className="pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/matches')}
                >
                  Back to Matches
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

