'use client';

import { useState } from 'react';
import { Activity, FileBarChart, BarChart3 } from 'lucide-react';
import { ActivityLogsTab } from './tabs/activity-logs-tab';
import { ReportsTab } from './tabs/reports-tab';
import { MetricsTab } from './tabs/metrics-tab';

type TabId = 'activity' | 'reports' | 'metrics';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'activity',
    label: 'Logs de Actividad',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: <FileBarChart className="h-4 w-4" />,
  },
  {
    id: 'metrics',
    label: 'Métricas',
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

export function AuditReportsTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('activity');

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium
                transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              <span
                className={
                  activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'activity' && <ActivityLogsTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'metrics' && <MetricsTab />}
      </div>
    </div>
  );
}
