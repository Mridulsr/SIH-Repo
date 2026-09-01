import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Camera,
  AlertEvent,
  VehiclePlateRecord,
  PersonRecord,
  SystemMetrics,
  VirtualFence,
  LightingEnvironment,
  UserProfile,
  NavigationTab,
  NightFilterMode,
} from "./types";
import {
  INITIAL_CAMERAS,
  INITIAL_ALERTS,
  INITIAL_VEHICLES,
  INITIAL_PEOPLE,
  INITIAL_METRICS,
  INITIAL_USER,
} from "./data/initialData";

// Navigation & Layout Components matching the image
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";

// Main View Pages matching Screens 2 to 6
import { DashboardOverview } from "./components/DashboardOverview";
import { LiveCameraView } from "./components/LiveCameraView";
import { EventsView } from "./components/EventsView";
import { VehicleDetectionView } from "./components/VehicleDetectionView";
import { AnalyticsView } from "./components/AnalyticsView";

// Additional Pages
import { PeopleDetectionView } from "./components/PeopleDetectionView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { ProfileView } from "./components/ProfileView";
import { HelpSupportView } from "./components/HelpSupportView";

// Core Modal Engines
import { VirtualFenceEditor } from "./components/VirtualFenceEditor";
import { GeminiForensicsModal } from "./components/GeminiForensicsModal";
import { ArchitectureBlueprintModal } from "./components/ArchitectureBlueprintModal";
import { AddCameraModal } from "./components/AddCameraModal";
import { SitrepHolderModal } from "./components/SitrepHolderModal";
import { CameraInspectorModal } from "./components/CameraInspectorModal";
import { JudgeDemoWalkthrough } from "./components/JudgeDemoWalkthrough";

// Icons
import {
  AlertTriangle,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  CheckCircle2,
  Radio,
  Eye,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";

export const App: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);

  // Main Navigation state ('dashboard' | 'live-cameras' | 'events' | 'alerts' | 'vehicles' | 'people' | 'analytics' | 'reports' | 'settings' | 'profile' | 'support' | 'blueprint')
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("CAM-01");
  const [globalFilterMode, setGlobalFilterMode] = useState<NightFilterMode>("NORMAL");

  // Core Surveillance Data State
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS);
  const [vehicles, setVehicles] = useState<VehiclePlateRecord[]>(INITIAL_VEHICLES);
  const [people, setPeople] = useState<PersonRecord[]>(INITIAL_PEOPLE);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);

  // Audio / Alarm system state
  const [soundMuted, setSoundMuted] = useState<boolean>(true);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);

  // Modals
  const [editingFenceCamera, setEditingFenceCamera] = useState<Camera | null>(null);
  const [forensicAlert, setForensicAlert] = useState<AlertEvent | null>(null);
  const [inspectingCamera, setInspectingCamera] = useState<Camera | null>(null);
  const [showAddCameraModal, setShowAddCameraModal] = useState<boolean>(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);
  const [showSitrepModal, setShowSitrepModal] = useState<boolean>(false);
  const [showJudgeTour, setShowJudgeTour] = useState<boolean>(false);

  // Banner notification for newest critical breach
  const [activeBannerAlert, setActiveBannerAlert] = useState<AlertEvent | null>(null);

  // Currently focused camera for spotlight player
  const selectedCamera = useMemo(() => {
    return cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  }, [cameras, selectedCameraId]);

  // Audio synthesizer for alarms
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

  // Trigger alert handler
  const handleTriggerAlert = useCallback(
    (newAlert: AlertEvent) => {
      setAlerts((prev) => {
        // Prevent duplicate active alerts from the same track and camera
        const isDuplicate = prev.some(
          (a) =>
            a.id === newAlert.id ||
            (a.cameraId === newAlert.cameraId &&
              a.trackId === newAlert.trackId &&
              a.status === "ACTIVE")
        );
        if (isDuplicate) return prev;

        const uniqueId =
          newAlert.id && !prev.some((a) => a.id === newAlert.id)
            ? newAlert.id
            : `ALT-${newAlert.cameraId || "SYS"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const alertToAdd: AlertEvent = {
          ...newAlert,
          id: uniqueId,
        };

        playAlertSound();
        setActiveBannerAlert(alertToAdd);
        return [alertToAdd, ...prev];
      });
    },
    [playAlertSound]
  );

  // Acknowledge alert
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

  // Dispatch Quick Reaction Team (QRT)
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

  // Save customized virtual fence
  const handleSaveVirtualFence = (cameraFences: VirtualFence[]) => {
    if (!editingFenceCamera) return;
    setCameras((prev) =>
      prev.map((c) =>
        c.id === editingFenceCamera.id ? { ...c, virtualFences: cameraFences } : c
      )
    );
    setEditingFenceCamera(null);
  };

  // Add Plate to ANPR Watchlist
  const handleAddWatchlistPlate = (plate: string, reason: string) => {
    const timestamp = Date.now();
    const salt = Math.random().toString(36).slice(2, 7);
    const newRecord: VehiclePlateRecord = {
      id: `VEH-CAM02-${timestamp}-${salt}`,
      cameraId: "CAM-02",
      cameraName: "CAM 02 - Parking",
      plateNumber: plate,
      vehicleType: "SUV",
      ocrConfidence: 0.985,
      watchlistStatus: "WANTED_RED_NOTICE",
      speedKmh: 38,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      notes: reason,
    };
    setVehicles((prev) => [newRecord, ...prev]);

    const newAlert: AlertEvent = {
      id: `EVT-ANPR-${timestamp}-${salt}`,
      cameraId: "CAM-02",
      cameraName: "CAM 02 - Parking",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      eventType: "ANPR_WATCHLIST_HIT",
      severity: "CRITICAL",
      confidence: 0.985,
      objectType: "VEHICLE",
      trackId: `VEH-MATCH-${salt}`,
      sector: "Sector-04 Indo-Nepal Border",
      status: "ACTIVE",
      coordinates: { x: 0.45, y: 0.65 },
      snapshotUrl:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
      details: {
        reason: `CRITICAL WATCHLIST HIT: Plate ${plate} detected at Parking gate. ${reason}`,
        explainableEvidence: `PaddleOCR matched plate string ${plate} against Red Notice DB with 98.5% confidence score.`,
        plateNumber: plate,
      },
    };
    handleTriggerAlert(newAlert);
  };

  // Register new camera
  const handleAddCamera = (newCamPartial: Partial<Camera>) => {
    const nextIdx = cameras.length + 1;
    const formattedId = `CAM-${String(nextIdx).padStart(2, "0")}`;
    const newCam: Camera = {
      id: formattedId,
      name: newCamPartial.name || `CAM ${String(nextIdx).padStart(2, "0")} - Forward Post`,
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        setSoundMuted((prev) => !prev);
      } else if (e.key === " " && activeBannerAlert) {
        e.preventDefault();
        handleAcknowledgeAlert(activeBannerAlert.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBannerAlert]);

  // If user is not authenticated, show LoginPage (Screen 1 in image)
  if (!isAuthenticated) {
    return (
      <LoginPage
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Calculate active alerts count
  const activeAlertsCount = alerts.filter((a) => a.status === "ACTIVE").length;

  return (
    <div className="flex h-screen w-full bg-[#0a0f1d] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 1. Sidebar Navigation (Matching design from image) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAlertsCount={activeAlertsCount}
        onlineCamerasCount={cameras.filter((c) => c.status === "ONLINE").length}
        currentUser={currentUser}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0a0f1d]">
        
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          subTitle={
            activeTab === "live-cameras"
              ? (selectedCamera?.name || selectedCamera?.id)
              : undefined
          }
          activeAlerts={alerts.filter((a) => a.status === "ACTIVE")}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onOpenGeminiForensics={(alert) => setForensicAlert(alert)}
          onAddCamera={() => setShowAddCameraModal(true)}
          onOpenBlueprint={() => setShowBlueprintModal(true)}
          onOpenTour={() => setShowJudgeTour(true)}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          isAlarmActive={alarmActive}
          onToggleAlarm={() => setAlarmActive(!alarmActive)}
          isMuted={soundMuted}
          onToggleMute={() => setSoundMuted(!soundMuted)}
          onLogout={() => setIsAuthenticated(false)}
        />

        {/* Global Active Breach Banner (If active breach is triggered) */}
        {activeBannerAlert && (
          <div className="bg-red-950/90 border-b border-red-500/50 px-6 py-2.5 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-bold text-red-300 font-mono flex items-center gap-2">
                  <span>CRITICAL BREACH DETECTED: {activeBannerAlert.cameraName}</span>
                  <span className="px-2 py-0.5 rounded bg-red-500 text-[10px] text-white">IMMEDIATE SENTRY ACTION REQUIRED</span>
                </div>
                <div className="text-[11px] text-red-200/80 mt-0.5">
                  {activeBannerAlert.details?.reason || "Virtual tripwire boundary crossed by unverified entity."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setForensicAlert(activeBannerAlert)}
                className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-red-200 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Forensics</span>
              </button>
              <button
                onClick={() => handleAcknowledgeAlert(activeBannerAlert.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono cursor-pointer"
              >
                Acknowledge (Space)
              </button>
              <button
                onClick={() => setActiveBannerAlert(null)}
                className="p-1 rounded text-red-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {/* SCREEN 2: Dashboard Overview */}
          {activeTab === "dashboard" && (
            <DashboardOverview
              cameras={cameras}
              alerts={alerts}
              onSelectTab={setActiveTab}
              onSelectCamera={(cam) => setSelectedCameraId(cam.id)}
              onInspectCamera={(cam) => setInspectingCamera(cam)}
              onOpenVirtualFence={(cam) => setEditingFenceCamera(cam)}
              onTriggerAlert={handleTriggerAlert}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onOpenGeminiForensics={(alert) => setForensicAlert(alert)}
              isAudioMuted={soundMuted}
              filterMode={globalFilterMode}
            />
          )}

          {/* SCREEN 3: Live Cameras Spotlight & Detections */}
          {activeTab === "live-cameras" && (
            <LiveCameraView
              selectedCamera={selectedCamera}
              allCameras={cameras}
              onSelectCamera={(cam) => setSelectedCameraId(cam.id)}
              onTriggerAlert={handleTriggerAlert}
              onOpenVirtualFence={(cam) => setEditingFenceCamera(cam)}
              onInspectCamera={(cam) => setInspectingCamera(cam)}
              onOpenGeminiForensics={(alert) => setForensicAlert(alert)}
              isAudioMuted={soundMuted}
              filterMode={globalFilterMode}
              onSetFilterMode={setGlobalFilterMode}
            />
          )}

          {/* SCREEN 4: Events Table View */}
          {(activeTab === "events" || activeTab === "alerts") && (
            <EventsView
              events={alerts}
              cameras={cameras}
              onOpenGeminiForensics={(alert) => setForensicAlert(alert)}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {/* SCREEN 5: Vehicle Detection & ANPR View */}
          {activeTab === "vehicles" && (
            <VehicleDetectionView
              vehicles={vehicles}
              cameras={cameras}
              onAddWatchlistPlate={handleAddWatchlistPlate}
            />
          )}

          {/* SCREEN 6: Analytics View */}
          {activeTab === "analytics" && (
            <AnalyticsView cameras={cameras} />
          )}

          {/* People Tracker View */}
          {activeTab === "people" && (
            <PeopleDetectionView people={people} cameras={cameras} />
          )}

          {/* Reports View */}
          {activeTab === "reports" && (
            <ReportsView
              alerts={alerts}
              vehicles={vehicles}
              cameras={cameras}
              onOpenSITREP={() => setShowSitrepModal(true)}
            />
          )}

          {/* Settings View */}
          {activeTab === "settings" && (
            <SettingsView />
          )}

          {/* Profile View */}
          {activeTab === "profile" && (
            <ProfileView
              currentUser={currentUser}
              onUpdateProfile={(u) => setCurrentUser(u)}
            />
          )}

          {/* Help & Support View */}
          {activeTab === "support" && (
            <HelpSupportView />
          )}

          {/* Architecture Blueprint View */}
          {activeTab === "blueprint" && (
            <div className="p-4">
              <button
                onClick={() => setShowBlueprintModal(true)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs font-mono mb-4 cursor-pointer"
              >
                Open Architecture Blueprint Modal
              </button>
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 text-xs text-slate-300 font-mono">
                System Diagram: Edge Device &rarr; YOLOv11 TensorRT &rarr; ANPR PaddleOCR &rarr; Virtual Fence Engine &rarr; Gemini Multimodal AI &rarr; Sentry Dispatch
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODALS AND FLYOUTS */}
      {/* ========================================================================= */}

      {/* Virtual Fence Editor Modal */}
      {editingFenceCamera && (
        <VirtualFenceEditor
          camera={editingFenceCamera}
          onSave={handleSaveVirtualFence}
          onClose={() => setEditingFenceCamera(null)}
        />
      )}

      {/* Gemini AI Multimodal Forensic Investigation Modal */}
      {forensicAlert && (
        <GeminiForensicsModal
          alert={forensicAlert}
          camera={cameras.find((c) => c.id === forensicAlert.cameraId) || cameras[0]}
          onClose={() => setForensicAlert(null)}
          onDispatchQRT={handleDispatchQRT}
        />
      )}

      {/* Architecture Blueprint Modal */}
      {showBlueprintModal && (
        <ArchitectureBlueprintModal onClose={() => setShowBlueprintModal(false)} />
      )}

      {/* Register New RTSP Stream Modal */}
      {showAddCameraModal && (
        <AddCameraModal
          onAddCamera={handleAddCamera}
          onClose={() => setShowAddCameraModal(false)}
        />
      )}

      {/* Tactical AI SITREP Generator Modal */}
      {showSitrepModal && (
        <SitrepHolderModal
          alerts={alerts}
          cameras={cameras}
          onClose={() => setShowSitrepModal(false)}
        />
      )}

      {/* Camera Inspector & Diagnostics Modal */}
      {inspectingCamera && (
        <CameraInspectorModal
          camera={inspectingCamera}
          onClose={() => setInspectingCamera(null)}
          onUpdateLighting={(env) => {
            setCameras((prev) =>
              prev.map((c) =>
                c.id === inspectingCamera.id ? { ...c, lightingEnvironment: env } : c
              )
            );
            setInspectingCamera((prev) =>
              prev ? { ...prev, lightingEnvironment: env } : null
            );
          }}
        />
      )}

      {/* Judge & Evaluator Guided Demo Walkthrough Modal */}
      {showJudgeTour && (
        <JudgeDemoWalkthrough
          onClose={() => setShowJudgeTour(false)}
          onSelectStep={(step) => {
            if (step === 1 || step === 2) setActiveTab("dashboard");
            else if (step === 3) setActiveTab("live-cameras");
            else if (step === 4) setActiveTab("events");
            else if (step === 5) setActiveTab("vehicles");
            else if (step === 6) setActiveTab("analytics");
          }}
        />
      )}
    </div>
  );
};
export default App;
