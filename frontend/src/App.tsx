// src/App.tsx

import React, { useState } from "react";
import { TabsLayout, TabKey } from "./adapters/ui/components/TabsLayout";
import { RoutesTab } from "./adapters/ui/components/RoutesTab";
import { CompareTab } from "./adapters/ui/components/CompareTab";
import { BankingTab } from "./adapters/ui/components/BankingTab";
import { PoolingTab } from "./adapters/ui/components/PoolingTab";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("Routes");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-sky-400">
              FuelEU Maritime
            </div>
            <div className="text-lg font-semibold flex items-center gap-2">
              Compliance Dashboard
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/60 text-emerald-300 bg-emerald-900/20">
                Hexagonal Architecture
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Routes • GHG comparison • Banking • Pooling (Articles 20–21)
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-400">
            <div>
              Backend:{" "}
              <span className="text-emerald-400">http://localhost:4000</span>
            </div>
            <div>
              Frontend:{" "}
              <span className="text-sky-400">http://localhost:5173</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Card shell */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl shadow-xl shadow-slate-950/60">
            <div className="px-4 pt-4 pb-1 border-b border-slate-800/80">
              <TabsLayout active={activeTab} onChange={setActiveTab} />
            </div>

            <div className="p-4 md:p-6">
              {activeTab === "Routes" && <RoutesTab />}
              {activeTab === "Compare" && <CompareTab />}
              {activeTab === "Banking" && <BankingTab />}
              {activeTab === "Pooling" && <PoolingTab />}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-4 mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              Built as a FuelEU Maritime assignment using{" "}
              <span className="text-sky-400">
                React · TypeScript · Tailwind · Node.js
              </span>
            </div>
            <div className="opacity-80">
              Pattern:{" "}
              <span className="text-emerald-400">Ports &amp; Adapters</span>{" "}
              (Core ↔ Adapters)
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
