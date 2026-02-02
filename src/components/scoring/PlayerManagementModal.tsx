'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

interface Player {
  id: string;
  name: string;
}

interface PlayerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (homePlayers: Player[], awayPlayers: Player[]) => Promise<void>;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
}

export default function PlayerManagementModal({
  isOpen,
  onClose,
  onSave,
  homePlayers: initialHomePlayers,
  awayPlayers: initialAwayPlayers,
  homeTeamName,
  awayTeamName,
}: PlayerManagementModalProps) {
  const [homePlayers, setHomePlayers] = useState<Player[]>(initialHomePlayers);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>(initialAwayPlayers);
  const [editingPlayer, setEditingPlayer] = useState<{ team: 'home' | 'away'; playerId: string } | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHomePlayers([...initialHomePlayers]);
      setAwayPlayers([...initialAwayPlayers]);
    }
  }, [isOpen, initialHomePlayers, awayPlayers]);

  if (!isOpen) return null;

  const handleEditPlayer = (team: 'home' | 'away', playerId: string) => {
    const player = (team === 'home' ? homePlayers : awayPlayers).find((p) => p.id === playerId);
    if (player) {
      setEditingPlayer({ team, playerId });
      setNewPlayerName(player.name);
    }
  };

  const handleSavePlayer = (team: 'home' | 'away', playerId: string) => {
    if (!newPlayerName.trim()) {
      alert('Player name cannot be empty');
      return;
    }

    if (team === 'home') {
      setHomePlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, name: newPlayerName.trim() } : p))
      );
    } else {
      setAwayPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, name: newPlayerName.trim() } : p))
      );
    }
    setEditingPlayer(null);
    setNewPlayerName('');
  };

  const handleAddPlayer = (team: 'home' | 'away') => {
    if (!newPlayerName.trim()) {
      alert('Please enter player name');
      return;
    }

    const newId = team === 'home' ? `h${Date.now()}` : `a${Date.now()}`;
    const newPlayer: Player = { id: newId, name: newPlayerName.trim() };

    if (team === 'home') {
      setHomePlayers((prev) => [...prev, newPlayer]);
    } else {
      setAwayPlayers((prev) => [...prev, newPlayer]);
    }
    setNewPlayerName('');
  };

  const handleDeletePlayer = (team: 'home' | 'away', playerId: string) => {
    if (!confirm('Are you sure you want to remove this player?')) return;

    if (team === 'home') {
      setHomePlayers((prev) => prev.filter((p) => p.id !== playerId));
    } else {
      setAwayPlayers((prev) => prev.filter((p) => p.id !== playerId));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(homePlayers, awayPlayers);
      onClose();
    } catch (error) {
      console.error('Error saving players:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderPlayerList = (team: 'home' | 'away', players: Player[]) => {
    const teamName = team === 'home' ? homeTeamName : awayTeamName;
    const isEditing = (playerId: string) =>
      editingPlayer?.team === team && editingPlayer?.playerId === playerId;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{teamName}</h3>
          <div className="flex items-center gap-2">
            <Input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="New player name"
              className="text-sm w-32"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddPlayer(team);
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddPlayer(team)}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {players.map((player) => {
            if (isEditing(player.id)) {
              return (
                <div key={player.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="flex-1 text-sm"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSavePlayer(team, player.id);
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSavePlayer(team, player.id)}
                    className="text-xs"
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
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              );
            }
            return (
              <div key={player.id} className="flex items-center justify-between p-2 border rounded-lg">
                <span className="text-sm font-medium">{player.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditPlayer(team, player.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-primary-600" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(team, player.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 safe-area">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Manage Players</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg touch-target"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderPlayerList('home', homePlayers)}
              {renderPlayerList('away', awayPlayers)}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" size="lg" fullWidth onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="lg" fullWidth onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

