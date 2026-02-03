'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { formatDate, formatScore } from '@/lib/utils';
import type { CricketMatch } from '@/types';
import { Search, RefreshCw, Inbox } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const loadMatches = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const filters: any = { limit: 50 };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await api.getScorerMatches(filters);
      setMatches(response.data.data || []);
    } catch (error) {
      logger.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => loadMatches(true)}
      disabled={refreshing}
      className="touch-target"
      aria-label="Refresh"
    >
      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
    </Button>
  );

  if (authLoading || loading) {
    return (
      <AppLayout title="My Matches">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading matches...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Matches" headerActions={headerActions}>
      <div className="space-y-4 lg:space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
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
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
            {['all', 'upcoming', 'live', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm lg:text-base font-medium whitespace-nowrap min-w-[80px] lg:min-w-[100px]
                  transition-colors touch-target
                  ${
                    statusFilter === status
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Matches List */}
        <div>
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredMatches.map((match) => (
              <Link key={match.matchId} href={`/matches/${match.matchId}`}>
                <Card variant="elevated" hover className="p-4 lg:p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-2 lg:mb-3 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base lg:text-lg text-gray-100 mb-1 truncate">
                        {match.teams.home.name} vs {match.teams.away.name}
                      </p>
                      <p className="text-sm lg:text-base text-gray-400 mb-1 truncate">{match.series}</p>
                      <p className="text-xs lg:text-sm text-gray-500 truncate">
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
                      className="ml-2 flex-shrink-0"
                    >
                      {match.status}
                    </Badge>
                  </div>

                  {match.currentScore && (
                    <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-700 flex-shrink-0">
                      <div className="flex items-center justify-between text-sm lg:text-base text-gray-300">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{match.teams.home.name}:</span>{' '}
                          {formatScore(match.currentScore.home)}
                        </div>
                        <div className="min-w-0 flex-1 text-right ml-4">
                          <span className="font-medium">{match.teams.away.name}:</span>{' '}
                          {formatScore(match.currentScore.away)}
                        </div>
                      </div>
                    </div>
                  )}

                  {match.status === 'live' && (
                    <div className="mt-3 lg:mt-4 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.preventDefault();
                          // Check if match is set up for ball-by-ball scoring
                          // @ts-ignore
                          if (match.matchSetup?.isSetupComplete) {
                            router.push(`/matches/${match.matchId}/score`);
                          } else if (match.matchId.startsWith('LOCAL-')) {
                            router.push(`/matches/${match.matchId}/setup`);
                          } else {
                            router.push(`/matches/${match.matchId}/update`);
                          }
                        }}
                        className="text-sm lg:text-base"
                      >
                        {/* @ts-ignore */}
                        {match.matchSetup?.isSetupComplete ? 'Live Score' : match.matchId.startsWith('LOCAL-') ? 'Setup Match' : 'Update Score'}
                      </Button>
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Inbox className="w-12 h-12 text-gray-400" />}
            title={searchQuery ? 'No matches found' : 'No matches yet'}
            description={
              searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start scoring by creating your first match'
            }
            action={
              !searchQuery
                ? {
                    label: 'Create Your First Match',
                    onClick: () => router.push('/matches/create'),
                  }
                : undefined
            }
          />
        )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <AppLayout title="My Matches">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    }>
      <MatchesContent />
    </Suspense>
  );
}

