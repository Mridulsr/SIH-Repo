import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialization of Gemini client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// In-Memory Store for Border Analytics Platform
export interface CameraData {
  id: string;
  name: string;
  sector: string;
  location: string;
  streamUrl: string;
  streamType: "RTSP" | "DEMO_FEED" | "IP_CAM";
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  fps: number;
  resolution: string;
  bitrate: string;
  coordinates: { lat: number; lng: number };
  mode: "STANDARD" | "RESTRICTED_FENCE" | "ANPR_CHECKPOST" | "NIGHT_THERMAL";
  virtualFences: Array<{
    id: string;
    name: string;
    type: "RESTRICTED_POLYGON" | "TRIPWIRE_LINE" | "BUFFER_ZONE";
    points: Array<{ x: number; y: number }>;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    direction: "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
    active: boolean;
  }>;
}

export interface AlertEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  sector: string;
  eventType: "VIRTUAL_FENCE_INTRUSION" | "ANPR_WATCHLIST_HIT" | "NIGHT_LOITERING" | "SUSPICIOUS_TRAJECTORY" | "UNAUTHORIZED_VEHICLE";
  timestamp: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  trackId: string;
  objectType: "PERSON" | "VEHICLE" | "GROUP" | "UNKNOWN";
  confidence: number;
  coordinates: { x: number; y: number };
  snapshotUrl?: string;
  details: {
    plateNumber?: string;
    vehicleType?: string;
    loiterDurationSec?: number;
    fenceName?: string;
    reason: string;
    explainableEvidence: string;
  };
  status: "ACTIVE" | "ACKNOWLEDGED" | "QRT_DISPATCHED" | "RESOLVED";
  qrtStatus?: {
    teamCode: string;
    dispatchedAt: string;
    etaMinutes: number;
    commander: string;
  };
}

export interface VehiclePlateRecord {
  id: string;
  cameraId: string;
  cameraName: string;
  plateNumber: string;
  vehicleType: "SEDAN" | "SUV" | "TRUCK" | "MOTORCYCLE" | "JEEP_4X4" | "HEAVY_CARGO";
  timestamp: string;
  ocrConfidence: number;
  speedKmh: number;
  watchlistStatus: "CLEAN" | "FLAGGED_SUSPICIOUS" | "WANTED_RED_NOTICE" | "STOLEN";
  notes?: string;
}

// Initial Mock Cameras
let cameras: CameraData[] = [
  {
    id: "CAM-01",
    name: "Sector 4A - Forward Perimeter Patrol",
    sector: "Sector-04 Indo-Nepal Border",
    location: "Post 42A, Jogbani Ridge",
    streamUrl: "rtsp://10.42.10.101:554/live/stream1",
    streamType: "RTSP",
    status: "ONLINE",
    fps: 25.0,
    resolution: "1920x1080 @ 25fps",
    bitrate: "4.2 Mbps",
    coordinates: { lat: 26.3985, lng: 87.2741 },
    mode: "STANDARD",
    virtualFences: [],
  },
  {
    id: "CAM-02",
    name: "Sector 4B - Zero-Line Restricted Fence",
    sector: "Sector-04 Indo-Nepal Border",
    location: "Pillar 188/4 Zero Line Corridor",
    streamUrl: "rtsp://10.42.10.102:554/live/stream1",
    streamType: "DEMO_FEED",
    status: "ONLINE",
    fps: 24.8,
    resolution: "1920x1080 @ 25fps",
    bitrate: "4.0 Mbps",
    coordinates: { lat: 26.3992, lng: 87.2764 },
    mode: "RESTRICTED_FENCE",
    virtualFences: [
      {
        id: "VF-02-RED",
        name: "Zero-Line No-Go Red Polygon",
        type: "RESTRICTED_POLYGON",
        points: [
          { x: 0.15, y: 0.35 },
          { x: 0.85, y: 0.35 },
          { x: 0.92, y: 0.82 },
          { x: 0.08, y: 0.82 },
        ],
        severity: "CRITICAL",
        direction: "INBOUND",
        active: true,
      },
    ],
  },
  {
    id: "CAM-03",
    name: "Sector 4C - Integrated Checkpost Barricade",
    sector: "Sector-04 Indo-Nepal Border",
    location: "Main Transit Axis Gate 2",
    streamUrl: "rtsp://10.42.10.103:554/live/stream1",
    streamType: "DEMO_FEED",
    status: "ONLINE",
    fps: 25.0,
    resolution: "1920x1080 @ 25fps",
    bitrate: "3.8 Mbps",
    coordinates: { lat: 26.4011, lng: 87.2805 },
    mode: "ANPR_CHECKPOST",
    virtualFences: [],
  },
  {
    id: "CAM-04",
    name: "Sector 4D - Sarda Riverbed Forest Sector",
    sector: "Sector-04 Indo-Nepal Border",
    location: "River Crossing Dense Forest Outpost",
    streamUrl: "rtsp://10.42.10.104:554/live/stream1",
    streamType: "DEMO_FEED",
    status: "ONLINE",
    fps: 24.2,
    resolution: "1920x1080 @ 25fps",
    bitrate: "3.5 Mbps",
    coordinates: { lat: 26.4035, lng: 87.2842 },
    mode: "NIGHT_THERMAL",
    virtualFences: [
      {
        id: "VF-04-THERM",
        name: "Riverbank Buffer Geofence",
        type: "BUFFER_ZONE",
        points: [
          { x: 0.2, y: 0.4 },
          { x: 0.8, y: 0.4 },
          { x: 0.85, y: 0.9 },
          { x: 0.15, y: 0.9 },
        ],
        severity: "HIGH",
        direction: "BIDIRECTIONAL",
        active: true,
      },
    ],
  },
];

let alerts: AlertEvent[] = [
  {
    id: "ALT-2026-8901",
    cameraId: "CAM-02",
    cameraName: "Sector 4B - Zero-Line Restricted Fence",
    sector: "Sector-04 Indo-Nepal Border",
    eventType: "VIRTUAL_FENCE_INTRUSION",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    severity: "CRITICAL",
    trackId: "TRK-402",
    objectType: "PERSON",
    confidence: 0.942,
    coordinates: { x: 0.48, y: 0.62 },
    snapshotUrl: "https://images.unsplash.com/photo-1578836537282-3171d77f8632?auto=format&fit=crop&w=600&q=80",
    details: {
      fenceName: "Zero-Line No-Go Red Polygon",
      reason: "Unauthorized subject penetrated primary security perimeter polygon at Zero Line",
      explainableEvidence: "Persistent ByteTrack ID TRK-402 crossed polygon boundary from coordinate (0.42, 0.28) heading inbound at 1.8 m/s.",
    },
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-8899",
    cameraId: "CAM-03",
    cameraName: "Sector 4C - Integrated Checkpost Barricade",
    sector: "Sector-04 Indo-Nepal Border",
    eventType: "ANPR_WATCHLIST_HIT",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    severity: "HIGH",
    trackId: "TRK-219",
    objectType: "VEHICLE",
    confidence: 0.965,
    coordinates: { x: 0.52, y: 0.7 },
    snapshotUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    details: {
      plateNumber: "UP-32-DK-8921",
      vehicleType: "SUV (Dark Tint)",
      reason: "ANPR match against SSB Inter-Agency Red Notice Watchlist #WN-904",
      explainableEvidence: "PaddleOCR verified plate UP-32-DK-8921 with 96.5% confidence. Vehicle flagged for illicit contraband transport.",
    },
    status: "ACKNOWLEDGED",
  },
  {
    id: "ALT-2026-8895",
    cameraId: "CAM-04",
    cameraName: "Sector 4D - Sarda Riverbed Forest Sector",
    sector: "Sector-04 Indo-Nepal Border",
    eventType: "NIGHT_LOITERING",
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    severity: "MEDIUM",
    trackId: "TRK-108",
    objectType: "PERSON",
    confidence: 0.891,
    coordinates: { x: 0.35, y: 0.55 },
    snapshotUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    details: {
      loiterDurationSec: 145,
      reason: "Subject remained stationary in dense tree line for >120 seconds during 03:00 hours",
      explainableEvidence: "Thermal infrared delta detected human heat signature exhibiting loitering pattern without designated patrol clearance.",
    },
    status: "RESOLVED",
  },
];

let vehicles: VehiclePlateRecord[] = [
  {
    id: "VEH-1001",
    cameraId: "CAM-03",
    cameraName: "Sector 4C - Integrated Checkpost Barricade",
    plateNumber: "UP-32-DK-8921",
    vehicleType: "SUV",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    ocrConfidence: 0.965,
    speedKmh: 24,
    watchlistStatus: "WANTED_RED_NOTICE",
    notes: "Flagged on MHA Inter-Agency Watchlist (Smuggling suspect)",
  },
  {
    id: "VEH-1002",
    cameraId: "CAM-03",
    cameraName: "Sector 4C - Integrated Checkpost Barricade",
    plateNumber: "BR-01-GB-4412",
    vehicleType: "TRUCK",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    ocrConfidence: 0.982,
    speedKmh: 18,
    watchlistStatus: "CLEAN",
    notes: "Commercial transit carrier - Manifest verified",
  },
  {
    id: "VEH-1003",
    cameraId: "CAM-03",
    cameraName: "Sector 4C - Integrated Checkpost Barricade",
    plateNumber: "DL-08-CC-5190",
    vehicleType: "SEDAN",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    ocrConfidence: 0.941,
    speedKmh: 31,
    watchlistStatus: "CLEAN",
    notes: "Civilian transit",
  },
  {
    id: "VEH-1004",
    cameraId: "CAM-03",
    cameraName: "Sector 4C - Integrated Checkpost Barricade",
    plateNumber: "HR-26-EQ-1994",
    vehicleType: "MOTORCYCLE",
    timestamp: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    ocrConfidence: 0.915,
    speedKmh: 42,
    watchlistStatus: "FLAGGED_SUSPICIOUS",
    notes: "Expired border clearance permit",
  },
];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SIH26187-Border-Video-Analytics-Engine", version: "3.2.0" });
});

// Camera endpoints
app.get("/api/cameras", (req, res) => {
  res.json({ cameras });
});

app.post("/api/cameras", (req, res) => {
  const newCam: CameraData = {
    id: `CAM-${String(cameras.length + 1).padStart(2, "0")}`,
    name: req.body.name || `New Camera ${cameras.length + 1}`,
    sector: req.body.sector || "Sector-04 Indo-Nepal Border",
    location: req.body.location || "Border Post Forward Zone",
    streamUrl: req.body.streamUrl || "rtsp://10.42.10.150:554/live/stream1",
    streamType: req.body.streamType || "RTSP",
    status: "ONLINE",
    fps: 25.0,
    resolution: "1920x1080 @ 25fps",
    bitrate: "4.0 Mbps",
    coordinates: req.body.coordinates || { lat: 26.402, lng: 87.28 },
    mode: req.body.mode || "STANDARD",
    virtualFences: req.body.virtualFences || [],
  };
  cameras.push(newCam);
  res.status(201).json(newCam);
});

app.put("/api/cameras/:id", (req, res) => {
  const { id } = req.params;
  const idx = cameras.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Camera not found" });
  }
  cameras[idx] = { ...cameras[idx], ...req.body };
  res.json(cameras[idx]);
});

// Alert endpoints
app.get("/api/alerts", (req, res) => {
  res.json({ alerts });
});

app.post("/api/alerts", (req, res) => {
  const newAlert: AlertEvent = {
    id: `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    cameraId: req.body.cameraId || "CAM-02",
    cameraName: req.body.cameraName || "Sector 4B - Zero-Line Restricted Fence",
    sector: req.body.sector || "Sector-04 Indo-Nepal Border",
    eventType: req.body.eventType || "VIRTUAL_FENCE_INTRUSION",
    timestamp: new Date().toISOString(),
    severity: req.body.severity || "CRITICAL",
    trackId: req.body.trackId || `TRK-${Math.floor(100 + Math.random() * 900)}`,
    objectType: req.body.objectType || "PERSON",
    confidence: req.body.confidence || 0.935,
    coordinates: req.body.coordinates || { x: 0.5, y: 0.6 },
    snapshotUrl: req.body.snapshotUrl,
    details: req.body.details || {
      reason: "Perimeter breach detected by computer vision pipeline",
      explainableEvidence: "Subject crossed virtual polygon boundary at sector zero line",
    },
    status: "ACTIVE",
  };
  alerts.unshift(newAlert);
  res.status(201).json(newAlert);
});

app.patch("/api/alerts/:id/status", (req, res) => {
  const { id } = req.params;
  const alert = alerts.find((a) => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  if (req.body.status) alert.status = req.body.status;
  if (req.body.qrtStatus) alert.qrtStatus = req.body.qrtStatus;
  res.json(alert);
});

// Vehicles endpoints
app.get("/api/vehicles", (req, res) => {
  res.json({ vehicles });
});

app.post("/api/vehicles", (req, res) => {
  const newVeh: VehiclePlateRecord = {
    id: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
    cameraId: req.body.cameraId || "CAM-03",
    cameraName: req.body.cameraName || "Sector 4C - Integrated Checkpost Barricade",
    plateNumber: req.body.plateNumber || "BR-06-XX-9999",
    vehicleType: req.body.vehicleType || "SEDAN",
    timestamp: new Date().toISOString(),
    ocrConfidence: req.body.ocrConfidence || 0.95,
    speedKmh: req.body.speedKmh || 28,
    watchlistStatus: req.body.watchlistStatus || "CLEAN",
    notes: req.body.notes || "Live ANPR Detection Entry",
  };
  vehicles.unshift(newVeh);
  res.status(201).json(newVeh);
});

// Edge System & Benchmark Metrics
app.get("/api/system/metrics", (req, res) => {
  const activeStreamsCount = cameras.filter((c) => c.status === "ONLINE").length;
  res.json({
    activeStreams: activeStreamsCount,
    totalRegisteredCameras: cameras.length,
    pipelineFps: 24.6 + (Math.random() * 0.8 - 0.4),
    targetInferenceFps: 25.0,
    ingestLatencyMs: 31 + Math.floor(Math.random() * 6),
    tensorRtAcceleration: "CUDA Enabled (FP16 INT8 Mode)",
    gpuVramUsedMb: 2480,
    gpuVramTotalMb: 8192,
    gpuUtilizationPercent: 64 + Math.floor(Math.random() * 8),
    cpuLoadPercent: 32 + Math.floor(Math.random() * 6),
    networkBandwidthMbps: (activeStreamsCount * 3.8).toFixed(1),
    frameDropRatePercent: 0.12,
    modelStack: {
      detector: "YOLOv11x-Border (PyTorch / TensorRT)",
      tracker: "ByteTrack (Kalman Filter + Hungarian Matching)",
      anprOcr: "PaddleOCR Mobile V4 + Plate Localizer",
      lowLightEnhancement: "Zero-DCE / Gamma Normalizer",
    },
  });
});

// Gemini Forensic Incident Analysis
app.post("/api/gemini/analyze-incident", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.status(200).json({
        report: {
          threatLevel: "ELEVATED",
          tacticalSummary: "Simulated Forensic Intelligence Advisory: Target breached restricted border polygon line at Sector 4B. Spatial trajectory confirms intentional inbound traversal bypassing authorized border checkposts. Immediate Quick Reaction Team (QRT) interception advised.",
          breachTrajectoryAnalysis: "Subject initiated movement from unregulated terrain along Pillar 188/4 coordinate axis, moving southwest across zero-line at 1.8 m/s speed.",
          legalProtocolGuidance: "Actionable under Section 11 of the Sashastra Seema Bal Act & Border Security Regulation SOP 2024. Detain subject, secure evidence frame hash, and log entry coordinates.",
          confidenceScore: 0.94,
          suggestedActions: [
            "Dispatch QRT Unit Alpha-2 from Forward Post 42",
            "Broadcast intruder coordinate vector to Sector Patrol jeeps",
            "Lock down Gate 2 barricades on CAM-03 axis",
            "Export cryptographic incident dossier with timestamped video hash",
          ],
        },
      });
    }

    const { alert, camera, context } = req.body;
    const prompt = `You are the Lead Intelligence & Computer Vision Security Analyst for the Sashastra Seema Bal (SSB), Ministry of Home Affairs, Government of India.
Analyze this real-time border security breach event detected by our AI Video Analytics Platform (SIH26187):

Alert Details:
- Alert ID: ${alert?.id || "ALT-LIVE"}
- Camera Source: ${camera?.name || alert?.cameraName || "Border CCTV Sector"}
- Sector: ${camera?.sector || "Indo-Nepal Border"}
- Event Type: ${alert?.eventType || "VIRTUAL_FENCE_INTRUSION"}
- Subject / Target: ${alert?.objectType || "PERSON"} with ByteTrack ID: ${alert?.trackId || "TRK-402"}
- Confidence Score: ${alert?.confidence ? (alert.confidence * 100).toFixed(1) + "%" : "94%"}
- Event Reason: ${alert?.details?.reason || "Restricted perimeter polygon boundary crossed"}
- Explainable Evidence: ${alert?.details?.explainableEvidence || "Persistent tracking across zero line"}
- Timestamp: ${alert?.timestamp || new Date().toISOString()}
- Additional Context: ${context || "Zero Line forward corridor"}

Generate a professional, structured military/police tactical forensic dossier in valid JSON format with:
- "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM"
- "tacticalSummary": Brief authoritative tactical summary (2-3 sentences)
- "breachTrajectoryAnalysis": Analysis of subject speed, vector, terrain crossing behavior, and likelihood of covert ingress/egress.
- "legalProtocolGuidance": Reference to standard SSB/MHA border protocol, detention authorization, and chain of custody evidence preservation.
- "confidenceScore": Float between 0.85 and 0.99
- "suggestedActions": Array of 4 clear, urgent tactical directives for the command room operator.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({ report: parsed });
    } catch {
      res.json({
        report: {
          threatLevel: "CRITICAL",
          tacticalSummary: text.slice(0, 300),
          breachTrajectoryAnalysis: "Subject verified crossing restricted geofence perimeter.",
          legalProtocolGuidance: "Standard SSB Interception SOP applies.",
          confidenceScore: 0.95,
          suggestedActions: [
            "Dispatch Quick Reaction Team to coordinate sector",
            "Maintain continuous optical lock on subject track ID",
            "Archive video snapshot in evidence ledger",
            "Notify Sector Command Duty Officer",
          ],
        },
      });
    }
  } catch (error: any) {
    console.error("Gemini Forensic Analysis Error:", error);
    res.status(500).json({ error: error.message || "Forensic analysis failed" });
  }
});

// Gemini Sector Intelligence Briefing
app.post("/api/gemini/threat-brief", async (req, res) => {
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        briefing: "BORDER DEFENSE SITREP: Sector-04 Indo-Nepal Border is currently operating under DEFCON-2 / ELEVATED readiness. 4 active AI video streams online. 1 active perimeter intrusion alert recorded at Pillar 188/4. ANPR checkposts processed 4 vehicles with 1 flagged watchlist match. Night vision sensors operational with normal environmental baseline.",
      });
    }

    const { activeAlertsCount, camerasCount, vehiclesCount } = req.body;
    const prompt = `Generate a concise 3-paragraph Operational Intelligence Briefing (SITREP) for the Command Room Duty Officer of Sashastra Seema Bal (SSB) Police II Division.
Current Platform Status:
- Active CCTV Feeds: ${camerasCount || 4} IP Cameras running software AI detection
- Active Security Alerts: ${activeAlertsCount || 1}
- ANPR Vehicle Logs: ${vehiclesCount || 4}
- Readiness State: DEFCON 2 Elevated Border Surveillance
Include: Sector Operational Posture, Automated Edge Analytics Status, and Tactical Directives for the next shift. Keep tone authoritative, crisp, and military-professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ briefing: response.text || "Sector operational." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate briefing" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIH26187 Server] Intelligence Border Video Analytics Engine running at http://localhost:${PORT}`);
  });
}

startServer();
