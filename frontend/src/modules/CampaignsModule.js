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
import { Plus, Trash2, Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CampaignsModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    campaign_name: '',
    platform: 'Facebook',
    spend: '',
    results: '',
    learnings: '',
    linked_assets: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/modules/performance-campaigns`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/modules/performance-campaigns`, formData);
      toast.success('Campaign created successfully');
      setDialogOpen(false);
      setFormData({
        campaign_name: '',
        platform: 'Facebook',
        spend: '',
        results: '',
        learnings: '',
        linked_assets: ''
      });
      fetchItems();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await axios.delete(`${API}/modules/performance-campaigns/${id}`);
      toast.success('Campaign deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Facebook': return 'bg-blue-100 text-blue-800';
      case 'Google Ads': return 'bg-green-100 text-green-800';
      case 'Instagram': return 'bg-pink-100 text-pink-800';
      case 'LinkedIn': return 'bg-indigo-100 text-indigo-800';
      case 'Twitter': return 'bg-sky-100 text-sky-800';
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
    <div className="p-6" data-testid="campaigns-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Performance Campaigns</h1>
          <p className="text-gray-600">Track marketing campaigns and learnings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-button" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  placeholder="e.g., Q4 Black Friday Sale"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="TikTok">TikTok</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Spend (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Results / Metrics *</Label>
                <Textarea
                  value={formData.results}
                  onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                  placeholder="e.g., 1000 conversions, 2% CTR, 50,000 impressions"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Key Learnings *</Label>
                <Textarea
                  value={formData.learnings}
                  onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                  placeholder="What worked? What didn't? What would you do differently?"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Linked Creative Assets</Label>
                <Input
                  value={formData.linked_assets}
                  onChange={(e) => setFormData({ ...formData, linked_assets: e.target.value })}
                  placeholder="Asset IDs or names (comma separated)"
                />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Create Campaign</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No campaigns yet. Create your first campaign to track performance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.campaign_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPlatformColor(item.platform)}>{item.platform}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ₹{parseFloat(item.spend).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Results / Metrics</h4>
                    <p className="text-sm text-gray-700">{item.results}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Key Learnings</h4>
                    <p className="text-sm text-gray-700">{item.learnings}</p>
                  </div>
                  {item.linked_assets && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Linked Assets</h4>
                      <p className="text-sm text-gray-600">{item.linked_assets}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsModule;
