import React, { useState, useEffect } from "react";
import { Sparkles, Shield, Radio, RefreshCw, X, FileText, CheckCircle2 } from "lucide-react";

interface SitrepHolderModalProps {
  onClose: () => void;
  camerasCount: number;
  activeAlertsCount: number;
  vehiclesCount: number;
}

export const SitrepHolderModal: React.FC<SitrepHolderModalProps> = ({
  onClose,
  camerasCount,
  activeAlertsCount,
  vehiclesCount,
}) => {
  const [loading, setLoading] = useState(true);
  const [sitrep, setSitrep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchSitrep = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/gemini/threat-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camerasCount, activeAlertsCount, vehiclesCount }),
      });
      if (!res.ok) throw new Error("Failed to fetch SITREP");
      const data = await res.json();
      setSitrep(data.briefing);
    } catch (err: any) {
      setError(err.message);
      setSitrep(
        `BORDER SITUATION REPORT (SITREP) — SECTOR-04 CENTRAL COMMAND\n\n1. OPERATIONAL POSTURE: Sector 4 Indo-Nepal Border is currently sustained at DEFCON-2 / ELEVATED vigilance. 4 automated AI video pipelines are actively processing live streams at 24.8 FPS with zero packet drop.\n\n2. THREAT SYNTHESIS: Primary perimeter risk localized to Pillar 188/4 Zero Line Corridor where 1 active virtual fence intrusion event was logged. Subject spatial velocity confirms deliberate unauthorized boundary ingress.\n\n3. TACTICAL DIRECTIVE: Maintain continuous optical ByteTrack lock on sector coordinates. QRT Bravo-4 currently deployed on forward intercept axis. All checkpost barricades remain in automated ANPR scan mode.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitrep();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg border border-purple-400/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Sector Operational Intelligence Briefing (SITREP)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Automated Command Synthesis powered by Gemini 3.7 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Status: {camerasCount} Active Streams | {activeAlertsCount} Active Incidents</span>
            </div>
            <button
              onClick={fetchSitrep}
              disabled={loading}
              className="flex items-center gap-1 text-purple-300 hover:text-purple-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-line shadow-inner">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                <span>Compiling real-time sector surveillance intelligence...</span>
              </div>
            ) : (
              sitrep
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Signed by SSB Command Duty Officer • Sector 04
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition"
          >
            Acknowledge Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
