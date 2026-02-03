'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { validatePhone, validateEmail } from '@/lib/utils';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    district: '',
    area: '',
    scorerType: 'volunteer' as 'official' | 'volunteer' | 'community',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

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
      const response = await api.registerScorer({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        location: {
          city: formData.city,
          district: formData.district || undefined,
          area: formData.area || undefined,
        },
        scorerType: formData.scorerType,
        termsAccepted: formData.termsAccepted,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="p-8 text-center max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Registration Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your scorer account has been created. You can now sign in.
            </p>
            <Button variant="primary" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-md">
        <Card className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Register as Scorer</h1>
            <p className="text-gray-300">Create your scorer account to start managing matches</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
                {errors.submit}
              </div>
            )}

            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
              placeholder="+1234567890"
            />

            <Input
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="your.email@example.com"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <div className="space-y-3">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                error={errors.city}
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scorer Type
              </label>
              <select
                value={formData.scorerType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scorerType: e.target.value as 'official' | 'volunteer' | 'community',
                  })
                }
                className="w-full px-4 py-3 text-base rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] text-gray-100"
              >
                <option value="volunteer" className="bg-gray-800">Volunteer Scorer (Auto-approved)</option>
                <option value="community" className="bg-gray-800">Community Scorer (Auto-approved)</option>
                <option value="official" className="bg-gray-800">Official Scorer (Requires verification)</option>
              </select>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-1 h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-600 rounded bg-gray-800"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I accept the{' '}
                <Link href="/terms" className="text-primary-400 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-sm text-red-400">{errors.termsAccepted}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-400 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  );
}





