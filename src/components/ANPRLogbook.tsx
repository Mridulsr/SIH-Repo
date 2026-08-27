import React, { useState } from "react";
import { VehiclePlateRecord } from "../types";
import {
  Car,
  Search,
  ShieldAlert,
  CheckCircle,
  Plus,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Gauge,
  Tag,
} from "lucide-react";

interface ANPRLogbookProps {
  vehicles: VehiclePlateRecord[];
  onAddWatchlistPlate: (plate: string, reason: string) => void;
}

export const ANPRLogbook: React.FC<ANPRLogbookProps> = ({
  vehicles,
  onAddWatchlistPlate,
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newReason, setNewReason] = useState("");

  const filtered = (vehicles || []).filter((v) => {
    if (!v) return false;
    if (filterStatus !== "ALL" && v.watchlistStatus !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
        (v.vehicleType && v.vehicleType.toLowerCase().includes(q)) ||
        (v.notes && v.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate) return;
    onAddWatchlistPlate(newPlate.toUpperCase(), newReason || "Manual Watchlist Entry");
    setNewPlate("");
    setNewReason("");
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Automatic Number Plate Recognition (ANPR) & Watchlist Ledger
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              PaddleOCR + YOLO Vehicle Localizer • Standardized Indian License Plate Normalization
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Plate, Make..."
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Watchlist Statuses</option>
            <option value="WANTED_RED_NOTICE">Wanted / Red Notice</option>
            <option value="FLAGGED_SUSPICIOUS">Flagged Suspicious</option>
            <option value="CLEAN">Clean Transit</option>
          </select>

          {/* Add Watchlist Plate */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Watchlist Plate</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            {vehicles.length}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Total Scanned</div>
            <div className="text-xs font-bold text-slate-200">Vehicles Today</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
            {vehicles.filter((v) => v.watchlistStatus === "WANTED_RED_NOTICE").length}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Red Notice Matches</div>
            <div className="text-xs font-bold text-red-300">Intercept Required</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            {vehicles.filter((v) => v.watchlistStatus === "FLAGGED_SUSPICIOUS").length}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Flagged Vehicles</div>
            <div className="text-xs font-bold text-amber-300">Under Observation</div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            96.8%
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono">Avg OCR Accuracy</div>
            <div className="text-xs font-bold text-emerald-300">PaddleOCR v4</div>
          </div>
        </div>
      </div>

      {/* ANPR Records Table */}
      <div className="flex-1 bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-inner">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">License Plate</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4">Camera / Gate</th>
                <th className="py-3 px-4">OCR Confidence</th>
                <th className="py-3 px-4">Est. Speed</th>
                <th className="py-3 px-4">Watchlist Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Intelligence Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {filtered.map((v) => {
                const isRedNotice = v.watchlistStatus === "WANTED_RED_NOTICE";
                const isFlagged = v.watchlistStatus === "FLAGGED_SUSPICIOUS";
                return (
                  <tr
                    key={v.id}
                    className={`transition ${
                      isRedNotice
                        ? "bg-red-950/40 hover:bg-red-950/60"
                        : isFlagged
                        ? "bg-amber-950/20 hover:bg-amber-950/40"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Plate */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-700 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-amber-300 font-bold tracking-wider">{v.plateNumber}</span>
                      </div>
                    </td>

                    {/* Vehicle Type */}
                    <td className="py-3 px-4 font-semibold text-slate-300">
                      {v.vehicleType}
                    </td>

                    {/* Camera */}
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {v.cameraName.split("-")[0].trim()}
                    </td>

                    {/* OCR Conf */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${v.ocrConfidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-emerald-400">
                          {(v.ocrConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Speed */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {v.speedKmh} km/h
                    </td>

                    {/* Watchlist Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block ${
                          isRedNotice
                            ? "bg-red-600 text-white animate-pulse"
                            : isFlagged
                            ? "bg-amber-600 text-slate-950"
                            : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {v.watchlistStatus}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Notes */}
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {v.notes || "Standard transit"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Watchlist Plate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Add Vehicle to Security Watchlist
                </h3>
                <p className="text-xs text-slate-400">
                  Instant real-time trigger when scanned on any border camera
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  License Plate Number (Format: UP32-DK-8921)
                </label>
                <input
                  type="text"
                  required
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="e.g. BR-01-AB-1234"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Watchlist Reason / Intelligence File Reference
                </label>
                <textarea
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. SSB Inter-Agency Red Notice (Suspected illegal transit)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Save Watchlist Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
