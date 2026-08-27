import React, { useState, useEffect } from "react";
import {
  Shield,
  Radio,
  Bell,
  Volume2,
  VolumeX,
  PlayCircle,
  FileCode,
  Sparkles,
  Plus,
  Grid,
  Maximize2,
  List,
  Car,
  Activity,
  Layers,
} from "lucide-react";
import { AlertEvent } from "../types";

interface TacticalHeaderProps {
  activeAlerts?: AlertEvent[];
  activeAlertsCount?: number;
  activeTab: "grid" | "alerts" | "anpr" | "metrics" | "blueprint";
  setActiveTab?: (tab: "grid" | "alerts" | "anpr" | "metrics" | "blueprint") => void;
  onTabChange?: (tab: "grid" | "alerts" | "anpr" | "metrics" | "blueprint") => void;
  audioMuted?: boolean;
  soundMuted?: boolean;
  setAudioMuted?: (muted: boolean) => void;
  setSoundMuted?: (muted: boolean) => void;
  onLaunchJudgeTour?: () => void;
  onOpenJudgeTour?: () => void;
  onOpenSitrepHolder?: () => void;
  onOpenSitrep?: () => void;
  onOpenAddCamera?: () => void;
  onOpenBlueprint?: () => void;
  defconLevel?: 1 | 2 | 3 | 4 | 5;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  activeAlerts = [],
  activeAlertsCount,
  activeTab,
  setActiveTab,
  onTabChange,
  audioMuted = true,
  soundMuted,
  setAudioMuted,
  setSoundMuted,
  onLaunchJudgeTour,
  onOpenJudgeTour,
  onOpenSitrepHolder,
  onOpenSitrep,
  onOpenAddCamera,
  onOpenBlueprint,
  defconLevel = 2,
}) => {
  const [time, setTime] = useState({
    ist: "",
    utc: "",
  });

  const handleTabSelect = (tab: "grid" | "alerts" | "anpr" | "metrics" | "blueprint") => {
    if (onTabChange) onTabChange(tab);
    else if (setActiveTab) setActiveTab(tab);
  };

  const handleJudgeTour = onOpenJudgeTour || onLaunchJudgeTour || (() => {});
  const handleSitrep = onOpenSitrep || onOpenSitrepHolder || (() => {});
  const isMuted = soundMuted !== undefined ? soundMuted : audioMuted;
  const toggleMute = () => {
    if (setSoundMuted) setSoundMuted(!isMuted);
    else if (setAudioMuted) setAudioMuted(!isMuted);
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({
        ist: now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        utc: now.toISOString().slice(11, 19) + " UTC",
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount =
    activeAlertsCount !== undefined
      ? activeAlertsCount
      : (activeAlerts || []).filter(
          (a) => a.severity === "CRITICAL" && a.status === "ACTIVE"
        ).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner with MHA / SSB Identity */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>MHA / POLICE II DIVISION</span>
          </div>
          <span className="text-slate-500 font-mono">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">SASHASTRA SEEMA BAL (SSB)</span>
            <span className="text-slate-400 font-mono">— Sector-04 Central Command</span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
          <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-bold">DEFCON-2 / ELEVATED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">IST:</span>
            <span className="text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              {time.ist || "05:34:10"}
            </span>
            <span className="text-slate-500">({time.utc || "UTC"})</span>
          </div>
        </div>
      </div>

      {/* Main Command Navigation */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg border border-blue-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                SIH26187 — Intelligent Border Video Analytics Platform
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                v3.2 Edge AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Software-Defined CCTV Surveillance • YOLOv11 • ByteTrack • ANPR • Virtual Fence
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            id="tab-btn-grid"
            onClick={() => handleTabSelect("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "grid"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>4-Cam Grid</span>
          </button>

          <button
            id="tab-btn-alerts"
            onClick={() => handleTabSelect("alerts")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all relative ${
              activeTab === "alerts"
                ? "bg-rose-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts Vault</span>
            {criticalCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white animate-bounce">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-anpr"
            onClick={() => handleTabSelect("anpr")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "anpr"
                ? "bg-amber-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>ANPR Logbook</span>
          </button>

          <button
            id="tab-btn-metrics"
            onClick={() => handleTabSelect("metrics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "metrics"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Hardware FPS</span>
          </button>

          <button
            id="tab-btn-blueprint"
            onClick={() => {
              if (onOpenBlueprint) onOpenBlueprint();
              else handleTabSelect("blueprint");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === "blueprint"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>SIH Blueprint</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Alert Toggle */}
          <button
            id="audio-mute-toggle"
            onClick={toggleMute}
            title={isMuted ? "Unmute Alarm Siren" : "Mute Alarm Siren"}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              isMuted
                ? "bg-slate-800 border-slate-700 text-slate-400"
                : "bg-red-950/70 border-red-700/80 text-red-300 animate-pulse"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono">{isMuted ? "Muted" : "Siren ON"}</span>
          </button>

          {/* Gemini AI SITREP */}
          <button
            id="btn-gemini-sitrep"
            onClick={handleSitrep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-600 hover:to-indigo-600 border border-purple-400/40 text-xs font-semibold text-white shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>AI SITREP Brief</span>
          </button>

          {/* Judge Demo Walkthrough Trigger */}
          <button
            id="btn-judge-tour"
            onClick={handleJudgeTour}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-orange-950/40 border border-amber-300 transition transform active:scale-95"
          >
            <PlayCircle className="w-4 h-4 fill-slate-950 text-amber-200" />
            <span>Judge Demo Walkthrough</span>
          </button>

          {/* Register New Camera */}
          {onOpenAddCamera && (
            <button
              id="btn-add-camera"
              onClick={onOpenAddCamera}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
              title="Register New IP Camera / Stream"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
