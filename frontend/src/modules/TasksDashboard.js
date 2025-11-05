import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckSquare, Clock, AlertTriangle, CheckCircle, Circle } from 'lucide-react';

const TasksDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/tasks`);
      const tasksData = response.data;
      setTasks(tasksData);
      
      // Calculate stats
      const total = tasksData.length;
      const todo = tasksData.filter(t => t.status === 'To Do').length;
      const inProgress = tasksData.filter(t => t.status === 'In Progress').length;
      const completed = tasksData.filter(t => t.status === 'Done').length;
      const overdue = tasksData.filter(t => {
        const deadline = new Date(t.deadline);
        const today = new Date();
        return t.status !== 'Done' && deadline < today;
      }).length;
      
      setStats({ total, todo, inProgress, completed, overdue });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'To Do': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent & Important': return 'bg-red-100 text-red-800 border-red-300';
      case 'Not Urgent but Important': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Urgent but Not Important': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Neither Urgent nor Important': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const isOverdue = (task) => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    return task.status !== 'Done' && deadline < today;
  };

  // Group tasks by Eisenhower Matrix quadrants
  const urgentImportant = tasks.filter(t => t.eisenhower_priority === 'Urgent & Important');
  const notUrgentImportant = tasks.filter(t => t.eisenhower_priority === 'Not Urgent but Important');
  const urgentNotImportant = tasks.filter(t => t.eisenhower_priority === 'Urgent but Not Important');
  const neitherUrgentNorImportant = tasks.filter(t => t.eisenhower_priority === 'Neither Urgent nor Important');

  const QuadrantCard = ({ title, tasks, bgColor, borderColor, icon }) => (
    <Card className={`${bgColor} border-2 ${borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{tasks.length} tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No tasks in this quadrant</p>
          ) : (
            tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="bg-white border rounded p-2 text-sm hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-xs flex-1">{task.task_title}</span>
                  <Badge className={getStatusColor(task.status)} variant="outline">
                    {getStatusIcon(task.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                  <span>{task.assigned_to}</span>
                  {isOverdue(task) && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
          {tasks.length > 5 && (
            <p className="text-xs text-center text-gray-500 mt-2">+ {tasks.length - 5} more</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tasks Dashboard</h1>
        <p className="text-gray-600">Track team tasks with Eisenhower Matrix prioritization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Circle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Eisenhower Matrix */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Eisenhower Priority Matrix</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuadrantCard
            title="DO FIRST"
            tasks={urgentImportant}
            bgColor="bg-red-50"
            borderColor="border-red-300"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          />
          
          <QuadrantCard
            title="SCHEDULE"
            tasks={notUrgentImportant}
            bgColor="bg-orange-50"
            borderColor="border-orange-300"
            icon={<Clock className="h-5 w-5 text-orange-600" />}
          />
          
          <QuadrantCard
            title="DELEGATE"
            tasks={urgentNotImportant}
            bgColor="bg-yellow-50"
            borderColor="border-yellow-300"
            icon={<CheckSquare className="h-5 w-5 text-yellow-600" />}
          />
          
          <QuadrantCard
            title="ELIMINATE"
            tasks={neitherUrgentNorImportant}
            bgColor="bg-gray-50"
            borderColor="border-gray-300"
            icon={<Circle className="h-5 w-5 text-gray-600" />}
          />
        </div>
      </div>

      {/* All Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Complete task list with details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No tasks created yet. Start by adding your first task!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{task.task_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>Assigned to: {task.assigned_to}</span>
                        <span>•</span>
                        <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        {isOverdue(task) && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(task.eisenhower_priority)} variant="outline">
                        {task.eisenhower_priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksDashboard;
