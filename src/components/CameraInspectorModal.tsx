import React from "react";
import {
  X,
  Camera as CameraIcon,
  Radio,
  Sun,
  Moon,
  Flame,
  CloudFog,
  CloudRain,
  Sunrise,
  Shield,
  Zap,
  Crosshair,
  Maximize2,
  Copy,
  Check,
  Cpu,
  Navigation,
  Mountain,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import { Camera, LightingEnvironment, AlertEvent, VehiclePlateRecord } from "../types";

interface CameraInspectorModalProps {
  camera: Camera | null;
  onClose: () => void;
  onMaximize?: (camera: Camera) => void;
  onEditFence?: (camera: Camera) => void;
  onTriggerAlert?: (alert: AlertEvent) => void;
  onVehicleDetected?: (record: VehiclePlateRecord) => void;
  onOpenForensics?: (alert: AlertEvent) => void;
  onUpdateLighting?: (cameraId: string, env: LightingEnvironment) => void;
}

export const CameraInspectorModal: React.FC<CameraInspectorModalProps> = ({
  camera,
  onClose,
  onMaximize,
  onEditFence,
  onTriggerAlert,
  onVehicleDetected,
  onOpenForensics,
  onUpdateLighting,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!camera) return null;

  const handleCopyRtsp = () => {
    navigator.clipboard?.writeText(camera.streamUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEnvBadge = (env?: LightingEnvironment) => {
    switch (env) {
      case "DAY_BRIGHT":
        return { label: "Daylight Bright (Sunlit 100k Lux)", icon: Sun, color: "text-amber-400 bg-amber-950/70 border-amber-800/80" };
      case "DAY_OVERCAST":
        return { label: "Daylight Overcast / Diffuse", icon: CloudFog, color: "text-sky-300 bg-sky-950/70 border-sky-800/80" };
      case "DUSK_GOLDEN":
        return { label: "Dusk / Twilight Golden Hour", icon: Sunrise, color: "text-orange-300 bg-orange-950/70 border-orange-800/80" };
      case "NIGHT_IR":
        return { label: "Night Vision IR (850nm Starlight)", icon: Moon, color: "text-teal-300 bg-teal-950/70 border-teal-800/80" };
      case "NIGHT_VISION_GREEN":
        return { label: "Military NVG Gen-3 Green Phosphor", icon: Eye, color: "text-emerald-300 bg-emerald-950/70 border-emerald-800/80" };
      case "THERMAL_WHITE_HOT":
        return { label: "FLIR Thermal (White-Hot 8-14µm)", icon: Flame, color: "text-rose-300 bg-rose-950/70 border-rose-800/80" };
      case "THERMAL_IRONBOW":
        return { label: "FLIR Thermal (Ironbow Heatmap)", icon: Flame, color: "text-purple-300 bg-purple-950/70 border-purple-800/80" };
      case "RAIN_MONSOON":
        return { label: "Monsoon Precipitation / Wet Sheen", icon: CloudRain, color: "text-cyan-300 bg-cyan-950/70 border-cyan-800/80" };
      case "FOG_VALLEY":
        return { label: "Dense Mountain Fog / Optical Dehaze", icon: CloudFog, color: "text-slate-300 bg-slate-800/80 border-slate-700" };
      default:
        return { label: "Daylight High Contrast", icon: Sun, color: "text-amber-300 bg-amber-950/70 border-amber-800/80" };
    }
  };

  const envBadge = getEnvBadge(camera.lightingEnvironment);
  const EnvIcon = envBadge.icon;

  const lightingOptions: Array<{ id: LightingEnvironment; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: "DAY_BRIGHT", label: "Day Bright", icon: Sun },
    { id: "DAY_OVERCAST", label: "Day Overcast", icon: CloudFog },
    { id: "DUSK_GOLDEN", label: "Dusk Twilight", icon: Sunrise },
    { id: "NIGHT_IR", label: "Night IR 850nm", icon: Moon },
    { id: "NIGHT_VISION_GREEN", label: "NVG Green", icon: Eye },
    { id: "THERMAL_WHITE_HOT", label: "FLIR White-Hot", icon: Flame },
    { id: "THERMAL_IRONBOW", label: "FLIR Ironbow", icon: Flame },
    { id: "RAIN_MONSOON", label: "Monsoon Rain", icon: CloudRain },
    { id: "FOG_VALLEY", label: "Fog Dehaze", icon: CloudFog },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CameraIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
                  {camera.id}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {camera.outpostCode || "SSB-SEC-SURVEILLANCE"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-mono">LIVE FEED</span>
              </div>
              <h2 className="text-lg font-bold text-white font-sans mt-0.5">
                {camera.properName || camera.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Outpost Tactical Identification Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-400" />
                  <span>SECTOR & ZONE</span>
                </div>
                <div className="text-white font-medium text-xs mt-1">{camera.sector}</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-emerald-400" />
                  <span>ELEVATION & GRID</span>
                </div>
                <div className="text-white font-mono text-xs mt-1">
                  {camera.elevation || "75m AMSL"} · {camera.mgrs || "MGRS LOCKED"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>COORDINATES</span>
                </div>
                <div className="text-white font-mono text-xs mt-1">
                  {camera.coordinates.lat.toFixed(4)}° N, {camera.coordinates.lng.toFixed(4)}° E
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  <span>STREAM BITRATE</span>
                </div>
                <div className="text-white font-mono text-xs mt-1">
                  {camera.resolution} ({camera.bitrate})
                </div>
              </div>
            </div>
          </div>

          {/* RTSP Stream Ingestion URL & Protocol */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-400" />
                RTSP INGESTION ENDPOINT & PROTOCOL
              </span>
              <button
                onClick={handleCopyRtsp}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy RTSP URI"}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between">
              <span>{camera.streamUrl}</span>
              <span className="text-[10px] text-slate-400 font-sans ml-2 shrink-0">H.264/H.265 RTSP Transport</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
              <span><strong>Latency:</strong> ~31ms</span>
              <span><strong>Buffer:</strong> 200ms Zero-Copy</span>
              <span><strong>Hardware Dec:</strong> NVDEC INT8</span>
            </div>
          </div>

          {/* Lighting Environment & Live Mode Selector */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  OPTICAL LIGHTING & SENSOR ENVIRONMENT
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Active classification of ambient light conditions and hardware sensor tuning.
                </p>
              </div>
              <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${envBadge.color}`}>
                <EnvIcon className="w-4 h-4" />
                <span>{envBadge.label}</span>
              </div>
            </div>

            {/* Interactive Environment Simulation Buttons */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 mb-2 block">
                SWITCH SURVEILLANCE VISION MODE:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {lightingOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = camera.lightingEnvironment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateLighting?.(camera.id, opt.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-400 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sensor Specs */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="font-mono text-slate-400 block mb-1">SENSOR HARDWARE SPECIFICATIONS:</span>
              <p className="text-slate-200 font-mono">
                {camera.sensorType || "4K Starlight CMOS / Dual Thermal FLIR with Adaptive Auto-Gain Control"}
              </p>
            </div>
          </div>

          {/* Virtual Fences on this Camera */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                VIRTUAL FENCES & ZERO-LINE GEOFENCES ({camera.virtualFences.length})
              </span>
              <button
                onClick={() => {
                  onClose();
                  onEditFence?.(camera);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>Open Geofence Studio</span>
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            {camera.virtualFences.length === 0 ? (
              <div className="text-xs text-slate-500 py-3 text-center">
                No virtual fences configured. Click Open Geofence Studio to draw polygons.
              </div>
            ) : (
              <div className="space-y-2">
                {camera.virtualFences.map((vf) => (
                  <div
                    key={vf.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          vf.severity === "CRITICAL"
                            ? "bg-rose-500"
                            : vf.severity === "HIGH"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="font-bold text-white">{vf.name}</span>
                      <span className="text-slate-400">[{vf.type}]</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Direction: {vf.direction}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onMaximize?.(camera);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Maximize CCTV Feed</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEditFence?.(camera);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Edit Polygon Fence</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {camera.mode === "RESTRICTED_FENCE" && (
              <button
                onClick={() => {
                  const alert: AlertEvent = {
                    id: `ALT-MANUAL-${Date.now()}`,
                    cameraId: camera.id,
                    cameraName: camera.name,
                    sector: camera.sector,
                    eventType: "VIRTUAL_FENCE_INTRUSION",
                    timestamp: new Date().toISOString(),
                    severity: "CRITICAL",
                    trackId: "TRK-990",
                    objectType: "PERSON",
                    confidence: 0.96,
                    coordinates: { x: 0.5, y: 0.5 },
                    details: {
                      fenceName: camera.virtualFences[0]?.name || "Zero-Line Geofence",
                      reason: "Simulated tactical breach event triggered for inspection",
                      explainableEvidence: "Manual simulation test for border commander review.",
                    },
                    status: "ACTIVE",
                  };
                  onTriggerAlert?.(alert);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate Ingress</span>
              </button>
            )}

            {camera.mode === "ANPR_CHECKPOST" && (
              <button
                onClick={() => {
                  const rec: VehiclePlateRecord = {
                    id: `VEH-${Date.now()}`,
                    cameraId: camera.id,
                    cameraName: camera.name,
                    plateNumber: "UP-32-DK-8921",
                    vehicleType: "SUV",
                    timestamp: new Date().toISOString(),
                    ocrConfidence: 0.965,
                    speedKmh: 28,
                    watchlistStatus: "WANTED_RED_NOTICE",
                    notes: "High-risk vehicle detected at checkpost",
                  };
                  onVehicleDetected?.(rec);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white font-bold text-xs shadow transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Simulate Red Notice Plate</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
