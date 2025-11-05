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
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Pencil, Trash2, Loader2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IdeasModule = () => {
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(null);
  const [formData, setFormData] = useState({
    associated_goal_id: '',
    idea_title: '',
    idea_description: '',
    submitted_by_id: '',
    submit_anonymously: false,
    status: 'New',
    manager_comments: ''
  });

  useEffect(() => {
    fetchIdeas();
    fetchUsers();
    fetchGoals();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get(`${API}/ideas`);
      setIdeas(response.data);
    } catch (error) {
      toast.error('Failed to load ideas');
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
      if (editMode && currentIdea) {
        await axios.put(`${API}/ideas/${currentIdea.id}`, formData);
        toast.success('Idea updated successfully');
        if (currentIdea.status !== 'Accepted' && formData.status === 'Accepted') {
          toast.success('Task auto-created for accepted idea!', { duration: 5000 });
        }
      } else {
        await axios.post(`${API}/ideas`, formData);
        toast.success('Idea submitted successfully');
        if (formData.status === 'Accepted') {
          toast.success('Task auto-created for accepted idea!', { duration: 5000 });
        }
      }
      fetchIdeas();
      resetForm();
    } catch (error) {
      toast.error('Failed to save idea');
    }
  };

  const handleEdit = (idea) => {
    setCurrentIdea(idea);
    setFormData({
      associated_goal_id: idea.associated_goal_id || '',
      idea_title: idea.idea_title,
      idea_description: idea.idea_description,
      submitted_by_id: idea.submitted_by_id,
      submit_anonymously: idea.submit_anonymously,
      status: idea.status,
      manager_comments: idea.manager_comments || ''
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await axios.delete(`${API}/ideas/${id}`);
        toast.success('Idea deleted successfully');
        fetchIdeas();
      } catch (error) {
        toast.error('Failed to delete idea');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      associated_goal_id: '',
      idea_title: '',
      idea_description: '',
      submitted_by_id: '',
      submit_anonymously: false,
      status: 'New',
      manager_comments: ''
    });
    setCurrentIdea(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getUserName = (userId, isAnonymous) => {
    if (isAnonymous) return 'Anonymous User';
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Needs Discussion': return 'bg-purple-100 text-purple-800';
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

  return (
    <div className="p-6" data-testid="ideas-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Idea Suggestions</h1>
          <p className="text-gray-600">Submit and manage innovative ideas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-idea-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Submit Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Idea' : 'Submit New Idea'}</DialogTitle>
              <DialogDescription>{editMode ? 'Update idea details' : 'Share your innovative idea'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="idea_title">Idea Title *</Label>
                <Input id="idea_title" data-testid="idea-title-input" value={formData.idea_title} onChange={(e) => setFormData({...formData, idea_title: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="idea_description">Idea Description *</Label>
                <Textarea id="idea_description" value={formData.idea_description} onChange={(e) => setFormData({...formData, idea_description: e.target.value})} rows={4} required />
              </div>
              <div>
                <Label htmlFor="associated_goal_id">Associated Goal (Optional)</Label>
                <Select value={formData.associated_goal_id} onValueChange={(value) => setFormData({...formData, associated_goal_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select goal (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {goals.map((goal) => (<SelectItem key={goal.id} value={goal.id}>{goal.goal_title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="submitted_by_id">Submitted By *</Label>
                <Select value={formData.submitted_by_id} onValueChange={(value) => setFormData({...formData, submitted_by_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select submitter" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (<SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="submit_anonymously" checked={formData.submit_anonymously} onCheckedChange={(checked) => setFormData({...formData, submit_anonymously: checked})} />
                <Label htmlFor="submit_anonymously" className="cursor-pointer">Submit Anonymously</Label>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger data-testid="idea-status-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Needs Discussion">Needs Discussion</SelectItem>
                  </SelectContent>
                </Select>
                {formData.status === 'Accepted' && (<p className="text-sm text-green-600 mt-1">✅ A task will be auto-created</p>)}
              </div>
              <div>
                <Label htmlFor="manager_comments">Manager Comments</Label>
                <Textarea id="manager_comments" value={formData.manager_comments} onChange={(e) => setFormData({...formData, manager_comments: e.target.value})} rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-idea-button">{editMode ? 'Update' : 'Submit'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No ideas yet. Submit your first innovative idea!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ideas.map((idea) => (
                <TableRow key={idea.id} data-testid={`idea-row-${idea.id}`}>
                  <TableCell className="font-medium">{idea.idea_title}</TableCell>
                  <TableCell>{getUserName(idea.submitted_by_id, idea.submit_anonymously)}</TableCell>
                  <TableCell><Badge className={getStatusColor(idea.status)}>{idea.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(idea)} data-testid={`edit-idea-${idea.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(idea.id)} data-testid={`delete-idea-${idea.id}`}>
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

export default IdeasModule;
