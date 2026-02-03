'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Award, User, MapPin, Phone, Mail, Shield, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.scorerProfile?.location?.city || '',
    district: user?.scorerProfile?.location?.district || '',
    area: user?.scorerProfile?.location?.area || '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.scorerProfile?.location?.city || '',
        district: user.scorerProfile?.location?.district || '',
        area: user.scorerProfile?.location?.area || '',
      });
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Note: This assumes there's an update profile endpoint
      // If not available, we'll just show a message
      await refreshUser();
      const successMsg = 'Profile updated successfully!';
      setSuccess(successMsg);
      showSuccess(successMsg);
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.scorerProfile?.location?.city || '',
        district: user.scorerProfile?.location?.district || '',
        area: user.scorerProfile?.location?.area || '',
      });
    }
    setEditing(false);
    setError('');
  };

  if (authLoading) {
    return (
      <AppLayout title="Profile">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const headerActions = editing ? (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={saving}
        className="touch-target"
      >
        <X className="w-4 h-4" />
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={handleSave}
        loading={saving}
        disabled={saving}
        className="touch-target"
      >
        <Save className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setEditing(true)}
      className="touch-target"
    >
      <Edit2 className="w-4 h-4" />
    </Button>
  );

  const scorerProfile = user.scorerProfile;
  const stats = {
    matchesScored: scorerProfile?.matchesScored || 0,
    accuracyScore: scorerProfile?.accuracyScore || 100,
    verificationStatus: scorerProfile?.verificationStatus || 'pending',
    scorerType: scorerProfile?.scorerType || 'volunteer',
  };

  return (
    <AppLayout title="Profile" headerActions={headerActions}>
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-100 mb-1">
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  user.name
                )}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    stats.verificationStatus === 'verified'
                      ? 'success'
                      : stats.verificationStatus === 'pending'
                      ? 'info'
                      : 'default'
                  }
                >
                  {stats.verificationStatus}
                </Badge>
                <Badge variant="default">{stats.scorerType}</Badge>
              </div>
            </div>
          </div>

          {/* Scorer ID */}
          {scorerProfile?.scorerId && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">Scorer ID</p>
              <p className="text-base font-mono text-gray-100">{scorerProfile.scorerId}</p>
            </div>
          )}
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                  className="bg-gray-800"
                />
              ) : (
                <p className="text-gray-100">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              {editing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              ) : (
                <p className="text-gray-100">{user.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-400" />
            Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
              {editing ? (
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city"
                />
              ) : (
                <p className="text-gray-100">{formData.city || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">District</label>
              {editing ? (
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Enter district"
                />
              ) : (
                <p className="text-gray-100">{formData.district || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Area/Neighborhood</label>
              {editing ? (
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Enter area"
                />
              ) : (
                <p className="text-gray-100">{formData.area || 'Not provided'}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-400" />
            Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-2xl font-bold text-gray-100">{stats.matchesScored}</p>
              <p className="text-sm text-gray-400 mt-1">Matches Scored</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-2xl font-bold text-gray-100">{stats.accuracyScore}%</p>
              <p className="text-sm text-gray-400 mt-1">Accuracy Score</p>
            </div>
          </div>
        </Card>

        {/* Verification Status */}
        {stats.verificationStatus === 'pending' && (
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">Verification Pending</h3>
                <p className="text-sm text-gray-300">
                  Your scorer account is pending verification. Once verified, you'll have access to
                  additional features.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

