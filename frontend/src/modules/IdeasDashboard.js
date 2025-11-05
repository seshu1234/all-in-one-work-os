import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Lightbulb, ThumbsUp, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

const IdeasDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/idea-suggestions`);
      const ideasData = response.data;
      setIdeas(ideasData);
      
      // Calculate stats
      const total = ideasData.length;
      const pending = ideasData.filter(i => i.status === 'Pending Review').length;
      const accepted = ideasData.filter(i => i.status === 'Accepted').length;
      const rejected = ideasData.filter(i => i.status === 'Rejected').length;
      
      setStats({ total, pending, accepted, rejected });
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending Review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="h-4 w-4" />;
      case 'Pending Review': return <Clock className="h-4 w-4" />;
      case 'Rejected': return <XCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ideas Dashboard</h1>
        <p className="text-gray-600">Track team suggestions and innovation pipeline</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-600">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-gray-600">Moving to execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-gray-600">Not proceeding</p>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Review
            </CardTitle>
            <CardDescription>Ideas awaiting management review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ideas.filter(i => i.status === 'Pending Review').length === 0 ? (
                <p className="text-center py-4 text-gray-500 text-sm">No pending ideas</p>
              ) : (
                ideas.filter(i => i.status === 'Pending Review').map((idea) => (
                  <div key={idea.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{idea.idea_title}</h4>
                      <Badge className={getStatusColor(idea.status)} variant="outline">
                        {getStatusIcon(idea.status)}
                        <span className="ml-1">{idea.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{idea.idea_description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By: {idea.submit_anonymously ? 'Anonymous' : idea.submitted_by}</span>
                      <span>Goal: {idea.associated_goal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accepted Ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Accepted Ideas
            </CardTitle>
            <CardDescription>Ideas approved for implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ideas.filter(i => i.status === 'Accepted').length === 0 ? (
                <p className="text-center py-4 text-gray-500 text-sm">No accepted ideas yet</p>
              ) : (
                ideas.filter(i => i.status === 'Accepted').map((idea) => (
                  <div key={idea.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-green-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{idea.idea_title}</h4>
                      <Badge className={getStatusColor(idea.status)} variant="outline">
                        {getStatusIcon(idea.status)}
                        <span className="ml-1">{idea.status}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{idea.idea_description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>By: {idea.submit_anonymously ? 'Anonymous' : idea.submitted_by}</span>
                      <span>Goal: {idea.associated_goal}</span>
                    </div>
                    {idea.manager_comments && (
                      <div className="mt-2 flex items-start gap-1 text-xs bg-white p-2 rounded border border-green-200">
                        <MessageSquare className="h-3 w-3 mt-0.5 text-green-600" />
                        <span className="text-gray-700">{idea.manager_comments}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Ideas List */}
      <Card>
        <CardHeader>
          <CardTitle>All Ideas</CardTitle>
          <CardDescription>Complete list of team suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ideas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No ideas submitted yet. Be the first to share your innovation!</p>
              </div>
            ) : (
              ideas.map((idea) => (
                <div key={idea.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{idea.idea_title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{idea.idea_description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Submitted by: {idea.submit_anonymously ? 'Anonymous User' : idea.submitted_by}</span>
                        <span>Goal: {idea.associated_goal}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(idea.status)} variant="outline">
                      {getStatusIcon(idea.status)}
                      <span className="ml-1">{idea.status}</span>
                    </Badge>
                  </div>
                  
                  {idea.manager_comments && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Manager Comments:</p>
                          <p className="text-sm text-gray-600">{idea.manager_comments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdeasDashboard;
