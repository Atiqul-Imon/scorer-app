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
  Clock,
  UserPlus,
  PlusCircle,
  Settings,
  MousePointerClick,
  Sparkles
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-primary-300 font-medium">Step-by-Step Guide</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
                Getting Started Guide
              </h2>
              <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
                Follow these simple steps to start scoring matches like a professional. 
                <span className="block mt-2 text-base text-gray-400">
                  Each step takes just a few minutes to complete.
                </span>
              </p>
            </div>

            {/* Steps Container with Visual Flow */}
            <div className="max-w-5xl mx-auto">
              {/* Step 1: Registration */}
              <div className="relative mb-8 lg:mb-12">
                {/* Step Number Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl lg:text-3xl font-bold text-blue-400">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                      <UserPlus className="w-6 h-6 lg:w-7 lg:h-7 text-blue-400" />
                      Create Your Account
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Get started in under 2 minutes
                    </p>
                  </div>
                </div>

                <Card className="p-6 lg:p-8 bg-gradient-to-br from-blue-500/10 via-gray-800 to-gray-800 border-blue-500/20 shadow-xl">
                  <div className="space-y-4">
                    <p className="text-gray-200 text-base lg:text-lg leading-relaxed">
                      Click the <strong className="text-gray-100">"Get Started Free"</strong> button or visit the{' '}
                      <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-2 underline-offset-2">
                        registration page
                      </Link>
                      . Fill in your details to create your scorer account.
                    </p>
                    
                    <div className="bg-gray-800/50 rounded-xl p-4 lg:p-6 border border-gray-700/50">
                      <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Required Information:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                        {[
                          { label: 'Full Name', required: true },
                          { label: 'Phone Number', required: true },
                          { label: 'Email', required: false },
                          { label: 'Password', required: true },
                          { label: 'Location (City)', required: true },
                          { label: 'Scorer Type', required: true },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm lg:text-base">
                            <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.required ? 'text-green-400' : 'text-gray-500'}`} />
                            <span className="text-gray-300">{item.label}</span>
                            {item.required && <span className="text-red-400 text-xs">*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Connector Line */}
                <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-blue-500/50 to-green-500/50"></div>
              </div>

              {/* Step 2: Create Match */}
              <div className="relative mb-8 lg:mb-12 lg:ml-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl lg:text-3xl font-bold text-green-400">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                      <PlusCircle className="w-6 h-6 lg:w-7 lg:h-7 text-green-400" />
                      Create Your Match
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Set up match details in minutes
                    </p>
                  </div>
                </div>

                <Card className="p-6 lg:p-8 bg-gradient-to-br from-green-500/10 via-gray-800 to-gray-800 border-green-500/20 shadow-xl">
                  <div className="space-y-4">
                    <p className="text-gray-200 text-base lg:text-lg leading-relaxed">
                      From your dashboard, click <strong className="text-gray-100">"Create Match"</strong> or use the{' '}
                      <strong className="text-gray-100">"+"</strong> button. Enter the match information:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                      {[
                        'Team Names (Home & Away)',
                        'Match Format (T20/ODI/Test)',
                        'Date & Time',
                        'Venue Details',
                        'Series/League Name',
                        'Location Info',
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                            <span className="text-sm lg:text-base text-gray-300">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Connector Line */}
                <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-green-500/50 to-purple-500/50"></div>
              </div>

              {/* Step 3: Match Setup */}
              <div className="relative mb-8 lg:mb-12 lg:ml-16">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-2 border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl lg:text-3xl font-bold text-purple-400">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                      <Settings className="w-6 h-6 lg:w-7 lg:h-7 text-purple-400" />
                      Complete Match Setup
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Configure players and match details
                    </p>
                  </div>
                </div>

                <Card className="p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 via-gray-800 to-gray-800 border-purple-500/20 shadow-xl">
                  <div className="space-y-4">
                    <p className="text-gray-200 text-base lg:text-lg leading-relaxed">
                      Complete the match setup by adding players and match information. Most steps are optional and can be done later.
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { 
                          title: 'Add Player Names', 
                          desc: 'Add names for both teams (at least 11 players each). You can add more players during the match.',
                          icon: Users,
                          required: true
                        },
                        { 
                          title: 'Record Toss Result', 
                          desc: 'Which team won the toss and their decision (bat/bowl). Can be updated later.',
                          icon: Trophy,
                          required: false
                        },
                        { 
                          title: 'Select Opening Batters', 
                          desc: 'Choose the two opening batters. Can be changed during the match.',
                          icon: PlayCircle,
                          required: false
                        },
                        { 
                          title: 'Choose First Bowler', 
                          desc: 'Select the opening bowler. Can be changed anytime.',
                          icon: Target,
                          required: false
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.required ? 'bg-purple-500/20' : 'bg-gray-700/50'}`}>
                              <item.icon className={`w-4 h-4 ${item.required ? 'text-purple-400' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-100 text-sm lg:text-base">{item.title}</h4>
                                {!item.required && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded">Optional</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Connector Line */}
                <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-purple-500/50 to-orange-500/50"></div>
              </div>

              {/* Step 4: Start Scoring */}
              <div className="relative mb-8 lg:mb-12 lg:ml-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl lg:text-3xl font-bold text-orange-400">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                      <MousePointerClick className="w-6 h-6 lg:w-7 lg:h-7 text-orange-400" />
                      Start Live Scoring
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Record every ball with ease
                    </p>
                  </div>
                </div>

                <Card className="p-6 lg:p-8 bg-gradient-to-br from-orange-500/10 via-gray-800 to-gray-800 border-orange-500/20 shadow-xl">
                  <div className="space-y-4">
                    <p className="text-gray-200 text-base lg:text-lg leading-relaxed">
                      Once setup is complete, you'll see the live scoring interface. Use the intuitive buttons to record every delivery:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      {[
                        { action: 'Record Runs', detail: 'Tap 0-6 buttons for runs scored', colorClass: 'bg-blue-400' },
                        { action: 'Record Extras', detail: 'Wide, No Ball, Bye, Leg Bye', colorClass: 'bg-yellow-400' },
                        { action: 'Record Wickets', detail: 'Select dismissal type', colorClass: 'bg-red-400' },
                        { action: 'Undo Mistakes', detail: 'Undo last ball if needed', colorClass: 'bg-gray-400' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${item.colorClass}`}></div>
                            <div>
                              <h4 className="font-semibold text-gray-100 text-sm lg:text-base mb-1">{item.action}</h4>
                              <p className="text-xs lg:text-sm text-gray-400">{item.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary-400" />
                        <strong className="text-gray-100">Real-time Updates:</strong> All statistics update automatically as you score!
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Connector Line */}
                <div className="hidden lg:block absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-orange-500/50 to-amber-500/50"></div>
              </div>

              {/* Step 5: Additional Features */}
              <div className="relative mb-12 lg:mb-16">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl lg:text-3xl font-bold text-amber-400">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 text-amber-400" />
                      Advanced Features
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Powerful tools for flexible scoring
                    </p>
                  </div>
                </div>

                <Card className="p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 via-gray-800 to-gray-800 border-amber-500/20 shadow-xl">
                  <div className="space-y-4">
                    <p className="text-gray-200 text-base lg:text-lg leading-relaxed">
                      Access additional features via the <strong className="text-gray-100">Settings menu</strong> (gear icon) during the match:
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[
                        { 
                          title: 'Manual Score Entry', 
                          desc: 'Jump to a specific score/over if you started scoring late',
                          icon: Target
                        },
                        { 
                          title: 'Change Players', 
                          desc: 'Update current batters or bowler anytime',
                          icon: Users
                        },
                        { 
                          title: 'Manage Players', 
                          desc: 'Add or edit player names during the match',
                          icon: FileText
                        },
                        { 
                          title: 'Edit Match Setup', 
                          desc: 'Update toss result or other match details',
                          icon: Settings
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-amber-500/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-100 text-sm lg:text-base mb-1">{item.title}</h4>
                              <p className="text-xs lg:text-sm text-gray-400">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16 lg:mt-20">
              <Card className="p-8 lg:p-12 bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-gray-800 border-primary-500/30 shadow-2xl max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-primary-500/20 border-2 border-primary-500/30 mb-6">
                  <Trophy className="w-8 h-8 lg:w-10 lg:h-10 text-primary-400" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-4">Ready to Get Started?</h3>
                <p className="text-lg text-gray-300 mb-2 max-w-2xl mx-auto">
                  Join hundreds of scorers already using Scorenews Scorer to manage their cricket matches professionally.
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  Free forever • No credit card required • Instant setup
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push('/register')}
                    className="text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    Register as Scorer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                      Already have an account? Sign In
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
