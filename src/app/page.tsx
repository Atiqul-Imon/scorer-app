'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  Shield, 
  Smartphone, 
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  FileText,
  BarChart3,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only redirect if authenticated and not loading
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show homepage if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto max-w-7xl">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
                <Trophy className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300 font-medium">Professional Cricket Scoring</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-100 mb-6">
                Score Cricket Matches
                <span className="block text-primary-400">Like a Pro</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                The most intuitive and powerful cricket scoring platform for hyper-local matches. 
                Built for scorers who demand accuracy and speed.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Instant Setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
          <div className="w-full mx-auto max-w-7xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
                Everything You Need to Score Matches
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Powerful features designed for professional cricket scoring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="p-6 lg:p-8 bg-gradient-to-br from-primary-500/10 to-gray-800 border-primary-500/20">
                <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Ball-by-Ball Scoring</h3>
                <p className="text-gray-300">
                  Record every delivery with precision. Track runs, wickets, extras, and more with a single tap.
                </p>
              </Card>

              <Card className="p-6 lg:p-8 bg-gradient-to-br from-green-500/10 to-gray-800 border-green-500/20">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Optimized for speed. Score matches in real-time without lag or delays.
                </p>
              </Card>

              <Card className="p-6 lg:p-8 bg-gradient-to-br from-blue-500/10 to-gray-800 border-blue-500/20">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Mobile First</h3>
                <p className="text-gray-300">
                  Works perfectly on phones, tablets, and desktops. Score from anywhere.
                </p>
              </Card>

              <Card className="p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-gray-800 border-purple-500/20">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Live Statistics</h3>
                <p className="text-gray-300">
                  Real-time stats for batters, bowlers, partnerships, and run rates. Always up-to-date.
                </p>
              </Card>

              <Card className="p-6 lg:p-8 bg-gradient-to-br from-orange-500/10 to-gray-800 border-orange-500/20">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Reliable & Secure</h3>
                <p className="text-gray-300">
                  Your data is safe and secure. Automatic backups and error recovery.
                </p>
              </Card>

              <Card className="p-6 lg:p-8 bg-gradient-to-br from-pink-500/10 to-gray-800 border-pink-500/20">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Player Management</h3>
                <p className="text-gray-300">
                  Easy player setup and management. Add, edit, and organize players effortlessly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="w-full mx-auto max-w-7xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Get started in minutes. It's that simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-400">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3">Register as Scorer</h3>
                <p className="text-gray-300">
                  Create your free account in seconds. No credit card required. Just your name, phone, and location.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-400">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3">Create Your Match</h3>
                <p className="text-gray-300">
                  Set up your match with teams, players, and format. Complete the match setup in minutes.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-400">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-3">Start Scoring</h3>
                <p className="text-gray-300">
                  Use the intuitive interface to record every ball. Real-time stats update automatically.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/register')}
                className="text-lg px-8 py-6"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Instructions Section */}
        <section id="instructions" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
          <div className="w-full mx-auto max-w-7xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
                Getting Started Guide
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Follow these simple steps to start scoring matches
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="p-6 lg:p-8 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2">Step 1: Registration</h3>
                    <p className="text-gray-300 mb-3">
                      Click the <strong className="text-gray-100">"Get Started Free"</strong> button above or visit the{' '}
                      <Link href="/register" className="text-primary-400 hover:text-primary-300 underline">
                        registration page
                      </Link>
                      . Fill in your details:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                      <li>Full Name</li>
                      <li>Phone Number (required)</li>
                      <li>Email (optional)</li>
                      <li>Password</li>
                      <li>Location (City, District, Area)</li>
                      <li>Scorer Type (Volunteer, Community, or Official)</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:p-8 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2">Step 2: Create a Match</h3>
                    <p className="text-gray-300 mb-3">
                      Once logged in, go to your dashboard and click <strong className="text-gray-100">"New Match"</strong> or{' '}
                      <strong className="text-gray-100">"Create Match"</strong>. Enter:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                      <li>Match Title</li>
                      <li>Home Team and Away Team names</li>
                      <li>Match Format (T20, ODI, Test, etc.)</li>
                      <li>Match Date and Time</li>
                      <li>Venue details</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:p-8 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2">Step 3: Match Setup</h3>
                    <p className="text-gray-300 mb-3">
                      Complete the match setup by:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                      <li><strong>Select Playing XI:</strong> Add player names for both teams (at least 11 players each)</li>
                      <li><strong>Toss Result:</strong> Record which team won the toss and their decision (optional)</li>
                      <li><strong>Opening Batters:</strong> Select the two opening batters (optional)</li>
                      <li><strong>First Bowler:</strong> Select the opening bowler (optional)</li>
                    </ul>
                    <p className="text-gray-300 mt-3 text-sm">
                      <strong className="text-gray-100">Note:</strong> You can skip optional steps and complete them later during the match.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:p-8 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2">Step 4: Start Scoring</h3>
                    <p className="text-gray-300 mb-3">
                      Once setup is complete, you'll see the live scoring interface. Use the large buttons to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                      <li><strong>Record Runs:</strong> Tap 0, 1, 2, 3, 4, 5, or 6 for runs scored</li>
                      <li><strong>Record Extras:</strong> Tap Wide, No Ball, Bye, or Leg Bye buttons</li>
                      <li><strong>Record Wickets:</strong> Tap the Wicket button and select dismissal type</li>
                      <li><strong>Undo:</strong> Use Undo Last Ball if you made a mistake</li>
                    </ul>
                    <p className="text-gray-300 mt-3 text-sm">
                      All statistics update automatically in real-time!
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 lg:p-8 bg-gray-800 border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-100 mb-2">Step 5: Additional Features</h3>
                    <p className="text-gray-300 mb-3">
                      During the match, you can access additional features via the Settings menu (gear icon):
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm ml-4">
                      <li><strong>Manual Score Entry:</strong> Jump to a specific score/over if you started scoring late</li>
                      <li><strong>Change Players:</strong> Update current batters or bowler</li>
                      <li><strong>Manage Players:</strong> Add or edit player names</li>
                      <li><strong>Edit Toss:</strong> Update toss result if needed</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Card className="p-8 bg-gradient-to-br from-primary-500/10 to-gray-800 border-primary-500/20 inline-block">
                <h3 className="text-2xl font-bold text-gray-100 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Join hundreds of scorers already using Scorenews Scorer to manage their cricket matches.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="text-lg px-8 py-6"
                >
                  Register as Scorer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
