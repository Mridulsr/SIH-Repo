import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  Bell,
  Cpu,
  Shield,
  Save,
  CheckCircle2,
  Volume2,
  Radio,
  Lock,
  Globe
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const [detectorModel, setDetectorModel] = useState("YOLOv11x-Edge (PyTorch / TensorRT 10.x)");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.65);
  const [iouThreshold, setIouThreshold] = useState(0.45);
  const [anprOcrEngine, setAnprOcrEngine] = useState("PaddleOCR Mobile V4 + Plate Regressor");
  const [autoQrtDispatch, setAutoQrtDispatch] = useState(true);
  const [sirenVolume, setSirenVolume] = useState(80);
  const [rtspBufferMs, setRtspBufferMs] = useState(120);
  const [webhookUrl, setWebhookUrl] = useState("https://command.sih.internal/api/v1/alerts/webhook");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
            <Sliders className="w-4 h-4" />
            <span>Tactical System Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">System & Model Settings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure edge AI inference thresholds, RTSP hardware pipelines, and automated escalation parameters.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Settings applied to Edge Engine</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: AI Model Pipeline & Thresholds */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">AI Vision & Detection Pipeline</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Object Detection Engine
              </label>
              <select
                value={detectorModel}
                onChange={(e) => setDetectorModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="YOLOv11x-Edge (PyTorch / TensorRT 10.x)">YOLOv11x-Edge (PyTorch / TensorRT 10.x)</option>
                <option value="YOLOv10-Border-Optimized (FP16)">YOLOv10-Border-Optimized (FP16)</option>
                <option value="Thermal-YOLO-FLIR-Custom">Thermal-YOLO-FLIR-Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                ANPR OCR Regressor
              </label>
              <select
                value={anprOcrEngine}
                onChange={(e) => setAnprOcrEngine(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="PaddleOCR Mobile V4 + Plate Regressor">PaddleOCR Mobile V4 + Plate Regressor</option>
                <option value="EasyOCR High-Speed Tensor Engine">EasyOCR High-Speed Tensor Engine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold font-mono">Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</span>
                <span className="text-slate-500 text-[11px]">Min probability for intrusion trigger</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold font-mono">NMS IoU Threshold: {(iouThreshold * 100).toFixed(0)}%</span>
                <span className="text-slate-500 text-[11px]">Bounding box overlap suppression</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={iouThreshold}
                onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Alert Escalation & Audio Sirens */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Alert Escalation & Siren Protocols</h3>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">Auto-Dispatch Quick Reaction Team (QRT)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Automatically allocate nearest tactical unit when CRITICAL breach severity is detected.
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoQrtDispatch}
              onChange={(e) => setAutoQrtDispatch(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-slate-400">
              Tactical Webhook Integration (Law Enforcement / Sentry Dispatch)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE TACTICAL CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
