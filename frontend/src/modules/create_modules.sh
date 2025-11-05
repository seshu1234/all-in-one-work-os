#!/bin/bash

modules=(
  "IdeasModule:Idea Suggestions:Submit and manage idea suggestions"
  "TasksModule:Tasks:Manage tasks and assignments"
  "MeetingNotesModule:Meeting Notes:Capture meeting notes and action items"
  "ClientConversationsModule:Client Conversations:Track client and lead conversations"
  "ContentIdeasModule:Content Idea Bank:Store and manage content ideas"
  "CreativeRequestsModule:Creative Requests:Manage creative design requests"
  "AssetsModule:Asset Library:Organize and share digital assets"
  "CampaignsModule:Performance Campaigns:Track marketing campaign performance"
  "SkillDirectoryModule:Skill Directory:Employee skills and expertise directory"
  "KnowledgeHubModule:Knowledge Hub:Centralized knowledge and SOPs"
  "ShoutoutsModule:Shoutouts:Recognition and appreciation wall"
  "KPIsModule:KPIs:Key Performance Indicators tracking"
  "KRIsModule:KRIs:Key Risk Indicators monitoring"
  "ScorecardsModule:Team Scorecards:Team performance scorecards"
)

for module in "${modules[@]}"; do
  IFS=':' read -r filename title description <<< "$module"
  cat > "${filename}.js" << EOL
import React from 'react';
import { Construction } from 'lucide-react';

const ${filename} = () => {
  return (
    <div className="p-6" data-testid="${filename,,}">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">${title}</h1>
        <p className="text-gray-600">${description}</p>
      </div>
      <div className="bg-white rounded-lg border p-12 text-center">
        <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold mb-2">Module Under Development</h2>
        <p className="text-gray-600">This module will be fully functional soon.</p>
      </div>
    </div>
  );
};

export default ${filename};
EOL
done

echo "All modules created!"
