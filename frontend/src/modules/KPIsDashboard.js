import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target } from 'lucide-react';

const KPIsDashboard = () => {
  const [kpis, setKpis] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    onTrack: 0,
    atRisk: 0,
    critical: 0
  });

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/modules/kpis`);
      const kpisData = response.data;
      setKpis(kpisData);
      
      // Calculate stats
      const total = kpisData.length;
      let onTrack = 0;
      let atRisk = 0;
      let critical = 0;

      kpisData.forEach(kpi => {
        const current = parseFloat(kpi.current_value) || 0;
        const target = parseFloat(kpi.target_value) || 1;
        const percentage = (current / target) * 100;

        if (percentage >= 90) {
          onTrack++;
        } else if (percentage >= 70) {
          atRisk++;
        } else {
          critical++;
        }
      });
      
      setStats({ total, onTrack, atRisk, critical });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const getPerformanceStatus = (kpi) => {
    const current = parseFloat(kpi.current_value) || 0;
    const target = parseFloat(kpi.target_value) || 1;
    const percentage = (current / target) * 100;

    if (percentage >= 90) return { status: 'On Track', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle };
    if (percentage >= 70) return { status: 'At Risk', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle };
    return { status: 'Critical', color: 'bg-red-100 text-red-800 border-red-300', icon: TrendingDown };
  };

  const calculateProgress = (kpi) => {
    const current = parseFloat(kpi.current_value) || 0;
    const target = parseFloat(kpi.target_value) || 1;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">KPIs Dashboard</h1>
        <p className="text-gray-600">Monitor key performance indicators across the organization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">Being tracked</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.onTrack}</div>
            <p className="text-xs text-gray-600">≥90% of target</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.atRisk}</div>
            <p className="text-xs text-gray-600">70-90% of target</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
            <p className="text-xs text-gray-600">&lt;70% of target</p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical KPIs */}
        {stats.critical > 0 && (
          <Card className="border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <TrendingDown className="h-5 w-5" />
                Critical ({stats.critical})
              </CardTitle>
              <CardDescription>Immediate action required</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.filter(kpi => {
                  const percentage = (parseFloat(kpi.current_value) / parseFloat(kpi.target_value)) * 100;
                  return percentage < 70;
                }).map((kpi) => {
                  const progress = calculateProgress(kpi);
                  return (
                    <div key={kpi.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2">{kpi.kpi_name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Current: {kpi.current_value}</span>
                          <span>Target: {kpi.target_value}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-600">
                          Goal: {kpi.associated_goal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* At Risk KPIs */}
        {stats.atRisk > 0 && (
          <Card className="border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertCircle className="h-5 w-5" />
                At Risk ({stats.atRisk})
              </CardTitle>
              <CardDescription>Needs monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.filter(kpi => {
                  const percentage = (parseFloat(kpi.current_value) / parseFloat(kpi.target_value)) * 100;
                  return percentage >= 70 && percentage < 90;
                }).map((kpi) => {
                  const progress = calculateProgress(kpi);
                  return (
                    <div key={kpi.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2">{kpi.kpi_name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Current: {kpi.current_value}</span>
                          <span>Target: {kpi.target_value}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-600">
                          Goal: {kpi.associated_goal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* On Track KPIs */}
        {stats.onTrack > 0 && (
          <Card className="border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                On Track ({stats.onTrack})
              </CardTitle>
              <CardDescription>Performing well</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.filter(kpi => {
                  const percentage = (parseFloat(kpi.current_value) / parseFloat(kpi.target_value)) * 100;
                  return percentage >= 90;
                }).map((kpi) => {
                  const progress = calculateProgress(kpi);
                  return (
                    <div key={kpi.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2">{kpi.kpi_name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Current: {kpi.current_value}</span>
                          <span>Target: {kpi.target_value}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-600">
                          Goal: {kpi.associated_goal}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All KPIs List */}
      <Card>
        <CardHeader>
          <CardTitle>All KPIs</CardTitle>
          <CardDescription>Complete list of performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No KPIs defined yet. Start tracking your key metrics!</p>
              </div>
            ) : (
              kpis.map((kpi) => {
                const progress = calculateProgress(kpi);
                const status = getPerformanceStatus(kpi);
                const StatusIcon = status.icon;
                
                return (
                  <div key={kpi.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{kpi.kpi_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Goal: {kpi.associated_goal}</span>
                          <span>•</span>
                          <span>Owner: {kpi.owner}</span>
                          <span>•</span>
                          <span>Frequency: {kpi.measurement_frequency}</span>
                        </div>
                      </div>
                      <Badge className={status.color} variant="outline">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          <span>Current: <span className="font-semibold">{kpi.current_value}</span></span>
                          <span>Target: <span className="font-semibold">{kpi.target_value}</span></span>
                        </div>
                        <span className="font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {kpi.update_notes && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Latest update:</span> {kpi.update_notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPIsDashboard;
