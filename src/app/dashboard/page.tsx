'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { CricketMatch } from '@/types';
import { Plus, TrendingUp, Calendar, Award } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    accuracy: 100,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [matchesResponse] = await Promise.all([
        api.getScorerMatches({ limit: 10 }),
      ]);

      const matchesData = matchesResponse.data.data || [];
      setMatches(matchesData);

      // Calculate stats
      const active = matchesData.filter((m) => m.status === 'live').length;
      const completed = matchesData.filter((m) => m.status === 'completed').length;
      const accuracy = user?.scorerProfile?.accuracyScore || 100;

      setStats({
        total: matchesData.length,
        active,
        completed,
        accuracy,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.scorerProfile?.accuracyScore]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, loadData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeMatches = matches.filter((m) => m.status === 'live');
  const recentMatches = matches.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-bottom">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || 'Scorer'}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/matches/create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Match</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Matches</span>
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completed</span>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Accuracy</span>
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
                  <Card className="p-4 hover:shadow-md transition-shadow">
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
                  <Card className="p-4 hover:shadow-md transition-shadow">
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
              <Card className="p-8 text-center">
                <p className="text-gray-600 mb-4">No matches yet</p>
                <Button variant="primary" onClick={() => router.push('/matches/create')}>
                  Create Your First Match
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="container-mobile">
          <nav className="flex items-center justify-around py-2">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1 px-4 py-2 text-primary-600"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link
              href="/matches"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Matches</span>
            </Link>
            <Link
              href="/matches/create"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Create</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <Award className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}




