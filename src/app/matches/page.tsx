'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { formatDate, formatScore } from '@/lib/utils';
import type { CricketMatch } from '@/types';
import { Plus, Search, Filter } from 'lucide-react';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadMatches();
    }
  }, [isAuthenticated, authLoading, statusFilter, router]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const filters: any = { limit: 50 };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await api.getScorerMatches(filters);
      setMatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      match.teams.home.name.toLowerCase().includes(query) ||
      match.teams.away.name.toLowerCase().includes(query) ||
      match.venue.name.toLowerCase().includes(query) ||
      match.series.toLowerCase().includes(query)
    );
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-bottom">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 safe-top">
        <div className="container-mobile py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">My Matches</h1>
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {['all', 'upcoming', 'live', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-w-[80px]
                  transition-colors
                  ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="container-mobile py-6">
        {filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches.map((match) => (
              <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {match.teams.home.name} vs {match.teams.away.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">{match.series}</p>
                      <p className="text-xs text-gray-500">
                        {match.venue.name}, {match.venue.city} • {formatDate(match.startTime)}
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

                  {match.currentScore && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{match.teams.home.name}:</span>{' '}
                          {formatScore(match.currentScore.home)}
                        </div>
                        <div>
                          <span className="font-medium">{match.teams.away.name}:</span>{' '}
                          {formatScore(match.currentScore.away)}
                        </div>
                      </div>
                    </div>
                  )}

                  {match.status === 'live' && (
                    <div className="mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/matches/${match.matchId}/update`);
                        }}
                      >
                        Update Score
                      </Button>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'No matches found' : 'No matches yet'}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={() => router.push('/matches/create')}>
                Create Your First Match
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="container-mobile">
          <nav className="flex items-center justify-around py-2">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link
              href="/matches"
              className="flex flex-col items-center gap-1 px-4 py-2 text-primary-600"
            >
              <span className="text-xs font-medium">Matches</span>
            </Link>
            <Link
              href="/matches/create"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <span className="text-xs">Create</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 px-4 py-2 text-gray-600"
            >
              <span className="text-xs">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <MatchesContent />
    </Suspense>
  );
}

