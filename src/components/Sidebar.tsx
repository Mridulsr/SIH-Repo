import React from "react";
import {
  LayoutDashboard,
  Video,
  AlertOctagon,
  Bell,
  Car,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Shield,
  HelpCircle,
  Cpu,
  User,
  Radio
} from "lucide-react";
import { NavigationTab, UserProfile } from "../types";

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeAlertsCount: number;
  totalCamerasCount: number;
  onLogout: () => void;
  currentUser: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertsCount,
  totalCamerasCount,
  onLogout,
  currentUser,
}) => {
  const mainNavItems = [
    {
      id: "dashboard" as NavigationTab,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "live-cameras" as NavigationTab,
      label: "Live Cameras",
      icon: Video,
      badge: `${totalCamerasCount}`,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "events" as NavigationTab,
      label: "Events",
      icon: AlertOctagon,
    },
    {
      id: "alerts" as NavigationTab,
      label: "Alerts",
      icon: Bell,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : undefined,
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
    },
    {
      id: "vehicles" as NavigationTab,
      label: "Vehicles",
      icon: Car,
    },
    {
      id: "people" as NavigationTab,
      label: "People",
      icon: Users,
    },
    {
      id: "analytics" as NavigationTab,
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "reports" as NavigationTab,
      label: "Reports",
      icon: FileText,
    },
    {
      id: "settings" as NavigationTab,
      label: "Settings",
      icon: Settings,
    },
  ];

  const secondaryItems = [
    {
      id: "profile" as NavigationTab,
      label: "Profile",
      icon: User,
    },
    {
      id: "support" as NavigationTab,
      label: "Help & Docs",
      icon: HelpCircle,
    },
    {
      id: "blueprint" as NavigationTab,
      label: "System Architecture",
      icon: Cpu,
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col h-screen shrink-0 select-none z-30 font-sans">
      {/* Brand Header (Matching exact "SIH SYSTEM" logo from screenshot) */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <div 
          onClick={() => onSelectTab("dashboard")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 tracking-wider flex items-center gap-1.5">
              <span>SIH SYSTEM</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              INTELLIGENT CCTV
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Core Operations
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-200"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-full border ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950 border-slate-950/30"
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Secondary / Admin tools */}
        <div className="pt-4 pb-1.5 px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Administration
        </div>

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User profile footer & Logout (Matching bottom of screenshot) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        <div 
          onClick={() => onSelectTab("profile")}
          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
        >
          <img
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={currentUser?.name || "Admin"}
            className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
          />
          <div className="overflow-hidden flex-1">
            <div className="text-xs font-medium text-slate-200 truncate">{currentUser?.name || "Admin"}</div>
            <div className="text-[10px] font-mono text-emerald-400 truncate">{currentUser?.email || "admin@sih.com"}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
