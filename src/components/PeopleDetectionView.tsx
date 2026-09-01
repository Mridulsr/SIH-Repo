import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Calendar,
  Eye,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Zap
} from "lucide-react";
import { PersonRecord, Camera } from "../types";

interface PeopleDetectionViewProps {
  people: PersonRecord[];
  cameras: Camera[];
}

export const PeopleDetectionView: React.FC<PeopleDetectionViewProps> = ({
  people,
  cameras,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<string>("ALL");
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const filteredPeople = people.filter((p) => {
    if (selectedActivity !== "ALL" && p.activity !== selectedActivity) return false;
    if (selectedZone !== "ALL" && p.zoneStatus !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.cameraName.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-wrap items-center gap-3">
        <div>
          <select
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Activities</option>
            <option value="WALKING">Walking</option>
            <option value="LOITERING">Loitering (&gt;120s)</option>
            <option value="RUNNING">Running</option>
            <option value="STATIONARY">Stationary</option>
          </select>
        </div>

        <div>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Zones</option>
            <option value="RESTRICTED">Restricted Perimeter</option>
            <option value="AUTHORIZED">Authorized Public Bay</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search person ID, camera..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 px-2">
          {filteredPeople.length} Tracked Individuals
        </div>
      </div>

      {/* People Table */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Time</th>
                <th className="py-3.5 px-4 font-semibold">Subject ID</th>
                <th className="py-3.5 px-4 font-semibold">Camera Source</th>
                <th className="py-3.5 px-4 font-semibold">Activity</th>
                <th className="py-3.5 px-4 font-semibold">Loiter Dwell</th>
                <th className="py-3.5 px-4 font-semibold">Re-ID Match</th>
                <th className="py-3.5 px-4 font-semibold">Snapshot</th>
                <th className="py-3.5 px-4 font-semibold text-center">Zone Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPeople.map((p) => {
                const isRestricted = p.zoneStatus === "RESTRICTED";
                return (
                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-300 font-semibold">{p.timestamp}</td>
                    <td className="py-4 px-4 font-mono font-bold text-white">{p.id}</td>
                    <td className="py-4 px-4 text-slate-200 font-medium">{p.cameraName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                        {p.activity}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      <span className={p.loiterDurationSec > 120 ? "text-amber-400 font-bold" : ""}>
                        {p.loiterDurationSec}s
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold">
                      {p.reIdScore ? `${(p.reIdScore * 100).toFixed(0)}%` : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <div
                        onClick={() => setActiveImageModal(p.snapshotUrl || null)}
                        className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 hover:border-emerald-500 cursor-pointer relative group/img"
                      >
                        <img
                          src={p.snapshotUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                          alt="Subject"
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {isRestricted ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold">
                          RESTRICTED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                          AUTHORIZED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img src={activeImageModal} alt="Enlarged" className="w-full h-auto rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
