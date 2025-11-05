import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContentIdeasModule = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    idea_title: '',
    description_script_notes: '',
    tags: [],
    submitted_by_id: '',
    status: 'New'
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/content-ideas`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load content ideas');
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
      if (editMode && currentItem) {
        await axios.put(`${API}/content-ideas/${currentItem.id}`, formData);
        toast.success('Content idea updated');
      } else {
        await axios.post(`${API}/content-ideas`, formData);
        toast.success('Content idea created');
      }
      fetchItems();
      resetForm();
    } catch (error) {
      toast.error('Failed to save content idea');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      idea_title: item.idea_title,
      description_script_notes: item.description_script_notes,
      tags: item.tags || [],
      submitted_by_id: item.submitted_by_id,
      status: item.status
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this content idea?')) {
      try {
        await axios.delete(`${API}/content-ideas/${id}`);
        toast.success('Content idea deleted');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({...formData, tags: [...formData.tags, tagInput.trim()]});
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({...formData, tags: formData.tags.filter(t => t !== tag)});
  };

  const resetForm = () => {
    setFormData({
      idea_title: '',
      description_script_notes: '',
      tags: [],
      submitted_by_id: '',
      status: 'New'
    });
    setTagInput('');
    setCurrentItem(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Pipeline': return 'bg-yellow-100 text-yellow-800';
      case 'Published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6" data-testid="content-ideas-module">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Content Idea Bank</h1>
        <p className="text-gray-600">Manage your content pipeline and ideas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Ideas</CardDescription>
            <CardTitle className="text-3xl">{items.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <ImageIcon className="w-4 h-4 mr-1" />Content pipeline
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Pipeline</CardDescription>
            <CardTitle className="text-3xl">{items.filter(i => i.status === 'In Pipeline').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">{items.filter(i => i.status === 'Published').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-content-idea-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Content Idea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Create'} Content Idea</DialogTitle>
              <DialogDescription>Add a new content idea to your pipeline</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="idea_title">Idea Title *</Label>
                <Input id="idea_title" data-testid="content-idea-title-input" value={formData.idea_title} onChange={(e) => setFormData({...formData, idea_title: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="description_script_notes">Description / Script Notes *</Label>
                <Textarea id="description_script_notes" value={formData.description_script_notes} onChange={(e) => setFormData({...formData, description_script_notes: e.target.value})} rows={5} required />
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag" />
                  <Button type="button" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="submitted_by_id">Submitted By *</Label>
                <Select value={formData.submitted_by_id} onValueChange={(value) => setFormData({...formData, submitted_by_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>
                    {users.map(user => <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger data-testid="content-idea-status-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Pipeline">In Pipeline</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-content-idea-button">{editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No content ideas yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} data-testid={`content-idea-card-${item.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.idea_title}</CardTitle>
                    <CardDescription>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.description_script_notes}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentIdeasModule;