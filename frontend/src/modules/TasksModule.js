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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TasksModule = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    task_title: '',
    description: '',
    linked_idea_id: '',
    assigned_to_id: '',
    priority: 'Medium',
    status: 'To Do',
    deadline: '',
    comments: '',
    attachments: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchIdeas();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
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

  const fetchIdeas = async () => {
    try {
      const response = await axios.get(`${API}/ideas`);
      setIdeas(response.data);
    } catch (error) {
      console.error('Failed to load ideas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentTask) {
        await axios.put(`${API}/tasks/${currentTask.id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await axios.post(`${API}/tasks`, formData);
        toast.success('Task created successfully');
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      task_title: task.task_title,
      description: task.description,
      linked_idea_id: task.linked_idea_id || '',
      assigned_to_id: task.assigned_to_id,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      comments: task.comments || '',
      attachments: task.attachments || ''
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API}/tasks/${id}`);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      task_title: '',
      description: '',
      linked_idea_id: '',
      assigned_to_id: '',
      priority: 'Medium',
      status: 'To Do',
      deadline: '',
      comments: '',
      attachments: ''
    });
    setCurrentTask(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.username : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-100 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'In Review': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
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
    <div className="p-6" data-testid="tasks-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage tasks and assignments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-task-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              <DialogDescription>{editMode ? 'Update task details' : 'Fill in the task details'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="task_title">Task Title *</Label>
                <Input id="task_title" data-testid="task-title-input" value={formData.task_title} onChange={(e) => setFormData({...formData, task_title: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} required />
              </div>
              <div>
                <Label htmlFor="linked_idea_id">Linked Idea (Optional)</Label>
                <Select value={formData.linked_idea_id} onValueChange={(value) => setFormData({...formData, linked_idea_id: value})}>
                  <SelectTrigger><SelectValue placeholder="Select idea (optional)" /></SelectTrigger>
                  <SelectContent>
                    {ideas.map((idea) => (<SelectItem key={idea.id} value={idea.id}>{idea.idea_title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assigned_to_id">Assigned To *</Label>
                <Select value={formData.assigned_to_id} onValueChange={(value) => setFormData({...formData, assigned_to_id: value})}>
                  <SelectTrigger data-testid="task-assignee-select"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (<SelectItem key={user.id} value={user.id}>{user.username}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger data-testid="task-status-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="To Do">To Do</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline *</Label>
                <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
              </div>
              <div>
                <Label htmlFor="comments">Comments</Label>
                <Textarea id="comments" value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})} rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" data-testid="submit-task-button">{editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No tasks yet. Create your first task to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} data-testid={`task-row-${task.id}`}>
                  <TableCell className="font-medium">{task.task_title}</TableCell>
                  <TableCell>{getUserName(task.assigned_to_id)}</TableCell>
                  <TableCell><Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge></TableCell>
                  <TableCell><Badge className={getStatusColor(task.status)}>{task.status}</Badge></TableCell>
                  <TableCell>{task.deadline}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(task)} data-testid={`edit-task-${task.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(task.id)} data-testid={`delete-task-${task.id}`}>
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

export default TasksModule;
