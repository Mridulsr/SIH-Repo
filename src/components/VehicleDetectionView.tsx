import React, { useState } from "react";
import {
  Car,
  Search,
  Filter,
  Calendar,
  Eye,
  Plus,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { VehiclePlateRecord, Camera } from "../types";

interface VehicleDetectionViewProps {
  vehicles: VehiclePlateRecord[];
  cameras: Camera[];
  onAddWatchlistPlate: (plate: string, reason: string) => void;
}

export const VehicleDetectionView: React.FC<VehicleDetectionViewProps> = ({
  vehicles,
  cameras,
  onAddWatchlistPlate,
}) => {
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("29-08-2024 - 29-08-2024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    if (selectedType !== "ALL" && v.vehicleType.toUpperCase() !== selectedType.toUpperCase()) {
      return false;
    }
    if (selectedCameraId !== "ALL" && v.cameraId !== selectedCameraId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = v.plateNumber.toLowerCase().includes(q);
      const matchCam = v.cameraName.toLowerCase().includes(q);
      const matchNotes = v.notes?.toLowerCase().includes(q);
      if (!matchPlate && !matchCam && !matchNotes) return false;
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    onAddWatchlistPlate(newPlate.toUpperCase().trim(), newReason || "Flagged on ANPR checkpost watchlist");
    setNewPlate("");
    setNewReason("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Filter Bar (Matching Screen 5 in image) */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-wrap items-center gap-3">
        
        {/* Vehicle Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="Car">Car</option>
            <option value="Truck">Truck</option>
            <option value="SUV">SUV</option>
            <option value="MOTORCYCLE">Motorcycle</option>
          </select>
        </div>

        {/* Camera Filter */}
        <div>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Cameras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-48 font-mono"
            placeholder="DD-MM-YYYY - DD-MM-YYYY"
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate number, camera..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Add Plate to Watchlist */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Watchlist Plate</span>
        </button>
      </div>

      {/* ANPR Vehicle Table (Matching Screen 5 in image) */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Time</th>
                <th className="py-3.5 px-4 font-semibold">Camera</th>
                <th className="py-3.5 px-4 font-semibold">Vehicle Type</th>
                <th className="py-3.5 px-4 font-semibold">License Plate</th>
                <th className="py-3.5 px-4 font-semibold">Snapshot</th>
                <th className="py-3.5 px-4 font-semibold">Confidence</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No vehicle records found for the active filter.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const isRedNotice = v.watchlistStatus === "WANTED_RED_NOTICE";
                  const isFlagged = v.watchlistStatus === "FLAGGED_SUSPICIOUS";

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Time */}
                      <td className="py-4 px-4 font-mono text-slate-300 font-semibold whitespace-nowrap">
                        {v.timestamp}
                      </td>

                      {/* Camera */}
                      <td className="py-4 px-4 text-slate-200 font-medium whitespace-nowrap">
                        {v.cameraName}
                      </td>

                      {/* Vehicle Type */}
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-amber-400" />
                          <span>{v.vehicleType}</span>
                        </div>
                      </td>

                      {/* License Plate (with Indian IND style badge) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold tracking-widest text-xs shadow-inner">
                          {v.plateNumber}
                        </span>
                      </td>

                      {/* Snapshot Thumbnail */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => setActiveImageModal(v.snapshotUrl || null)}
                          className="w-14 h-9 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 hover:border-emerald-500 cursor-pointer relative group/img transition-all"
                        >
                          <img
                            src={
                              v.snapshotUrl ||
                              "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=300&q=80"
                            }
                            alt="Plate Crop"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* OCR Confidence */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-200">
                        {v.ocrConfidence.toFixed(2)}
                      </td>

                      {/* Watchlist Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isRedNotice ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold animate-pulse">
                            RED NOTICE
                          </span>
                        ) : isFlagged ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                            FLAGGED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                            CLEAN
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Watchlist Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Add Plate to Sentry Watchlist
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a license plate number to trigger automated checkpost alarms and alert sentry personnel.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="e.g. MH12AB1234 or UP32DK8921"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Watchlist Reason / Flag Tag
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Suspected Smuggling Carrier / No Entry Zone"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-bold rounded-lg text-xs font-mono cursor-pointer"
                >
                  ARM WATCHLIST TRIGGER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snapshot Enlarge Modal */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img
              src={activeImageModal}
              alt="High-Res Forensic Capture"
              className="w-full h-auto rounded-xl object-contain max-h-[75vh]"
            />
            <div className="p-3 text-center text-xs text-slate-400 font-mono">
              Click anywhere to close plate crop preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
