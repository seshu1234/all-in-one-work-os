import React from 'react';
import { Construction } from 'lucide-react';

const ModulePlaceholder = ({ title, description }) => {
  return (
    <div className="p-6" data-testid={`${title.toLowerCase().replace(/ /g, '-')}-module`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="bg-white rounded-lg border p-12 text-center">
        <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-gray-600">This module is under construction and will be available shortly.</p>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
