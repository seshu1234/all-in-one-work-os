import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KRIsModule = () => {
  const [kris, setKris] = useState([]);
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentKri, setCurrentKri] = useState(null);
  const [formData, setFormData] = useState({
    risk_area: '',
    associated_goal_id: '',
    risk_description: '',
    risk_level: 'Low',
    mitigation_owner_id: '',
    action_plan: '',
    status: 'Monitoring'
  });

  useEffect(() => {
    fetchKris();
    fetchUsers();
    fetchGoals();
  }, []);

  const fetchKris = async () => {
    try {
      const response = await axios.get(`${API}/kris`);
      setKris(response.data);
    } catch (error) {
      toast.error('Failed to load KRIs');
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
      if (editMode && currentKri) {
        await axios.put(`${API}/kris/${currentKri.id}`, formData);
        toast.success('KRI updated successfully');
        if (formData.risk_level === 'Critical') {
          toast.warning('Critical risk alert sent to leadership!', { duration: 5000 });
        }
      } else {
        await axios.post(`${API}/kris`, formData);
        toast.success('KRI created successfully');
        if (formData.risk_level === 'Critical') {
          toast.warning('Critical risk alert sent to leadership!', { duration: 5000 });
        }
      }
      fetchKris();
      resetForm();
    } catch (error) {
      toast.error('Failed to save KRI');
    }
  };

  const handleEdit = (kri) => {
    setCurrentKri(kri);
    setFormData({
      risk_area: kri.risk_area,
      associated_goal_id: kri.associated_goal_id || '',
      risk_description: kri.risk_description,
      risk_level: kri.risk_level,
      mitigation_owner_id: kri.mitigation_owner_id,
      action_plan: kri.action_plan,
      status: kri.status
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this KRI?')) {
      try {
        await axios.delete(`${API}/kris/${id}`);
        toast.success('KRI deleted successfully');
        fetchKris();
      } catch (error) {
        toast.error('Failed to delete KRI');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      risk_area: '',
      associated_goal_id: '',
      risk_description: '',
      risk_level: 'Low',
      mitigation_owner_id: '',
      action_plan: '',
      status: 'Monitoring'
    });
    setCurrentKri(null);
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

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Critical': return <AlertTriangle className="w-4 h-4" />;
      case 'High': return <AlertCircle className="w-4 h-4" />;
      case 'Medium': return <Info className="w-4 h-4" />;
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Monitoring': return 'bg-blue-100 text-blue-800';
      case 'Mitigating': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const criticalRisks = kris.filter(k => k.risk_level === 'Critical').length;
  const highRisks = kris.filter(k => k.risk_level === 'High').length;

  return (
    <div className="p-6" data-testid="kris-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Key Risk Indicators (KRIs)</h1>
          <p className="text-gray-600">Monitor and manage organizational risks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-kri-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Create KRI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit KRI' : 'Create New KRI'}</DialogTitle>
              <DialogDescription>
                {editMode ? 'Update the KRI details below' : 'Fill in the details to create a new KRI'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="risk_area">Risk Area *</Label>
                <Input id="risk_area" data-testid="kri-risk-area-input" value={formData.risk_area} onChange={(e) => setFormData({ ...formData, risk_area: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="associated_goal_id">Associated Goal / Project</Label>
                <Select value={formData.associated_goal_id} onValueChange={(value) => setFormData({ ...formData, associated_goal_id: value })}>
                  <SelectTrigger data-testid="kri-goal-select"><SelectValue placeholder="Select goal (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {goals.map((goal) => (<SelectItem key={goal.id} value={goal.id}>{goal.goal_title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="risk_description">Risk Description *</Label>
                <Textarea id="risk_description" data-testid="kri-description-input" value={formData.risk_description} onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })} rows={3} required />
              </div>
              <div>
                <Label htmlFor="risk_level">Risk Level *</Label>
                <Select value={formData.risk_level} onValueChange={(value) => setFormData({ ...formData, risk_level: value })}>
                  <SelectTrigger data-testid="kri-level-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {formData.risk_level === 'Critical' && (<p className="text-sm text-red-600 mt-1">⚠️ Leadership will be notified</p>)}
              </div>
              <div>
                <Label htmlFor="mitigation_owner_id">Mitigation Owner *</Label>
                <Select value={formData.mitigation_owner_id} onValueChange={(value) => setFormData({ ...formData, mitigation_owner_id: value })}>
                  <SelectTrigger data-testid="kri-owner-select"><SelectValue placeholder="Select owner" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (<SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action_plan">Action Plan *</Label>
                <Textarea id="action_plan" data-testid="kri-action-plan-input" value={formData.action_plan} onChange={(e) => setFormData({ ...formData, action_plan: e.target.value })} rows={3} required />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger data-testid="kri-status-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monitoring">Monitoring</SelectItem>
                    <SelectItem value="Mitigating">Mitigating</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-kri-button">{editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Total Risks</p><p className="text-3xl font-bold">{kris.length}</p></div>
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Critical Risks</p><p className="text-3xl font-bold text-red-600">{criticalRisks}</p></div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">High Risks</p><p className="text-3xl font-bold text-orange-600">{highRisks}</p></div>
            <AlertCircle className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>
      {kris.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No KRIs yet. Create your first KRI to start monitoring risks.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Area</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kris.map((kri) => (
                <TableRow key={kri.id} data-testid={`kri-row-${kri.id}`}>
                  <TableCell className="font-medium">{kri.risk_area}</TableCell>
                  <TableCell>
                    <Badge className={`${getRiskLevelColor(kri.risk_level)} flex items-center gap-1 w-fit`}>
                      {getRiskIcon(kri.risk_level)}{kri.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{getUserName(kri.mitigation_owner_id)}</TableCell>
                  <TableCell>{getGoalName(kri.associated_goal_id)}</TableCell>
                  <TableCell><Badge className={getStatusColor(kri.status)}>{kri.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(kri)} data-testid={`edit-kri-${kri.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(kri.id)} data-testid={`delete-kri-${kri.id}`}>
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

export default KRIsModule;
