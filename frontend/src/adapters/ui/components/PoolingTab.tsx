// src/adapters/ui/components/PoolingTab.tsx

import React, { useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import { PoolCreationResult } from "../../../core/domain/pooling";
import { AdjustedCBResult } from "../../../core/domain/compliance";

const ALL_SHIPS = ["R001", "R002", "R003", "R004", "R005"];
const DEFAULT_YEAR = 2024;

export const PoolingTab: React.FC = () => {
  const [year, setYear] = useState<number>(DEFAULT_YEAR);
  const [selectedShips, setSelectedShips] = useState<string[]>(["R001", "R002"]);
  const [result, setResult] = useState<PoolCreationResult | null>(null);
  const [adjusted, setAdjusted] = useState<Record<string, AdjustedCBResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleShip = (shipId: string) => {
    setResult(null);
    setAdjusted({});
    setSelectedShips((prev) =>
      prev.includes(shipId)
        ? prev.filter((s) => s !== shipId)
        : [...prev, shipId]
    );
  };

  const handleCreatePool = async () => {
    if (selectedShips.length < 2) {
      setError("Pool must contain at least 2 ships.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setAdjusted({});
      const res = await apiClient.createPool(
        year,
        selectedShips.map((s) => ({ shipId: s }))
      );
      setResult(res);

      // load adjusted CB for each member
      const map: Record<string, AdjustedCBResult> = {};
      for (const m of res.members) {
        map[m.shipId] = await apiClient.getAdjustedCB(m.shipId, year);
      }
      setAdjusted(map);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create pool");
    } finally {
      setLoading(false);
    }
  };

  const poolValid =
    result && result.poolSumAfter >= 0 && result.poolSumBefore >= 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-400">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_SHIPS.map((ship) => {
            const active = selectedShips.includes(ship);
            return (
              <button
                key={ship}
                type="button"
                onClick={() => toggleShip(ship)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  active
                    ? "bg-sky-600 border-sky-400"
                    : "bg-slate-900 border-slate-600 text-slate-400"
                }`}
              >
                {ship}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCreatePool}
          disabled={selectedShips.length < 2 || loading}
          className={`text-xs px-3 py-1 rounded ${
            selectedShips.length >= 2 && !loading
              ? "bg-emerald-600 hover:bg-emerald-500"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Creating…" : "Create Pool"}
        </button>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      {/* Pool summary */}
      {result && (
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">
              Pool #{result.poolId} — Year {result.year}
            </div>
            <div
              className={`text-xs px-2 py-0.5 rounded-full ${
                poolValid
                  ? "bg-emerald-900/70 text-emerald-300 border border-emerald-700"
                  : "bg-red-900/70 text-red-300 border border-red-700"
              }`}
            >
              {poolValid ? "Valid Pool" : "Invalid Pool"}
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Sum(before): {result.poolSumBefore.toFixed(0)} gCO₂eq | Sum(after):{" "}
            {result.poolSumAfter.toFixed(0)} gCO₂eq
          </div>
        </div>
      )}

      {/* Members table */}
      {result && (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">Ship</th>
                <th className="px-3 py-2 text-left">Year</th>
                <th className="px-3 py-2 text-left">CB Before</th>
                <th className="px-3 py-2 text-left">CB After</th>
                <th className="px-3 py-2 text-left">Δ</th>
              </tr>
            </thead>
            <tbody>
              {result.members.map((m) => {
                const delta = m.cb_after - m.cb_before;
                const adj = adjusted[m.shipId];
                return (
                  <tr key={m.shipId} className="border-t border-slate-800">
                    <td className="px-3 py-2">{m.shipId}</td>
                    <td className="px-3 py-2">{m.year}</td>
                    <td className="px-3 py-2">{m.cb_before.toFixed(0)}</td>
                    <td className="px-3 py-2">{m.cb_after.toFixed(0)}</td>
                    <td className="px-3 py-2">
                      {delta.toFixed(0)}{" "}
                      {delta > 0 ? "⬆️" : delta < 0 ? "⬇️" : ""}
                    </td>
                  </tr>
                );
              })}
              {result.members.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No members in pool.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
