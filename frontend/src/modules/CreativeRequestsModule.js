import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CreativeRequestsModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_title: '',
    type: 'Graphic Design',
    brief: '',
    references: '',
    requested_by: '',
    assigned_designer: '',
    status: 'New Request'
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/modules/creative-requests`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load creative requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/modules/creative-requests`, formData);
      toast.success('Creative request created successfully');
      setDialogOpen(false);
      setFormData({
        request_title: '',
        type: 'Graphic Design',
        brief: '',
        references: '',
        requested_by: '',
        assigned_designer: '',
        status: 'New Request'
      });
      fetchItems();
    } catch (error) {
      toast.error('Failed to create creative request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await axios.delete(`${API}/modules/creative-requests/${id}`);
      toast.success('Request deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="creative-requests-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Creative Requests</h1>
          <p className="text-gray-600">Streamline design and creative workflows</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-button" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Creative Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Request Title *</Label>
                <Input
                  value={formData.request_title}
                  onChange={(e) => setFormData({ ...formData, request_title: e.target.value })}
                  placeholder="e.g., Social Media Banner for Q4 Campaign"
                  required
                />
              </div>

              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Graphic Design">Graphic Design</SelectItem>
                    <SelectItem value="Video Editing">Video Editing</SelectItem>
                    <SelectItem value="Copywriting">Copywriting</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Brief / Requirements *</Label>
                <Textarea
                  value={formData.brief}
                  onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                  placeholder="Describe what you need in detail..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>References / Brand Assets</Label>
                <Textarea
                  value={formData.references}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Links to references, brand guidelines, examples..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested By *</Label>
                  <Input
                    value={formData.requested_by}
                    onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <Label>Assigned Designer</Label>
                  <Input
                    value={formData.assigned_designer}
                    onChange={(e) => setFormData({ ...formData, assigned_designer: e.target.value })}
                    placeholder="Designer name (optional)"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Request">New Request</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Create Request</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No creative requests yet. Create your first request to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.request_title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{item.brief}</p>
                  {item.references && (
                    <p className="text-gray-600"><strong>References:</strong> {item.references}</p>
                  )}
                  <div className="flex gap-4 text-gray-600">
                    <span><strong>Requested by:</strong> {item.requested_by}</span>
                    {item.assigned_designer && (
                      <span><strong>Designer:</strong> {item.assigned_designer}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreativeRequestsModule;
