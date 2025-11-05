import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const RemindersPanel = () => {
  const [reminders, setReminders] = useState({
    due_soon: [],
    overdue: [],
    today: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkReminders();
    // Check for reminders every 5 minutes
    const interval = setInterval(checkReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkReminders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/reminders/check`);
      const data = response.data;
      setReminders(data);
      
      // Show toast notifications for overdue and due today
      if (data.overdue.length > 0) {
        toast.error(`${data.overdue.length} task(s) are overdue!`, {
          duration: 5000,
        });
      }
      if (data.today.length > 0) {
        toast.warning(`${data.today.length} task(s) due today!`, {
          duration: 5000,
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking reminders:', error);
      setLoading(false);
    }
  };

  const totalReminders = reminders.overdue.length + reminders.today.length + reminders.due_soon.length;

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-red-600" />
            Loading Reminders...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (totalReminders === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No upcoming deadlines or overdue tasks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overdue Tasks */}
      {reminders.overdue.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Overdue Tasks ({reminders.overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.overdue.map((task) => (
                <div key={task.id} className="bg-white border border-red-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: {task.assigned_to}</p>
                      <p className="text-xs text-gray-600">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      {task.days_overdue} day{task.days_overdue !== 1 ? 's' : ''} overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Today */}
      {reminders.today.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              Due Today ({reminders.today.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.today.map((task) => (
                <div key={task.id} className="bg-white border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: {task.assigned_to}</p>
                      <p className="text-xs text-gray-600">Deadline: {new Date(task.deadline).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      Today
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Soon (within 24 hours) */}
      {reminders.due_soon.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-yellow-600" />
              Due Soon ({reminders.due_soon.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders.due_soon.map((task) => (
                <div key={task.id} className="bg-white border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: {task.assigned_to}</p>
                      <p className="text-xs text-gray-600">Deadline: {new Date(task.deadline).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {task.hours_remaining}h left
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RemindersPanel;
