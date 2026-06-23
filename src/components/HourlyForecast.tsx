import { Clock } from "lucide-react";
import { useState } from "react";
import { WeatherData } from "../types";
import { getWeatherIcon } from "../utils/weatherHelpers";

interface HourlyForecastProps {
  weather: WeatherData;
}

export default function HourlyForecast({ weather }: HourlyForecastProps) {
  const currentHour = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState(0);
  return (
    <div
      id="hourly-forecast-module"
      className="p-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl w-full max-w-full"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider font-display">Hourly Forecast</span>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 border-white/10">
          24h cycle
        </span>
      </div>

      {/* Horizontal Scroll Layout with custom styling */}
      <div
        id="hourly-scroll-wrapper"
        className="w-full overflow-x-auto pb-4 lg:overflow-x-hidden"
      >
        <div
          id="hourly-scroll-container"
          className="flex gap-6.5 snap-x w-max"
        >
          {weather.hourly.map((item, index) => {
            const Icon = getWeatherIcon(item.condition);
            const isSelected = index === selectedHour;
            return (
              <div
                key={index}
                id={`hourly-item-${index}`}
                onClick={() => setSelectedHour(index)}
                className={`flex-none shrink-0 w-[72px] snap-align-start p-2 rounded-xl border text-center transition-all duration-300 cursor-pointer ${isSelected
                  ? "bg-gradient-to-b from-white/10 to-white/[0.02] border-white/10 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
                  : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]"
                  }`}
              >
                {/* Hourly Time label */}
                <p className={`text-[10px] font-medium font-sans mb-1 ${isSelected ? "text-cyan-300 font-semibold" : "text-slate-400"}`}>
                  {item.time}
                </p>
                {/* Dynamic Icon */}
                {/* Dynamic Icon */}
                <div className="my-1.5 flex justify-center">
                  <Icon className={`h-5 w-5 stroke-[1.8] ${isSelected ? "text-white scale-110 drop-shadow-md" : "text-slate-300"}
                      ${isSelected ? "animate-pulse" : ""}`} />
                </div>


                {/* Temperature */}
                <p className="text-sm font-bold font-display text-white mb-0.5">
                  {item.temp}°
                </p>

                {/* Precipitation Chance */}
                <p className="text-[9px] font-mono text-cyan-400 font-bold">
                  {item.precipChance}%
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
