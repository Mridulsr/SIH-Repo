import React, { useState, useRef, useEffect } from "react";
import { Camera, VirtualFence, SeverityLevel } from "../types";
import { Shield, Check, Trash2, Undo, Plus, AlertTriangle, X, Info } from "lucide-react";

interface VirtualFenceEditorProps {
  camera: Camera;
  onClose: () => void;
  onSaveFence: (updatedFences: VirtualFence[]) => void;
}

export const VirtualFenceEditor: React.FC<VirtualFenceEditorProps> = ({
  camera,
  onClose,
  onSaveFence,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fences, setFences] = useState<VirtualFence[]>(camera.virtualFences || []);
  const [activeFenceId, setActiveFenceId] = useState<string>(
    fences.length > 0 ? fences[0].id : "new-fence"
  );

  // Edit form state
  const [zoneName, setZoneName] = useState("Zero-Line No-Go Red Polygon");
  const [zoneType, setZoneType] = useState<"RESTRICTED_POLYGON" | "TRIPWIRE_LINE" | "BUFFER_ZONE">(
    "RESTRICTED_POLYGON"
  );
  const [severity, setSeverity] = useState<SeverityLevel>("CRITICAL");
  const [direction, setDirection] = useState<"INBOUND" | "OUTBOUND" | "BIDIRECTIONAL">("INBOUND");
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>(
    fences.length > 0
      ? fences[0].points
      : [
          { x: 0.15, y: 0.35 },
          { x: 0.85, y: 0.35 },
          { x: 0.9, y: 0.8 },
          { x: 0.1, y: 0.8 },
        ]
  );

  // Canvas drawing of current polygon
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw dark grid backdrop
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw active polygon
    if (points.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0].x * width, points[0].y * height);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * width, points[i].y * height);
      }

      if (zoneType === "RESTRICTED_POLYGON" || zoneType === "BUFFER_ZONE") {
        ctx.closePath();
        ctx.fillStyle =
          severity === "CRITICAL"
            ? "rgba(239, 68, 68, 0.25)"
            : "rgba(245, 158, 11, 0.25)";
        ctx.fill();
      }

      ctx.strokeStyle = severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      // Vertices with numbers
      points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 7, 0, Math.PI * 2);
        ctx.fillStyle = severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(idx + 1), p.x * width - 3, p.y * height - 10);
      });

      ctx.restore();
    }
  }, [points, severity, zoneType]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setPoints([...points, { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }]);
  };

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleSave = () => {
    const updatedFence: VirtualFence = {
      id: activeFenceId.startsWith("new") ? `VF-${Date.now().toString().slice(-4)}` : activeFenceId,
      name: zoneName,
      type: zoneType,
      points,
      severity,
      direction,
      active: true,
    };

    const nextFences = [
      ...fences.filter((f) => f.id !== updatedFence.id),
      updatedFence,
    ];

    setFences(nextFences);
    onSaveFence(nextFences);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Virtual Fence & Restricted Zone Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {camera?.id || "CAM"} — {camera?.properName || camera?.name || "Border Camera"}
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

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
          {/* Left / Center: Interactive Canvas */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="font-semibold">Interactive Canvas (Click to Add Vertices)</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
                <span>{points.length} Vertices Placed</span>
              </div>
            </div>

            <div className="relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
              <canvas
                ref={canvasRef}
                width={640}
                height={360}
                onClick={handleCanvasClick}
                className="w-full h-[280px] sm:h-[340px] cursor-crosshair object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-900/90 text-slate-300 px-2 py-1 rounded text-[11px] font-mono border border-slate-700 pointer-events-none">
                💡 Click on canvas to place polygon perimeter points
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={points.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span>Undo Last Point</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={points.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-medium flex items-center gap-1.5 border border-red-800 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Ray-Casting Algorithm Evaluated on Edge</span>
              </div>
            </div>
          </div>

          {/* Right: Fence Parameter Form */}
          <div className="flex flex-col gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Zone Parameters
            </h3>

            {/* Zone Name */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Zone / Geofence Label
              </label>
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Zero-Line Primary Intrusion Box"
              />
            </div>

            {/* Zone Geometry Type */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Geometry Type
              </label>
              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="RESTRICTED_POLYGON">Restricted Polygon (No-Go Area)</option>
                <option value="TRIPWIRE_LINE">Tripwire Crossing Line</option>
                <option value="BUFFER_ZONE">Buffer Warning Corridor</option>
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Alarm Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["CRITICAL", "HIGH", "MEDIUM"] as SeverityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition border ${
                      severity === lvl
                        ? lvl === "CRITICAL"
                          ? "bg-red-600 text-white border-red-500 shadow-md"
                          : lvl === "HIGH"
                          ? "bg-amber-600 text-white border-amber-500 shadow-md"
                          : "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Trigger Trajectory Vector
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="INBOUND">Inbound Only (Crossing towards India)</option>
                <option value="OUTBOUND">Outbound Only</option>
                <option value="BIDIRECTIONAL">Bidirectional (Both Directions)</option>
              </select>
            </div>

            {/* Save Action */}
            <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={points.length < 3}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Apply Zone to {camera.id}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
