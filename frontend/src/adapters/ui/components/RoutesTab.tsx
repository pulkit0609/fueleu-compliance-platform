// src/adapters/ui/components/RoutesTab.tsx

import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import type { Route } from "../../../core/domain/route";

export const RoutesTab: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [vesselFilter, setVesselFilter] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [searchId, setSearchId] = useState<string>("");

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRoutes();
      setRoutes(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const baselineRoute = routes.find((r) => r.isBaseline);

  const vesselTypes = Array.from(new Set(routes.map((r) => r.vesselType)));
  const fuelTypes = Array.from(new Set(routes.map((r) => r.fuelType)));
  const years = Array.from(new Set(routes.map((r) => r.year))).sort();

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (vesselFilter && r.vesselType !== vesselFilter) return false;
      if (fuelFilter && r.fuelType !== fuelFilter) return false;
      if (yearFilter && String(r.year) !== yearFilter) return false;
      if (searchId && !r.routeId.toLowerCase().includes(searchId.toLowerCase()))
        return false;
      return true;
    });
  }, [routes, vesselFilter, fuelFilter, yearFilter, searchId]);

  const totalEmissions = filteredRoutes.reduce(
    (sum, r) => sum + (r.totalEmissions ?? 0),
    0
  );

  const handleSetBaseline = async (routeId: string) => {
    try {
      setError(null);
      await apiClient.setBaseline(routeId);
      await loadRoutes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to set baseline");
    }
  };

  const clearFilters = () => {
    setVesselFilter("");
    setFuelFilter("");
    setYearFilter("");
    setSearchId("");
  };

  return (
    <div className="space-y-4">
      {/* Top summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold">Routes Overview</div>
          <div className="text-[11px] text-slate-400">
            {routes.length} routes · {baselineRoute ? (
              <>
                baseline:{" "}
                <span className="text-emerald-400 font-medium">
                  {baselineRoute.routeId}
                </span>
              </>
            ) : (
              <span className="text-red-400">no baseline set</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px]">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80">
            Visible routes:{" "}
            <span className="font-semibold text-sky-400">
              {filteredRoutes.length}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80">
            Total emissions (visible):{" "}
            <span className="font-semibold text-emerald-400">
              {totalEmissions.toFixed(0)} t
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 md:p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Vessel Type
          </label>
          <select
            value={vesselFilter}
            onChange={(e) => setVesselFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {vesselTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Fuel Type
          </label>
          <select
            value={fuelFilter}
            onChange={(e) => setFuelFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">
            Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-[11px] text-slate-400 mb-1">
            Route ID search
          </label>
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. R00"
            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-sm"
          />
        </div>

        <button
          onClick={clearFilters}
          className="text-xs px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
        >
          Clear filters
        </button>
      </div>

      {/* Status */}
      {loading && (
        <div className="text-sm text-slate-400">Loading routes…</div>
      )}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Baseline</th>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left">Vessel</th>
              <th className="px-3 py-2 text-left">Fuel</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">gCO₂e/MJ</th>
              <th className="px-3 py-2 text-left">Fuel (t)</th>
              <th className="px-3 py-2 text-left">Distance (km)</th>
              <th className="px-3 py-2 text-left">Emissions (t)</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map((r) => (
              <tr
                key={r.routeId}
                className={
                  r.isBaseline
                    ? "bg-emerald-900/10 border-t border-emerald-700/60"
                    : "border-t border-slate-800"
                }
              >
                <td className="px-3 py-2">
                  {r.isBaseline && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/70 bg-emerald-900/40 text-emerald-300">
                      BASELINE
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-slate-100">
                  {r.routeId}
                </td>
                <td className="px-3 py-2">{r.vesselType}</td>
                <td className="px-3 py-2">{r.fuelType}</td>
                <td className="px-3 py-2">{r.year}</td>
                <td className="px-3 py-2">
                  {r.ghgIntensity.toFixed(2)}
                </td>
                <td className="px-3 py-2">{r.fuelConsumption}</td>
                <td className="px-3 py-2">{r.distance}</td>
                <td className="px-3 py-2">{r.totalEmissions}</td>
                <td className="px-3 py-2 text-right">
                  {!r.isBaseline && (
                    <button
                      onClick={() => handleSetBaseline(r.routeId)}
                      className="text-[11px] px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                      Set baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredRoutes.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-slate-500"
                >
                  No routes match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
