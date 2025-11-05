import React from 'react';
import { Construction } from 'lucide-react';

const KPIsModule = () => {
  return (
    <div className="p-6" data-testid="kpismodule">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">KPIs</h1>
        <p className="text-gray-600">Key Performance Indicators tracking</p>
      </div>
      <div className="bg-white rounded-lg border p-12 text-center">
        <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Module Under Development</h2>
        <p className="text-gray-600">This module will be fully functional soon.</p>
      </div>
    </div>
  );
};

export default KPIsModule;
