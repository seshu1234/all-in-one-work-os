import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  Lightbulb,
  Users,
  Award,
  Clock,
  Calendar
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    goals: { total: 0, completed: 0, inProgress: 0, completionRate: 0 },
    ideas: { total: 0, accepted: 0, rejected: 0, pending: 0, acceptanceRate: 0 },
    tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0, completionRate: 0 },
    kpis: { total: 0, onTrack: 0, atRisk: 0 },
    shoutouts: { total: 0, thisMonth: 0 },
    teamPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all module data
      const [goalsRes, ideasRes, tasksRes, kpisRes, shoutoutsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/organization-goals`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/idea-suggestions`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/tasks`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/kpis`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/shoutouts`)
      ]);

      const goals = goalsRes.data;
      const ideas = ideasRes.data;
      const tasks = tasksRes.data;
      const kpis = kpisRes.data;
      const shoutouts = shoutoutsRes.data;

      // Calculate goals analytics
      const goalsCompleted = goals.filter(g => g.status === 'Completed').length;
      const goalsInProgress = goals.filter(g => g.status === 'In Progress').length;
      const goalsCompletionRate = goals.length > 0 ? (goalsCompleted / goals.length) * 100 : 0;

      // Calculate ideas analytics
      const ideasAccepted = ideas.filter(i => i.status === 'Accepted').length;
      const ideasRejected = ideas.filter(i => i.status === 'Rejected').length;
      const ideasPending = ideas.filter(i => i.status === 'Pending Review').length;
      const ideasAcceptanceRate = (ideasAccepted + ideasRejected) > 0 
        ? (ideasAccepted / (ideasAccepted + ideasRejected)) * 100 
        : 0;

      // Calculate tasks analytics
      const tasksCompleted = tasks.filter(t => t.status === 'Done').length;
      const tasksInProgress = tasks.filter(t => t.status === 'In Progress').length;
      const tasksOverdue = tasks.filter(t => {
        const deadline = new Date(t.deadline);
        return t.status !== 'Done' && deadline < new Date();
      }).length;
      const tasksCompletionRate = tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 0;

      // Calculate KPI analytics
      const kpisOnTrack = kpis.filter(k => {
        const current = parseFloat(k.current_value) || 0;
        const target = parseFloat(k.target_value) || 1;
        return current >= target * 0.8;
      }).length;
      const kpisAtRisk = kpis.length - kpisOnTrack;

      // Calculate shoutouts this month
      const thisMonth = new Date().getMonth();
      const shoutoutsThisMonth = shoutouts.filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === thisMonth;
      }).length;

      // Team performance (tasks by assignee)
      const tasksByPerson = tasks.reduce((acc, task) => {
        const person = task.assigned_to;
        if (!acc[person]) {
          acc[person] = { name: person, total: 0, completed: 0, inProgress: 0 };
        }
        acc[person].total++;
        if (task.status === 'Done') acc[person].completed++;
        if (task.status === 'In Progress') acc[person].inProgress++;
        return acc;
      }, {});

      const teamPerformance = Object.values(tasksByPerson)
        .map(p => ({
          ...p,
          completionRate: p.total > 0 ? (p.completed / p.total) * 100 : 0
        }))
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10);

      setAnalytics({
        goals: {
          total: goals.length,
          completed: goalsCompleted,
          inProgress: goalsInProgress,
          completionRate: goalsCompletionRate
        },
        ideas: {
          total: ideas.length,
          accepted: ideasAccepted,
          rejected: ideasRejected,
          pending: ideasPending,
          acceptanceRate: ideasAcceptanceRate
        },
        tasks: {
          total: tasks.length,
          completed: tasksCompleted,
          inProgress: tasksInProgress,
          overdue: tasksOverdue,
          completionRate: tasksCompletionRate
        },
        kpis: {
          total: kpis.length,
          onTrack: kpisOnTrack,
          atRisk: kpisAtRisk
        },
        shoutouts: {
          total: shoutouts.length,
          thisMonth: shoutoutsThisMonth
        },
        teamPerformance
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Comprehensive insights into your organization's performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Completion</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.goals.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{analytics.goals.completed} of {analytics.goals.total} completed</p>
            <Progress value={analytics.goals.completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideas Acceptance</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.ideas.acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{analytics.ideas.accepted} accepted, {analytics.ideas.pending} pending</p>
            <Progress value={analytics.ideas.acceptanceRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tasks.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">{analytics.tasks.completed} of {analytics.tasks.total} completed</p>
            <Progress value={analytics.tasks.completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Recognition</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.shoutouts.thisMonth}</div>
            <p className="text-xs text-gray-600">Shoutouts this month</p>
            <p className="text-xs text-gray-500 mt-1">Total: {analytics.shoutouts.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Goals Performance
            </CardTitle>
            <CardDescription>Current status of organizational goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold">{analytics.goals.completed}</span>
              </div>
              <Progress value={(analytics.goals.completed / analytics.goals.total) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold">{analytics.goals.inProgress}</span>
              </div>
              <Progress value={(analytics.goals.inProgress / analytics.goals.total) * 100} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                {analytics.goals.completionRate >= 50 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {analytics.goals.completionRate >= 50 ? 'On track' : 'Needs attention'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Tasks Performance
            </CardTitle>
            <CardDescription>Task execution and delivery metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold">{analytics.tasks.completed}</span>
              </div>
              <Progress value={(analytics.tasks.completed / analytics.tasks.total) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold">{analytics.tasks.inProgress}</span>
              </div>
              <Progress value={(analytics.tasks.inProgress / analytics.tasks.total) * 100} className="h-2" />
            </div>
            {analytics.tasks.overdue > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-600">Overdue</span>
                  <span className="font-semibold text-red-600">{analytics.tasks.overdue}</span>
                </div>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  Needs immediate attention
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Team Performance
          </CardTitle>
          <CardDescription>Individual task completion rates (Top 10)</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.teamPerformance.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No team data available</p>
          ) : (
            <div className="space-y-4">
              {analytics.teamPerformance.map((member, index) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">#{index + 1}</span>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{member.completed}/{member.total} tasks</span>
                      <span className="font-semibold">{member.completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <Progress value={member.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs & Ideas Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              KPIs Overview
            </CardTitle>
            <CardDescription>Performance indicators status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700">{analytics.kpis.onTrack}</div>
                <div className="text-sm text-gray-600 mt-1">On Track</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-700">{analytics.kpis.atRisk}</div>
                <div className="text-sm text-gray-600 mt-1">At Risk</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {analytics.kpis.total} total KPIs being tracked
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Innovation Pipeline
            </CardTitle>
            <CardDescription>Ideas submission and acceptance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{analytics.ideas.pending}</div>
                <div className="text-xs text-gray-600 mt-1">Pending</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{analytics.ideas.accepted}</div>
                <div className="text-xs text-gray-600 mt-1">Accepted</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{analytics.ideas.rejected}</div>
                <div className="text-xs text-gray-600 mt-1">Rejected</div>
              </div>
            </div>
            <div className="text-sm text-center">
              <span className="font-semibold">{analytics.ideas.acceptanceRate.toFixed(0)}%</span>
              <span className="text-gray-600"> acceptance rate</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
