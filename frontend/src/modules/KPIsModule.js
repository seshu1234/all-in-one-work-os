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
import { Plus, Pencil, Trash2, Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KPIsModule = () => {
  const [kpis, setKpis] = useState([]);
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentKpi, setCurrentKpi] = useState(null);
  const [formData, setFormData] = useState({
    kpi_name: '',
    associated_goal_id: '',
    owner_id: '',
    measurement_frequency: 'Monthly',
    current_value: 0,
    target_value: 0,
    update_notes: ''
  });

  useEffect(() => {
    fetchKpis();
    fetchUsers();
    fetchGoals();
  }, []);

  const fetchKpis = async () => {
    try {
      const response = await axios.get(`${API}/kpis`);
      setKpis(response.data);
    } catch (error) {
      toast.error('Failed to load KPIs');
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

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to load goals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        current_value: parseFloat(formData.current_value),
        target_value: parseFloat(formData.target_value)
      };
      
      if (editMode && currentKpi) {
        await axios.put(`${API}/kpis/${currentKpi.id}`, payload);
        toast.success('KPI updated successfully');
      } else {
        await axios.post(`${API}/kpis`, payload);
        toast.success('KPI created successfully');
      }
      fetchKpis();
      resetForm();
    } catch (error) {
      toast.error('Failed to save KPI');
    }
  };

  const handleEdit = (kpi) => {
    setCurrentKpi(kpi);
    setFormData({
      kpi_name: kpi.kpi_name,
      associated_goal_id: kpi.associated_goal_id || '',
      owner_id: kpi.owner_id,
      measurement_frequency: kpi.measurement_frequency,
      current_value: kpi.current_value,
      target_value: kpi.target_value,
      update_notes: kpi.update_notes || ''
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this KPI?')) {
      try {
        await axios.delete(`${API}/kpis/${id}`);
        toast.success('KPI deleted successfully');
        fetchKpis();
      } catch (error) {
        toast.error('Failed to delete KPI');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      kpi_name: '',
      associated_goal_id: '',
      owner_id: '',
      measurement_frequency: 'Monthly',
      current_value: 0,
      target_value: 0,
      update_notes: ''
    });
    setCurrentKpi(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getGoalName = (goalId) => {
    if (!goalId) return 'None';
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.goal_title : 'Unknown';
  };

  const getPerformance = (kpi) => {
    const percentage = (kpi.current_value / kpi.target_value) * 100;
    return percentage;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="kpis-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Key Performance Indicators (KPIs)</h1>
          <p className="text-gray-600">Track and monitor key performance metrics</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-kpi-button" onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create KPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit KPI' : 'Create New KPI'}</DialogTitle>
              <DialogDescription>
                {editMode ? 'Update the KPI details below' : 'Fill in the details to create a new KPI'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="kpi_name">KPI Name *</Label>
                <Input
                  id="kpi_name"
                  data-testid="kpi-name-input"
                  value={formData.kpi_name}
                  onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="associated_goal_id">Associated Goal</Label>
                <Select
                  value={formData.associated_goal_id}
                  onValueChange={(value) => setFormData({ ...formData, associated_goal_id: value })}
                >
                  <SelectTrigger data-testid="kpi-goal-select">
                    <SelectValue placeholder="Select goal (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.goal_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="owner_id">Owner *</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                >
                  <SelectTrigger data-testid="kpi-owner-select">
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
              <div>
                <Label htmlFor="measurement_frequency">Measurement Frequency *</Label>
                <Select
                  value={formData.measurement_frequency}
                  onValueChange={(value) => setFormData({ ...formData, measurement_frequency: value })}
                >
                  <SelectTrigger data-testid="kpi-frequency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_value">Current Value *</Label>
                  <Input
                    id="current_value"
                    data-testid="kpi-current-value-input"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_value">Target Value *</Label>
                  <Input
                    id="target_value"
                    data-testid="kpi-target-value-input"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="update_notes">Update Notes</Label>
                <Textarea
                  id="update_notes"
                  data-testid="kpi-notes-input"
                  value={formData.update_notes}
                  onChange={(e) => setFormData({ ...formData, update_notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-kpi-button">
                  {editMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {kpis.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No KPIs yet. Create your first KPI to start tracking performance.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Current / Target</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => {
                const performance = getPerformance(kpi);
                return (
                  <TableRow key={kpi.id} data-testid={`kpi-row-${kpi.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {kpi.kpi_name}
                        {kpi.flagged && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getUserName(kpi.owner_id)}</TableCell>
                    <TableCell>{getGoalName(kpi.associated_goal_id)}</TableCell>
                    <TableCell>{kpi.measurement_frequency}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{kpi.current_value}</span>
                        <span className="text-gray-400">/</span>
                        <span>{kpi.target_value}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {performance >= 100 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={performance >= 100 ? 'text-green-600' : 'text-red-600'}>
                          {performance.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(kpi)}
                          data-testid={`edit-kpi-${kpi.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(kpi.id)}
                          data-testid={`delete-kpi-${kpi.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default KPIsModule;
