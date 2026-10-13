import React from 'react';

interface StatusTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const StatusTabs: React.FC<StatusTabsProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { label: 'All orders', value: 'ALL' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Pending', value: 'Pending' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#065f46] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
