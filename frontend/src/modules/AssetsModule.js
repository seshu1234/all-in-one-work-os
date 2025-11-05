import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Download, Trash2, Loader2, FolderOpen, File } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AssetsModule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset_name: '',
    file_url: '',
    tags: '',
    created_by: '',
    linked_tasks: '',
    download_count: 0
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/modules/asset-library`);
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/modules/asset-library`, formData);
      toast.success('Asset added successfully');
      setDialogOpen(false);
      setFormData({
        asset_name: '',
        file_url: '',
        tags: '',
        created_by: '',
        linked_tasks: '',
        download_count: 0
      });
      fetchItems();
    } catch (error) {
      toast.error('Failed to add asset');
    }
  };

  const handleDownload = async (id, currentCount) => {
    try {
      // Increment download count
      await axios.put(`${API}/modules/asset-library/${id}`, {
        download_count: currentCount + 1
      });
      toast.success('Download counted');
      fetchItems();
    } catch (error) {
      console.error('Failed to update download count');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await axios.delete(`${API}/modules/asset-library/${id}`);
      toast.success('Asset deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete asset');
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
    <div className="p-6" data-testid="assets-module">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Asset Library</h1>
          <p className="text-gray-600">Centralized repository for all digital assets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-button" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Asset Name *</Label>
                <Input
                  value={formData.asset_name}
                  onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  placeholder="e.g., Brand Logo - Primary"
                  required
                />
              </div>

              <div>
                <Label>File URL *</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://... (link to file)"
                  required
                />
              </div>

              <div>
                <Label>Tags</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="logo, brand, marketing (comma separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created By *</Label>
                  <Input
                    value={formData.created_by}
                    onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <Label>Linked Tasks</Label>
                  <Input
                    value={formData.linked_tasks}
                    onChange={(e) => setFormData({ ...formData, linked_tasks: e.target.value })}
                    placeholder="Related task IDs (optional)"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Add Asset</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No assets yet. Add your first asset to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <File className="w-5 h-5 text-red-600 mt-1" />
                    <div>
                      <CardTitle className="text-base">{item.asset_name}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">by {item.created_by}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.split(',').map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    <Download className="w-3 h-3 inline mr-1" />
                    {item.download_count} downloads
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      window.open(item.file_url, '_blank');
                      handleDownload(item.id, item.download_count);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
                {item.linked_tasks && (
                  <p className="text-xs text-gray-500 mt-2">Linked: {item.linked_tasks}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetsModule;
