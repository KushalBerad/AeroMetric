import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { WeatherData } from "../types";

interface WeatherMetricsTrendsProps {
  weather: WeatherData;
}

export default function WeatherMetricsTrends({
  weather,
}: WeatherMetricsTrendsProps) {
  const [activeTab, setActiveTab] = useState<"temp" | "precip">("temp");

  // Responsive dataset for desktop / tablet / mobile
  const chartData = weather.hourly.map((h) => ({
    time: h.time,
    Temperature: h.temp,
    Precipitation: h.precipChance,
  }));
  const screenWidth =
    typeof window !== "undefined" ? window.innerWidth : 1440;

  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;

  return (
    <div
      id="trends-module"
      className="p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2 text-slate-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">
            Climatic Trends Analysis
          </span>
        </div>

        {/* Tab Controllers */}
        <div className="flex flex-nowrap overflow-x-auto sm:overflow-visible bg-white/5 border border-white/5 p-1 rounded-xl w-full sm:w-auto gap-1">
          <button
            type="button"
            id="tab-btn-temp"
            onClick={() => setActiveTab("temp")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${activeTab === "temp"
              ? "bg-white/10 text-white shadow-md font-display"
              : "text-slate-400 hover:text-white"
              }`}
          >
            <span className="hidden sm:inline">
              Hourly Temperature (°C)
            </span>
            <span className="sm:hidden">
              Temperature
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-precip"
            onClick={() => setActiveTab("precip")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${activeTab === "precip"
              ? "bg-white/10 text-cyan-400 shadow-md font-display"
              : "text-slate-400 hover:text-cyan-400"
              }`}
          >
            <span className="hidden sm:inline">
              Precipitation Probability (%)
            </span>
            <span className="sm:hidden">
              Precipitation %
            </span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div
        className="h-44 sm:h-52 lg:h-56 w-full min-w-0"
        id="trends-chart-canvas"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 5,
              left: -15,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={8}
              interval={
                isMobile
                  ? "preserveStartEnd"   // mobile = few labels
                  : isTablet
                    ? 1                   // tablet = every second label (~6)
                    : 0                   // desktop = all labels
              }
              minTickGap={
                isMobile
                  ? 35
                  : isTablet
                    ? 20
                    : 10
              }
            />

            <YAxis
              stroke="#64748b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dx={0}
              width={28}
              domain={activeTab === "temp" ? ["auto", "auto"] : [0, 100]}
              tickFormatter={(val) =>
                activeTab === "temp" ? `${val}°` : `${val}%`
              }
            />

            <Tooltip
              wrapperStyle={{
                fontSize: "10px",
                maxWidth: "140px"
              }}
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "6px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
              }}
              labelStyle={{
                color: "#94a3b8",
                fontFamily: "Space Grotesk",
                fontSize: "11px",
                fontWeight: "bold",
              }}
              itemStyle={{
                color: "#f8fafc",
                fontFamily: "Inter",
                fontSize: "12px",
              }}
            />

            {activeTab === "temp" ? (
              <Area
                type="monotone"
                dataKey="Temperature"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTemp)"
              />
            ) : (
              <Area
                type="monotone"
                dataKey="Precipitation"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrecip)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center mt-4 justify-center px-2">
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-sans text-center leading-relaxed">
          Live weather trends based on current atmospheric conditions.
        </span>
      </div>
    </div>
  );
}