import React, { useState } from "react";
import {
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Download,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { AlertEvent, Camera } from "../types";

interface EventsViewProps {
  events: AlertEvent[];
  cameras: Camera[];
  onOpenGeminiForensics: (alert: AlertEvent) => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  cameras,
  onOpenGeminiForensics,
  onAcknowledgeAlert,
}) => {
  const [selectedEventType, setSelectedEventType] = useState<string>("ALL");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("29-08-2024 - 29-08-2024");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter((evt) => {
    if (selectedEventType !== "ALL") {
      if (selectedEventType === "INTRUSION" && evt.eventType !== "VIRTUAL_FENCE_INTRUSION") return false;
      if (selectedEventType === "VEHICLE" && evt.eventType !== "UNAUTHORIZED_VEHICLE" && evt.eventType !== "ANPR_WATCHLIST_HIT") return false;
      if (selectedEventType === "PERSON" && evt.eventType !== "PERSON_IN_RESTRICTED_AREA" && evt.eventType !== "NIGHT_LOITERING") return false;
    }
    if (selectedCameraId !== "ALL" && evt.cameraId !== selectedCameraId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCam = evt.cameraName.toLowerCase().includes(q);
      const matchReason = evt.details?.reason?.toLowerCase().includes(q);
      const matchTrack = evt.trackId.toLowerCase().includes(q);
      if (!matchCam && !matchReason && !matchTrack) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Filter Bar (Matching Screen 4 in image) */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-wrap items-center gap-3">
        
        {/* Event Type Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Events</option>
            <option value="INTRUSION">Intrusion Detected</option>
            <option value="VEHICLE">Vehicle in Restricted Area</option>
            <option value="PERSON">Person in Restricted Area</option>
          </select>
        </div>

        {/* Camera Filter */}
        <div className="flex items-center gap-2">
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

        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Results Counter */}
        <div className="text-xs font-mono text-slate-400 px-2">
          Showing {filteredEvents.length} Events
        </div>
      </div>

      {/* Events Interactive Data Table (Matching Screen 4 in image) */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Time</th>
                <th className="py-3.5 px-4 font-semibold">Event</th>
                <th className="py-3.5 px-4 font-semibold">Camera</th>
                <th className="py-3.5 px-4 font-semibold">Snapshot</th>
                <th className="py-3.5 px-4 font-semibold">Confidence</th>
                <th className="py-3.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No matching intrusion events found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isIntrusion = evt.eventType === "VIRTUAL_FENCE_INTRUSION";
                  const isVehicle = evt.eventType === "UNAUTHORIZED_VEHICLE" || evt.eventType === "ANPR_WATCHLIST_HIT";
                  const isPerson = evt.eventType === "PERSON_IN_RESTRICTED_AREA" || evt.eventType === "NIGHT_LOITERING";

                  const eventLabel = isIntrusion
                    ? "Intrusion Detected"
                    : isVehicle
                    ? "Vehicle in Restricted Area"
                    : "Person in Restricted Area";

                  const badgeClass = isIntrusion
                    ? "text-red-400 bg-red-500/15 border-red-500/30"
                    : isVehicle
                    ? "text-amber-400 bg-amber-500/15 border-amber-500/30"
                    : "text-amber-400 bg-amber-500/15 border-amber-500/30";

                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Time */}
                      <td className="py-4 px-4 font-mono text-slate-300 font-semibold whitespace-nowrap">
                        {evt.timestamp}
                      </td>

                      {/* Event Type with colored badge & icon */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold">
                          <AlertTriangle
                            className={`w-3.5 h-3.5 ${
                              isIntrusion ? "text-red-400" : "text-amber-400"
                            }`}
                          />
                          <span
                            className={
                              isIntrusion
                                ? "text-red-400 font-bold"
                                : "text-amber-300 font-bold"
                            }
                          >
                            {eventLabel}
                          </span>
                        </div>
                      </td>

                      {/* Camera */}
                      <td className="py-4 px-4 text-slate-200 font-medium whitespace-nowrap">
                        {evt.cameraName}
                      </td>

                      {/* Snapshot Thumbnail Preview */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => setActiveImageModal(evt.snapshotUrl || null)}
                          className="w-14 h-9 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 hover:border-emerald-500 cursor-pointer relative group/img transition-all"
                        >
                          <img
                            src={
                              evt.snapshotUrl ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                            }
                            alt="Snapshot"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </td>

                      {/* Confidence */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-200">
                        {evt.confidence.toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenGeminiForensics(evt)}
                            title="Inspect with AI Multimodal Forensics"
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {evt.status === "ACTIVE" && (
                            <button
                              onClick={() => onAcknowledgeAlert(evt.id)}
                              title="Acknowledge Alert"
                              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              Click anywhere to dismiss high-resolution snapshot preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
