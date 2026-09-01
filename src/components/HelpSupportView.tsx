import React from "react";
import {
  HelpCircle,
  Cpu,
  Shield,
  Code,
  Radio,
  BookOpen,
  Keyboard,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

export const HelpSupportView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#152342] to-[#0f172a] border border-slate-800/90 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
          <BookOpen className="w-4 h-4" />
          <span>Documentation & Architecture Guide</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">SIH System Help & Model Specification</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Comprehensive manual on real-time neural vision pipelines, ANPR OCR algorithms, optical virtual fence geometry, and Gemini Multimodal Forensics.
        </p>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">YOLOv11 + ByteTrack</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-speed TensorRT INT8/FP16 edge inference running at 25+ FPS per stream. Kalman filters maintain identity across optical occlusions and low-light terrain.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Virtual Tripwires & Fences</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ray-casting algorithm computes polygon intersections within sub-millisecond cycles to detect directional intrusions into restricted perimeters and buffer zones.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-lg space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">ANPR PaddleOCR V4</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deep character recognition engine optimized for high-speed license plates, low-contrast retro-reflective plates, and automatic inter-agency watchlist correlation.
          </p>
        </div>
      </div>

      {/* Tactical Keyboard Shortcuts */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Tactical Sentry Keyboard Shortcuts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Toggle Siren Alarm</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">M</kbd>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Next Spotlight Camera</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Tab / N</kbd>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Night NVG / Thermal</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">T</kbd>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Acknowledge Breach</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Space</kbd>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">AI Forensic Dossier</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">F</kbd>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Full Screen Feed</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">F11</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
