// src/adapters/ui/components/BankingTab.tsx

import React, { useEffect, useState } from "react";
import { apiClient } from "../../infrastructure/apiClient";
import { ComplianceBalanceResult } from "../../../core/domain/compliance";
import { BankingRecordsResponse } from "../../../core/domain/banking";

const DEFAULT_YEAR = 2024;
const DEFAULT_SHIP_ID = "R002"; // one with positive CB

export const BankingTab: React.FC = () => {
  const [shipId, setShipId] = useState(DEFAULT_SHIP_ID);
  const [year, setYear] = useState<number>(DEFAULT_YEAR);

  const [cb, setCb] = useState<ComplianceBalanceResult | null>(null);
  const [records, setRecords] = useState<BankingRecordsResponse | null>(null);
  const [amountToApply, setAmountToApply] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const [cbRes, recordsRes] = await Promise.all([
        apiClient.getComplianceCB(shipId, year),
        apiClient.getBankingRecords(shipId, year),
      ]);
      setCb(cbRes);
      setRecords(recordsRes);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load banking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shipId, year]);

  const handleBank = async () => {
    if (!cb || !cb.surplus) return;
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      const res = await apiClient.bankSurplus(shipId, year);
      setMessage(
        `Banked ${res.applied.toFixed(0)} gCO₂eq. CB is now ${res.cb_after.toFixed(
          0
        )}`
      );
      await loadData();
    } catch (err: any) {
      setError(err?.message ?? "Failed to bank surplus");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    const amount = Number(amountToApply);
    if (!amount || amount <= 0) {
      setError("Amount must be a positive number");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      const res = await apiClient.applyBanked(shipId, year, amount);
      setMessage(
        `Applied ${res.applied.toFixed(
          0
        )}. CB: ${res.cb_before.toFixed(0)} → ${res.cb_after.toFixed(0)}`
      );
      await loadData();
    } catch (err: any) {
      setError(err?.message ?? "Failed to apply banked surplus");
    } finally {
      setActionLoading(false);
    }
  };

  const cbValue = cb?.cb ?? 0;
  const canBank = !!cb && cb.surplus;
  const totalBanked = records?.totalBanked ?? 0;
  const hasBanked = totalBanked > 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-400">Ship (Route ID)</label>
          <select
            value={shipId}
            onChange={(e) => setShipId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          >
            <option value="R001">R001</option>
            <option value="R002">R002</option>
            <option value="R003">R003</option>
            <option value="R004">R004</option>
            <option value="R005">R005</option>
          </select>
        </div>
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
        <button
          onClick={loadData}
          className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-sm text-slate-400">Loading…</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}
      {message && <div className="text-sm text-emerald-400">{message}</div>}

      {/* KPIs */}
      {cb && (
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700">
            <div className="text-xs text-slate-400">Current CB</div>
            <div className="text-lg font-semibold">
              {cb.cb.toFixed(0)} gCO₂eq
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {cb.surplus ? "Surplus" : "Deficit"}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700">
            <div className="text-xs text-slate-400">Total Banked</div>
            <div className="text-lg font-semibold">
              {totalBanked.toFixed(0)} gCO₂eq
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700">
            <div className="text-xs text-slate-400">Intensity</div>
            <div className="text-lg font-semibold">
              {cb.actualIntensity.toFixed(3)} gCO₂e/MJ
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Target: {cb.targetIntensity.toFixed(4)} gCO₂e/MJ
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 space-y-2">
          <div className="text-sm font-semibold">Bank Surplus</div>
          <p className="text-xs text-slate-400">
            If CB is positive, you can bank the surplus for future years.
          </p>
          <button
            onClick={handleBank}
            disabled={!canBank || actionLoading}
            className={`text-xs px-3 py-1 rounded ${
              canBank && !actionLoading
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {actionLoading ? "Working…" : "Bank Current Surplus"}
          </button>
          {!canBank && (
            <div className="text-xs text-slate-500 mt-1">
              CB must be positive to bank surplus.
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700 space-y-2">
          <div className="text-sm font-semibold">Apply Banked Surplus</div>
          <p className="text-xs text-slate-400">
            Apply previously banked surplus to reduce a deficit CB.
          </p>
          <input
            type="number"
            value={amountToApply}
            onChange={(e) => setAmountToApply(e.target.value)}
            placeholder="Amount to apply (gCO₂eq)"
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleApply}
            disabled={!hasBanked || actionLoading}
            className={`text-xs px-3 py-1 rounded ${
              hasBanked && !actionLoading
                ? "bg-sky-600 hover:bg-sky-500"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {actionLoading ? "Working…" : "Apply Banked Surplus"}
          </button>
          {!hasBanked && (
            <div className="text-xs text-slate-500 mt-1">
              No banked surplus available to apply.
            </div>
          )}
        </div>
      </div>

      {/* Records table */}
      {records && (
        <div className="overflow-x-auto border border-slate-700 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {records.records.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {r.amount.toFixed(0)} gCO₂eq
                  </td>
                </tr>
              ))}
              {records.records.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No banking actions yet.
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
