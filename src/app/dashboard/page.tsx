'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { CricketMatch } from '@/types';
import { TrendingUp, Calendar, Award, RefreshCw, Inbox } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    accuracy: 100,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [matchesResponse] = await Promise.all([
        api.getScorerMatches({ limit: 50 }), // Get more matches to filter
      ]);

      // Filter to show only matches assigned to this scorer
      const allMatches = matchesResponse.data.data || [];
      const assignedMatches = allMatches.filter((m: CricketMatch) => {
        // Only show matches created by this scorer
        return m.scorerInfo?.scorerId === user?.scorerProfile?.scorerId;
      });
      
      setMatches(assignedMatches);

      // Calculate stats
      const active = assignedMatches.filter((m) => m.status === 'live').length;
      const completed = assignedMatches.filter((m) => m.status === 'completed').length;
      const accuracy = user?.scorerProfile?.accuracyScore || 100;

      setStats({
        total: assignedMatches.length,
        active,
        completed,
        accuracy,
      });
    } catch (error) {
      logger.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.scorerProfile?.accuracyScore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeMatches = matches.filter((m) => m.status === 'live');
  const recentMatches = matches.slice(0, 5);

  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => loadData(true)}
      disabled={refreshing}
      className="touch-target"
      aria-label="Refresh"
    >
      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
    </Button>
  );

  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle={`Welcome back, ${user?.name || 'Scorer'}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.name || 'Scorer'}`}
      headerActions={headerActions}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card variant="elevated" className="p-4 lg:p-6 bg-gradient-to-br from-primary-500/10 to-gray-800 border-primary-500/20">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-sm lg:text-base text-gray-300 font-medium">Total Matches</span>
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-primary-400" />
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-100">{stats.total}</p>
          </Card>

          <Card variant="elevated" className="p-4 lg:p-6 bg-gradient-to-br from-green-500/10 to-gray-800 border-green-500/20">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-sm lg:text-base text-gray-300 font-medium">Active</span>
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-100">{stats.active}</p>
          </Card>

          <Card variant="elevated" className="p-4 lg:p-6 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-sm lg:text-base text-gray-300 font-medium">Completed</span>
              <Award className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-100">{stats.completed}</p>
          </Card>

          <Card variant="elevated" className="p-4 lg:p-6 bg-gradient-to-br from-purple-500/10 to-gray-800 border-purple-500/20">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-sm lg:text-base text-gray-300 font-medium">Accuracy</span>
              <Badge variant="success" className="text-xs lg:text-sm">{stats.accuracy}%</Badge>
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-100">{stats.accuracy}%</p>
          </Card>
        </div>

        {/* Active Matches */}
        {activeMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-100">Active Matches</h2>
              <Link
                href="/matches?status=live"
                className="text-sm lg:text-base text-primary-400 font-medium hover:text-primary-300 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {activeMatches.map((match) => (
                <Link key={match.matchId} href={`/matches/${match.matchId}/update`}>
                  <Card variant="elevated" hover className="p-4 lg:p-6 h-full">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base lg:text-lg text-gray-100 truncate">
                          {match.teams.home.name} vs {match.teams.away.name}
                        </p>
                        <p className="text-sm lg:text-base text-gray-400 truncate">{match.venue.name}</p>
                      </div>
                      <Badge variant="success" className="ml-2 flex-shrink-0">Live</Badge>
                    </div>
                    {match.currentScore && (
                      <div className="mt-2 lg:mt-3 text-sm lg:text-base text-gray-300">
                        <span className="font-medium">
                          {match.currentScore.home.runs}/{match.currentScore.home.wickets}
                        </span>
                        {' - '}
                        <span className="font-medium">
                          {match.currentScore.away.runs}/{match.currentScore.away.wickets}
                        </span>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches */}
        <div>
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-100">Recent Matches</h2>
            <Link
              href="/matches"
              className="text-sm lg:text-base text-primary-400 font-medium hover:text-primary-300 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                  <Card variant="elevated" hover className="p-4 lg:p-6 h-full">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base lg:text-lg text-gray-100 truncate">
                          {match.teams.home.name} vs {match.teams.away.name}
                        </p>
                        <p className="text-sm lg:text-base text-gray-400 truncate">
                          {match.venue.name} • {formatDate(match.startTime)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          match.status === 'live'
                            ? 'success'
                            : match.status === 'completed'
                            ? 'default'
                            : 'info'
                        }
                        className="ml-2 flex-shrink-0"
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <EmptyState
                icon={<Inbox className="w-12 h-12 text-gray-400" />}
                title="No matches yet"
                description="Start scoring by creating your first match"
                action={{
                  label: 'Create Your First Match',
                  onClick: () => router.push('/matches/create'),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}




