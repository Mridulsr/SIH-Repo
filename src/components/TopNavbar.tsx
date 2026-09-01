import React, { useState } from "react";
import {
  Bell,
  Search,
  Volume2,
  VolumeX,
  Plus,
  FileSpreadsheet,
  Cpu,
  ChevronDown,
  Shield,
  User,
  LogOut,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { NavigationTab, UserProfile, AlertEvent } from "../types";

interface TopNavbarProps {
  activeTab: NavigationTab;
  breadcrumbSub?: string;
  currentUser: UserProfile;
  activeAlerts: AlertEvent[];
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onOpenAddCamera: () => void;
  onOpenSITREP: () => void;
  onOpenBlueprint: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  breadcrumbSub,
  currentUser,
  activeAlerts,
  isAudioMuted,
  onToggleAudio,
  onOpenAddCamera,
  onOpenSITREP,
  onOpenBlueprint,
  onSelectTab,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "live-cameras":
        return breadcrumbSub ? `Live Cameras / ${breadcrumbSub}` : "Live Cameras";
      case "events":
        return "Events";
      case "alerts":
        return "Alerts Management";
      case "vehicles":
        return "Vehicles (ANPR OCR)";
      case "people":
        return "People & Pedestrian Tracking";
      case "analytics":
        return "Analytics & Insights";
      case "reports":
        return "Intelligence Reports";
      case "settings":
        return "System Settings";
      case "profile":
        return "Admin Profile & Credentials";
      case "support":
        return "Help & Documentation";
      case "blueprint":
        return "System Architecture Blueprint";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-20 font-sans">
      
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <span>{getPageTitle()}</span>
        </h1>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>YOLOv11x • ByteTrack 25 FPS</span>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cameras, plates, events..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Audio alarm siren toggle */}
        <button
          onClick={onToggleAudio}
          title={isAudioMuted ? "Unmute Intrusion Siren" : "Mute Intrusion Siren"}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isAudioMuted
              ? "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
              : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 animate-pulse"
          }`}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Quick Add Camera */}
        <button
          onClick={onOpenAddCamera}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Camera</span>
        </button>

        {/* AI SITREP Generator */}
        <button
          onClick={onOpenSITREP}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI SITREP</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Active Alerts ({activeAlerts.length})
                </span>
                <button
                  onClick={() => {
                    onSelectTab("alerts");
                    setNotificationDropdownOpen(false);
                  }}
                  className="text-[11px] text-emerald-400 hover:underline font-mono"
                >
                  View All
                </button>
              </div>

              <div className="mt-2 max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {activeAlerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                    All sectors secure. No active breaches.
                  </div>
                ) : (
                  activeAlerts.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        onSelectTab("events");
                        setNotificationDropdownOpen(false);
                      }}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-red-400">{a.cameraName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{a.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                        {a.details?.reason || "Intrusion detected"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu (Matching Admin / admin@sih.com in screenshot) */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
          >
            <img
              src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={currentUser?.name || "Admin"}
              className="w-6 h-6 rounded-full object-cover border border-emerald-500/40"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 leading-tight">Admin</div>
              <div className="text-[10px] font-mono text-slate-400 leading-tight truncate max-w-[100px]">
                {currentUser?.email || "admin@sih.com"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-xs font-bold text-white">{currentUser?.name || "Command Administrator"}</div>
                <div className="text-[11px] font-mono text-emerald-400 truncate">{currentUser?.email || "admin@sih.com"}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{currentUser?.role || "System Administrator"}</div>
              </div>

              <button
                onClick={() => {
                  onSelectTab("profile");
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Permissions</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab("settings");
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>System Preferences</span>
              </button>

              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
