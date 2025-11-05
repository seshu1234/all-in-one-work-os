import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
  LayoutDashboard,
  Target,
  Lightbulb,
  CheckSquare,
  FileText,
  Users,
  Image as ImageIcon,
  Palette,
  FolderOpen,
  TrendingUp,
  Award,
  BookOpen,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

// Module Pages
import MyDashboard from '../modules/MyDashboard';
import StrategyDashboard from '../modules/StrategyDashboard';
import AnalyticsDashboard from '../modules/AnalyticsDashboard';
import GoalsModule from '../modules/GoalsModule';
import GoalsDashboard from '../modules/GoalsDashboard';
import IdeasModule from '../modules/IdeasModule';
import IdeasDashboard from '../modules/IdeasDashboard';
import TasksModule from '../modules/TasksModule';
import TasksDashboard from '../modules/TasksDashboard';
import MeetingNotesModule from '../modules/MeetingNotesModule';
import ContentIdeasModule from '../modules/ContentIdeasModule';
import CreativeRequestsModule from '../modules/CreativeRequestsModule';
import AssetsModule from '../modules/AssetsModule';
import CampaignsModule from '../modules/CampaignsModule';
import SkillDirectoryModule from '../modules/SkillDirectoryModule';
import KnowledgeHubModule from '../modules/KnowledgeHubModule';
import ShoutoutsModule from '../modules/ShoutoutsModule';
import KPIsModule from '../modules/KPIsModule';
import KPIsDashboard from '../modules/KPIsDashboard';
import KRIsModule from '../modules/KRIsModule';
import ScorecardsModule from '../modules/ScorecardsModule';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const modules = [
    { id: 'my-dashboard', name: 'My Dashboard', icon: LayoutDashboard },
    { id: 'analytics', name: '📈 Analytics & Reports', icon: BarChart3 },
    { id: 'strategy', name: 'OKR & Strategy', icon: TrendingUp },
    { id: 'goals-dashboard', name: '📊 Goals Dashboard', icon: Target },
    { id: 'goals', name: 'Organization Goals', icon: Target },
    { id: 'ideas-dashboard', name: '📊 Ideas Dashboard', icon: Lightbulb },
    { id: 'ideas', name: 'Idea Suggestions', icon: Lightbulb },
    { id: 'tasks-dashboard', name: '📊 Tasks Dashboard', icon: CheckSquare },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'meeting-notes', name: 'Meeting Notes', icon: FileText },
    { id: 'content-ideas', name: 'Content Idea Bank', icon: ImageIcon },
    { id: 'creative-requests', name: 'Creative Requests', icon: Palette },
    { id: 'assets', name: 'Asset Library', icon: FolderOpen },
    { id: 'campaigns', name: 'Performance Campaigns', icon: BarChart3 },
    { id: 'skill-directory', name: 'Skill Directory', icon: Award },
    { id: 'knowledge-hub', name: 'Knowledge Hub', icon: BookOpen },
    { id: 'shoutouts', name: 'Shoutouts', icon: MessageSquare },
    { id: 'kpis-dashboard', name: '📊 KPIs Dashboard', icon: BarChart3 },
    { id: 'kpis', name: 'KPIs', icon: BarChart3 },
    { id: 'kris', name: 'KRIs', icon: AlertTriangle },
    { id: 'scorecards', name: 'Team Scorecards', icon: ClipboardList },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'my-dashboard': return <MyDashboard />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'strategy': return <StrategyDashboard />;
      case 'goals-dashboard': return <GoalsDashboard />;
      case 'goals': return <GoalsModule />;
      case 'ideas-dashboard': return <IdeasDashboard />;
      case 'ideas': return <IdeasModule />;
      case 'tasks-dashboard': return <TasksDashboard />;
      case 'tasks': return <TasksModule />;
      case 'meeting-notes': return <MeetingNotesModule />;
      case 'content-ideas': return <ContentIdeasModule />;
      case 'creative-requests': return <CreativeRequestsModule />;
      case 'assets': return <AssetsModule />;
      case 'campaigns': return <CampaignsModule />;
      case 'skill-directory': return <SkillDirectoryModule />;
      case 'knowledge-hub': return <KnowledgeHubModule />;
      case 'shoutouts': return <ShoutoutsModule />;
      case 'kpis': return <KPIsModule />;
      case 'kris': return <KRIsModule />;
      case 'scorecards': return <ScorecardsModule />;
      default:
        return (
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to All-In-One Work OS</h1>
            <p className="text-gray-600 mb-6">Manage your organization with 15 powerful modules.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.slice(1).map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white"
                  >
                    <Icon className="w-8 h-8 mb-2 text-blue-600" />
                    <h3 className="font-semibold">{module.name}</h3>
                  </button>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">Work OS</h2>
          <p className="text-sm text-gray-600">{user?.username}</p>
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="p-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  data-testid={`nav-${module.id}`}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{module.name}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            data-testid="logout-button"
            onClick={logout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
