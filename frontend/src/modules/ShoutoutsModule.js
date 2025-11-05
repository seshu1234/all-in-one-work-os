import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Plus, Loader2, Heart, Trash2, Award, TrendingUp, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ShoutoutsModule = () => {
  const [shoutouts, setShoutouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ from_user_id: '', to_user_id: '', message: '', related_work_id: '' });

  useEffect(() => {
    fetchShoutouts();
    fetchUsers();
    fetchTasks();
  }, []);

  const fetchShoutouts = async () => {
    try {
      const response = await axios.get(`${API}/shoutouts`);
      setShoutouts(response.data);
    } catch (error) {
      toast.error('Failed to load shoutouts');
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

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/shoutouts`, formData);
      toast.success('Shoutout sent successfully!');
      fetchShoutouts();
      resetForm();
    } catch (error) {
      toast.error('Failed to send shoutout');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shoutout?')) {
      try {
        await axios.delete(`${API}/shoutouts/${id}`);
        toast.success('Shoutout deleted');
        fetchShoutouts();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({ from_user_id: '', to_user_id: '', message: '', related_work_id: '' });
    setDialogOpen(false);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getUserInitials = (userId) => {
    const name = getUserName(userId);
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6" data-testid="shoutouts-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shoutouts & Recognition</h1>
          <p className="text-gray-600">Celebrate achievements and appreciate team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-shoutout-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Give Shoutout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Give a Shoutout</DialogTitle>
              <DialogDescription>Recognize someone's great work</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="from_user_id">From *</Label>
                <Select value={formData.from_user_id} onValueChange={(value) => setFormData({...formData, from_user_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select your name" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (<SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="to_user_id">To *</Label>
                <Select value={formData.to_user_id} onValueChange={(value) => setFormData({...formData, to_user_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (<SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" data-testid="shoutout-message-input" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={4} placeholder="Write your appreciation message..." required />
              </div>
              <div>
                <Label htmlFor="related_work_id">Related Task (Optional)</Label>
                <Select value={formData.related_work_id} onValueChange={(value) => setFormData({...formData, related_work_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select task (optional)" /></SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (<SelectItem key={task.id} value={task.id}>{task.task_title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-shoutout-button">Send Shoutout</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {shoutouts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No shoutouts yet. Be the first to recognize someone!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shoutouts.map((shoutout) => (
            <Card key={shoutout.id} data-testid={`shoutout-card-${shoutout.id}`} className="relative">
              <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => handleDelete(shoutout.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">{getUserInitials(shoutout.to_user_id)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{getUserName(shoutout.to_user_id)}</CardTitle>
                    <CardDescription>from {getUserName(shoutout.from_user_id)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 italic">"{shoutout.message}"</p>
                <div className="flex items-center justify-between mt-4">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <p className="text-xs text-gray-500">{new Date(shoutout.date).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoutoutsModule;
