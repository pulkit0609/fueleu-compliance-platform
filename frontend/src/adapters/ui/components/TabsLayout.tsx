// src/adapters/ui/components/TabsLayout.tsx

import React from "react";

const tabs = ["Routes", "Compare", "Banking", "Pooling"] as const;
export type TabKey = (typeof tabs)[number];

interface TabsLayoutProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export const TabsLayout: React.FC<TabsLayoutProps> = ({
  active,
  onChange,
}) => {
  return (
    <div className="border-b border-slate-700 mb-4 flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm rounded-t-md border border-b-0 ${
            active === tab
              ? "bg-slate-800 border-slate-600 text-white"
              : "bg-slate-900 border-transparent text-slate-400 hover:bg-slate-800"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};
