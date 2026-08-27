export type StreamType = "RTSP" | "DEMO_FEED" | "IP_CAM";
export type CameraStatus = "ONLINE" | "DEGRADED" | "OFFLINE";
export type CameraMode = "STANDARD" | "RESTRICTED_FENCE" | "ANPR_CHECKPOST" | "NIGHT_THERMAL";
export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type LightingEnvironment =
  | "DAY_BRIGHT"
  | "DAY_OVERCAST"
  | "DUSK_GOLDEN"
  | "NIGHT_IR"
  | "NIGHT_VISION_GREEN"
  | "THERMAL_WHITE_HOT"
  | "THERMAL_IRONBOW"
  | "RAIN_MONSOON"
  | "FOG_VALLEY";

export interface VirtualFence {
  id: string;
  name: string;
  type: "RESTRICTED_POLYGON" | "TRIPWIRE_LINE" | "BUFFER_ZONE";
  points: Array<{ x: number; y: number }>; // Normalized 0..1 coordinates
  severity: SeverityLevel;
  direction: "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
  active: boolean;
}

export interface Camera {
  id: string;
  name: string;
  properName?: string;
  sector: string;
  location: string;
  outpostCode?: string;
  streamUrl: string;
  streamType: StreamType;
  status: CameraStatus;
  fps: number;
  resolution: string;
  bitrate: string;
  coordinates: { lat: number; lng: number };
  mgrs?: string;
  elevation?: string;
  lightingEnvironment?: LightingEnvironment;
  sensorType?: string;
  mode: CameraMode;
  virtualFences: VirtualFence[];
}

export interface DetectedTrack {
  id: string; // e.g. "TRK-402"
  label: string; // "person" | "vehicle" | "truck" | "motorcycle"
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number }; // 0..1 normalized
  velocity: { vx: number; vy: number };
  trajectory: Array<{ x: number; y: number; timestamp: number }>;
  timeInFrameSec: number;
  inRestrictedZone: boolean;
  plateNumber?: string;
  plateConfidence?: number;
  loiterDuration?: number;
}

export interface AlertEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  sector: string;
  eventType: "VIRTUAL_FENCE_INTRUSION" | "ANPR_WATCHLIST_HIT" | "NIGHT_LOITERING" | "SUSPICIOUS_TRAJECTORY" | "UNAUTHORIZED_VEHICLE";
  timestamp: string;
  severity: SeverityLevel;
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

export interface SystemMetrics {
  activeStreams: number;
  totalRegisteredCameras: number;
  pipelineFps: number;
  targetInferenceFps: number;
  ingestLatencyMs: number;
  tensorRtAcceleration: string;
  gpuVramUsedMb: number;
  gpuVramTotalMb: number;
  gpuUtilizationPercent: number;
  cpuLoadPercent: number;
  networkBandwidthMbps: string;
  frameDropRatePercent: number;
  modelStack: {
    detector: string;
    tracker: string;
    anprOcr: string;
    lowLightEnhancement: string;
  };
}

export interface ForensicReport {
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM";
  tacticalSummary: string;
  breachTrajectoryAnalysis: string;
  legalProtocolGuidance: string;
  confidenceScore: number;
  suggestedActions: string[];
}

export type NightFilterMode = "NORMAL" | "NIGHT_VISION_GREEN" | "THERMAL_WHITE_HOT" | "IRONBOW_HEATMAP";
