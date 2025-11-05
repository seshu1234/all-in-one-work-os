import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Target, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const GoalsDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    atRisk: 0
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/organization-goals`);
      const goalsData = response.data;
      setGoals(goalsData);
      
      // Calculate stats
      const total = goalsData.length;
      const active = goalsData.filter(g => g.status === 'In Progress').length;
      const completed = goalsData.filter(g => g.status === 'Completed').length;
      const atRisk = goalsData.filter(g => {
        const endDate = new Date(g.end_date);
        const today = new Date();
        const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        return g.status !== 'Completed' && daysUntilEnd < 7;
      }).length;
      
      setStats({ total, active, completed, atRisk });
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Planning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'On Hold': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculateProgress = (goal) => {
    if (goal.status === 'Completed') return 100;
    const start = new Date(goal.start_date);
    const end = new Date(goal.end_date);
    const today = new Date();
    const total = end - start;
    const elapsed = today - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Goals Dashboard</h1>
        <p className="text-gray-600">Track and monitor organizational goals at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">Across all statuses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-600">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-600">Successfully achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRisk}</div>
            <p className="text-xs text-gray-600">Ending within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>All Goals</CardTitle>
          <CardDescription>Overview of all organizational goals and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No goals found. Create your first goal to get started!</p>
              </div>
            ) : (
              goals.map((goal) => {
                const progress = calculateProgress(goal);
                const endDate = new Date(goal.end_date);
                const today = new Date();
                const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{goal.goal_title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}</span>
                          {daysUntilEnd > 0 && daysUntilEnd < 7 && goal.status !== 'Completed' && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                              {daysUntilEnd} days left
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium">{goal.owner}</span>
                      </div>
                      {goal.success_metrics && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Metrics:</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{goal.success_metrics}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsDashboard;
