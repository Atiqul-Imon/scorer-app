'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import type { CricketMatch } from '@/types';
import { Check, X, Users, Trophy, UserPlus, Edit2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  role?: string;
}

interface SetupState {
  step: 'teams' | 'playingXI' | 'toss' | 'openers' | 'bowler';
  homePlayingXI: Player[];
  awayPlayingXI: Player[];
  tossWinner?: 'home' | 'away';
  tossDecision?: 'bat' | 'bowl';
  openingBatter1Id?: string;
  openingBatter2Id?: string;
  firstBowlerId?: string;
}

export default function MatchSetupPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();

  const [match, setMatch] = useState<CricketMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [setupState, setSetupState] = useState<SetupState>({
    step: 'teams',
    homePlayingXI: [],
    awayPlayingXI: [],
  });

  // Temporary player lists (in real app, these would come from team rosters)
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<{ team: 'home' | 'away'; playerId: string } | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState<{ team: 'home' | 'away' } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && matchId) {
      loadMatch();
    }
  }, [isAuthenticated, authLoading, matchId, router]);

  const loadMatch = async () => {
    try {
      const response = await api.getMatch(matchId);
      const matchData = response.data;
      setMatch(matchData);

      // Initialize player lists - start with empty, user will add players
      // Minimum 11 slots, but user can add more
      const initialHomePlayers: Player[] = Array.from({ length: 11 }, (_, i) => ({
        id: `h${i + 1}`,
        name: '',
      }));
      const initialAwayPlayers: Player[] = Array.from({ length: 11 }, (_, i) => ({
        id: `a${i + 1}`,
        name: '',
      }));
      
      setHomePlayers(initialHomePlayers);
      setAwayPlayers(initialAwayPlayers);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerNameEdit = (team: 'home' | 'away', playerId: string, newName: string) => {
    const trimmedName = newName.trim();
    if (team === 'home') {
      setHomePlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, name: trimmedName } : p))
      );
      // Also update in playing XI if player is selected
      setSetupState((prev) => ({
        ...prev,
        homePlayingXI: prev.homePlayingXI.map((p) => (p.id === playerId ? { ...p, name: trimmedName } : p)),
      }));
    } else {
      setAwayPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, name: trimmedName } : p))
      );
      // Also update in playing XI if player is selected
      setSetupState((prev) => ({
        ...prev,
        awayPlayingXI: prev.awayPlayingXI.map((p) => (p.id === playerId ? { ...p, name: trimmedName } : p)),
      }));
    }
    setEditingPlayer(null);
    setNewPlayerName('');
  };

  const handleAddPlayer = (team: 'home' | 'away') => {
    if (!newPlayerName.trim()) {
      showError('Please enter player name');
      return;
    }
    
    const newId = team === 'home' ? `h${homePlayers.length + 1}` : `a${awayPlayers.length + 1}`;
    const newPlayer: Player = { id: newId, name: newPlayerName.trim() };
    
    if (team === 'home') {
      setHomePlayers((prev) => [...prev, newPlayer]);
    } else {
      setAwayPlayers((prev) => [...prev, newPlayer]);
    }
    
    setNewPlayerName('');
    setShowAddPlayer(null);
  };

  const handlePlayerToggle = (team: 'home' | 'away', playerId: string) => {
    const player = (team === 'home' ? homePlayers : awayPlayers).find((p) => p.id === playerId);
    if (!player || !player.name.trim()) {
      // If player has no name, start editing
      setEditingPlayer({ team, playerId });
      setNewPlayerName(player?.name || '');
      return;
    }

    setSetupState((prev) => {
      const teamKey = team === 'home' ? 'homePlayingXI' : 'awayPlayingXI';
      const currentXI = prev[teamKey];
      const isSelected = currentXI.some((p) => p.id === playerId);

      if (isSelected) {
        return {
          ...prev,
          [teamKey]: currentXI.filter((p) => p.id !== playerId),
        };
      } else {
        if (currentXI.length >= 11) {
          showError('Maximum 11 players allowed');
          return prev;
        }
        return {
          ...prev,
          [teamKey]: [...currentXI, player],
        };
      }
    });
  };

  const handleNext = () => {
    if (setupState.step === 'teams') {
      // Check that all selected players have names
      const homePlayersWithNames = setupState.homePlayingXI.filter((p) => p.name.trim());
      const awayPlayersWithNames = setupState.awayPlayingXI.filter((p) => p.name.trim());
      
      if (homePlayersWithNames.length !== 11 || awayPlayersWithNames.length !== 11) {
        showError('Please select exactly 11 players with names for each team');
        return;
      }
      
      // Ensure all selected players have names
      if (setupState.homePlayingXI.some((p) => !p.name.trim()) || setupState.awayPlayingXI.some((p) => !p.name.trim())) {
        showError('All selected players must have names');
        return;
      }
      
      setSetupState((prev) => ({ ...prev, step: 'toss' }));
    } else if (setupState.step === 'toss') {
      if (!setupState.tossWinner || !setupState.tossDecision) {
        showError('Please select toss winner and decision');
        return;
      }
      setSetupState((prev) => ({ ...prev, step: 'openers' }));
    } else if (setupState.step === 'openers') {
      if (!setupState.openingBatter1Id || !setupState.openingBatter2Id) {
        showError('Please select both opening batters');
        return;
      }
      setSetupState((prev) => ({ ...prev, step: 'bowler' }));
    }
  };

  const handleBack = () => {
    if (setupState.step === 'toss') {
      setSetupState((prev) => ({ ...prev, step: 'teams' }));
    } else if (setupState.step === 'openers') {
      setSetupState((prev) => ({ ...prev, step: 'toss' }));
    } else if (setupState.step === 'bowler') {
      setSetupState((prev) => ({ ...prev, step: 'openers' }));
    }
  };

  const handleComplete = async () => {
    if (!setupState.firstBowlerId) {
      showError('Please select first bowler');
      return;
    }

    setSaving(true);
    try {
      const setupData = {
        matchId,
        homePlayingXI: setupState.homePlayingXI,
        awayPlayingXI: setupState.awayPlayingXI,
        toss: {
          winner: setupState.tossWinner!,
          decision: setupState.tossDecision!,
        },
        openingBatter1Id: setupState.openingBatter1Id!,
        openingBatter2Id: setupState.openingBatter2Id!,
        firstBowlerId: setupState.firstBowlerId,
      };

      await api.completeMatchSetup(matchId, setupData);
      success('Match setup completed!');
      router.push(`/matches/${matchId}/score`);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to complete setup');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Match Setup" showBack>
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
      <AppLayout title="Match Setup" showBack>
        <Card className="p-8 text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">Match not found</p>
          <Button variant="primary" onClick={() => router.push('/matches')}>
            Go to Matches
          </Button>
        </Card>
      </AppLayout>
    );
  }

  const battingTeam = setupState.tossDecision === 'bat' ? setupState.tossWinner : setupState.tossWinner === 'home' ? 'away' : 'home';
  const availableBatters = battingTeam === 'home' ? setupState.homePlayingXI : setupState.awayPlayingXI;
  const availableBowlers = battingTeam === 'home' ? setupState.awayPlayingXI : setupState.homePlayingXI;

  return (
    <AppLayout title="Match Setup" showBack>
      <div className="space-y-6 pb-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between px-2">
          {['teams', 'toss', 'openers', 'bowler'].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  setupState.step === step
                    ? 'bg-primary-600 text-white'
                    : ['teams', 'toss', 'openers', 'bowler'].indexOf(setupState.step) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600',
                )}
              >
                {['teams', 'toss', 'openers', 'bowler'].indexOf(setupState.step) > index ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    ['teams', 'toss', 'openers', 'bowler'].indexOf(setupState.step) > index
                      ? 'bg-green-600'
                      : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Playing XI */}
        {setupState.step === 'teams' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Playing XI
              </h2>

              {/* Home Team */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {match.teams.home.name} ({setupState.homePlayingXI.length}/11)
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddPlayer({ team: 'home' });
                      setNewPlayerName('');
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded touch-target"
                  >
                    <Plus className="w-3 h-3" />
                    Add Player
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {homePlayers.map((player) => {
                    const isSelected = setupState.homePlayingXI.some((p) => p.id === player.id);
                    const isEditing = editingPlayer?.team === 'home' && editingPlayer?.playerId === player.id;
                    
                    if (isEditing) {
                      return (
                        <div key={player.id} className="p-2 border-2 border-primary-600 rounded-lg bg-primary-50">
                          <Input
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Enter player name"
                            className="text-sm mb-2"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePlayerNameEdit('home', player.id, newPlayerName)}
                              className="flex-1 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPlayer(null);
                                setNewPlayerName('');
                              }}
                              className="flex-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerToggle('home', player.id)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-all touch-target relative',
                          isSelected
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : player.name
                            ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            : 'border-dashed border-gray-300 bg-gray-50 text-gray-400',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {player.name || 'Tap to add player'}
                          </span>
                          <div className="flex items-center gap-1">
                            {player.name && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlayer({ team: 'home', playerId: player.id });
                                  setNewPlayerName(player.name);
                                }}
                                className="p-1 hover:bg-primary-100 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-primary-600" />
                              </button>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Add Player Input */}
                {showAddPlayer?.team === 'home' && (
                  <div className="mt-2 p-3 border-2 border-primary-600 rounded-lg bg-primary-50">
                    <Input
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      className="text-sm mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddPlayer('home')}
                        className="flex-1 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddPlayer(null);
                          setNewPlayerName('');
                        }}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {match.teams.away.name} ({setupState.awayPlayingXI.length}/11)
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddPlayer({ team: 'away' });
                      setNewPlayerName('');
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded touch-target"
                  >
                    <Plus className="w-3 h-3" />
                    Add Player
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {awayPlayers.map((player) => {
                    const isSelected = setupState.awayPlayingXI.some((p) => p.id === player.id);
                    const isEditing = editingPlayer?.team === 'away' && editingPlayer?.playerId === player.id;
                    
                    if (isEditing) {
                      return (
                        <div key={player.id} className="p-2 border-2 border-primary-600 rounded-lg bg-primary-50">
                          <Input
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            placeholder="Enter player name"
                            className="text-sm mb-2"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePlayerNameEdit('away', player.id, newPlayerName)}
                              className="flex-1 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingPlayer(null);
                                setNewPlayerName('');
                              }}
                              className="flex-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerToggle('away', player.id)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-all touch-target relative',
                          isSelected
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : player.name
                            ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            : 'border-dashed border-gray-300 bg-gray-50 text-gray-400',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {player.name || 'Tap to add player'}
                          </span>
                          <div className="flex items-center gap-1">
                            {player.name && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlayer({ team: 'away', playerId: player.id });
                                  setNewPlayerName(player.name);
                                }}
                                className="p-1 hover:bg-primary-100 rounded"
                              >
                                <Edit2 className="w-3 h-3 text-primary-600" />
                              </button>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Add Player Input */}
                {showAddPlayer?.team === 'away' && (
                  <div className="mt-2 p-3 border-2 border-primary-600 rounded-lg bg-primary-50">
                    <Input
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      className="text-sm mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddPlayer('away')}
                        className="flex-1 text-xs"
                      >
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddPlayer(null);
                          setNewPlayerName('');
                        }}
                        className="flex-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onClick={handleNext} 
              disabled={
                setupState.homePlayingXI.length !== 11 || 
                setupState.awayPlayingXI.length !== 11 ||
                setupState.homePlayingXI.some((p) => !p?.name || typeof p.name !== 'string' || !p.name.trim()) ||
                setupState.awayPlayingXI.some((p) => !p?.name || typeof p.name !== 'string' || !p.name.trim())
              }
            >
              Next: Toss
            </Button>
          </div>
        )}

        {/* Step 2: Toss */}
        {setupState.step === 'toss' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Toss Result
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSetupState((prev) => ({ ...prev, tossWinner: 'home' }))}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all touch-target',
                        setupState.tossWinner === 'home'
                          ? 'border-primary-600 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                      )}
                    >
                      <p className="font-semibold">{match.teams.home.name}</p>
                    </button>
                    <button
                      onClick={() => setSetupState((prev) => ({ ...prev, tossWinner: 'away' }))}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all touch-target',
                        setupState.tossWinner === 'away'
                          ? 'border-primary-600 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                      )}
                    >
                      <p className="font-semibold">{match.teams.away.name}</p>
                    </button>
                  </div>
                </div>

                {setupState.tossWinner && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSetupState((prev) => ({ ...prev, tossDecision: 'bat' }))}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all touch-target',
                          setupState.tossDecision === 'bat'
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        )}
                      >
                        <p className="font-semibold">Bat</p>
                      </button>
                      <button
                        onClick={() => setSetupState((prev) => ({ ...prev, tossDecision: 'bowl' }))}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all touch-target',
                          setupState.tossDecision === 'bowl'
                            ? 'border-primary-600 bg-primary-50 text-primary-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                        )}
                      >
                        <p className="font-semibold">Bowl</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" fullWidth onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleNext} disabled={!setupState.tossWinner || !setupState.tossDecision}>
                Next: Opening Batters
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Opening Batters */}
        {setupState.step === 'openers' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Select Opening Batters
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {battingTeam === 'home' ? match.teams.home.name : match.teams.away.name} will bat first
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Striker (Batter 1)</label>
                  <select
                    value={setupState.openingBatter1Id || ''}
                    onChange={(e) => setSetupState((prev) => ({ ...prev, openingBatter1Id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  >
                    <option value="">Select batter</option>
                    {availableBatters
                      .filter((p) => p.id !== setupState.openingBatter2Id)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Non-Striker (Batter 2)</label>
                  <select
                    value={setupState.openingBatter2Id || ''}
                    onChange={(e) => setSetupState((prev) => ({ ...prev, openingBatter2Id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  >
                    <option value="">Select batter</option>
                    {availableBatters
                      .filter((p) => p.id !== setupState.openingBatter1Id)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" fullWidth onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleNext} disabled={!setupState.openingBatter1Id || !setupState.openingBatter2Id}>
                Next: First Bowler
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: First Bowler */}
        {setupState.step === 'bowler' && (
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Select First Bowler
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {battingTeam === 'home' ? match.teams.away.name : match.teams.home.name} will bowl first
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bowler</label>
                <select
                  value={setupState.firstBowlerId || ''}
                  onChange={(e) => setSetupState((prev) => ({ ...prev, firstBowlerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">Select bowler</option>
                  {availableBowlers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" fullWidth onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleComplete} disabled={!setupState.firstBowlerId || saving}>
                {saving ? 'Completing...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}



