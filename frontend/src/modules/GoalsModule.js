import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const GoalsModule = () => {
  const [goals, setGoals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [formData, setFormData] = useState({
    goal_title: '',
    description: '',
    owner_id: '',
    start_date: '',
    end_date: '',
    status: 'Active',
    success_metrics: ''
  });

  useEffect(() => {
    fetchGoals();
    fetchUsers();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentGoal) {
        await axios.put(`${API}/goals/${currentGoal.id}`, formData);
        toast.success('Goal updated successfully');
      } else {
        await axios.post(`${API}/goals`, formData);
        toast.success('Goal created successfully');
      }
      fetchGoals();
      resetForm();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setCurrentGoal(goal);
    setFormData({
      goal_title: goal.goal_title,
      description: goal.description,
      owner_id: goal.owner_id,
      start_date: goal.start_date,
      end_date: goal.end_date,
      status: goal.status,
      success_metrics: goal.success_metrics
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`${API}/goals/${id}`);
        toast.success('Goal deleted successfully');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      goal_title: '',
      description: '',
      owner_id: '',
      start_date: '',
      end_date: '',
      status: 'Active',
      success_metrics: ''
    });
    setCurrentGoal(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="goals-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Organization Goals</h1>
          <p className="text-gray-600">Manage your organization's strategic goals</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-goal-button" onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                {editMode ? 'Update the goal details below' : 'Fill in the details to create a new goal'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="goal_title">Goal Title *</Label>
                <Input
                  id="goal_title"
                  data-testid="goal-title-input"
                  value={formData.goal_title}
                  onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  data-testid="goal-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="owner_id">Owner *</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                >
                  <SelectTrigger data-testid="goal-owner-select">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    data-testid="goal-start-date-input"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    data-testid="goal-end-date-input"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="goal-status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="success_metrics">Success Metrics *</Label>
                <Textarea
                  id="success_metrics"
                  data-testid="goal-success-metrics-input"
                  value={formData.success_metrics}
                  onChange={(e) => setFormData({ ...formData, success_metrics: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-goal-button">
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No goals yet. Create your first goal to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Goal Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.map((goal) => (
                <TableRow key={goal.id} data-testid={`goal-row-${goal.id}`}>
                  <TableCell className="font-medium">{goal.goal_title}</TableCell>
                  <TableCell>{getUserName(goal.owner_id)}</TableCell>
                  <TableCell>{goal.start_date}</TableCell>
                  <TableCell>{goal.end_date}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(goal)}
                        data-testid={`edit-goal-${goal.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(goal.id)}
                        data-testid={`delete-goal-${goal.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GoalsModule;
