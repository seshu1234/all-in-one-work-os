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
import { Plus, Pencil, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ScorecardsModule = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoGenOpen, setAutoGenOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentScorecard, setCurrentScorecard] = useState(null);
  const [formData, setFormData] = useState({
    team_name: '',
    reporting_period: 'Monthly',
    goals_progress_summary: '',
    kpi_performance_summary: '',
    risks_issues: '',
    wins_recognitions: ''
  });
  const [autoGenData, setAutoGenData] = useState({ team_name: '', reporting_period: 'Monthly' });

  useEffect(() => {
    fetchScorecards();
  }, []);

  const fetchScorecards = async () => {
    try {
      const response = await axios.get(`${API}/scorecards`);
      setScorecards(response.data);
    } catch (error) {
      toast.error('Failed to load scorecards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && currentScorecard) {
        await axios.put(`${API}/scorecards/${currentScorecard.id}`, formData);
        toast.success('Scorecard updated successfully');
      } else {
        await axios.post(`${API}/scorecards`, formData);
        toast.success('Scorecard created successfully');
      }
      fetchScorecards();
      resetForm();
    } catch (error) {
      toast.error('Failed to save scorecard');
    }
  };

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/scorecards/auto-generate`, null, { params: autoGenData });
      toast.success('Scorecard auto-generated successfully!');
      fetchScorecards();
      setAutoGenOpen(false);
      setAutoGenData({ team_name: '', reporting_period: 'Monthly' });
    } catch (error) {
      toast.error('Failed to auto-generate scorecard');
    }
  };

  const handleEdit = (scorecard) => {
    setCurrentScorecard(scorecard);
    setFormData({
      team_name: scorecard.team_name,
      reporting_period: scorecard.reporting_period,
      goals_progress_summary: scorecard.goals_progress_summary,
      kpi_performance_summary: scorecard.kpi_performance_summary,
      risks_issues: scorecard.risks_issues,
      wins_recognitions: scorecard.wins_recognitions
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scorecard?')) {
      try {
        await axios.delete(`${API}/scorecards/${id}`);
        toast.success('Scorecard deleted successfully');
        fetchScorecards();
      } catch (error) {
        toast.error('Failed to delete scorecard');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      team_name: '',
      reporting_period: 'Monthly',
      goals_progress_summary: '',
      kpi_performance_summary: '',
      risks_issues: '',
      wins_recognitions: ''
    });
    setCurrentScorecard(null);
    setEditMode(false);
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="scorecards-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Scorecards</h1>
          <p className="text-gray-600">Track team performance and achievements</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={autoGenOpen} onOpenChange={setAutoGenOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="auto-generate-scorecard-button">
                <Sparkles className="w-4 h-4 mr-2" />Auto-Generate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Auto-Generate Scorecard</DialogTitle>
                <DialogDescription>Generate a scorecard based on KPIs, KRIs, Tasks, and Shoutouts</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAutoGenerate} className="space-y-4">
                <div>
                  <Label htmlFor="auto_team_name">Team Name *</Label>
                  <Input id="auto_team_name" value={autoGenData.team_name} onChange={(e) => setAutoGenData({...autoGenData, team_name: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="auto_period">Reporting Period *</Label>
                  <Select value={autoGenData.reporting_period} onValueChange={(value) => setAutoGenData({...autoGenData, reporting_period: value})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setAutoGenOpen(false)}>Cancel</Button>
                  <Button type="submit">Generate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-scorecard-button" onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />Create Scorecard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Scorecard' : 'Create New Scorecard'}</DialogTitle>
                <DialogDescription>{editMode ? 'Update scorecard details' : 'Fill in the scorecard details'}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="team_name">Team Name *</Label>
                  <Input id="team_name" data-testid="scorecard-team-name-input" value={formData.team_name} onChange={(e) => setFormData({...formData, team_name: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="reporting_period">Reporting Period *</Label>
                  <Select value={formData.reporting_period} onValueChange={(value) => setFormData({...formData, reporting_period: value})}>
                    <SelectTrigger data-testid="scorecard-period-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="goals_progress_summary">Goals Progress Summary *</Label>
                  <Textarea id="goals_progress_summary" value={formData.goals_progress_summary} onChange={(e) => setFormData({...formData, goals_progress_summary: e.target.value})} rows={2} required />
                </div>
                <div>
                  <Label htmlFor="kpi_performance_summary">KPI Performance Summary *</Label>
                  <Textarea id="kpi_performance_summary" value={formData.kpi_performance_summary} onChange={(e) => setFormData({...formData, kpi_performance_summary: e.target.value})} rows={2} required />
                </div>
                <div>
                  <Label htmlFor="risks_issues">Risks & Issues *</Label>
                  <Textarea id="risks_issues" value={formData.risks_issues} onChange={(e) => setFormData({...formData, risks_issues: e.target.value})} rows={2} required />
                </div>
                <div>
                  <Label htmlFor="wins_recognitions">Wins & Recognitions *</Label>
                  <Textarea id="wins_recognitions" value={formData.wins_recognitions} onChange={(e) => setFormData({...formData, wins_recognitions: e.target.value})} rows={2} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" data-testid="submit-scorecard-button">{editMode ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {scorecards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No scorecards yet. Create or auto-generate your first scorecard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scorecards.map((scorecard) => (
            <Card key={scorecard.id} data-testid={`scorecard-card-${scorecard.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{scorecard.team_name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{scorecard.reporting_period}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(scorecard)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(scorecard.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Goals Progress</p>
                  <p className="text-sm">{scorecard.goals_progress_summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">KPI Performance</p>
                  <p className="text-sm">{scorecard.kpi_performance_summary}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Risks & Issues</p>
                  <p className="text-sm">{scorecard.risks_issues}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Wins & Recognitions</p>
                  <p className="text-sm">{scorecard.wins_recognitions}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScorecardsModule;
