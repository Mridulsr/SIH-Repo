import React from "react";
import {
  Camera as CameraIcon,
  Users,
  Car,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  ExternalLink,
  Shield,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Camera, AlertEvent, NavigationTab, NightFilterMode } from "../types";
import { CameraTile } from "./CameraTile";

interface DashboardOverviewProps {
  cameras: Camera[];
  alerts: AlertEvent[];
  onSelectTab: (tab: NavigationTab) => void;
  onSelectCamera: (cam: Camera) => void;
  onInspectCamera: (cam: Camera) => void;
  onOpenVirtualFence: (cam: Camera) => void;
  onTriggerAlert: (alert: AlertEvent) => void;
  onAcknowledgeAlert: (id: string) => void;
  onOpenGeminiForensics: (alert: AlertEvent) => void;
  isAudioMuted: boolean;
  filterMode: NightFilterMode;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  cameras,
  alerts,
  onSelectTab,
  onSelectCamera,
  onInspectCamera,
  onOpenVirtualFence,
  onTriggerAlert,
  onAcknowledgeAlert,
  onOpenGeminiForensics,
  isAudioMuted,
  filterMode,
}) => {
  // Key 4 cameras for the 2x2 grid (matching Screen 2)
  const overviewCameras = cameras.slice(0, 4);

  // Active alerts count
  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* 4 Metric KPI Cards (Exact match to Screen 2 in image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Cameras Online */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg flex items-center justify-between group hover:border-emerald-500/40 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-400">Cameras Online</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">12</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CameraIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Persons Detected */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg flex items-center justify-between group hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-400">Persons Detected</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">18</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Vehicles Detected */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg flex items-center justify-between group hover:border-amber-500/40 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-400">Vehicles Detected</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">7</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg flex items-center justify-between group hover:border-red-500/40 transition-colors">
          <div>
            <div className="text-xs font-semibold text-slate-400">Active Alerts</div>
            <div className="text-2xl font-bold text-white font-mono mt-1 flex items-center gap-2">
              <span>{activeAlerts.length || 3}</span>
              {activeAlerts.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Split Layout: Live Overview (2x2 Grid) + Recent Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Live Overview 2x2 Camera Matrix (Matching Screen 2 in image) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">Live Overview</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                4 Matrix Grid
              </span>
            </div>
            <button
              onClick={() => onSelectTab("live-cameras")}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Switch to Spotlight View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {overviewCameras.map((camera) => (
              <div key={camera.id} className="relative group">
                <CameraTile
                  camera={camera}
                  onTriggerAlert={onTriggerAlert}
                  onOpenVirtualFence={() => onOpenVirtualFence(camera)}
                  onInspectCamera={() => onInspectCamera(camera)}
                  onZoomStream={() => {
                    onSelectCamera(camera);
                    onSelectTab("live-cameras");
                  }}
                  isAudioMuted={isAudioMuted}
                  globalFilterMode={filterMode}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Alerts Panel (Matching Screen 2 in image) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-xl flex-1 flex flex-col">
            
            {/* Header with View All link */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-slate-100">Recent Alerts</h3>
              </div>
              <button
                onClick={() => onSelectTab("alerts")}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Alerts List */}
            <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
              {alerts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  No intrusion alerts recorded.
                </div>
              ) : (
                alerts.slice(0, 6).map((alert) => {
                  const isCritical = alert.severity === "CRITICAL";
                  const isHigh = alert.severity === "HIGH";

                  return (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-emerald-500/40 transition-all cursor-pointer group"
                      onClick={() => onOpenGeminiForensics(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                            isCritical
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : isHigh
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold truncate ${
                                isCritical ? "text-red-400" : isHigh ? "text-amber-300" : "text-slate-200"
                              }`}
                            >
                              {alert.eventType === "VIRTUAL_FENCE_INTRUSION"
                                ? "Intrusion Detected"
                                : alert.eventType === "UNAUTHORIZED_VEHICLE"
                                ? "Vehicle in Restricted Area"
                                : "Person in Restricted Area"}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0">
                              {alert.timestamp}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {alert.cameraName}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-slate-500">
                              Conf: {(alert.confidence * 100).toFixed(0)}%
                            </span>
                            <div className="flex items-center gap-1.5 text-emerald-400 group-hover:underline">
                              <span>Inspect AI Dossier</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Tactical Footer */}
            <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Auto-escalation: QRT Active</span>
              <button
                onClick={() => onSelectTab("events")}
                className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium cursor-pointer text-[11px]"
              >
                Open Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
