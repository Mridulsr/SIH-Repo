import React, { useState } from "react";
import {
  FileCode,
  Layers,
  Database,
  Server,
  Shield,
  Cpu,
  Workflow,
  CheckCircle,
  X,
  Copy,
  Download,
} from "lucide-react";

interface ArchitectureBlueprintModalProps {
  onClose: () => void;
}

export const ArchitectureBlueprintModal: React.FC<ArchitectureBlueprintModalProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"pipeline" | "backend" | "database" | "roi">("pipeline");
  const [copied, setCopied] = useState(false);

  const handleCopyArchitecture = () => {
    navigator.clipboard.writeText(`SIH26187 Architecture Pipeline:
CCTV / RTSP Stream -> RTSP Stream Manager -> Frame Sampling Decoder (15-25 FPS) -> YOLO Detection (Person & Vehicle) -> ByteTrack / BoT-SORT -> Event Engine (Virtual Fence + ANPR + Night Movement) -> Alert & Evidence Service -> FastAPI + PostgreSQL + WebSocket -> React Command Dashboard`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SIH26187 System Architecture & Project Blueprint
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Ministry of Home Affairs / Sashastra Seema Bal (SSB), Police II Division
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

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "pipeline"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Logical Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("backend")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "backend"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend & Vision Modules</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "database"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab("roi")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === "roi"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Operational ROI & SSB Impact</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === "pipeline" && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>End-to-End AI Analytics Pipeline (Section 6 Architecture)</span>
                  <button
                    onClick={handleCopyArchitecture}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? "Copied" : "Copy Pipeline"}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-slate-200 leading-relaxed">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span>1. Ingestion:</span>
                    <span className="text-slate-300 font-normal">Legacy IP CCTV / RTSP / Video Feeds</span>
                  </div>
                  <div className="text-slate-500 pl-4">↓ RTSP Stream Manager (OpenCV / GStreamer Async Decoders)</div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <span>2. Sampling & Preprocessing:</span>
                    <span className="text-slate-300 font-normal">Configurable 5–25 FPS Ring Buffer & Low-Light Normalization</span>
                  </div>
                  <div className="text-slate-500 pl-4">↓ PyTorch / TensorRT 10.x Inference Engine</div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>3. Detection & Tracking:</span>
                    <span className="text-slate-300 font-normal">YOLOv11 Person/Vehicle Localizer + ByteTrack / BoT-SORT Re-ID</span>
                  </div>
                  <div className="text-slate-500 pl-4">↓ Spatial Geometry & Context Evaluator</div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <span>4. Specialist Rules Engine:</span>
                    <span className="text-slate-300 font-normal">Virtual Fence Ray-Casting + PaddleOCR ANPR + Night Loitering Timer</span>
                  </div>
                  <div className="text-slate-500 pl-4">↓ Evidence Hasher & Dispatch Service</div>
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <span>5. Alert & Command Hub:</span>
                    <span className="text-slate-300 font-normal">FastAPI + PostgreSQL + WebSocket + React Command Dashboard</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Zero Hardware Lock-In</div>
                  <p className="text-slate-400">
                    Works on any existing H.264/H.265 RTSP standard camera without smart chipsets.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Sub-40ms Low Latency</div>
                  <p className="text-slate-400">
                    Optimized with TensorRT FP16 for real-time edge processing on NVIDIA Jetson / GPU servers.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Explainable AI Rules</div>
                  <p className="text-slate-400">
                    Clear geometric boundaries, trajectory speeds, and OCR logs instead of opaque black-box decisions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "backend" && (
            <div className="space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-200">
                Recommended Backend Package Hierarchy (Section 7)
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 overflow-x-auto">
{`backend/
├── main.py                     # FastAPI application bootstrap & WebSocket endpoints
├── api/
│   ├── cameras.py              # Camera registration, RTSP test & status endpoints
│   ├── detections.py           # Real-time YOLO detection feeds & coordinate telemetry
│   ├── alerts.py               # Alert acknowledgement, QRT dispatch & evidence hashes
│   └── analytics.py            # Hourly breach trends, vehicle counts & uptime stats
├── vision/
│   ├── detector.py             # YOLOv11 TensorRT inference runner
│   ├── tracker.py              # ByteTrack / BoT-SORT multi-object state machine
│   ├── anpr.py                 # Number plate ROI cropping + PaddleOCR normalization
│   ├── intrusion.py            # Ray-Casting & Line segment polygon intersection
│   └── night_detection.py      # Zero-DCE low-light enhancement & loitering thresholding
├── streams/
│   ├── rtsp_manager.py         # Multi-threaded stream reconnection & queue manager
│   └── frame_processor.py      # Async frame buffer & FPS decimation
└── services/
    ├── alert_service.py        # Real-time WebSocket pusher & siren trigger
    └── event_service.py        # Forensic evidence snapshot generator & PDF exporter`}
              </pre>
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-3 font-mono">
              <div className="text-xs font-bold text-slate-200">
                Relational Database Schemas (Section 8)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-blue-400">Table: cameras</div>
                  <div className="text-slate-400 text-[11px]">
                    • id (VARCHAR PRIMARY KEY)<br />
                    • name (VARCHAR)<br />
                    • stream_url (VARCHAR)<br />
                    • location (VARCHAR)<br />
                    • status (VARCHAR: ONLINE/OFFLINE)<br />
                    • coordinates (JSONB lat/lng)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400">Table: detections</div>
                  <div className="text-slate-400 text-[11px]">
                    • id (UUID PRIMARY KEY)<br />
                    • camera_id (FK → cameras.id)<br />
                    • object_type (VARCHAR: person/vehicle)<br />
                    • track_id (VARCHAR: TRK-xxx)<br />
                    • confidence (FLOAT)<br />
                    • timestamp (TIMESTAMPTZ)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-400">Table: events (Alerts)</div>
                  <div className="text-slate-400 text-[11px]">
                    • id (VARCHAR PRIMARY KEY)<br />
                    • camera_id (FK → cameras.id)<br />
                    • event_type (VARCHAR: INTRUSION/ANPR/NIGHT)<br />
                    • severity (VARCHAR: CRITICAL/HIGH/MED)<br />
                    • confidence (FLOAT)<br />
                    • snapshot_url (TEXT)<br />
                    • status (ACTIVE/ACK/QRT_DISPATCHED)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400">Table: vehicles (ANPR)</div>
                  <div className="text-slate-400 text-[11px]">
                    • id (UUID PRIMARY KEY)<br />
                    • camera_id (FK → cameras.id)<br />
                    • plate_number (VARCHAR INDEXED)<br />
                    • vehicle_type (VARCHAR)<br />
                    • ocr_confidence (FLOAT)<br />
                    • watchlist_status (VARCHAR)<br />
                    • timestamp (TIMESTAMPTZ)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roi" && (
            <div className="space-y-4 font-sans">
              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/80 space-y-2">
                <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>Strategic Impact for Ministry of Home Affairs / SSB</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Existing border outposts already possess thousands of standard CCTV IP cameras installed over past modernization drives. Replacing them with specialized smart cameras or dedicated hardware FRS/ANPR appliances would cost hundreds of crores.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">💰 85% Capital Expenditure Reduction</div>
                  <p className="text-slate-400">
                    Software-defined architecture converts legacy ₹4,000 CCTV cameras into AI-enabled smart perimeter sensors.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">⚡ Zero-Latency QRT Dispatch</div>
                  <p className="text-slate-400">
                    Automates human monitoring fatigue — alerts sent in &lt;1 second vs. manual spotters taking 3–8 minutes.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">⚖️ Legal & Privacy Safeguards</div>
                  <p className="text-slate-400">
                    Strict boundary-driven intrusion logs with explainable evidence, avoiding arbitrary facial recognition overreach.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-white">🌙 24/7 All-Weather Surveillance</div>
                  <p className="text-slate-400">
                    Automatic low-light gamma enhancement & FLIR thermal heat detection overcomes dense fog and night terrain.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Smart India Hackathon 2026 • Problem Statement SIH26187
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
