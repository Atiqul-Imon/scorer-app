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
import { format } from 'date-fns';

export default function CreateMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    series: '',
    format: 't20' as 't20' | 'odi' | 'test' | 'first-class' | 'list-a',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
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
        success('Match created successfully!');
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
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Match Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Match Information</h2>

              <Input
                label="Series/League Name"
                value={formData.series}
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                error={errors.series}
                required
                placeholder="e.g., Local Cricket League 2026"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      format: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                >
                  <option value="t20">T20</option>
                  <option value="odi">ODI</option>
                  <option value="test">Test</option>
                  <option value="first-class">First-Class</option>
                  <option value="list-a">List-A</option>
                </select>
              </div>

              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                error={errors.startTime}
                required
              />
            </div>

            {/* Teams */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>

              <Input
                label="Home Team"
                value={formData.teamHome}
                onChange={(e) => setFormData({ ...formData, teamHome: e.target.value })}
                error={errors.teamHome}
                required
                placeholder="Team A"
              />

              <Input
                label="Away Team"
                value={formData.teamAway}
                onChange={(e) => setFormData({ ...formData, teamAway: e.target.value })}
                error={errors.teamAway}
                required
                placeholder="Team B"
              />
            </div>

            {/* Venue */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Venue</h2>

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

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>

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

            {/* League (Optional) */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">League (Optional)</h2>

              <Input
                label="League Name"
                value={formData.leagueName}
                onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
                placeholder="Leave empty if not part of a league"
              />

              {formData.leagueName && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                      className="w-full px-4 py-3 text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                    >
                      <option value="club">Club</option>
                      <option value="ward">Ward</option>
                      <option value="city">City</option>
                      <option value="district">District</option>
                      <option value="state">State</option>
                      <option value="national">National</option>
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

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => router.back()}
                disabled={loading}
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
              >
                Create Match
              </Button>
            </div>
          </form>
        </Card>
    </AppLayout>
  );
}











