import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { WeatherData } from "../types";

interface ClimateAssistantProps {
  weather: WeatherData;
}

export default function ClimateAssistant({ weather }: ClimateAssistantProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateInsight() {
    if (loading) return;

    setLoading(true);

    try {
      const summary = [];

      // Current weather conditions
      const humidity = weather.current.humidity;
      const temp = weather.current.temp;
      const precip = weather.current.precipChance;
      const uv = weather.current.uvi;

      // Dynamic analysis generation
      if (humidity > 80) {
        summary.push(
          "High humidity detected. Hydration is strongly recommended."
        );
      }

      if (temp > 32) {
        summary.push(
          "Elevated temperature levels detected. Avoid prolonged afternoon exposure."
        );
      }

      if (temp < 15) {
        summary.push(
          "Cool weather conditions detected. Layered clothing is recommended."
        );
      }

      if (precip > 40) {
        summary.push(
          "Rain probability is elevated. Carry umbrella if commuting."
        );
      }

      if (uv > 6) {
        summary.push(
          "UV index is relatively high. Sunscreen protection is advised."
        );
      }

      // fallback
      if (summary.length === 0) {
        summary.push(
          weather.insights.aiAdvice ||
            "Weather conditions look stable for outdoor activities."
        );
      }

      setAnalysis(summary.join(" "));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      id="climate-assistant-widget"
      className="p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl space-y-5"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 text-cyan-400">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest font-display">
          AI Weather Insights
        </span>
      </div>

      {/* Today's Analysis */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
          Today's Analysis
        </p>

        <div
          id="assistant-analysis-box"
          className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl min-h-[100px]"
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded-full animate-pulse"></div>
              <div className="h-3 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
            </div>
          ) : analysis ? (
            <p className="text-sm text-slate-200 leading-relaxed">
              {analysis}
            </p>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">
              {weather.insights.summary}
            </p>
          )}
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">
          Recommendations
        </p>

        <ul className="space-y-1 text-sm text-slate-300">
          <li>• Carry umbrella if rain probability increases</li>
          <li>• Prefer breathable clothing during humid conditions</li>
          <li>• Outdoor activity is safer during evening hours</li>
        </ul>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateInsight}
        disabled={loading}
        className="w-full py-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Refresh Insights"}
      </button>
    </div>
  );
}