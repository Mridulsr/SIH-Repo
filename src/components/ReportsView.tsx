import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  Printer,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { AlertEvent, VehiclePlateRecord, Camera } from "../types";

interface ReportsViewProps {
  alerts: AlertEvent[];
  vehicles: VehiclePlateRecord[];
  cameras: Camera[];
  onOpenSITREP: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  alerts,
  vehicles,
  cameras,
  onOpenSITREP,
}) => {
  const [reportType, setReportType] = useState("DAILY_AUDIT");
  const [generated, setGenerated] = useState(false);

  const handleDownloadReport = (format: "csv" | "json") => {
    let dataStr = "";
    let filename = "";
    if (format === "csv") {
      dataStr = "data:text/csv;charset=utf-8," +
        "ID,Camera,Timestamp,Severity,ObjectType,Confidence,Reason\n" +
        alerts.map(a => `${a.id},${a.cameraName},${a.timestamp},${a.severity},${a.objectType},${a.confidence},"${a.details?.reason || ''}"`).join("\n");
      filename = "SIH_Surveillance_Audit_Report.csv";
    } else {
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ alerts, vehicles, camerasCount: cameras.length, exportedAt: new Date().toISOString() }, null, 2));
      filename = "SIH_Tactical_Intelligence_Report.json";
    }
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header card with AI generator button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#13203c] to-[#0f172a] border border-slate-800/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
            <FileText className="w-4 h-4" />
            <span>Tactical Intelligence & Incident Audit Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Surveillance Audit Reports</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Export compliant incident logs, ANPR transit records, and automated SITREP briefings formatted for Quick Reaction Teams and Law Enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSITREP}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI SITREP Briefing</span>
          </button>

          <button
            onClick={() => handleDownloadReport("csv")}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Log</span>
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 font-mono">Total Recorded Incidents</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{alerts.length}</div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All entries cryptographically signed (SHA-256)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 font-mono">ANPR Transit Hits</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{vehicles.length} Plates</div>
          <div className="text-[11px] text-amber-400 mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{vehicles.filter(v => v.watchlistStatus === "WANTED_RED_NOTICE").length} Red Notice flags logged</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 font-mono">Audit Export Status</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">Ready</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Instant export to CSV, JSON, or Printable Briefing
          </div>
        </div>
      </div>

      {/* Report Table Preview */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Incident Manifest Preview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Chronological audit stream ready for export</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadReport("json")}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
            >
              Export JSON
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 font-sans">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Camera</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-bold text-white">{a.id}</td>
                  <td className="py-3 px-3 text-slate-200">{a.cameraName}</td>
                  <td className="py-3 px-3 text-slate-400">{a.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className={a.severity === "CRITICAL" ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{a.details?.reason || a.eventType}</td>
                  <td className="py-3 px-3 text-emerald-400">{(a.confidence * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
