'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
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
      console.error('Failed to load dashboard data:', error);
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
            <p className="text-gray-600">Loading dashboard...</p>
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
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="elevated" className="p-4 bg-gradient-to-br from-primary-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Matches</span>
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </Card>

          <Card variant="elevated" className="p-4 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Active</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </Card>

          <Card variant="elevated" className="p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Completed</span>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </Card>

          <Card variant="elevated" className="p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Accuracy</span>
              <Badge variant="success">{stats.accuracy}%</Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
          </Card>
        </div>

        {/* Active Matches */}
        {activeMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Matches</h2>
              <Link
                href="/matches?status=live"
                className="text-sm text-primary-600 font-medium hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {activeMatches.map((match) => (
                <Link key={match.matchId} href={`/matches/${match.matchId}/update`}>
                  <Card variant="elevated" hover className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {match.teams.home.name} vs {match.teams.away.name}
                        </p>
                        <p className="text-sm text-gray-600">{match.venue.name}</p>
                      </div>
                      <Badge variant="success">Live</Badge>
                    </div>
                    {match.currentScore && (
                      <div className="mt-2 text-sm text-gray-700">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
            <Link
              href="/matches"
              className="text-sm text-primary-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                  <Card variant="elevated" hover className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {match.teams.home.name} vs {match.teams.away.name}
                        </p>
                        <p className="text-sm text-gray-600">
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




