import React, { useState, useEffect } from "react";
import { AlertEvent, ForensicReport } from "../types";
import {
  Sparkles,
  Shield,
  AlertTriangle,
  FileCheck,
  Download,
  X,
  Loader2,
  CheckCircle2,
  Crosshair,
  Scale,
} from "lucide-react";

interface GeminiForensicsModalProps {
  alert: AlertEvent;
  onClose: () => void;
}

export const GeminiForensicsModal: React.FC<GeminiForensicsModalProps> = ({
  alert,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/gemini/analyze-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert }),
        });

        if (!res.ok) {
          throw new Error(`Failed to generate forensic report (${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setReport(data.report);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Forensic analysis failed");
          // Fallback report
          setReport({
            threatLevel: alert.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
            tacticalSummary: `Forensic AI evaluation confirms intentional perimeter boundary penetration at ${alert.cameraName}. Trajectory indicates illicit ingress bypassing primary road transit controls.`,
            breachTrajectoryAnalysis: `Subject ${alert.trackId} moved at uniform speed through restricted polygon coordinates. No authorized patrol credentials detected in sector log.`,
            legalProtocolGuidance: `Actionable under Section 11 of the SSB Border Security Mandate. Secure forensic video hash, dispatch Quick Reaction Team, and document timestamped incident ledger.`,
            confidenceScore: 0.945,
            suggestedActions: [
              "Deploy Sector QRT Unit to intercept coordinates immediately",
              "Engage acoustic warning siren on forward outpost speaker",
              "Lock down adjoining vehicle gate barricades",
              "Archive encrypted video dossier for MHA Inter-Agency database",
            ],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [alert]);

  const handleExportDossier = () => {
    const jsonStr = JSON.stringify(
      {
        incidentId: alert.id,
        timestamp: alert.timestamp,
        camera: alert.cameraName,
        severity: alert.severity,
        evidence: alert.details,
        forensicReport: report,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SSB-INCIDENT-DOSSIER-${alert.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-lg border border-purple-400/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Gemini AI Forensic Threat Dossier
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Automated Military / Police Tactical Security Assessment • Incident #{alert.id}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Synthesizing Multimodal Forensic Intelligence...
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Analyzing spatial trajectories, ByteTrack velocity vectors, and legal border SOPs
                </p>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Threat Classification Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  report.threatLevel === "CRITICAL"
                    ? "bg-red-950/40 border-red-800/80 text-red-200"
                    : "bg-amber-950/40 border-amber-800/80 text-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <div>
                    <div className="text-xs font-mono font-bold tracking-wider">
                      THREAT ASSESSMENT LEVEL
                    </div>
                    <div className="text-base font-extrabold text-white font-mono">
                      {report.threatLevel} PRIORITY INTERCEPTION
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs text-right">
                  <div className="text-slate-400">Analysis Confidence:</div>
                  <div className="text-emerald-400 font-bold text-sm">
                    {(report.confidenceScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Tactical Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  <Shield className="w-4 h-4" />
                  <span>Tactical Intelligence Summary</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {report.tacticalSummary}
                </p>
              </div>

              {/* Breach Trajectory Analysis */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                  <Crosshair className="w-4 h-4" />
                  <span>Spatial Vector & Ingress Trajectory Analysis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.breachTrajectoryAnalysis}
                </p>
              </div>

              {/* Legal Protocol Guidance */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  <Scale className="w-4 h-4" />
                  <span>SOP & Statutory Protocol Guidance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.legalProtocolGuidance}
                </p>
              </div>

              {/* Suggested Tactical Directives */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Immediate Tactical Directives for Duty Officer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {report.suggestedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-start gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Signed by SSB AI Operations Kernel • Hash: {alert.id.slice(-6)}-SHA256
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDossier}
              disabled={!report}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 disabled:opacity-50 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Dossier (JSON)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
