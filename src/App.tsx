import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Camera,
  AlertEvent,
  VehiclePlateRecord,
  SystemMetrics,
  VirtualFence,
  LightingEnvironment,
} from "./types";
import {
  INITIAL_CAMERAS,
  INITIAL_ALERTS,
  INITIAL_VEHICLES,
  INITIAL_METRICS,
} from "./data/initialData";
import { TacticalHeader } from "./components/TacticalHeader";
import { CameraTile } from "./components/CameraTile";
import { AlertsLocker } from "./components/AlertsLocker";
import { ANPRLogbook } from "./components/ANPRLogbook";
import { SystemPerformancePanel } from "./components/SystemPerformancePanel";
import { VirtualFenceEditor } from "./components/VirtualFenceEditor";
import { GeminiForensicsModal } from "./components/GeminiForensicsModal";
import { JudgeDemoWalkthrough } from "./components/JudgeDemoWalkthrough";
import { ArchitectureBlueprintModal } from "./components/ArchitectureBlueprintModal";
import { AddCameraModal } from "./components/AddCameraModal";
import { SitrepHolderModal } from "./components/SitrepHolderModal";
import { CameraInspectorModal } from "./components/CameraInspectorModal";
import {
  Grid,
  Grid3X3,
  LayoutGrid,
  Tv,
  Plus,
  AlertTriangle,
  Sparkles,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Search,
  Filter,
  Sun,
  Moon,
  Flame,
  CloudRain,
  Eye,
  Car,
  Layers,
} from "lucide-react";

export const App: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<"grid" | "alerts" | "anpr" | "metrics" | "blueprint">("grid");
  const [defconLevel, setDefconLevel] = useState<1 | 2 | 3 | 4 | 5>(2);
  const [soundMuted, setSoundMuted] = useState<boolean>(true);

  // Core Surveillance State
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS);
  const [vehicles, setVehicles] = useState<VehiclePlateRecord[]>(INITIAL_VEHICLES);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);

  // Grid Controls & Filtering State
  const [gridMatrix, setGridMatrix] = useState<"4" | "9" | "16" | "24" | "CINEMA">("4");
  const [cinemaCamId, setCinemaCamId] = useState<string>("CAM-01");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lightingFilter, setLightingFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");

  // Modals and Active Sub-Panels
  const [editingFenceCamera, setEditingFenceCamera] = useState<Camera | null>(null);
  const [forensicAlert, setForensicAlert] = useState<AlertEvent | null>(null);
  const [showJudgeTour, setShowJudgeTour] = useState<boolean>(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [showAddCameraModal, setShowAddCameraModal] = useState<boolean>(false);
  const [showSitrepModal, setShowSitrepModal] = useState<boolean>(false);
  const [maximizedCamera, setMaximizedCamera] = useState<Camera | null>(null);
  const [inspectingCamera, setInspectingCamera] = useState<Camera | null>(null);

  // Banner Notification for newest critical event
  const [activeBannerAlert, setActiveBannerAlert] = useState<AlertEvent | null>(null);

  // Trigger audio chime when critical alert is spawned
  const playAlertSound = useCallback(() => {
    if (soundMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [soundMuted]);

  // Handler: When a camera's AI detection logic triggers a new alert
  const handleTriggerAlert = useCallback(
    (newAlert: AlertEvent) => {
      setAlerts((prev) => {
        const exists = prev.some(
          (a) => a.cameraId === newAlert.cameraId && a.trackId === newAlert.trackId && a.status === "ACTIVE"
        );
        if (exists) return prev;

        playAlertSound();
        setActiveBannerAlert(newAlert);
        return [newAlert, ...prev];
      });
    },
    [playAlertSound]
  );

  // Handler: Acknowledge alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, status: "ACKNOWLEDGED" as const } : a
      )
    );
    if (activeBannerAlert?.id === alertId) {
      setActiveBannerAlert(null);
    }
  };

  // Handler: Dispatch Quick Reaction Team (QRT)
  const handleDispatchQRT = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: "QRT_DISPATCHED" as const,
            qrtStatus: {
              dispatched: true,
              dispatchedAt: new Date().toISOString(),
              teamCode: "QRT-BRAVO-4 (Armed Sector Intercept)",
              etaMinutes: 3.5,
              commander: "Sub-Inspector V. K. Rawat",
            },
          };
        }
        return a;
      })
    );
  };

  // Handler: Save customized virtual fence to camera
  const handleSaveVirtualFence = (cameraFences: VirtualFence[]) => {
    if (!editingFenceCamera) return;
    setCameras((prev) =>
      prev.map((c) =>
        c.id === editingFenceCamera.id ? { ...c, virtualFences: cameraFences } : c
      )
    );
    setEditingFenceCamera(null);
  };

  // Handler: Update lighting environment
  const handleUpdateLighting = (cameraId: string, env: LightingEnvironment) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === cameraId ? { ...c, lightingEnvironment: env } : c))
    );
    if (inspectingCamera && inspectingCamera.id === cameraId) {
      setInspectingCamera((prev) => (prev ? { ...prev, lightingEnvironment: env } : null));
    }
  };

  // Handler: Add new vehicle to ANPR Watchlist
  const handleAddWatchlistPlate = (plate: string, reason: string) => {
    const newRecord: VehiclePlateRecord = {
      id: `VEH-${Date.now().toString().slice(-4)}`,
      cameraId: "CAM-03",
      cameraName: "CAM-03: Indo-Nepal Checkpost 14",
      plateNumber: plate,
      vehicleType: "JEEP_4X4",
      ocrConfidence: 0.985,
      watchlistStatus: "WANTED_RED_NOTICE",
      speedKmh: 42,
      timestamp: new Date().toISOString(),
      notes: reason,
    };
    setVehicles((prev) => [newRecord, ...prev]);

    const newAlert: AlertEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      cameraId: "CAM-03",
      cameraName: "CAM-03: Indo-Nepal Checkpost 14",
      timestamp: new Date().toISOString(),
      eventType: "ANPR_WATCHLIST_HIT",
      severity: "CRITICAL",
      confidence: 0.985,
      objectType: "VEHICLE",
      trackId: "VEH-MATCH",
      sector: "Sector-04 Indo-Nepal Border",
      status: "ACTIVE",
      coordinates: { x: 0.45, y: 0.65 },
      snapshotUrl:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
      details: {
        reason: `CRITICAL WATCHLIST HIT: Plate ${plate} detected at Checkpost 14 Gate. ${reason}`,
        explainableEvidence: `PaddleOCR matched plate string ${plate} against Central SSB Red Notice DB with 98.5% confidence score.`,
        plateNumber: plate,
      },
    };
    handleTriggerAlert(newAlert);
  };

  // Handler: Register new camera stream
  const handleAddCamera = (newCamPartial: Partial<Camera>) => {
    const nextIdx = cameras.length + 1;
    const formattedId = `CAM-${String(nextIdx).padStart(2, "0")}`;
    const newCam: Camera = {
      id: formattedId,
      name: newCamPartial.name || `${formattedId}: Border Forward Post`,
      properName: newCamPartial.properName || newCamPartial.name || `BOP Sentry Unit - Station ${nextIdx}`,
      sector: newCamPartial.sector || "Sector-04 Indo-Nepal (Bihar)",
      location: newCamPartial.location || "Border Forward Post",
      streamUrl: newCamPartial.streamUrl || `rtsp://10.42.10.${100 + nextIdx}:554/live/stream1`,
      streamType: newCamPartial.streamType || "RTSP",
      mode: newCamPartial.mode || "STANDARD",
      lightingEnvironment: newCamPartial.lightingEnvironment || "DAY_BRIGHT",
      status: "ONLINE",
      fps: 25.0,
      resolution: "1920x1080 @ 25fps",
      bitrate: "4.0 Mbps",
      coordinates: newCamPartial.coordinates || { lat: 26.401, lng: 87.278 },
      virtualFences: [],
    };
    setCameras((prev) => [...prev, newCam]);
  };

  // Handler: Judge Step Selection
  const handleSelectJudgeStep = (stepNumber: number) => {
    if (stepNumber === 1 || stepNumber === 2 || stepNumber === 3 || stepNumber === 6) {
      setActiveTab("grid");
    } else if (stepNumber === 4 || stepNumber === 7) {
      setActiveTab("alerts");
    } else if (stepNumber === 5) {
      setActiveTab("anpr");
    } else if (stepNumber === 8) {
      setActiveTab("metrics");
    }
  };

  // Unique list of sectors for filter
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    cameras.forEach((c) => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set);
  }, [cameras]);

  // Filtered cameras based on Search, Lighting Environment, and Sector
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      // Query filter (searches ID, properName, name, outpostCode, sector, streamUrl)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          cam.id.toLowerCase().includes(q) ||
          cam.name.toLowerCase().includes(q) ||
          (cam.properName && cam.properName.toLowerCase().includes(q)) ||
          (cam.outpostCode && cam.outpostCode.toLowerCase().includes(q)) ||
          cam.sector.toLowerCase().includes(q) ||
          cam.streamUrl.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Sector filter
      if (sectorFilter !== "ALL" && cam.sector !== sectorFilter) {
        return false;
      }

      // Lighting Environment filter
      if (lightingFilter !== "ALL") {
        if (lightingFilter === "DAY" && !(cam.lightingEnvironment === "DAY_BRIGHT" || cam.lightingEnvironment === "DAY_OVERCAST" || cam.lightingEnvironment === "DUSK_GOLDEN")) {
          return false;
        }
        if (lightingFilter === "NIGHT" && !(cam.lightingEnvironment === "NIGHT_IR" || cam.lightingEnvironment === "NIGHT_VISION_GREEN")) {
          return false;
        }
        if (lightingFilter === "THERMAL" && !(cam.lightingEnvironment === "THERMAL_WHITE_HOT" || cam.lightingEnvironment === "THERMAL_IRONBOW")) {
          return false;
        }
        if (lightingFilter === "ANPR" && cam.mode !== "ANPR_CHECKPOST") {
          return false;
        }
        if (lightingFilter === "PRECIP" && !(cam.lightingEnvironment === "RAIN_MONSOON" || cam.lightingEnvironment === "FOG_VALLEY")) {
          return false;
        }
      }

      return true;
    });
  }, [cameras, searchQuery, sectorFilter, lightingFilter]);

  // Visible cameras tailored to chosen Matrix Grid size
  const displayedCameras = useMemo(() => {
    if (gridMatrix === "4") return filteredCameras.slice(0, 4);
    if (gridMatrix === "9") return filteredCameras.slice(0, 9);
    if (gridMatrix === "16") return filteredCameras.slice(0, 16);
    if (gridMatrix === "CINEMA") {
      const selected = cameras.find((c) => c.id === cinemaCamId) || filteredCameras[0] || cameras[0];
      return [selected];
    }
    return filteredCameras; // '24' or ALL
  }, [filteredCameras, gridMatrix, cinemaCamId, cameras]);

  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Tactical Top Command Header */}
      <TacticalHeader
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "blueprint") {
            setShowBlueprintModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        activeAlerts={alerts}
        activeAlertsCount={activeAlertsCount}
        defconLevel={defconLevel}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
        onOpenJudgeTour={() => setShowJudgeTour(true)}
        onOpenBlueprint={() => setShowBlueprintModal(true)}
        onOpenSitrep={() => setShowSitrepModal(true)}
        onOpenAddCamera={() => setShowAddCameraModal(true)}
      />

      {/* Real-Time Critical Ingress Alert Ticker Banner */}
      {activeBannerAlert && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2 flex items-center justify-between shadow-lg animate-pulse border-b border-red-400/40 z-20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs">
              <span className="font-mono font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded mr-2">
                CRITICAL INTRUSION DETECTED
              </span>
              <span className="font-semibold">{activeBannerAlert.cameraName}: </span>
              <span className="font-mono text-red-100">{activeBannerAlert.details.reason}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("alerts");
                setForensicAlert(activeBannerAlert);
              }}
              className="px-3 py-1 rounded bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Investigate Forensic Dossier</span>
            </button>
            <button
              onClick={() => handleAcknowledgeAlert(activeBannerAlert.id)}
              className="p-1 rounded bg-red-800/80 hover:bg-red-900 text-white text-xs"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: Video Analytics Grid Matrix */}
        {activeTab === "grid" && (
          <div className="flex-1 p-3 sm:p-4 bg-slate-950 overflow-y-auto flex flex-col gap-3">
            
            {/* Grid Controls & Environmental Filters Bar */}
            <div className="flex flex-col gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Left: Stream Count & Matrix Selector */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
                      LIVE MATRIX · {cameras.length} CHANNELS ONLINE
                    </span>
                  </div>

                  {/* Matrix Layout Buttons */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setGridMatrix("4")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-mono transition ${
                        gridMatrix === "4" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title="2x2 View (4 Feeds)"
                    >
                      <Grid className="w-3 h-3" />
                      <span>2x2</span>
                    </button>
                    <button
                      onClick={() => setGridMatrix("9")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-mono transition ${
                        gridMatrix === "9" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title="3x3 View (9 Feeds)"
                    >
                      <Grid3X3 className="w-3 h-3" />
                      <span>3x3</span>
                    </button>
                    <button
                      onClick={() => setGridMatrix("16")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-mono transition ${
                        gridMatrix === "16" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title="4x4 View (16 Feeds)"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span>4x4</span>
                    </button>
                    <button
                      onClick={() => setGridMatrix("24")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-mono transition ${
                        gridMatrix === "24" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title="All 24 Feeds Grid"
                    >
                      <Layers className="w-3 h-3" />
                      <span>All 24</span>
                    </button>
                    <button
                      onClick={() => setGridMatrix("CINEMA")}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 font-mono transition ${
                        gridMatrix === "CINEMA" ? "bg-purple-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                      title="Cinema Focus Single Feed"
                    >
                      <Tv className="w-3 h-3" />
                      <span>Cinema</span>
                    </button>
                  </div>
                </div>

                {/* Right: Search & Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Instant Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search outpost, proper name, plate, sector..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-64"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Audio Siren Toggle */}
                  <button
                    onClick={() => setSoundMuted(!soundMuted)}
                    className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition ${
                      soundMuted
                        ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        : "bg-amber-950 border-amber-800 text-amber-300"
                    }`}
                    title={soundMuted ? "Audio Siren Muted (Click to Unmute)" : "Audio Siren Active"}
                  >
                    {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{soundMuted ? "Muted" : "Siren On"}</span>
                  </button>

                  {/* Register New RTSP Stream */}
                  <button
                    onClick={() => setShowAddCameraModal(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add Camera</span>
                  </button>
                </div>
              </div>

              {/* Environmental Condition Filters & Sector Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
                
                {/* Lighting Environment Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3" />
                    ENVIRONMENT:
                  </span>
                  
                  <button
                    onClick={() => setLightingFilter("ALL")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition ${
                      lightingFilter === "ALL"
                        ? "bg-slate-700 text-white font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({cameras.length})
                  </button>

                  <button
                    onClick={() => setLightingFilter("DAY")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 transition ${
                      lightingFilter === "DAY"
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-slate-950 text-amber-400 hover:bg-slate-800"
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Day Bright</span>
                  </button>

                  <button
                    onClick={() => setLightingFilter("NIGHT")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 transition ${
                      lightingFilter === "NIGHT"
                        ? "bg-teal-600 text-white font-bold"
                        : "bg-slate-950 text-teal-400 hover:bg-slate-800"
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Night IR / NVG</span>
                  </button>

                  <button
                    onClick={() => setLightingFilter("THERMAL")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 transition ${
                      lightingFilter === "THERMAL"
                        ? "bg-rose-600 text-white font-bold"
                        : "bg-slate-950 text-rose-400 hover:bg-slate-800"
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Thermal FLIR</span>
                  </button>

                  <button
                    onClick={() => setLightingFilter("PRECIP")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 transition ${
                      lightingFilter === "PRECIP"
                        ? "bg-cyan-600 text-white font-bold"
                        : "bg-slate-950 text-cyan-400 hover:bg-slate-800"
                    }`}
                  >
                    <CloudRain className="w-3 h-3" />
                    <span>Monsoon / Fog</span>
                  </button>

                  <button
                    onClick={() => setLightingFilter("ANPR")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono flex items-center gap-1 transition ${
                      lightingFilter === "ANPR"
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-slate-950 text-amber-400 hover:bg-slate-800"
                    }`}
                  >
                    <Car className="w-3 h-3" />
                    <span>ANPR ICPs</span>
                  </button>
                </div>

                {/* Sector Selector Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-500 uppercase">SECTOR:</span>
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Border Sectors ({cameras.length})</option>
                    {sectorsList.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Cinema Feed Selector Ribbon (if Cinema Mode is Active) */}
            {gridMatrix === "CINEMA" && (
              <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase shrink-0 px-2">
                  CINEMA STREAM:
                </span>
                {filteredCameras.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setCinemaCamId(cam.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 flex items-center gap-2 border transition ${
                      cinemaCamId === cam.id
                        ? "bg-purple-600 text-white border-purple-400 shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-bold">{cam.id}</span>
                    <span className="truncate max-w-[120px]">{cam.properName || cam.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Camera Tiles Grid Matrix */}
            <div
              className={`flex-1 grid gap-3.5 ${
                gridMatrix === "CINEMA"
                  ? "grid-cols-1"
                  : gridMatrix === "4"
                  ? "grid-cols-1 md:grid-cols-2"
                  : gridMatrix === "9"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : gridMatrix === "16"
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
              }`}
            >
              {displayedCameras.map((camera) => (
                <CameraTile
                  key={camera.id}
                  camera={camera}
                  onTriggerAlert={handleTriggerAlert}
                  onVehicleDetected={(rec) => setVehicles((prev) => [rec, ...prev])}
                  onOpenForensicModal={(alert) => {
                    setActiveTab("alerts");
                    setForensicAlert(alert);
                  }}
                  onEditFence={(cam) => setEditingFenceCamera(cam)}
                  onMaximize={(cam) => setMaximizedCamera(cam)}
                  onInspect={(cam) => setInspectingCamera(cam)}
                />
              ))}
            </div>

            {displayedCameras.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-center">
                <Search className="w-10 h-10 text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No Surveillance Streams Match Filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Try clearing your search query "{searchQuery}" or adjusting the lighting/sector filter pills above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLightingFilter("ALL");
                    setSectorFilter("ALL");
                  }}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: Security Incidents & Evidence Locker */}
        {activeTab === "alerts" && (
          <AlertsLocker
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onDispatchQRT={handleDispatchQRT}
            onOpenForensicModal={(alert) => setForensicAlert(alert)}
          />
        )}

        {/* VIEW 3: ANPR Vehicle Watchlist Logbook */}
        {activeTab === "anpr" && (
          <ANPRLogbook
            vehicles={vehicles}
            onAddWatchlistPlate={handleAddWatchlistPlate}
          />
        )}

        {/* VIEW 4: Edge Hardware Performance & Benchmarks */}
        {activeTab === "metrics" && (
          <SystemPerformancePanel
            metrics={metrics}
            onUpdateTargetFps={(fps) =>
              setMetrics((prev) => ({
                ...prev,
                targetInferenceFps: fps,
                pipelineFps: Number((fps - 0.2).toFixed(1)),
              }))
            }
          />
        )}
      </main>

      {/* Maximized Camera Modal (Single Feed Zoom) */}
      {maximizedCamera && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 mr-2 border border-blue-800">
                  {maximizedCamera.id}
                </span>
                <span className="text-sm font-bold text-white font-sans">
                  {maximizedCamera.properName || maximizedCamera.name}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-2">
                  [{maximizedCamera.sector}]
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInspectingCamera(maximizedCamera)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-semibold"
              >
                Inspect Specs & Lighting
              </button>
              <button
                onClick={() => setMaximizedCamera(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 mt-2">
            <CameraTile
              camera={maximizedCamera}
              onTriggerAlert={handleTriggerAlert}
              onVehicleDetected={(rec) => setVehicles((prev) => [rec, ...prev])}
              onOpenForensicModal={(alert) => {
                setMaximizedCamera(null);
                setActiveTab("alerts");
                setForensicAlert(alert);
              }}
              onEditFence={(cam) => setEditingFenceCamera(cam)}
              onMaximize={() => setMaximizedCamera(null)}
              onInspect={(cam) => setInspectingCamera(cam)}
            />
          </div>
        </div>
      )}

      {/* Camera Tactical Detail & Lighting Inspector Modal */}
      {inspectingCamera && (
        <CameraInspectorModal
          camera={inspectingCamera}
          onClose={() => setInspectingCamera(null)}
          onMaximize={(cam) => {
            setInspectingCamera(null);
            setMaximizedCamera(cam);
          }}
          onEditFence={(cam) => {
            setInspectingCamera(null);
            setEditingFenceCamera(cam);
          }}
          onTriggerAlert={handleTriggerAlert}
          onVehicleDetected={(rec) => setVehicles((prev) => [rec, ...prev])}
          onUpdateLighting={handleUpdateLighting}
        />
      )}

      {/* Virtual Fence Editor Modal */}
      {editingFenceCamera && (
        <VirtualFenceEditor
          camera={editingFenceCamera}
          onClose={() => setEditingFenceCamera(null)}
          onSaveFence={handleSaveVirtualFence}
        />
      )}

      {/* Gemini AI Forensics Intelligence Modal */}
      {forensicAlert && (
        <GeminiForensicsModal
          alert={forensicAlert}
          onClose={() => setForensicAlert(null)}
        />
      )}

      {/* Judge Demo Walkthrough Guide */}
      {showJudgeTour && (
        <JudgeDemoWalkthrough
          onClose={() => setShowJudgeTour(false)}
          onSelectStep={handleSelectJudgeStep}
        />
      )}

      {/* System Architecture & Blueprint Viewer */}
      {showBlueprintModal && (
        <ArchitectureBlueprintModal onClose={() => setShowBlueprintModal(false)} />
      )}

      {/* Register New Camera Stream Modal */}
      {showAddCameraModal && (
        <AddCameraModal
          onClose={() => setShowAddCameraModal(false)}
          onAddCamera={handleAddCamera}
        />
      )}

      {/* Gemini SITREP Sector Briefing Modal */}
      {showSitrepModal && (
        <SitrepHolderModal
          onClose={() => setShowSitrepModal(false)}
          camerasCount={cameras.length}
          activeAlertsCount={activeAlertsCount}
          vehiclesCount={vehicles.length}
        />
      )}
    </div>
  );
};

export default App;
