import React, { useState } from "react";
import { AlertEvent, SeverityLevel } from "../types";
import {
  AlertTriangle,
  Shield,
  Clock,
  MapPin,
  Sparkles,
  Send,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Crosshair,
  User,
  Car,
} from "lucide-react";

interface AlertsLockerProps {
  alerts: AlertEvent[];
  onAcknowledgeAlert: (alertId: string) => void;
  onDispatchQRT: (alertId: string) => void;
  onOpenForensicModal: (alert: AlertEvent) => void;
}

export const AlertsLocker: React.FC<AlertsLockerProps> = ({
  alerts,
  onAcknowledgeAlert,
  onDispatchQRT,
  onOpenForensicModal,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(
    (alerts && alerts.length > 0) ? alerts[0] : null
  );

  const filteredAlerts = (alerts || []).filter((a) => {
    if (!a) return false;
    if (filterSeverity !== "ALL" && a.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.cameraName && a.cameraName.toLowerCase().includes(q)) ||
        (a.details?.reason && a.details.reason.toLowerCase().includes(q)) ||
        (a.details?.plateNumber && a.details.plateNumber.toLowerCase().includes(q)) ||
        (a.trackId && a.trackId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex flex-col gap-4 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Security Incidents & Evidence Locker
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-time audit trail of computer vision perimeter breaches & ANPR hits
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, Camera, Track..."
              className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-60"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="QRT_DISPATCHED">QRT Dispatched</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Alerts List + Inspector Drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left: Alerts Master List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-y-auto flex flex-col p-2 space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium">No alerts matching active filters</p>
              <p className="text-xs">Perimeter security algorithms are running normally.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              const isCritical = alert.severity === "CRITICAL";
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                    isSelected
                      ? "bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/40"
                      : isCritical && alert.status === "ACTIVE"
                      ? "bg-red-950/30 border-red-800/60 hover:bg-slate-800/60"
                      : "bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-500 text-white"
                            : alert.severity === "HIGH"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {alert.id}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        [{alert.cameraId}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                          alert.status === "ACTIVE"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
                            : alert.status === "QRT_DISPATCHED"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  {/* Summary Reason */}
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {alert.details.reason}
                  </p>

                  {/* Bottom Meta */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        {alert.objectType === "PERSON" ? (
                          <User className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Car className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{alert.trackId}</span>
                      </span>
                      <span>Conf: {(alert.confidence * 100).toFixed(1)}%</span>
                    </div>

                    {alert.details.plateNumber && (
                      <span className="text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                        Plate: {alert.details.plateNumber}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Evidence Detail Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto">
          {selectedAlert ? (
            <>
              {/* Top Dossier Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Evidence Dossier #{selectedAlert.id}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedAlert.cameraName}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    selectedAlert.severity === "CRITICAL"
                      ? "bg-red-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {selectedAlert.severity}
                </span>
              </div>

              {/* Evidence Snapshot Image Frame */}
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center group shadow-md">
                <img
                  src={
                    selectedAlert.snapshotUrl ||
                    "https://images.unsplash.com/photo-1578836537282-3171d77f8632?auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Incident Snapshot"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />

                {/* Overlaid bounding box crosshair */}
                <div className="absolute inset-0 border-2 border-red-500/60 pointer-events-none flex items-center justify-center">
                  <div className="w-24 h-24 border border-red-400/80 rounded flex items-center justify-center bg-red-500/10">
                    <Crosshair className="w-6 h-6 text-red-400 animate-pulse" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] text-slate-200 font-mono border border-slate-800">
                  Target: {selectedAlert.trackId} | {(selectedAlert.confidence * 100).toFixed(1)}% Conf
                </div>
              </div>

              {/* Explainable AI Evidence Breakdown */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Explainable Computer Vision Evidence
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedAlert.details.explainableEvidence}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">Coordinates:</span>
                    <span>
                      {(selectedAlert.coordinates.x * 100).toFixed(1)}% X,{" "}
                      {(selectedAlert.coordinates.y * 100).toFixed(1)}% Y
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sector:</span>
                    <span>{selectedAlert.sector}</span>
                  </div>
                </div>
              </div>

              {/* QRT Status Box if dispatched */}
              {selectedAlert.qrtStatus && (
                <div className="bg-purple-950/40 border border-purple-700/60 p-3 rounded-lg text-xs space-y-1 text-purple-200 font-mono">
                  <div className="font-bold flex items-center gap-1.5 text-purple-300">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>QRT DISPATCH ACTIVE</span>
                  </div>
                  <div>Unit: {selectedAlert.qrtStatus.teamCode}</div>
                  <div>Commander: {selectedAlert.qrtStatus.commander}</div>
                  <div>ETA: ~{selectedAlert.qrtStatus.etaMinutes} mins</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 mt-auto pt-2">
                {/* Gemini AI Forensic Threat Analysis */}
                <button
                  onClick={() => onOpenForensicModal(selectedAlert)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Gemini AI Threat Analysis</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* Dispatch QRT */}
                  <button
                    onClick={() => onDispatchQRT(selectedAlert.id)}
                    disabled={selectedAlert.status === "QRT_DISPATCHED"}
                    className="py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedAlert.status === "QRT_DISPATCHED" ? "QRT En Route" : "Dispatch QRT"}
                    </span>
                  </button>

                  {/* Acknowledge */}
                  <button
                    onClick={() => onAcknowledgeAlert(selectedAlert.id)}
                    disabled={selectedAlert.status !== "ACTIVE"}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 disabled:opacity-50 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <Eye className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-xs">Select an alert incident to review evidence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
