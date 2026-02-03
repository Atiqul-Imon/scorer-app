'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Globe, 
  Award, 
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
// Removed date-fns dependency - using native Date methods

export default function CreateMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    series: '',
    format: 't20' as 't20' | 'odi' | 'test' | 'first-class' | 'list-a',
    startTime: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    })(),
    venueName: '',
    venueCity: user?.scorerProfile?.location?.city || '',
    venueAddress: '',
    teamHome: '',
    teamAway: '',
    leagueName: '',
    leagueLevel: 'club' as 'national' | 'state' | 'district' | 'city' | 'ward' | 'club',
    leagueSeason: new Date().getFullYear().toString(),
    country: 'Bangladesh',
    city: user?.scorerProfile?.location?.city || '',
    district: user?.scorerProfile?.location?.district || '',
    area: user?.scorerProfile?.location?.area || '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.series.trim()) newErrors.series = 'Series/League name is required';
    if (!formData.venueName.trim()) newErrors.venueName = 'Venue name is required';
    if (!formData.venueCity.trim()) newErrors.venueCity = 'City is required';
    if (!formData.teamHome.trim()) newErrors.teamHome = 'Home team name is required';
    if (!formData.teamAway.trim()) newErrors.teamAway = 'Away team name is required';
    if (formData.teamHome === formData.teamAway) {
      newErrors.teamAway = 'Teams must be different';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const matchData = {
        series: formData.series,
        format: formData.format,
        startTime: new Date(formData.startTime).toISOString(),
        venue: {
          name: formData.venueName,
          city: formData.venueCity,
          address: formData.venueAddress || undefined,
        },
        teams: {
          home: formData.teamHome,
          away: formData.teamAway,
        },
        league: formData.leagueName
          ? {
              id: `league-${Date.now()}`,
              name: formData.leagueName,
              level: formData.leagueLevel,
              season: formData.leagueSeason,
              year: parseInt(formData.leagueSeason),
            }
          : undefined,
        location: {
          country: formData.country,
          city: formData.city,
          district: formData.district || undefined,
          area: formData.area || undefined,
        },
      };

      const response = await api.createMatch(matchData);

      if (response.success) {
        success('Match created successfully! It is currently in pending status. Complete the setup and start scoring when ready.');
        setTimeout(() => {
          router.push(`/matches/${response.data.matchId}`);
        }, 500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create match. Please try again.';
      setErrors({ submit: errorMessage });
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Create New Match" showBack>
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Error Message */}
          {errors.submit && (
            <Card className="p-4 bg-red-900/20 border-red-700/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-300">{errors.submit}</p>
                </div>
              </div>
            </Card>
          )}

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
                  <Input
                    label="Series/League Name"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    error={errors.series}
                    required
                    placeholder="e.g., Local Cricket League 2026"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Format <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          format: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-3 text-base rounded-lg bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] transition-colors"
                    >
                      <option value="t20" className="bg-gray-800">T20</option>
                      <option value="odi" className="bg-gray-800">ODI</option>
                      <option value="test" className="bg-gray-800">Test</option>
                      <option value="first-class" className="bg-gray-800">First-Class</option>
                      <option value="list-a" className="bg-gray-800">List-A</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Start Date & Time <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      error={errors.startTime}
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Teams */}
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">Teams</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Home Team"
                    value={formData.teamHome}
                    onChange={(e) => setFormData({ ...formData, teamHome: e.target.value })}
                    error={errors.teamHome}
                    required
                    placeholder="Team A"
                  />

                  <div className="flex items-center justify-center py-2">
                    <span className="text-gray-400 text-sm font-medium">VS</span>
                  </div>

                  <Input
                    label="Away Team"
                    value={formData.teamAway}
                    onChange={(e) => setFormData({ ...formData, teamAway: e.target.value })}
                    error={errors.teamAway}
                    required
                    placeholder="Team B"
                  />
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
                <div className="space-y-4">
                  <Input
                    label="Venue Name"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    error={errors.venueName}
                    required
                    placeholder="e.g., Local Cricket Ground"
                  />

                  <Input
                    label="City"
                    value={formData.venueCity}
                    onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                    error={errors.venueCity}
                    required
                  />

                  <Input
                    label="Address (Optional)"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:space-y-8">
              {/* Location */}
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-gray-800 border-purple-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">Location</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />

                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />

                  <Input
                    label="District (Optional)"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />

                  <Input
                    label="Area/Neighborhood (Optional)"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>
              </Card>

              {/* League (Optional) */}
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 to-gray-800 border-amber-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-100">League (Optional)</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    label="League Name"
                    value={formData.leagueName}
                    onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
                    placeholder="Leave empty if not part of a league"
                    helperText="Fill this if the match is part of an organized league"
                  />

                  {formData.leagueName && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                          League Level
                        </label>
                        <select
                          value={formData.leagueLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              leagueLevel: e.target.value as any,
                            })
                          }
                          className="w-full px-4 py-3 text-base rounded-lg bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] transition-colors"
                        >
                          <option value="club" className="bg-gray-800">Club</option>
                          <option value="ward" className="bg-gray-800">Ward</option>
                          <option value="city" className="bg-gray-800">City</option>
                          <option value="district" className="bg-gray-800">District</option>
                          <option value="state" className="bg-gray-800">State</option>
                          <option value="national" className="bg-gray-800">National</option>
                        </select>
                      </div>

                      <Input
                        label="Season Year"
                        type="number"
                        value={formData.leagueSeason}
                        onChange={(e) => setFormData({ ...formData, leagueSeason: e.target.value })}
                        min="2020"
                        max="2030"
                      />
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <Card className="p-6 lg:p-8 bg-gray-800/50 border-gray-700">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.back()}
                disabled={loading}
                className="sm:max-w-[200px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                className="sm:flex-1"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Create Match
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}











