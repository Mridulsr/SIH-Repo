import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Users,
  Car,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon
} from "lucide-react";
import { Camera } from "../types";

interface AnalyticsViewProps {
  cameras: Camera[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ cameras }) => {
  const [selectedCameraId, setSelectedCameraId] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("22-08-2024 - 29-08-2024");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Time-series data points from 22 Aug to 29 Aug (matching Screen 6)
  const timeSeriesData = [
    { date: "22 Aug", events: 35, persons: 45, vehicles: 20 },
    { date: "23 Aug", events: 65, persons: 78, vehicles: 35 },
    { date: "24 Aug", events: 40, persons: 52, vehicles: 22 },
    { date: "25 Aug", events: 85, persons: 98, vehicles: 45 },
    { date: "26 Aug", events: 50, persons: 62, vehicles: 28 },
    { date: "27 Aug", events: 90, persons: 110, vehicles: 52 },
    { date: "28 Aug", events: 70, persons: 88, vehicles: 40 },
    { date: "29 Aug", events: 128, persons: 145, vehicles: 68 },
  ];

  // Donut chart distribution categories (matching Screen 6)
  const distributionData = [
    { label: "Intrusion", percentage: 50, color: "#ef4444", count: 64 },
    { label: "Person", percentage: 20, color: "#10b981", count: 26 },
    { label: "Vehicle", percentage: 20, color: "#06b6d4", count: 26 },
    { label: "Other", percentage: 10, color: "#f59e0b", count: 12 },
  ];

  // Generate SVG Path for Area Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;
  const maxVal = 140;

  const points = timeSeriesData.map((d, i) => {
    const x = paddingX + (i / (timeSeriesData.length - 1)) * chartW;
    const y = svgHeight - paddingY - (d.events / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Date,Total Events,Persons Detected,Vehicles Detected\n" +
      timeSeriesData.map(e => `${e.date},${e.events},${e.persons},${e.vehicles}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIH_Analytics_${dateRange.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Filter Bar (Matching Screen 6 in image) */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Cameras</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-48 font-mono"
            />
          </div>
        </div>

        {/* Green Export button */}
        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards (Matching Screen 6 in image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Events */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400">Total Events</div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-white font-mono">128</div>
            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12%</span>
            </div>
          </div>
        </div>

        {/* Total Persons */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400">Total Persons</div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-white font-mono">245</div>
            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>15%</span>
            </div>
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400">Total Vehicles</div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-white font-mono">89</div>
            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>8%</span>
            </div>
          </div>
        </div>

        {/* Intrusions */}
        <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/90 shadow-lg">
          <div className="text-xs font-semibold text-slate-400">Intrusions</div>
          <div className="flex items-baseline justify-between mt-1">
            <div className="text-2xl font-bold text-white font-mono">16</div>
            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-red-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Split: Events Over Time + Event Distribution (Matching Screen 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Events Over Time Line/Area Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-100">Events Over Time</h3>
            <span className="text-xs font-mono text-emerald-400">22 Aug – 29 Aug</span>
          </div>

          {/* SVG Area Chart */}
          <div className="w-full h-64 relative my-2">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[20, 40, 60, 80, 100, 120].map((val) => {
                const y = svgHeight - paddingY - (val / maxVal) * chartH;
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Line stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint === i ? 6 : 3.5}
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth={hoveredPoint === i ? "3" : "2"}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer transition-all"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 10}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.date}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint !== null && (
              <div
                className="absolute p-2 rounded-lg bg-slate-950 border border-emerald-500/40 text-xs font-mono shadow-xl pointer-events-none z-10"
                style={{
                  left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
                  top: `${(points[hoveredPoint].y / svgHeight) * 100 - 35}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="font-bold text-white">{points[hoveredPoint].date}</div>
                <div className="text-emerald-400">Events: {points[hoveredPoint].events}</div>
                <div className="text-cyan-400">Persons: {points[hoveredPoint].persons}</div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Peak Day: 29 Aug (128 Events)</span>
            <span className="text-emerald-400">Mean Anomaly Index: 0.04 (Normal)</span>
          </div>
        </div>

        {/* Right: Event Distribution Donut Chart (Matching Screen 6) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-100">Event Distribution</h3>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center py-4 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* 50% Intrusion (Red) -> strokeDasharray 50 50 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="14"
                  strokeDasharray="50 50"
                  strokeDashoffset="0"
                />
                {/* 20% Vehicle (Cyan) -> strokeDasharray 20 80 offset -50 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="14"
                  strokeDasharray="20 80"
                  strokeDashoffset="-50"
                />
                {/* 20% Person (Emerald) -> strokeDasharray 20 80 offset -70 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="20 80"
                  strokeDashoffset="-70"
                />
                {/* 10% Other (Amber) -> strokeDasharray 10 90 offset -90 */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="14"
                  strokeDasharray="10 90"
                  strokeDashoffset="-90"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-white">100%</span>
                <span className="text-[10px] uppercase font-mono text-slate-400">Classified</span>
              </div>
            </div>
          </div>

          {/* Legend Matching Screen 6 */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            {distributionData.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-slate-300 font-medium">{d.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400">{d.count} evt</span>
                  <span className="font-mono font-bold text-white">{d.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
