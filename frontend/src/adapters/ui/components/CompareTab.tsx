// src/adapters/ui/components/CompareTab.tsx

import React, { useEffect, useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import type { RoutesComparisonResult } from "../../../core/domain/comparison";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const CompareTab: React.FC = () => {
  const [data, setData] = useState<RoutesComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiClient.getRoutesComparison();
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to load comparison data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading comparison…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!data) {
    return (
      <p className="text-slate-400 text-sm">
        No comparison data available.
      </p>
    );
  }

  const baseline = data.baseline;

  if (!baseline) {
    return (
      <p className="text-sm text-yellow-300">
        No baseline route is set. Please go to the Routes tab and select a
        baseline.
      </p>
    );
  }

  const chartData = data.comparisons.map((c) => ({
    routeId: c.routeId,
    baseline: baseline.ghgIntensity,
    comparison: c.ghgIntensity,
  }));

  return (
    <div className="space-y-6">
      {/* Baseline summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">
            Baseline Route: {baseline.routeId}
          </div>
          <div className="text-[11px] text-slate-400">
            {baseline.vesselType} · {baseline.fuelType} · {baseline.year} ·{" "}
            <span className="text-emerald-400 font-medium">
              {baseline.ghgIntensity} gCO₂e/MJ
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Comparing {data.comparisons.length} routes against the baseline.
        </div>
      </div>

      {/* Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          GHG Intensity Comparison
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="routeId" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="baseline" fill="#22c55e" name="Baseline" />
              <Bar dataKey="comparison" fill="#3b82f6" name="Route" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left">Vessel</th>
              <th className="px-3 py-2 text-left">Fuel</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">GHG Intensity</th>
              <th className="px-3 py-2 text-left">% Diff vs Baseline</th>
              <th className="px-3 py-2 text-left">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {data.comparisons.map((c) => (
              <tr key={c.routeId} className="border-t border-slate-800">
                <td className="px-3 py-2 font-medium text-slate-100">
                  {c.routeId}
                </td>
                <td className="px-3 py-2">{c.vesselType}</td>
                <td className="px-3 py-2">{c.fuelType}</td>
                <td className="px-3 py-2">{c.year}</td>
                <td className="px-3 py-2">{c.ghgIntensity}</td>
                <td
                  className={`px-3 py-2 ${
                    c.percentDiffFromBaseline <= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {c.percentDiffFromBaseline.toFixed(2)}%
                </td>
                <td className="px-3 py-2">
                  {c.compliant ? "✔️" : "❌"}
                </td>
              </tr>
            ))}

            {data.comparisons.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  No comparison routes available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
