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
import { Plus, Pencil, Trash2, Loader2, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KnowledgeHubModule = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({
    topic_title: '',
    category: 'Operations',
    detailed_sop_steps: '',
    attachments: '',
    added_by_id: ''
  });

  const categories = ['All', 'Sales Playbook', 'Content Guidelines', 'Performance Learnings', 'Branding', 'Operations', 'Product', 'HR / Policy'];

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/knowledge-hub`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load knowledge base');
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
        await axios.put(`${API}/knowledge-hub/${currentItem.id}`, formData);
        toast.success('Knowledge article updated');
      } else {
        await axios.post(`${API}/knowledge-hub`, formData);
        toast.success('Knowledge article created');
      }
      fetchItems();
      resetForm();
    } catch (error) {
      toast.error('Failed to save article');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      topic_title: item.topic_title,
      category: item.category,
      detailed_sop_steps: item.detailed_sop_steps,
      attachments: item.attachments || '',
      added_by_id: item.added_by_id
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`${API}/knowledge-hub/${id}`);
        toast.success('Article deleted');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      topic_title: '',
      category: 'Operations',
      detailed_sop_steps: '',
      attachments: '',
      added_by_id: ''
    });
    setCurrentItem(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'Sales Playbook': 'bg-blue-100 text-blue-800',
      'Content Guidelines': 'bg-purple-100 text-purple-800',
      'Performance Learnings': 'bg-green-100 text-green-800',
      'Branding': 'bg-pink-100 text-pink-800',
      'Operations': 'bg-orange-100 text-orange-800',
      'Product': 'bg-indigo-100 text-indigo-800',
      'HR / Policy': 'bg-yellow-100 text-yellow-800'
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.topic_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6" data-testid="knowledge-hub-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Hub</h1>
          <p className="text-gray-600">Centralized repository of SOPs and guides</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-knowledge-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Article' : 'Create New Article'}</DialogTitle>
              <DialogDescription>Document procedures and best practices</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="topic_title">Topic Title *</Label>
                <Input id="topic_title" data-testid="knowledge-title-input" value={formData.topic_title} onChange={(e) => setFormData({...formData, topic_title: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger data-testid="knowledge-category-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="detailed_sop_steps">Detailed Steps / SOP *</Label>
                <Textarea id="detailed_sop_steps" value={formData.detailed_sop_steps} onChange={(e) => setFormData({...formData, detailed_sop_steps: e.target.value})} rows={8} placeholder="Step 1: ...\nStep 2: ..." required />
              </div>
              <div>
                <Label htmlFor="added_by_id">Author *</Label>
                <Select value={formData.added_by_id} onValueChange={(value) => setFormData({...formData, added_by_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                  <SelectContent>
                    {users.map(user => <SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-knowledge-button">{editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input placeholder="Search articles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No articles found. Add your first knowledge article!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} data-testid={`knowledge-card-${item.id}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Badge className={`${getCategoryColor(item.category)} mb-2`}>{item.category}</Badge>
                    <CardTitle className="text-lg">{item.topic_title}</CardTitle>
                    <CardDescription>By {getUserName(item.added_by_id)}</CardDescription>
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
                <p className="text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">{item.detailed_sop_steps}</p>
                <p className="text-xs text-gray-400 mt-4">Updated {new Date(item.last_updated).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeHubModule;