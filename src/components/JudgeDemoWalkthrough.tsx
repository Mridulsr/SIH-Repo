import React, { useState } from "react";
import {
  PlayCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Shield,
  Eye,
  Crosshair,
  AlertTriangle,
  Car,
  Moon,
  List,
  Activity,
  Award,
} from "lucide-react";

interface JudgeDemoWalkthroughProps {
  onClose: () => void;
  onSelectStep: (stepNumber: number) => void;
}

interface StepInfo {
  number: number;
  title: string;
  officialCriteria: string;
  explanation: string;
  actionLabel: string;
  tabTarget: "grid" | "alerts" | "anpr" | "metrics" | "blueprint";
}

const STEPS: StepInfo[] = [
  {
    number: 1,
    title: "Step 1: Multi-Camera Surveillance Matrix",
    officialCriteria: "Four camera tiles are visible on the dashboard.",
    explanation:
      "The system ingests 4 independent live CCTV RTSP / simulated border video streams with zero proprietary hardware. Each tile displays active stream telemetry, FPS, bitrate, and GPS coordinates.",
    actionLabel: "View 4-Camera Grid",
    tabTarget: "grid",
  },
  {
    number: 2,
    title: "Step 2: Persistent Object Tracking (ByteTrack)",
    officialCriteria: "A person appears in Camera 02 and receives a tracking ID.",
    explanation:
      "YOLOv11 detects human bounding boxes and assigns persistent ByteTrack tracking IDs (e.g. TRK-402) with Kalman filter velocity vectors and real-time motion trajectory breadcrumbs.",
    actionLabel: "Observe CAM-02 Tracking",
    tabTarget: "grid",
  },
  {
    number: 3,
    title: "Step 3: Virtual Fence Boundary Crossing",
    officialCriteria: "The person crosses the configured virtual fence.",
    explanation:
      "The operator-defined Zero-Line polygon evaluates the target centroid via Ray-Casting & line intersection geometry in real time. Crossing triggers an immediate boundary breach.",
    actionLabel: "Trigger Fence Intrusion",
    tabTarget: "grid",
  },
  {
    number: 4,
    title: "Step 4: Real-Time Critical Alert & Evidence Snapshot",
    officialCriteria: "A red intrusion alert appears immediately with camera, timestamp, confidence and snapshot.",
    explanation:
      "Instant alarm dispatch with audio chime, confidence score (94.2%), exact coordinate hash, high-res evidence snapshot, and Quick Reaction Team (QRT) dispatch trigger.",
    actionLabel: "Inspect Critical Alert Dossier",
    tabTarget: "alerts",
  },
  {
    number: 5,
    title: "Step 5: ANPR & Vehicle Classification Pipeline",
    officialCriteria: "A vehicle appears in Camera 03; the system detects the vehicle and reads its plate through the ANPR pipeline.",
    explanation:
      "Vehicle bounding box localization + PaddleOCR crops the license plate, standardizes the text (e.g. UP-32-DK-8921), and cross-matches against the SSB Inter-Agency Red Notice Watchlist.",
    actionLabel: "Examine ANPR Logbook",
    tabTarget: "anpr",
  },
  {
    number: 6,
    title: "Step 6: Night-Time Movement & Thermal Surveillance",
    officialCriteria: "Camera 04 demonstrates night-time movement detection.",
    explanation:
      "CAM-04 executes thermal infrared (FLIR White-Hot) low-light movement detection with loitering duration thresholding (>30s in restricted riverbed forest zone).",
    actionLabel: "View Thermal Night Sector",
    tabTarget: "grid",
  },
  {
    number: 7,
    title: "Step 7: Event History & Audit Ledger",
    officialCriteria: "The event history shows all incidents and their status.",
    explanation:
      "Complete historical audit log with acknowledge/resolve state machines, QRT dispatch tracking with live ETA countdown, and cryptographic incident dossier export.",
    actionLabel: "Review Audit History",
    tabTarget: "alerts",
  },
  {
    number: 8,
    title: "Step 8: Edge Hardware & Measured FPS Benchmark",
    officialCriteria: "A performance panel shows measured streams, processing FPS, latency and resource usage.",
    explanation:
      "Real-time benchmark dashboard displaying 24.8 FPS pipeline throughput, 31ms latency, TensorRT INT8 mode, GPU/CPU utilization, and interactive inference sampling rate control.",
    actionLabel: "View Hardware Benchmarks",
    tabTarget: "metrics",
  },
];

export const JudgeDemoWalkthrough: React.FC<JudgeDemoWalkthroughProps> = ({
  onClose,
  onSelectStep,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const step = STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      onSelectStep(nextIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      onSelectStep(prevIdx + 1);
    }
  };

  const handleJumpToStep = (idx: number) => {
    setCurrentStepIdx(idx);
    onSelectStep(idx + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SIH26187 Judge Evaluation Walkthrough
              </h2>
              <p className="text-xs text-amber-400 font-mono">
                Official Demonstration Script (Section 13 — What the Judge Should See)
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

        {/* Step Progress Indicators */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          {STEPS.map((s, idx) => (
            <button
              key={s.number}
              onClick={() => handleJumpToStep(idx)}
              className={`flex-1 min-w-[28px] h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition border ${
                idx === currentStepIdx
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                  : idx < currentStepIdx
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
              }`}
              title={s.title}
            >
              {idx < currentStepIdx ? "✓" : s.number}
            </button>
          ))}
        </div>

        {/* Current Step Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              CRITERION {step.number} OF 8
            </span>
            <span className="text-xs font-mono text-slate-400">
              Target Tab: <span className="text-blue-400 uppercase font-bold">{step.tabTarget}</span>
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 mb-3">
              <span className="text-slate-500">SIH Mandate: </span>
              "{step.officialCriteria}"
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {step.explanation}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onSelectStep(step.number);
                onClose();
              }}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>{step.actionLabel} & Close Tour</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-slate-500">
            Step {currentStepIdx + 1} / 8
          </span>

          <button
            onClick={handleNext}
            disabled={currentStepIdx === STEPS.length - 1}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shadow disabled:opacity-40"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
