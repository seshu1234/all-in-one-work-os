import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, 
  Target, 
  Lightbulb, 
  CheckSquare, 
  BarChart3, 
  Award,
  Zap,
  Users,
  TrendingUp,
  BookOpen,
  Palette,
  MessageSquare,
  ArrowRight,
  X as XIcon,
  FileText,
  Video,
  FolderOpen,
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  const problems = [
    "Slack messages",
    "WhatsApp chats",
    "Spreadsheets",
    "Google Docs",
    "Untracked approvals",
    "Lost follow-ups",
    "Repeated mistakes"
  ];

  const painPoints = [
    "What is being worked on",
    "Who owns what",
    "What is blocked",
    "What was learned",
    "What worked in the past"
  ];

  const features = [
    {
      icon: Target,
      title: "Organization Goals",
      description: "Set and track strategic objectives across your organization",
      color: "text-red-600"
    },
    {
      icon: Lightbulb,
      title: "Idea Suggestions",
      description: "Crowdsource innovation with anonymous idea submissions",
      color: "text-red-500"
    },
    {
      icon: CheckSquare,
      title: "Tasks & Eisenhower Matrix",
      description: "Prioritize with urgency/importance quadrants",
      color: "text-red-600"
    },
    {
      icon: FileText,
      title: "Meeting Notes",
      description: "Auto-extract action items from meeting notes",
      color: "text-red-500"
    },
    {
      icon: Video,
      title: "Content Ideas",
      description: "Build and track your content idea bank",
      color: "text-red-600"
    },
    {
      icon: Palette,
      title: "Creative Requests",
      description: "Streamline design and creative workflows",
      color: "text-red-500"
    },
    {
      icon: FolderOpen,
      title: "Asset Library",
      description: "Centralized repository for all digital assets",
      color: "text-red-600"
    },
    {
      icon: TrendingUp,
      title: "Performance Campaigns",
      description: "Track marketing campaigns and learnings",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Skill Directory",
      description: "Find the right expert for any project",
      color: "text-red-600"
    },
    {
      icon: BookOpen,
      title: "Knowledge Hub",
      description: "SOPs and processes in one searchable place",
      color: "text-red-500"
    },
    {
      icon: Award,
      title: "Shoutouts & Recognition",
      description: "Celebrate wins and recognize team members",
      color: "text-red-600"
    },
    {
      icon: BarChart3,
      title: "KPIs",
      description: "Monitor key performance indicators in real-time",
      color: "text-red-500"
    },
    {
      icon: AlertTriangle,
      title: "KRIs",
      description: "Identify and mitigate risks proactively",
      color: "text-red-600"
    },
    {
      icon: ClipboardCheck,
      title: "Team Scorecards",
      description: "Comprehensive team performance reviews",
      color: "text-red-500"
    }
  ];

  const testimonials = [
    {
      quote: "We reduced meeting follow-ups by 70%. No one asks 'Who is doing this?' anymore.",
      author: "Growth Head",
      company: "EdTech Brand"
    },
    {
      quote: "Campaign learnings used to get lost. Now we reuse and scale what works.",
      author: "Marketing Lead",
      company: "SaaS Company"
    },
    {
      quote: "Finally, one place where everyone can see goals, tasks, and progress. Game changer.",
      author: "Founder & CEO",
      company: "Tech Startup"
    }
  ];

  const pricing = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Small teams getting started",
      features: [
        "Up to 5 team members",
        "Basic goal & task tracking",
        "Idea suggestions",
        "Knowledge hub",
        "Community support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per user/month",
      description: "Growing teams",
      features: [
        "Unlimited team members",
        "Advanced workflows",
        "KPI & scorecard tracking",
        "Creative approvals",
        "Priority support",
        "Custom integrations"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Large orgs needing SSO & custom workflow",
      features: [
        "Everything in Pro",
        "SSO & advanced security",
        "Custom workflows",
        "Dedicated account manager",
        "SLA guarantees",
        "White-label options"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const useCases = [
    { role: "Founders & Leadership", icon: TrendingUp },
    { role: "Marketing & Creative Teams", icon: Palette },
    { role: "Sales & Partnerships", icon: Users },
    { role: "Operations & Delivery Teams", icon: CheckSquare }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">WorkOS</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => navigate('/login')}>Get Started Free</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-100">
                The Operating System for Teams Who Move Fast
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Your Team's
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"> All-In-One</span>
                <br />Work OS
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 mb-8">
                From strategy to execution, manage goals, ideas, tasks, and performance in one powerful platform. Built for teams that move fast and think big.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/login')} className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever • 2 minutes to set up</p>
            </div>
            <div className="relative">
              <img
                src="/hero.png"
                alt="Modern workspace"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why This Exists</h2>
            <p className="text-xl text-gray-600">Work is happening — but information is scattered.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-600">Teams operate across:</h3>
              <div className="space-y-3">
                {problems.map((problem, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <XIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-gray-700">{problem}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <p className="font-semibold mb-2">This causes chaos. No one knows:</p>
                <ul className="space-y-1">
                  {painPoints.map((point, i) => (
                    <li key={i} className="text-gray-700 text-sm">• {point}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-600">The Solution:</h3>
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle>A single shared workspace where:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Goals are defined",
                      "Ideas are collected (even anonymously)",
                      "Tasks are tracked",
                      "Creative assets are reviewed",
                      "Campaigns are measured",
                      "Knowledge is preserved",
                      "Recognition is visible"
                    ].map((solution, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{solution}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold mb-4">WorkOS brings everything together.</p>
                <p className="text-gray-600">In one place. For everyone. Always accessible.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">14 Powerful Modules</h2>
            <p className="text-xl text-gray-600">Everything your team needs in one place</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="hover:shadow-xl hover:border-red-300 transition-all duration-300 group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits with Images */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Teams Love WorkOS</h2>
            <p className="text-xl text-gray-600">Stop juggling multiple tools. Start moving faster together.</p>
          </div>
          
          <div className="space-y-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Align Your Team</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Connect goals, ideas, and tasks in one unified workspace. Everyone knows what matters and why.
                </p>
                <ul className="space-y-3">
                  {['Clear goal visibility', 'Anonymous idea submissions', 'Linked objectives'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c"
                  alt="Team alignment"
                  className="rounded-2xl shadow-xl w-full h-auto"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                  alt="Team collaboration"
                  className="rounded-2xl shadow-xl w-full h-auto"
                />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Move Faster</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Automated workflows and smart reminders keep projects moving. No more manual status updates.
                </p>
                <ul className="space-y-3">
                  {['Auto task creation', 'Smart reminders', 'Real-time updates'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Make Better Decisions</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Real-time KPIs, risk indicators, and performance scorecards give you the insights you need.
                </p>
                <ul className="space-y-3">
                  {['Live KPI tracking', 'Risk monitoring', 'Team scorecards'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1555212697-194d092e3b8f"
                  alt="Better decisions"
                  className="rounded-2xl shadow-xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Who Uses It</h2>
            <p className="text-xl text-gray-600">If your team collaborates — you need WorkOS.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, i) => (
              <Card key={i} className="text-center hover:shadow-lg hover:border-red-300 transition-all">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <useCase.icon className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="font-semibold text-gray-800">{useCase.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by Teams Worldwide</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="pt-6">
                  <p className="text-white/90 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="border-t border-white/20 pt-4">
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-white/70 text-sm">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your team</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-2 border-red-600 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-red-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/login')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-8">No credit card required to start.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform How Your Team Works?</h2>
          <p className="text-xl mb-8 text-red-100">Join hundreds of teams who've ditched the chaos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="text-lg px-8 py-6 bg-white text-red-600 hover:bg-gray-100">
              Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          <p className="text-red-100 mt-6">Setup in 2 minutes • No credit card • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">WorkOS</span>
              </div>
              <p className="text-gray-400 text-sm">The Operating System for Teams Who Move Fast.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 WorkOS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowVideo(false)}>
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">30-Second Demo</h3>
              <button onClick={() => setShowVideo(false)} className="p-2 hover:bg-gray-100 rounded">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-center p-8">
              <div>
                <p className="text-lg mb-4">Imagine your team opens one dashboard and sees:</p>
                <ul className="text-left max-w-md mx-auto space-y-2">
                  <li>✓ What the company is trying to achieve.</li>
                  <li>✓ The best ideas on how to achieve it.</li>
                  <li>✓ Who is doing what.</li>
                  <li>✓ What's blocked.</li>
                  <li>✓ Which creative assets already exist.</li>
                  <li>✓ What campaigns worked.</li>
                  <li>✓ Who deserves appreciation.</li>
                </ul>
                <p className="text-xl font-bold mt-6">This is WorkOS.</p>
                <p className="text-lg">Work happens here now.</p>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={() => { setShowVideo(false); navigate('/auth'); }}>
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
