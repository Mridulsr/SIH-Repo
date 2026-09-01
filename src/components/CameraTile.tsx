import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Camera,
  DetectedTrack,
  NightFilterMode,
  LightingEnvironment,
  AlertEvent,
  VehiclePlateRecord,
} from "../types";
import { isPointInPolygon } from "../utils/geometry";
import {
  Maximize2,
  Minimize2,
  Camera as CameraIcon,
  Crosshair,
  Eye,
  AlertTriangle,
  Play,
  Shield,
  Zap,
  Sliders,
  Settings,
  Sun,
  Moon,
  Flame,
  Radio,
  Info,
  CloudFog,
  CloudRain,
  Sunrise,
} from "lucide-react";

interface CameraTileProps {
  camera: Camera;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onMaximize?: (camera: Camera) => void;
  onInspect?: (camera: Camera) => void;
  onOpenFenceEditor?: (camera: Camera) => void;
  onEditFence?: (camera: Camera) => void;
  onTriggerAlert?: (alert: AlertEvent) => void;
  onVehicleDetected?: (record: VehiclePlateRecord) => void;
  onOpenForensicModal?: (alert: AlertEvent) => void;
}

export const CameraTile: React.FC<CameraTileProps> = ({
  camera,
  isExpanded = false,
  onToggleExpand,
  onMaximize,
  onInspect,
  onOpenFenceEditor,
  onEditFence,
  onTriggerAlert,
  onVehicleDetected,
  onOpenForensicModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleEditFence = onEditFence || onOpenFenceEditor || (() => {});
  const handleToggleExpand = () => {
    if (onMaximize) onMaximize(camera);
    else if (onToggleExpand) onToggleExpand();
  };

  const handleInspect = () => {
    onInspect?.(camera);
  };

  // Overlays and Modes
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [showTracks, setShowTracks] = useState(true);
  const [showFences, setShowFences] = useState(true);
  const [showOSD, setShowOSD] = useState(true);

  const getInitialNightMode = (): NightFilterMode => {
    if (camera.lightingEnvironment === "THERMAL_WHITE_HOT") return "THERMAL_WHITE_HOT";
    if (camera.lightingEnvironment === "THERMAL_IRONBOW") return "IRONBOW_HEATMAP";
    if (camera.lightingEnvironment === "NIGHT_VISION_GREEN") return "NIGHT_VISION_GREEN";
    if (camera.mode === "NIGHT_THERMAL") return "THERMAL_WHITE_HOT";
    return "NORMAL";
  };

  const [nightMode, setNightMode] = useState<NightFilterMode>(getInitialNightMode());
  const [fpsCounter, setFpsCounter] = useState(camera.fps);
  const [activeBreachAlert, setActiveBreachAlert] = useState<string | null>(null);
  const [lastPlateScanned, setLastPlateScanned] = useState<string | null>(null);

  // Simulated moving tracks inside this camera feed
  const tracksRef = useRef<DetectedTrack[]>([]);
  const frameCountRef = useRef(0);
  const alertCooldownRef = useRef<{ [key: string]: number }>({});

  // Initialize tracks depending on camera mode and ID
  useEffect(() => {
    const idNum = parseInt(camera.id.replace(/\D/g, ""), 10) || 1;

    if (camera.mode === "ANPR_CHECKPOST") {
      const samplePlates = [
        "UP-32-DK-8921",
        "BR-06-BA-4512",
        "UP-53-AZ-1102",
        "WB-74-K-8819",
        "AS-01-EF-4412",
        "HR-26-EQ-1994",
        "DL-08-CC-5190",
      ];
      const samplePlate = samplePlates[idNum % samplePlates.length];
      tracksRef.current = [
        {
          id: `TRK-VEH-${idNum * 10 + 1}`,
          label: idNum % 3 === 0 ? "truck" : "vehicle",
          confidence: 0.965,
          bbox: { x: 0.38, y: 0.42, width: 0.24, height: 0.22 },
          velocity: { vx: 0.0001, vy: 0.0003 },
          trajectory: [],
          timeInFrameSec: 12,
          inRestrictedZone: false,
          plateNumber: samplePlate,
          plateConfidence: 0.965,
        },
      ];
    } else if (camera.mode === "RESTRICTED_FENCE") {
      tracksRef.current = [
        {
          id: `TRK-${idNum * 100 + 2}`,
          label: "person",
          confidence: 0.95,
          bbox: { x: 0.46, y: 0.22, width: 0.055, height: 0.16 },
          velocity: { vx: 0.0002, vy: 0.0007 },
          trajectory: [],
          timeInFrameSec: 8,
          inRestrictedZone: false,
        },
        {
          id: `TRK-${idNum * 100 + 9}`,
          label: "person",
          confidence: 0.89,
          bbox: { x: 0.82, y: 0.28, width: 0.05, height: 0.15 },
          velocity: { vx: -0.0003, vy: 0.0001 },
          trajectory: [],
          timeInFrameSec: 18,
          inRestrictedZone: false,
        },
      ];
    } else if (camera.mode === "NIGHT_THERMAL") {
      tracksRef.current = [
        {
          id: `TRK-TH-${idNum * 10 + 8}`,
          label: "person",
          confidence: 0.915,
          bbox: { x: 0.35, y: 0.52, width: 0.055, height: 0.15 },
          velocity: { vx: 0.00006, vy: 0.00006 },
          trajectory: [],
          timeInFrameSec: 45,
          inRestrictedZone: true,
          loiterDuration: 45,
        },
      ];
    } else {
      tracksRef.current = [
        {
          id: `TRK-PAT-${idNum * 10 + 1}`,
          label: "person",
          confidence: 0.94,
          bbox: { x: 0.2, y: 0.65, width: 0.06, height: 0.18 },
          velocity: { vx: 0.0007, vy: -0.0001 },
          trajectory: [],
          timeInFrameSec: 14,
          inRestrictedZone: false,
        },
        {
          id: `TRK-VEH-${idNum * 10 + 4}`,
          label: "vehicle",
          confidence: 0.91,
          bbox: { x: 0.65, y: 0.55, width: 0.18, height: 0.14 },
          velocity: { vx: -0.0004, vy: 0.0001 },
          trajectory: [],
          timeInFrameSec: 22,
          inRestrictedZone: false,
        },
      ];
    }
  }, [camera.id, camera.mode]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      frameCountRef.current++;

      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Simulated Camera Background
      drawCameraEnvironment(ctx, width, height, camera, nightMode);

      // 2. Draw Virtual Fences / Polygons
      if (showFences && camera.virtualFences && camera.virtualFences.length > 0) {
        camera.virtualFences.forEach((fence) => {
          if (!fence.active || fence.points.length < 2) return;

          ctx.save();
          ctx.beginPath();
          const startX = fence.points[0].x * width;
          const startY = fence.points[0].y * height;
          ctx.moveTo(startX, startY);

          for (let i = 1; i < fence.points.length; i++) {
            ctx.lineTo(fence.points[i].x * width, fence.points[i].y * height);
          }
          if (fence.type === "RESTRICTED_POLYGON" || fence.type === "BUFFER_ZONE") {
            ctx.closePath();
          }

          // Fence Styling
          const isCritical = fence.severity === "CRITICAL";
          const pulse = (Math.sin(Date.now() / 250) + 1) / 2;

          if (fence.type === "RESTRICTED_POLYGON") {
            ctx.fillStyle = isCritical
              ? `rgba(239, 68, 68, ${0.12 + pulse * 0.12})`
              : "rgba(245, 158, 11, 0.15)";
            ctx.fill();
            ctx.lineWidth = isCritical ? 2.5 : 2;
            ctx.strokeStyle = isCritical ? `rgba(239, 68, 68, ${0.8 + pulse * 0.2})` : "#f59e0b";
            ctx.setLineDash([8, 6]);
            ctx.stroke();
          } else {
            // Tripwire line
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#e11d48";
            ctx.setLineDash([10, 5]);
            ctx.stroke();
          }

          // Draw vertices
          fence.points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x * width, p.y * height, 4, 0, Math.PI * 2);
            ctx.fillStyle = isCritical ? "#ef4444" : "#f59e0b";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });

          // Fence Label Tag
          const midX = fence.points[0].x * width;
          const midY = fence.points[0].y * height;
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = isCritical ? "rgba(220, 38, 38, 0.9)" : "rgba(217, 119, 6, 0.9)";
          const labelText = `⚠️ ${fence.name} [${fence.direction}]`;
          const textWidth = ctx.measureText(labelText).width;
          ctx.fillRect(midX - 4, midY - 18, textWidth + 8, 18);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText, midX, midY - 5);

          ctx.restore();
        });
      }

      // 3. Update & Draw Simulated Moving Tracks (People & Vehicles)
      const currentTracks = tracksRef.current;
      currentTracks.forEach((track) => {
        // Move track
        track.bbox.x += track.velocity.vx;
        track.bbox.y += track.velocity.vy;

        // Bounce or loop inside frame bounds
        if (track.bbox.x <= 0.02 || track.bbox.x + track.bbox.width >= 0.98) {
          track.velocity.vx *= -1;
        }
        if (track.bbox.y <= 0.15 || track.bbox.y + track.bbox.height >= 0.92) {
          track.velocity.vy *= -1;
        }

        // Add history point for ByteTrack trajectory line
        if (frameCountRef.current % 3 === 0) {
          track.trajectory.push({
            x: track.bbox.x + track.bbox.width / 2,
            y: track.bbox.y + track.bbox.height,
            timestamp: Date.now(),
          });
          if (track.trajectory.length > 25) {
            track.trajectory.shift();
          }
        }

        // Check if track center point intersects with any active virtual polygon fence
        const centerX = track.bbox.x + track.bbox.width / 2;
        const bottomY = track.bbox.y + track.bbox.height * 0.9;
        let insideRestricted = false;

        if (camera.virtualFences && camera.virtualFences.length > 0) {
          for (const fence of camera.virtualFences) {
            if (!fence.active) continue;
            if (fence.type === "RESTRICTED_POLYGON" || fence.type === "BUFFER_ZONE") {
              if (isPointInPolygon({ x: centerX, y: bottomY }, fence.points)) {
                insideRestricted = true;

                // Trigger intrusion alert with 15s cooldown per track
                const lastAlertTime = alertCooldownRef.current[track.id] || 0;
                if (Date.now() - lastAlertTime > 15000) {
                  alertCooldownRef.current[track.id] = Date.now();
                  setActiveBreachAlert(`ALERT: ${fence.name} Breached by ${track.id}`);

                  const intrusionAlert: AlertEvent = {
                    id: `ALT-${camera.id}-${track.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    cameraId: camera.id,
                    cameraName: camera.properName || camera.name,
                    sector: camera.sector,
                    eventType: "VIRTUAL_FENCE_INTRUSION",
                    timestamp: new Date().toISOString(),
                    severity: fence.severity,
                    trackId: track.id,
                    objectType: track.label === "person" ? "PERSON" : "VEHICLE",
                    confidence: track.confidence,
                    coordinates: { x: centerX, y: bottomY },
                    details: {
                      fenceName: fence.name,
                      reason: `Subject penetrated ${fence.name} polygon [${fence.severity}]`,
                      explainableEvidence: `ByteTrack ID ${track.id} entered polygon coordinates (${centerX.toFixed(2)}, ${bottomY.toFixed(2)}) with velocity vector magnitude ${(Math.hypot(track.velocity.vx, track.velocity.vy) * 1000).toFixed(1)} px/s.`,
                    },
                    status: "ACTIVE",
                  };
                  onTriggerAlert?.(intrusionAlert);
                }
                break;
              }
            }
          }
        }
        track.inRestrictedZone = insideRestricted;

        // Draw physical figure
        drawObjectFigure(ctx, track, width, height, nightMode);

        // Draw ByteTrack trajectory path
        if (showTracks && track.trajectory.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(track.trajectory[0].x * width, track.trajectory[0].y * height);
          for (let t = 1; t < track.trajectory.length; t++) {
            ctx.lineTo(track.trajectory[t].x * width, track.trajectory[t].y * height);
          }
          ctx.strokeStyle = track.inRestrictedZone ? "#ef4444" : "#3b82f6";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }

        // Draw YOLO Detection Bounding Box & HUD Label
        if (showBBoxes) {
          const bx = track.bbox.x * width;
          const by = track.bbox.y * height;
          const bw = track.bbox.width * width;
          const bh = track.bbox.height * height;

          ctx.save();
          ctx.lineWidth = 2;
          ctx.strokeStyle = track.inRestrictedZone ? "#ef4444" : "#10b981";

          // Corner brackets
          const clen = Math.min(bw * 0.25, 12);
          // Top Left
          ctx.beginPath();
          ctx.moveTo(bx, by + clen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + clen, by);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - clen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + clen);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - clen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + clen, by + bh);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(bx + bw - clen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - clen);
          ctx.stroke();

          // Full rect dashed
          ctx.setLineDash([2, 4]);
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);

          // Tracking HUD Box Tag
          ctx.font = "bold 10px monospace";
          const tagText = `${track.id} ${track.label.toUpperCase()} ${(track.confidence * 100).toFixed(0)}%`;
          const tagWidth = ctx.measureText(tagText).width;

          ctx.fillStyle = track.inRestrictedZone ? "#ef4444" : "#10b981";
          ctx.fillRect(bx, by - 16, tagWidth + 6, 16);
          ctx.fillStyle = "#ffffff";
          ctx.fillText(tagText, bx + 3, by - 4);

          // ANPR Plate Recognition Overlay (if vehicle)
          if (track.plateNumber) {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1;
            ctx.fillRect(bx, by + bh + 4, 110, 20);
            ctx.strokeRect(bx, by + bh + 4, 110, 20);

            ctx.fillStyle = "#fbbf24";
            ctx.font = "bold 10px monospace";
            ctx.fillText(`ANPR: ${track.plateNumber}`, bx + 6, by + bh + 18);
          }

          ctx.restore();
        }
      });

      // 4. Draw Camera OSD (On-Screen Display: Latency, Timestamp, GPS)
      if (showOSD) {
        drawCameraOSD(ctx, width, height, camera, fpsCounter, activeBreachAlert);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, nightMode, showBBoxes, showTracks, showFences, showOSD, fpsCounter, onTriggerAlert]);

  // Simulation: Force intruder to run inside restricted fence
  const handleSimulateIntruder = useCallback(() => {
    const intruderTrack: DetectedTrack = {
      id: `TRK-${Math.floor(Math.random() * 800 + 100)}`,
      label: "person",
      confidence: 0.962,
      bbox: { x: 0.45, y: 0.2, width: 0.055, height: 0.16 },
      velocity: { vx: 0.0001, vy: 0.0022 }, // Fast downward intrusion
      trajectory: [],
      timeInFrameSec: 2,
      inRestrictedZone: false,
    };
    tracksRef.current = [intruderTrack, ...tracksRef.current.slice(0, 2)];
  }, []);

  // Simulation: Force ANPR vehicle scanner
  const handleSimulateANPRScan = useCallback(() => {
    const plates = [
      { plate: "UP-32-DK-8921", status: "WANTED_RED_NOTICE", note: "Wanted Red Corner Notice vehicle" },
      { plate: "BR-06-BA-4512", status: "FLAGGED_SUSPICIOUS", note: "Cross-border contraband suspect" },
      { plate: "HR-26-EQ-1994", status: "CLEAN", note: "Verified commercial transit" },
    ];
    const picked = plates[Math.floor(Math.random() * plates.length)];
    setLastPlateScanned(picked.plate);

    const rec: VehiclePlateRecord = {
      id: `VEH-${camera.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cameraId: camera.id,
      cameraName: camera.properName || camera.name,
      plateNumber: picked.plate,
      vehicleType: "SUV",
      timestamp: new Date().toISOString(),
      ocrConfidence: 0.965,
      speedKmh: Math.floor(Math.random() * 20 + 20),
      watchlistStatus: picked.status as any,
      notes: picked.note,
    };
    onVehicleDetected?.(rec);

    if (picked.status === "WANTED_RED_NOTICE") {
      const alert: AlertEvent = {
        id: `ALT-ANPR-${camera.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        cameraId: camera.id,
        cameraName: camera.properName || camera.name,
        sector: camera.sector,
        eventType: "ANPR_WATCHLIST_HIT",
        timestamp: new Date().toISOString(),
        severity: "CRITICAL",
        trackId: "TRK-219",
        objectType: "VEHICLE",
        confidence: 0.965,
        coordinates: { x: 0.5, y: 0.6 },
        details: {
          plateNumber: picked.plate,
          vehicleType: "SUV",
          reason: "Wanted Vehicle Matched Inter-Agency Watchlist (Red Notice)",
          explainableEvidence: `PaddleOCR detected license plate ${picked.plate} with 96.5% OCR confidence.`,
        },
        status: "ACTIVE",
      };
      onTriggerAlert?.(alert);
    }
  }, [camera, onVehicleDetected, onTriggerAlert]);

  // Snapshot capture handler
  const handleCaptureSnapshot = useCallback(() => {
    const snapshotAlert: AlertEvent = {
      id: `SNAP-${camera.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cameraId: camera.id,
      cameraName: camera.properName || camera.name,
      sector: camera.sector,
      eventType: "SUSPICIOUS_TRAJECTORY",
      timestamp: new Date().toISOString(),
      severity: "HIGH",
      trackId: "TRK-MANUAL-SNAP",
      objectType: "PERSON",
      confidence: 0.95,
      coordinates: { x: 0.5, y: 0.5 },
      snapshotUrl: "https://images.unsplash.com/photo-1578836537282-3171d77f8632?auto=format&fit=crop&w=600&q=80",
      details: {
        reason: "Manual High-Resolution Evidence Snapshot Saved by Operator",
        explainableEvidence: "Operator triggered forensic audit snapshot.",
      },
      status: "ACTIVE",
    };
    onOpenForensicModal?.(snapshotAlert);
  }, [camera, onOpenForensicModal]);

  // Get lighting badge label and icon
  const getLightingBadge = () => {
    const env = camera.lightingEnvironment;
    switch (env) {
      case "DAY_BRIGHT":
        return { label: "DAY BRIGHT", icon: Sun, color: "bg-amber-950/80 text-amber-300 border-amber-800/80" };
      case "DAY_OVERCAST":
        return { label: "DAY OVERCAST", icon: CloudFog, color: "bg-sky-950/80 text-sky-300 border-sky-800/80" };
      case "DUSK_GOLDEN":
        return { label: "DUSK SUNSET", icon: Sunrise, color: "bg-orange-950/80 text-orange-300 border-orange-800/80" };
      case "NIGHT_IR":
        return { label: "NIGHT IR (850nm)", icon: Moon, color: "bg-teal-950/80 text-teal-300 border-teal-800/80" };
      case "NIGHT_VISION_GREEN":
        return { label: "NVG GEN-3", icon: Eye, color: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80" };
      case "THERMAL_WHITE_HOT":
        return { label: "FLIR WHITE-HOT", icon: Flame, color: "bg-rose-950/80 text-rose-300 border-rose-800/80" };
      case "THERMAL_IRONBOW":
        return { label: "FLIR IRONBOW", icon: Flame, color: "bg-purple-950/80 text-purple-300 border-purple-800/80" };
      case "RAIN_MONSOON":
        return { label: "MONSOON RAIN", icon: CloudRain, color: "bg-cyan-950/80 text-cyan-300 border-cyan-800/80" };
      case "FOG_VALLEY":
        return { label: "FOG DEHAZE", icon: CloudFog, color: "bg-slate-800 text-slate-300 border-slate-700" };
      default:
        return { label: "DAY BRIGHT", icon: Sun, color: "bg-amber-950/80 text-amber-300 border-amber-800/80" };
    }
  };

  const lightingBadge = getLightingBadge();
  const LightingIcon = lightingBadge.icon;

  return (
    <div
      ref={containerRef}
      id={`camera-tile-${camera.id.toLowerCase()}`}
      className={`relative bg-slate-950 rounded-xl overflow-hidden border transition-all duration-300 flex flex-col shadow-lg ${
        activeBreachAlert
          ? "border-red-500 shadow-red-900/30 ring-2 ring-red-500/50"
          : "border-slate-800 hover:border-slate-700"
      } ${isExpanded ? "col-span-full row-span-full h-[82vh]" : "h-[360px] sm:h-[400px]"}`}
    >
      {/* Top Tile Header Bar */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />

          {/* Clickable Camera Identifier & Proper Name */}
          <button
            onClick={handleInspect}
            className="flex items-center gap-1.5 hover:opacity-80 transition text-left truncate group"
            title="Click to view proper outpost name, specs & lighting configuration"
          >
            <span className="font-bold text-white font-mono shrink-0 group-hover:text-blue-400">
              {camera.id}
            </span>
            <span className="text-slate-300 font-sans font-medium truncate max-w-[140px] sm:max-w-[200px] md:max-w-[240px] group-hover:underline">
              {camera.properName || camera.name}
            </span>
            <Info className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0" />
          </button>

          {/* RTSP & Lighting Environment Composite Badge */}
          <div className="hidden sm:flex items-center gap-1 shrink-0 ml-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
              {camera.streamType}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 border ${lightingBadge.color}`}>
              <LightingIcon className="w-3 h-3" />
              <span>{lightingBadge.label}</span>
            </span>
          </div>
        </div>

        {/* Quick View Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Night mode switcher */}
          <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => setNightMode("NORMAL")}
              className={`p-1 rounded ${
                nightMode === "NORMAL" ? "bg-slate-700 text-amber-300" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Daylight RGB Mode"
            >
              <Sun className="w-3 h-3" />
            </button>
            <button
              onClick={() => setNightMode("NIGHT_VISION_GREEN")}
              className={`p-1 rounded ${
                nightMode === "NIGHT_VISION_GREEN"
                  ? "bg-emerald-900 text-emerald-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Green Phosphor Night Vision"
            >
              <Moon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setNightMode("THERMAL_WHITE_HOT")}
              className={`p-1 rounded ${
                nightMode === "THERMAL_WHITE_HOT"
                  ? "bg-purple-900 text-purple-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="FLIR White-Hot Thermal IR"
            >
              <Flame className="w-3 h-3" />
            </button>
          </div>

          {/* Virtual Fence Editor Trigger */}
          <button
            id={`btn-edit-fence-${camera.id.toLowerCase()}`}
            onClick={() => handleEditFence(camera)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
            title="Configure Virtual Fence Polygon"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span className="hidden lg:inline">Fence</span>
          </button>

          {/* Snapshot Trigger */}
          <button
            onClick={handleCaptureSnapshot}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Capture High-Res Evidence Snapshot"
          >
            <CameraIcon className="w-3 h-3" />
          </button>

          {/* Fullscreen / Expand */}
          <button
            onClick={handleToggleExpand}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={isExpanded ? "Collapse View" : "Maximize Stream"}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Canvas CCTV Feed */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain cursor-crosshair"
          onClick={handleInspect}
        />

        {/* Live Breach Banner Overlay */}
        {activeBreachAlert && (
          <div className="absolute top-3 left-3 right-3 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-between border border-red-400 animate-pulse shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>{activeBreachAlert}</span>
            </div>
            <button
              onClick={() => setActiveBreachAlert(null)}
              className="text-[10px] bg-red-950 px-2 py-0.5 rounded hover:bg-red-900 border border-red-800"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Floating Quick Action Overlay at Bottom Right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs">
          {/* Quick Scenario Injectors */}
          {camera.mode === "RESTRICTED_FENCE" && (
            <button
              id={`btn-simulate-breach-${camera.id.toLowerCase()}`}
              onClick={handleSimulateIntruder}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600/90 hover:bg-rose-600 text-white font-mono text-[11px] font-bold shadow transition"
              title="Force Subject to Penetrate Fence Polygon"
            >
              <Zap className="w-3 h-3" />
              <span>Trigger Intrusion</span>
            </button>
          )}

          {camera.mode === "ANPR_CHECKPOST" && (
            <button
              id={`btn-simulate-anpr-${camera.id.toLowerCase()}`}
              onClick={handleSimulateANPRScan}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/90 hover:bg-amber-600 text-white font-mono text-[11px] font-bold shadow transition"
              title="Simulate Vehicle Entry & Plate OCR"
            >
              <Crosshair className="w-3 h-3" />
              <span>Scan ANPR Plate</span>
            </button>
          )}

          {/* Toggle Overlays Menu */}
          <div className="flex items-center gap-1 text-[11px] text-slate-300 pl-1 border-l border-slate-800">
            <button
              onClick={() => setShowBBoxes(!showBBoxes)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                showBBoxes ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-slate-500"
              }`}
              title="Toggle YOLO Bounding Boxes"
            >
              BBOX
            </button>
            <button
              onClick={() => setShowTracks(!showTracks)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                showTracks ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" : "text-slate-500"
              }`}
              title="Toggle ByteTrack Trajectory History"
            >
              TRACK
            </button>
            <button
              onClick={() => setShowFences(!showFences)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                showFences ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-500"
              }`}
              title="Toggle Virtual Fence Overlay"
            >
              FENCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Helper Canvas Drawing Functions
// ==========================================

function drawCameraEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  nightMode: NightFilterMode
) {
  const env = camera.lightingEnvironment || "DAY_BRIGHT";
  const idNum = parseInt(camera.id.replace(/\D/g, ""), 10) || 1;

  // Base Sky/Horizon Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  if (nightMode === "NIGHT_VISION_GREEN" || env === "NIGHT_VISION_GREEN") {
    grad.addColorStop(0, "#022010");
    grad.addColorStop(0.5, "#043818");
    grad.addColorStop(1, "#011508");
  } else if (nightMode === "THERMAL_WHITE_HOT" || env === "THERMAL_WHITE_HOT") {
    grad.addColorStop(0, "#111827");
    grad.addColorStop(0.5, "#1f2937");
    grad.addColorStop(1, "#030712");
  } else if (nightMode === "IRONBOW_HEATMAP" || env === "THERMAL_IRONBOW") {
    grad.addColorStop(0, "#1e0826");
    grad.addColorStop(0.5, "#3b0764");
    grad.addColorStop(1, "#0f0314");
  } else if (env === "DUSK_GOLDEN") {
    grad.addColorStop(0, "#7c2d12");
    grad.addColorStop(0.35, "#c2410c");
    grad.addColorStop(0.65, "#d97706");
    grad.addColorStop(1, "#1c1917");
  } else if (env === "NIGHT_IR") {
    grad.addColorStop(0, "#090d16");
    grad.addColorStop(0.5, "#0d131f");
    grad.addColorStop(1, "#05070c");
  } else if (env === "DAY_OVERCAST" || env === "FOG_VALLEY") {
    grad.addColorStop(0, "#475569");
    grad.addColorStop(0.5, "#64748b");
    grad.addColorStop(1, "#334155");
  } else if (env === "RAIN_MONSOON") {
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(0.5, "#334155");
    grad.addColorStop(1, "#0f172a");
  } else {
    // DAY BRIGHT
    grad.addColorStop(0, "#2563eb");
    grad.addColorStop(0.4, "#60a5fa");
    grad.addColorStop(0.65, "#93c5fd");
    grad.addColorStop(1, "#1e293b");
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  // Draw Mountain Ridges & Horizon
  if (camera.sector.includes("Kumaon") || camera.sector.includes("High Altitude") || idNum % 4 === 0) {
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#064e22" : "rgba(30, 41, 59, 0.7)";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.45);
    ctx.lineTo(width * 0.25, height * 0.28);
    ctx.lineTo(width * 0.5, height * 0.38);
    ctx.lineTo(width * 0.75, height * 0.24);
    ctx.lineTo(width, height * 0.42);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();
  }

  // Terrain / Road / Checkpost Elements
  const camName = (camera?.name || camera?.properName || "");
  if (camera?.mode === "ANPR_CHECKPOST" || camName.includes("Checkpost") || camName.includes("ICP")) {
    // Checkpoint Highway & Toll Booths
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#074e23" : "#1c2430";
    ctx.fillRect(0, height * 0.35, width, height * 0.65);

    // Asphalt Highway
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#043016" : "#121820";
    ctx.beginPath();
    ctx.moveTo(width * 0.2, height);
    ctx.lineTo(width * 0.42, height * 0.35);
    ctx.lineTo(width * 0.68, height * 0.35);
    ctx.lineTo(width * 0.85, height);
    ctx.fill();

    // Road Lane Divider Dashed Lines
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(width * 0.52, height * 0.35);
    ctx.lineTo(width * 0.52, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Checkpoint Boom Barrier Barricade
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width * 0.32, height * 0.52);
    ctx.lineTo(width * 0.65, height * 0.52);
    ctx.stroke();

    // Barricade Stripes
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (camName.includes("River") || camName.includes("Gorge") || camName.includes("Bridge") || camName.includes("Sandbar")) {
    // River & Floodplain
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#042c14" : "#0f1624";
    ctx.fillRect(0, height * 0.4, width, height * 0.6);

    // River Water Body
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#03200e" : env === "DUSK_GOLDEN" ? "#451a03" : "#080c14";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.65);
    ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.7, height * 0.75, width, height * 0.7);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Bridge Structure if applicable
    if (camName.includes("Bridge") || camName.includes("Suspension")) {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.55);
      ctx.lineTo(width, height * 0.55);
      ctx.stroke();

      // Suspension Cables
      ctx.strokeStyle = "rgba(203, 213, 225, 0.4)";
      ctx.lineWidth = 1;
      for (let cb = 0; cb < width; cb += 30) {
        ctx.beginPath();
        ctx.moveTo(cb, height * 0.42);
        ctx.lineTo(cb, height * 0.55);
        ctx.stroke();
      }
    }
  } else {
    // Perimeter / Fence / Zero-Line Trail
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#053d1b" : "#1a2533";
    ctx.fillRect(0, height * 0.38, width, height * 0.62);

    // Soil patrol track
    ctx.fillStyle = nightMode === "NIGHT_VISION_GREEN" ? "#074a21" : "#243346";
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    // Physical Border Fence Posts & Barbed Wire Lines
    ctx.strokeStyle = nightMode === "NIGHT_VISION_GREEN" ? "#10b981" : "#64748b";
    ctx.lineWidth = 1.5;
    const postCount = 9;
    for (let p = 0; p <= postCount; p++) {
      const px = (width / postCount) * p;
      ctx.beginPath();
      ctx.moveTo(px, height * 0.32);
      ctx.lineTo(px, height * 0.52);
      ctx.stroke();

      // Post cap
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(px - 2, height * 0.31, 4, 3);
    }
    // Barbed wire horizontal strands
    for (let s = 0; s < 4; s++) {
      const sy = height * 0.34 + s * (height * 0.045);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }
  }

  // Rain Effect
  if (env === "RAIN_MONSOON") {
    ctx.strokeStyle = "rgba(186, 230, 253, 0.35)";
    ctx.lineWidth = 1.2;
    const time = Date.now() / 15;
    for (let r = 0; r < 40; r++) {
      const rx = (r * 25 + (time % 100)) % width;
      const ry = ((r * 18 + time * 3) % height);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 16);
      ctx.stroke();
    }
  }

  // Fog / Mist Effect
  if (env === "FOG_VALLEY" || env === "DAY_OVERCAST") {
    ctx.fillStyle = "rgba(241, 245, 249, 0.12)";
    ctx.fillRect(0, height * 0.25, width, height * 0.5);
  }

  // Scanline / CRT / Sensor Noise Filter effect
  ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1.5);
  }

  ctx.restore();
}

function drawObjectFigure(
  ctx: CanvasRenderingContext2D,
  track: DetectedTrack,
  width: number,
  height: number,
  nightMode: NightFilterMode
) {
  const bx = track.bbox.x * width;
  const by = track.bbox.y * height;
  const bw = track.bbox.width * width;
  const bh = track.bbox.height * height;

  ctx.save();

  if (track.label === "person") {
    // Human Figure Silhouette / Thermal Signature
    const isThermal = nightMode === "THERMAL_WHITE_HOT" || nightMode === "IRONBOW_HEATMAP";
    const isNightGreen = nightMode === "NIGHT_VISION_GREEN";

    if (isThermal || track.inRestrictedZone) {
      ctx.shadowColor = track.inRestrictedZone ? "#ef4444" : "#ffffff";
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = nightMode === "IRONBOW_HEATMAP"
      ? "#f59e0b"
      : isThermal
      ? "#f8fafc"
      : isNightGreen
      ? "#22c55e"
      : track.inRestrictedZone
      ? "#f87171"
      : "#cbd5e1";

    // Head
    const headRadius = bw * 0.28;
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by + headRadius * 1.5, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Torso & Limbs
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.2, by + headRadius * 2.8, bw * 0.6, bh * 0.55, 4);
    ctx.fill();

    // Legs
    ctx.fillRect(bx + bw * 0.22, by + bh * 0.72, bw * 0.22, bh * 0.28);
    ctx.fillRect(bx + bw * 0.56, by + bh * 0.72, bw * 0.22, bh * 0.28);
  } else {
    // Vehicle Silhouette
    const isThermal = nightMode === "THERMAL_WHITE_HOT" || nightMode === "IRONBOW_HEATMAP";
    ctx.fillStyle = nightMode === "IRONBOW_HEATMAP" ? "#ea580c" : isThermal ? "#e2e8f0" : "#475569";
    ctx.beginPath();
    ctx.roundRect(bx, by + bh * 0.3, bw, bh * 0.6, 6);
    ctx.fill();

    // Vehicle Cabin / Roof
    ctx.fillStyle = isThermal ? "#94a3b8" : "#334155";
    ctx.beginPath();
    ctx.roundRect(bx + bw * 0.18, by, bw * 0.64, bh * 0.45, 4);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(bx + bw * 0.1, by + bh * 0.82, bw * 0.18, bh * 0.18);
    ctx.fillRect(bx + bw * 0.72, by + bh * 0.82, bw * 0.18, bh * 0.18);

    // Headlights beam
    ctx.fillStyle = "rgba(254, 240, 138, 0.25)";
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.9, by + bh * 0.5);
    ctx.lineTo(bx + bw * 1.5, by + bh * 0.3);
    ctx.lineTo(bx + bw * 1.5, by + bh * 0.8);
    ctx.fill();
  }

  ctx.restore();
}

function drawCameraOSD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  fps: number,
  breachAlert: string | null
) {
  ctx.save();
  ctx.font = "bold 11px monospace";

  // Top Left: Camera ID, Sector & GPS Coordinates
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(8, 8, 220, 48);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`CAM: ${camera.id} [${camera.status}]`, 14, 22);
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`LAT: ${camera.coordinates.lat.toFixed(4)}°N LNG: ${camera.coordinates.lng.toFixed(4)}°E`, 14, 36);
  ctx.fillText(`RES: ${camera.resolution}`, 14, 49);

  // Top Right: Live Timestamp & REC Indicator
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-GB") + "." + String(now.getMilliseconds()).padStart(3, "0");
  const dateString = now.toISOString().slice(0, 10);

  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(width - 190, 8, 182, 48);

  // Red blinking REC dot
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.beginPath();
    ctx.arc(width - 175, 22, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
  }
  ctx.fillStyle = "#ef4444";
  ctx.fillText("REC", width - 165, 26);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(timeString, width - 130, 26);
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(dateString, width - 175, 42);

  // Bottom Left: Edge Inference Telemetry
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(8, height - 32, 260, 24);
  ctx.fillStyle = "#10b981";
  ctx.fillText(`INFERENCE: ${fps} FPS | BITRATE: ${camera.bitrate}`, 14, height - 16);

  ctx.restore();
}
