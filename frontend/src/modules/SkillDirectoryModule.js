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
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Plus, Trash2, Loader2, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SkillDirectoryModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: '',
    team: '',
    skills: '',
    tools_used: '',
    notable_projects: '',
    contact_method: 'Email'
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/modules/skill-directory`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load skill directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/modules/skill-directory`, formData);
      toast.success('Employee profile added successfully');
      setDialogOpen(false);
      setFormData({
        employee_name: '',
        team: '',
        skills: '',
        tools_used: '',
        notable_projects: '',
        contact_method: 'Email'
      });
      fetchItems();
    } catch (error) {
      toast.error('Failed to add profile');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;
    try {
      await axios.delete(`${API}/modules/skill-directory/${id}`);
      toast.success('Profile deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="skill-directory-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Skill Directory</h1>
          <p className="text-gray-600">Find the right expert for any project</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-button" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Employee Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Name *</Label>
                  <Input
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label>Team *</Label>
                  <Input
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="e.g., Marketing, Engineering"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Skills *</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js (comma separated)"
                  required
                />
              </div>

              <div>
                <Label>Tools Used *</Label>
                <Input
                  value={formData.tools_used}
                  onChange={(e) => setFormData({ ...formData, tools_used: e.target.value })}
                  placeholder="VS Code, Figma, Jira (comma separated)"
                  required
                />
              </div>

              <div>
                <Label>Notable Projects</Label>
                <Textarea
                  value={formData.notable_projects}
                  onChange={(e) => setFormData({ ...formData, notable_projects: e.target.value })}
                  placeholder="List significant projects or achievements..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Preferred Contact Method</Label>
                <Select value={formData.contact_method} onValueChange={(value) => setFormData({ ...formData, contact_method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Slack">Slack</SelectItem>
                    <SelectItem value="Teams">Microsoft Teams</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Add to Directory</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No employees in the directory yet. Add profiles to build your skill directory.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-red-600">
                      <AvatarFallback className="bg-red-600 text-white font-semibold">
                        {getInitials(item.employee_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{item.employee_name}</CardTitle>
                      <p className="text-sm text-gray-600">{item.team}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.skills.split(',').map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Tools</h4>
                    <div className="flex flex-wrap gap-1">
                      {item.tools_used.split(',').map((tool, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-gray-100">
                          {tool.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {item.notable_projects && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Notable Projects</h4>
                      <p className="text-xs text-gray-700">{item.notable_projects}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {item.contact_method === 'Email' ? (
                        <Mail className="w-3 h-3" />
                      ) : (
                        <Phone className="w-3 h-3" />
                      )}
                      <span>Contact via {item.contact_method}</span>
                    </div>
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

export default SkillDirectoryModule;
