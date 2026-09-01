import React, { useState } from "react";
import {
  Camera as CameraIcon,
  Video,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Camera as SnapshotIcon,
  Sliders,
  Radio,
  Eye,
  ShieldAlert,
  AlertTriangle,
  User,
  Car,
  ChevronRight,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";
import { Camera, AlertEvent, NightFilterMode, DetectedTrack } from "../types";
import { CameraTile } from "./CameraTile";

interface LiveCameraViewProps {
  selectedCamera: Camera;
  allCameras: Camera[];
  onSelectCamera: (cam: Camera) => void;
  onTriggerAlert: (alert: AlertEvent) => void;
  onOpenVirtualFence: (cam: Camera) => void;
  onInspectCamera: (cam: Camera) => void;
  onOpenGeminiForensics: (alert: AlertEvent) => void;
  isAudioMuted: boolean;
  filterMode: NightFilterMode;
  onSetFilterMode: (mode: NightFilterMode) => void;
}

export const LiveCameraView: React.FC<LiveCameraViewProps> = ({
  selectedCamera,
  allCameras,
  onSelectCamera,
  onTriggerAlert,
  onOpenVirtualFence,
  onInspectCamera,
  onOpenGeminiForensics,
  isAudioMuted,
  filterMode,
  onSetFilterMode,
}) => {
  const [filterDropdown, setFilterDropdown] = useState(false);

  // Real-time detections list matching Screen 3 in image
  const simulatedDetections = [
    { id: "DET-1", type: "Person", conf: "0.92", time: "10:24:31", isIntruder: true },
    { id: "DET-2", type: "Car", conf: "0.88", time: "10:24:30", isIntruder: false },
    { id: "DET-3", type: "Person", conf: "0.91", time: "10:24:28", isIntruder: true },
    { id: "DET-4", type: "Car", conf: "0.86", time: "10:24:21", isIntruder: false },
    { id: "DET-5", type: "Truck", conf: "0.89", time: "10:23:55", isIntruder: false },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Main Grid: Spotlight Camera Player (Left 8 cols) + Detections & Camera List (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Spotlight Live Stream with bounding boxes & controls */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col">
            
            {/* Camera Header Bar */}
            <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    {selectedCamera?.name || selectedCamera?.id || "Live Stream"}
                  </h2>
                  <div className="text-[11px] font-mono text-slate-400">
                    {selectedCamera?.location || "Sector"} • {selectedCamera?.resolution || "1080p"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Night vision / Thermal filter pills */}
                <div className="relative">
                  <button
                    onClick={() => setFilterDropdown(!filterDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:border-emerald-500/50 cursor-pointer font-mono"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Filter: {filterMode.replace(/_/g, " ")}</span>
                  </button>

                  {filterDropdown && (
                    <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40">
                      {[
                        { id: "NORMAL", label: "Normal Starlight" },
                        { id: "NIGHT_VISION_GREEN", label: "NVG Green Phosphor" },
                        { id: "THERMAL_WHITE_HOT", label: "Thermal White Hot" },
                        { id: "IRONBOW_HEATMAP", label: "Ironbow Thermal" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSetFilterMode(item.id as NightFilterMode);
                            setFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                            filterMode === item.id
                              ? "bg-emerald-500/20 text-emerald-300 font-bold"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCamera && (
                  <button
                    onClick={() => onOpenVirtualFence(selectedCamera)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Virtual Fence</span>
                  </button>
                )}
              </div>
            </div>

            {/* Spotlight Interactive Canvas Feed */}
            <div className="p-3">
              {selectedCamera ? (
                <CameraTile
                  camera={selectedCamera}
                  onTriggerAlert={onTriggerAlert}
                  onOpenVirtualFence={() => onOpenVirtualFence(selectedCamera)}
                  onInspectCamera={() => onInspectCamera(selectedCamera)}
                  onZoomStream={() => {}}
                  isAudioMuted={isAudioMuted}
                  globalFilterMode={filterMode}
                  isSpotlight={true}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-xs">
                  No camera stream available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detections Stream & Camera Switcher List (Matching Screen 3) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Top Panel: Detections Real-Time Stream (Matching Screen 3) */}
          <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100">Detections</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">YOLOv11x Realtime</span>
            </div>

            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {simulatedDetections.map((det) => (
                <div
                  key={det.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    det.isIntruder
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-slate-900/80 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {det.type === "Person" ? (
                      <User className={`w-4 h-4 ${det.isIntruder ? "text-red-400" : "text-cyan-400"}`} />
                    ) : (
                      <Car className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold font-mono">
                        {det.type} {det.conf}
                      </span>
                      {det.isIntruder && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-red-500/30 text-[9px] font-mono text-red-200">
                          BREACH
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{det.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Panel: Camera List (Matching Screen 3) */}
          <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-100">Camera List</h3>
              <span className="text-[11px] font-mono text-slate-400">{allCameras.length} Registered</span>
            </div>

            <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {allCameras.map((cam) => {
                const isCurrent = cam.id === selectedCamera?.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => onSelectCamera(cam)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          cam.status === "ONLINE" ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                      <span className="text-xs truncate">{cam.name}</span>
                    </div>

                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-slate-600"}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
