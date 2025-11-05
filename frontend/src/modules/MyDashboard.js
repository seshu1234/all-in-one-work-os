import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Loader2, CheckSquare, Lightbulb, Target, Award, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import RemindersPanel from '../components/RemindersPanel';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState([]);
  const [myIdeas, setMyIdeas] = useState([]);
  const [myGoals, setMyGoals] = useState([]);
  const [myKPIs, setMyKPIs] = useState([]);
  const [receivedShoutouts, setReceivedShoutouts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchMyData();
    }
  }, [user]);

  const fetchMyData = async () => {
    try {
      const [tasksRes, ideasRes, goalsRes, kpisRes, shoutoutsRes] = await Promise.all([
        axios.get(`${API}/tasks`),
        axios.get(`${API}/ideas`),
        axios.get(`${API}/goals`),
        axios.get(`${API}/kpis`),
        axios.get(`${API}/shoutouts`)
      ]);
      
      setMyTasks(tasksRes.data.filter(t => t.assigned_to_id === user.id));
      setMyIdeas(ideasRes.data.filter(i => i.submitted_by_id === user.id));
      setMyGoals(goalsRes.data.filter(g => g.owner_id === user.id));
      setMyKPIs(kpisRes.data.filter(k => k.owner_id === user.id));
      setReceivedShoutouts(shoutoutsRes.data.filter(s => s.to_user_id === user.id));
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const pendingTasks = myTasks.filter(t => t.status !== 'Completed');
  const completedTasks = myTasks.filter(t => t.status === 'Completed');
  const urgentTasks = myTasks.filter(t => t.priority === 'High' && t.status !== 'Completed');
  const kpisAtRisk = myKPIs.filter(k => k.flagged);

  return (
    <div className="p-6" data-testid="my-dashboard">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user?.full_name || user?.username}! 👋</h1>
        <p className="text-gray-600">Here's your personalized overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Tasks</CardDescription>
            <CardTitle className="text-4xl">{pendingTasks.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckSquare className="w-4 h-4 mr-1" />{completedTasks.length} completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Ideas</CardDescription>
            <CardTitle className="text-4xl">{myIdeas.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <Lightbulb className="w-4 h-4 mr-1" />Ideas submitted
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My Goals</CardDescription>
            <CardTitle className="text-4xl">{myGoals.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-purple-600">
              <Target className="w-4 h-4 mr-1" />Objectives owned
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recognition</CardDescription>
            <CardTitle className="text-4xl">{receivedShoutouts.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-pink-600">
              <Award className="w-4 h-4 mr-1" />Shoutouts received
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        {urgentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Urgent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.task_title}</p>
                      <p className="text-xs text-gray-500">Due: {task.deadline}</p>
                    </div>
                    <Badge variant="destructive">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              My Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myGoals.length === 0 ? (
              <p className="text-sm text-gray-500">No goals assigned yet</p>
            ) : (
              <div className="space-y-3">
                {myGoals.map(goal => (
                  <div key={goal.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{goal.goal_title}</p>
                      <Badge variant={goal.status === 'Active' ? 'default' : 'secondary'}>{goal.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{goal.start_date} - {goal.end_date}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My KPIs */}
        {myKPIs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                My KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myKPIs.map(kpi => (
                  <div key={kpi.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{kpi.kpi_name}</p>
                      {kpi.flagged && <Badge variant="destructive">At Risk</Badge>}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Current: {kpi.current_value}</span>
                      <span>Target: {kpi.target_value}</span>
                    </div>
                    <Progress value={(kpi.current_value / kpi.target_value) * 100} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Shoutouts */}
        {receivedShoutouts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Recent Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receivedShoutouts.slice(-3).reverse().map(shoutout => (
                  <div key={shoutout.id} className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm italic">"{shoutout.message}"</p>
                    <p className="text-xs text-gray-500 mt-1">- From team</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyDashboard;
