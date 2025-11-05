import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Loader2, Target, TrendingUp, AlertTriangle, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StrategyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [kris, setKris] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [goalsRes, kpisRes, krisRes, tasksRes, usersRes] = await Promise.all([
        axios.get(`${API}/goals`),
        axios.get(`${API}/kpis`),
        axios.get(`${API}/kris`),
        axios.get(`${API}/tasks`),
        axios.get(`${API}/users`)
      ]);
      setGoals(goalsRes.data);
      setKpis(kpisRes.data);
      setKris(krisRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getGoalProgress = (goalId) => {
    const relatedKPIs = kpis.filter(k => k.associated_goal_id === goalId);
    if (relatedKPIs.length === 0) return 0;
    const avg = relatedKPIs.reduce((sum, k) => sum + (k.current_value / k.target_value) * 100, 0) / relatedKPIs.length;
    return Math.min(Math.round(avg), 100);
  };

  const activeGoals = goals.filter(g => g.status === 'Active');
  const completedGoals = goals.filter(g => g.status === 'Completed');
  const kpisOnTrack = kpis.filter(k => !k.flagged).length;
  const kpisAtRisk = kpis.filter(k => k.flagged).length;
  const criticalRisks = kris.filter(k => k.risk_level === 'Critical').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6" data-testid="strategy-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">OKR & Strategy Dashboard</h1>
        <p className="text-gray-600">Executive view of organizational objectives and key results</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Goals</CardDescription>
            <CardTitle className="text-4xl">{activeGoals.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <Target className="w-4 h-4 mr-1" />{completedGoals.length} completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>KPIs On Track</CardDescription>
            <CardTitle className="text-4xl">{kpisOnTrack}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />{kpisAtRisk} need attention
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Risks</CardDescription>
            <CardTitle className="text-4xl text-red-600">{criticalRisks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />Immediate action needed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-4xl">{completedTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-purple-600">
              <Award className="w-4 h-4 mr-1" />of {tasks.length} total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals with Progress */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Strategic Objectives (OKRs)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map(goal => {
            const progress = getGoalProgress(goal.id);
            const relatedKPIs = kpis.filter(k => k.associated_goal_id === goal.id);
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.goal_title}</CardTitle>
                      <CardDescription>Owner: {getUserName(goal.owner_id)}</CardDescription>
                    </div>
                    <Badge variant={goal.status === 'Active' ? 'default' : 'secondary'}>{goal.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{goal.description}</p>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}</span>
                    <span>{relatedKPIs.length} KPIs</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Critical KPIs */}
      {kpisAtRisk > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-red-600">KPIs Requiring Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpis.filter(k => k.flagged).map(kpi => (
              <Card key={kpi.id} className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-base">{kpi.kpi_name}</CardTitle>
                  <CardDescription>Owner: {getUserName(kpi.owner_id)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Current: <span className="font-semibold">{kpi.current_value}</span></p>
                      <p className="text-sm text-gray-600">Target: <span className="font-semibold">{kpi.target_value}</span></p>
                    </div>
                    <Badge variant="destructive">Below Target</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Critical Risks */}
      {criticalRisks > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Critical Risks</h2>
          <div className="grid grid-cols-1 gap-4">
            {kris.filter(k => k.risk_level === 'Critical').map(kri => (
              <Card key={kri.id} className="border-red-300 bg-red-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-red-800">{kri.risk_area}</CardTitle>
                      <CardDescription>Owner: {getUserName(kri.mitigation_owner_id)}</CardDescription>
                    </div>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />Critical
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{kri.risk_description}</p>
                  <p className="text-sm font-semibold">Action Plan: <span className="font-normal">{kri.action_plan}</span></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyDashboard;
