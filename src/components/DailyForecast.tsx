import { Calendar } from "lucide-react";
import { WeatherData } from "../types";
import { calculateTempProgress, getWeatherIcon } from "../utils/weatherHelpers";

interface DailyForecastProps {
  weather: WeatherData;
}

export default function DailyForecast({ weather }: DailyForecastProps) {
  // Find global min and max temperatures across the week to normalize the visual ranges
  const minTemps = weather.daily.map(d => d.tempNight);
  const maxTemps = weather.daily.map(d => d.tempDay);
  const globalMin = Math.min(...minTemps);
  const globalMax = Math.max(...maxTemps);

  return (
    <div
      id="daily-forecast-module"
      className="p-3 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl"
    >
      <div>
        <div className="flex items-center space-x-2 text-slate-400 mb-1.5">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">5-Day Forecast</span>
        </div>

        <div className="space-y-0" id="daily-items-list">
          {weather.daily.map((item, index) => {
            const Icon = getWeatherIcon(item.condition);
            const { left, width } = calculateTempProgress(item.tempNight, item.tempDay);

            return (
              <div
                key={index}
                id={`daily-day-${index}`}
                className="grid grid-cols-12 items-center gap-1 py-0 border-b border-white/5 last:border-none group hover:bg-white/[0.01] px-2 rounded-lg transition-all duration-200"
              >
                {/* 1. Day selector Name */}
                <span className="col-span-3 text-xs font-semibold font-display text-white">
                  {item.day}
                </span>

                {/* 2. Condition Icon / Cloud precipitation probability */}
                <div className="col-span-3 flex items-center space-x-1.5">
                  <Icon
                    className="h-3.5 w-3.5 text-slate-300 stroke-[1.8]
    group-hover:scale-110 transition-transform duration-300"
                  />

                  <span className="text-[9px] font-bold font-mono text-cyan-400 leading-none min-w-[28px]">
                    {item.precipChance > 0 ? `${item.precipChance}%` : "0%"}
                  </span>
                </div>

                {/* 3. Night temperature */}
                <span className="col-span-1 text-xs font-semibold font-mono text-slate-400 text-right">
                  {item.tempNight}°
                </span>

                {/* 4. Apple-style Visual Horizontal Temperature bar */}
                <div className="col-span-4 px-1.5 relative py-0.5">
                  <div className="h-1 w-full bg-white/5 rounded-full relative overflow-hidden border border-white/5">
                    {/* Render relative visual gradient strip indicating temperatures */}
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-orange-400 opacity-80"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`
                      }}
                    />
                  </div>
                </div>

                {/* 5. Day temperature */}
                <span className="col-span-1 text-xs font-bold font-mono text-white text-right">
                  {item.tempDay}°
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 pt-1.5 border-t border-white/5 text-center">
        <span className="text-[10px] text-slate-500 font-mono">
          Average humidity: {weather.daily.length > 0 ? Math.round(weather.daily.reduce((acc, curr) => acc + (curr.humidity || 50), 0) / weather.daily.length) : 0}%
        </span>
      </div>
    </div>
  );
}
