import React, { useState } from "react";
import { Camera, CameraMode, StreamType, LightingEnvironment } from "../types";
import { Plus, Camera as CameraIcon, X, Check, Video, MapPin, Sun, Moon, Flame } from "lucide-react";

interface AddCameraModalProps {
  onClose: () => void;
  onAddCamera: (newCamera: Partial<Camera>) => void;
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({
  onClose,
  onAddCamera,
}) => {
  const [name, setName] = useState("");
  const [properName, setProperName] = useState("");
  const [outpostCode, setOutpostCode] = useState("SSB-BOP-FRONTIER-01");
  const [sector, setSector] = useState("Sector-04 Indo-Nepal (Bihar)");
  const [location, setLocation] = useState("Pillar 189 Zero Line Outpost");
  const [streamUrl, setStreamUrl] = useState("rtsp://10.42.10.125:554/live/stream1");
  const [streamType, setStreamType] = useState<StreamType>("RTSP");
  const [mode, setMode] = useState<CameraMode>("STANDARD");
  const [lightingEnvironment, setLightingEnvironment] = useState<LightingEnvironment>("DAY_BRIGHT");
  const [lat, setLat] = useState("26.4015");
  const [lng, setLng] = useState("87.2785");
  const [elevation, setElevation] = useState("85m AMSL");
  const [sensorType, setSensorType] = useState("4K Starlight Optical 1/1.8\" CMOS");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddCamera({
      name,
      properName: properName || name,
      outpostCode,
      sector,
      location,
      streamUrl,
      streamType,
      mode,
      lightingEnvironment,
      elevation,
      sensorType,
      coordinates: {
        lat: parseFloat(lat) || 26.4,
        lng: parseFloat(lng) || 87.27,
      },
      status: "ONLINE",
      fps: 25.0,
      resolution: "1920x1080 @ 25fps",
      bitrate: "4.0 Mbps",
      virtualFences: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Register New CCTV / RTSP Stream
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Connect legacy IP camera without proprietary AI hardware
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Camera / Feed Identifier
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sector 4E - Sarda River West Embankment"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Official Proper Outpost / Sentry Name (Displayed when Clicked)
            </label>
            <input
              type="text"
              value={properName}
              onChange={(e) => setProperName(e.target.value)}
              placeholder="e.g. BOP Banbasa - Sarda River Crossing Deep Forest Outpost 25"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Outpost Tactical Code
              </label>
              <input
                type="text"
                value={outpostCode}
                onChange={(e) => setOutpostCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Border Sector
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              RTSP / IP Video Stream URL (RTSP Protocol)
            </label>
            <input
              type="text"
              required
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp://10.42.10.x:554/live/stream1"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Lighting / Visual Environment
              </label>
              <select
                value={lightingEnvironment}
                onChange={(e) => setLightingEnvironment(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="DAY_BRIGHT">Daylight Bright (Sunlit)</option>
                <option value="DAY_OVERCAST">Daylight Overcast / Cloudy</option>
                <option value="DUSK_GOLDEN">Dusk / Sunset Golden Hour</option>
                <option value="NIGHT_IR">Night Vision IR (850nm Starlight)</option>
                <option value="NIGHT_VISION_GREEN">Military NVG Gen-3 Green</option>
                <option value="THERMAL_WHITE_HOT">FLIR Thermal (White-Hot)</option>
                <option value="THERMAL_IRONBOW">FLIR Thermal (Ironbow Heatmap)</option>
                <option value="RAIN_MONSOON">Monsoon Precipitation</option>
                <option value="FOG_VALLEY">Dense Fog / Optical Dehaze</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Specialist AI Analytics Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="STANDARD">Standard Object Detection</option>
                <option value="RESTRICTED_FENCE">Virtual Fence Intrusion</option>
                <option value="ANPR_CHECKPOST">ANPR & Vehicle OCR</option>
                <option value="NIGHT_THERMAL">Night & Thermal IR Movement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                GPS Latitude (°N)
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                GPS Longitude (°E)
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Elevation AMSL
              </label>
              <input
                type="text"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Register Stream</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
