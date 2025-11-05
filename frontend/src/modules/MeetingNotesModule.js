import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Pencil, Trash2, Loader2, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MeetingNotesModule = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    meeting_title: '',
    raw_notes: '',
    auto_extracted_action_items: '',
    assigned_stakeholders: [],
    next_review_date: ''
  });

  useEffect(() => {
    fetchItems();
    fetchUsers();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/meeting-notes`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load meeting notes');
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
        await axios.put(`${API}/meeting-notes/${currentItem.id}`, formData);
        toast.success('Meeting note updated');
      } else {
        await axios.post(`${API}/meeting-notes`, formData);
        toast.success('Meeting note created');
      }
      fetchItems();
      resetForm();
    } catch (error) {
      toast.error('Failed to save meeting note');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      meeting_title: item.meeting_title,
      raw_notes: item.raw_notes,
      auto_extracted_action_items: item.auto_extracted_action_items || '',
      assigned_stakeholders: item.assigned_stakeholders || [],
      next_review_date: item.next_review_date || ''
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this meeting note?')) {
      try {
        await axios.delete(`${API}/meeting-notes/${id}`);
        toast.success('Meeting note deleted');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      meeting_title: '',
      raw_notes: '',
      auto_extracted_action_items: '',
      assigned_stakeholders: [],
      next_review_date: ''
    });
    setCurrentItem(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6" data-testid="meeting-notes-module">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meeting Notes</h1>
        <p className="text-gray-600">Document meetings and track action items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Meetings</CardDescription>
            <CardTitle className="text-3xl">{items.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <FileText className="w-4 h-4 mr-1" />Documented
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-6">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-meeting-note-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Meeting Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit' : 'Create'} Meeting Note</DialogTitle>
              <DialogDescription>Document meeting details and action items</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="meeting_title">Meeting Title *</Label>
                <Input id="meeting_title" data-testid="meeting-title-input" value={formData.meeting_title} onChange={(e) => setFormData({...formData, meeting_title: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="raw_notes">Meeting Notes *</Label>
                <Textarea id="raw_notes" value={formData.raw_notes} onChange={(e) => setFormData({...formData, raw_notes: e.target.value})} rows={5} required />
              </div>
              <div>
                <Label htmlFor="auto_extracted_action_items">Action Items</Label>
                <Textarea id="auto_extracted_action_items" value={formData.auto_extracted_action_items} onChange={(e) => setFormData({...formData, auto_extracted_action_items: e.target.value})} rows={3} placeholder="1. ...\n2. ..." />
              </div>
              <div>
                <Label htmlFor="next_review_date">Next Review Date</Label>
                <Input id="next_review_date" type="date" value={formData.next_review_date} onChange={(e) => setFormData({...formData, next_review_date: e.target.value})} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-meeting-note-button">{editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No meeting notes yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.id} data-testid={`meeting-note-card-${item.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.meeting_title}</CardTitle>
                    <CardDescription>{new Date(item.created_at).toLocaleDateString()}</CardDescription>
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
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-3">{item.raw_notes}</p>
                {item.auto_extracted_action_items && (
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <p className="text-xs font-semibold text-blue-800">Action Items:</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{item.auto_extracted_action_items}</p>
                  </div>
                )}
                {item.next_review_date && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    Next review: {item.next_review_date}
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

export default MeetingNotesModule;