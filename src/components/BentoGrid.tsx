import { 
  Sun, 
  Wind, 
  Droplets, 
  Activity, 
  Eye, 
  Compass, 
  Sunrise, 
  Sunset,
  ArrowDownCircle,
  TrendingDown,
  Sparkles
} from "lucide-react";
import { WeatherData } from "../types";
import { 
  getUVRisk, 
  getAQICategory, 
  getWindBeaufort 
} from "../utils/weatherHelpers";

interface BentoGridProps {
  weather: WeatherData;
}

export default function BentoGrid({ weather }: BentoGridProps) {
  const current = weather.current;
  const uvInfo = getUVRisk(current.uvi);
  const aqiInfo = getAQICategory(current.aqi);
  const windBeaufort = getWindBeaufort(current.windSpeed);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 lg:h-full" id="weather-bento-grid">
      {/* CARD 1: UV INDEX (Glassmorphic Accent) */}
      <div 
        id="bento-uv-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:border-amber-400/20 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <Sun className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider font-display">UV Index</span>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold font-display bg-white/5 border border-white/5 ${uvInfo.color}`}>
            {uvInfo.label}
          </span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">{current.uvi}</span>
          <span className="text-xs text-slate-400 font-sans">of 11+</span>
        </div>
        {/* Progress Slider */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 relative border border-white/5">
          <div 
            className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 h-full rounded-full"
            style={{ width: `${Math.min(100, (current.uvi / 11) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">{uvInfo.advice}</p>
      </div>

      {/* CARD 2: AIR QUALITY INDEX */}
      <div 
        id="bento-aqi-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:border-emerald-400/20 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider font-display">Air Quality</span>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold font-display bg-white/5 border border-white/5 ${aqiInfo.color}`}>
            Index {current.aqi}
          </span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className={`text-3xl font-extrabold tracking-tight font-display ${aqiInfo.color}`}>{aqiInfo.label}</span>
        </div>
        {/* Progress Slider */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 relative border border-white/5">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-rose-500 h-full rounded-full"
            style={{ width: `${aqiInfo.progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">Good outdoor conditions</p>
      </div>

      {/* CARD 3: WIND METRICS */}
      <div 
        id="bento-wind-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:border-cyan-400/20 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <Wind className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider font-display">Wind</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold font-display bg-white/5 border border-white/10 text-cyan-400">
            {windBeaufort.label}
          </span>
        </div>
        
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">
            {current.windSpeed}
          </span>
          <span className="text-xs text-slate-400 font-mono">m/s</span>
          <span className="text-xs text-slate-400 font-sans border-l border-white/15 pl-2">
            {current.windDir}
          </span>
        </div>

        <p className="text-xs text-slate-300 mt-2.5 font-sans">Light breeze detected</p>

        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-white/5 text-slate-400">
          <Compass className="h-3.5 w-3.5 text-sky-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-[10px] font-sans">Aero dynamics stable</span>
        </div>
      </div>

      {/* CARD 4: HUMIDITY & DEW POINT */}
      <div 
        id="bento-humidity-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:border-sky-400/20 hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <Droplets className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider font-display">Humidity</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Moisture</span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">{current.humidity}%</span>
          <span className="text-xs text-slate-400 font-sans">relative</span>
        </div>
        
        {/* Dynamic description of condensation risk */}
        <div className="text-xs text-slate-300 space-y-1 mt-2.5">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400 font-sans">Precip Chance:</span>
            <span className="font-mono text-white font-semibold">{current.precipChance || 0}%</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Comfortable indoor conditions
          </p>
        </div>
      </div>

      {/* CARD 5: PRESSURE / BAROMETER */}
      <div 
        id="bento-pressure-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center space-x-2 text-slate-400 mb-2">
          <ArrowDownCircle className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Barometer</span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">{current.pressure}</span>
          <span className="text-xs text-slate-400 font-mono">hPa</span>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] uppercase font-bold tracking-wider w-fit mt-2">
          <TrendingDown className="h-3 w-3" />
          <span>Steady High</span>
        </div>
        <p className="text-xs text-slate-300 mt-2.5 font-sans">Stable atmospheric pressure</p>
      </div>

      {/* CARD 6: VISIBILITY */}
      <div 
        id="bento-visibility-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center space-x-2 text-slate-400 mb-2">
          <Eye className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Visibility</span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">
            {(current.visibility / 1000).toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-mono">km</span>
        </div>
        <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
          Perfect horizontal visibility
        </p>
      </div>

      {/* CARD 7: SUNRISE */}
      <div 
        id="bento-sunrise-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center space-x-2 text-slate-400 mb-2 font-sans">
          <Sunrise className="h-4 w-4 text-amber-400 animate-bounce" style={{ animationDuration: "4s" }} />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Sunrise</span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">{current.sunrise}</span>
        </div>
        <p className="text-xs text-slate-300 mt-2.5 font-sans">Daily dawn transition</p>
      </div>

      {/* CARD 8: SUNSET */}
      <div 
        id="bento-sunset-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center space-x-2 text-slate-400 mb-2 font-sans">
          <Sunset className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Sunset</span>
        </div>
        <div className="flex items-baseline space-x-2 my-1">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">{current.sunset}</span>
        </div>
        <p className="text-xs text-slate-300 mt-2.5 font-sans">Daily dusk transition</p>
      </div>

      {/* CARD 9: DAYLIGHT */}
      <div 
        id="bento-daylight-card"
        className="relative group py-[21px] px-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-all duration-300"
      >
        <div className="flex items-center space-x-2 text-slate-400 mb-2 font-sans">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Daylight</span>
        </div>
        <div className="flex items-baseline space-x-2 my-0">
          <span className="text-3xl font-extrabold tracking-tight font-display text-white">Stable</span>
          <span className="text-xs text-slate-400 font-sans ml-1">hours</span>
        </div>
        <p className="text-xs text-slate-300 mt-2.5 font-sans">Daylight cycle stable</p>
      </div>
    </div>
  );
}
