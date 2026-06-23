import { useState, useEffect } from "react";
import {
  CloudRain,
  MapPin,
  Loader2,
  AlertTriangle,
  Clock,
  Wind,
  VolumeX,
  HelpCircle,
  TrendingUp,
  Award,
  Thermometer,
  CloudLightning,
  RefreshCw
} from "lucide-react";
import WeatherBackground from "./components/WeatherBackground";
import CitySearch from "./components/CitySearch";
import BentoGrid from "./components/BentoGrid";
import HourlyForecast from "./components/HourlyForecast";
import DailyForecast from "./components/DailyForecast";
import WeatherMetricsTrends from "./components/WeatherMetricsTrends";
import ClimateAssistant from "./components/ClimateAssistant";
import InteractiveWeatherScene from "./components/InteractiveWeatherScene";
import { WeatherData, FavoriteCity } from "./types";
import { getWeatherIcon, getWeatherTheme } from "./utils/weatherHelpers";

export default function App() {
  const [city, setCity] = useState("New York");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("09:58");

  // Load weather statistics based on city or location coordinates
  const fetchWeather = async (targetCity?: string, targetCoords?: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/weather?";
      if (targetCoords) {
        url += `lat=${targetCoords.lat}&lon=${targetCoords.lon}`;
      } else {
        const queryCity = targetCity || city;
        url += `city=${encodeURIComponent(queryCity)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to locate specified geographic system.");
      }
      const data: WeatherData = await response.json();
      setWeather(data);
      setCity(data.city); // Sync real name back if matched nearby coords

      const now = new Date();
      const mins = now.getMinutes().toString().padStart(2, "0");
      const hrs = now.getHours().toString().padStart(2, "0");
      setLastUpdatedTime(`${hrs}:${mins}`);
    } catch (err: any) {
      console.error(err);
      setError("Could not synchronise weather models. Please review connection or try searching another city.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger initial retrieval
  useEffect(() => {
    fetchWeather();
  }, []);

  // Geolocation trigger
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support Geolocation tracking.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const targetCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoords(targetCoords);
        fetchWeather(undefined, targetCoords);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location permission denied. Utilizing default New York baseline metrics instead.");
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const handleSearch = (newCity: string) => {
    setCoords(null);
    setCity(newCity);
    fetchWeather(newCity);
  };

  const handleSelectFavorite = (fav: FavoriteCity) => {
    if (fav.lat && fav.lon) {
      const targetCoords = { lat: fav.lat, lon: fav.lon };
      setCoords(targetCoords);
      fetchWeather(undefined, targetCoords);
    } else {
      setCoords(null);
      setCity(fav.city);
      fetchWeather(fav.city);
    }
  };

  // Determine dynamic weather styles
  const condition = weather?.current?.condition || "Clouds";
  const theme = getWeatherTheme(condition);
  const StatusIcon = getWeatherIcon(condition);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-white/10 select-none pb-4 transition-colors duration-1000">
      {/* 1. Dynamic Animated weather background */}
      <WeatherBackground condition={condition} />

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-4 relative z-10">

        {/* TOP BRAND HUD HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-4 gap-4" id="master-hud-header">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${theme.bgColor} ${theme.textColor} border ${theme.borderColor}`}>
              <StatusIcon className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight font-display text-white">
                AERO<span className="text-cyan-400">METRIC</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Precision Atmospheric Terminal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping"></span>
              <span>Last Updated {lastUpdatedTime}</span>
            </div>
            {/* Quick Refresh Icon */}
            <button
              id="header-btn-refresh"
              onClick={() => fetchWeather(city, coords || undefined)}
              disabled={loading}
              title="Refresh climate dataset"
              className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl animate-pulse" id="error-banner">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs font-semibold font-sans">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs underline font-semibold font-display hover:text-rose-300 ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Panel Section */}
        <section className="bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-3xl p-5" id="search-section">
          <CitySearch
            onSearch={handleSearch}
            onGeolocate={handleGeolocate}
            currentCity={city}
            isSearching={loading}
            onSelectFavorite={handleSelectFavorite}
          />
        </section>

        {/* LOADING SHIMMER PORT */}
        {loading && !weather ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-4" id="weather-initial-loader">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
            <p className="text-xs font-semibold font-mono text-slate-400 tracking-wider">Acquiring atmospheric microclimate fields...</p>
          </div>
        ) : weather ? (
          <div className="space-y-4" id="weather-dashboard-manifest">

            {/* HERO SECTION / CURRENT TEMPERATURE & CLIMATE */}
            <section
              id="hero-weather-showcase"
              className="relative overflow-hidden p-6 sm:p-8 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Highlight Background Glow Accent */}
              <div className={`absolute -right-[10%] top-[10%] w-[320px] h-[320px] rounded-full filter blur-[120px] opacity-15 pointer-events-none bg-indigo-500`} />

              <div className="space-y-4 relative z-10 w-full md:max-w-2xl">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <MapPin className="h-5 w-5 text-rose-400 animate-bounce" />
                  <span className="text-xl font-bold tracking-tight font-display text-white">{weather.city}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/5 border border-white/5 text-slate-400">
                    {weather.country}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white font-display">
                    {weather.current.temp}
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">°C</span>
                  <div className="ml-4 border-l border-white/10 pl-4">
                    <p className="text-sm font-semibold capitalize font-sans text-slate-200">
                      {weather.current.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs">
                      <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono text-slate-400">
                        Min: {weather.current.tempMin}°C
                      </span>
                      <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono text-slate-400">
                        Max: {weather.current.tempMax}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured Sub-Metrics Bar (No empty vertical spacing, compact) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Feels Like</span>
                    <span className="text-sm font-bold text-white font-sans">{weather.current.feelsLike}°C</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Humidity</span>
                    <span className="text-sm font-bold text-white font-sans">{weather.current.humidity}%</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Wind Speed</span>
                    <span className="text-sm font-bold text-white font-sans">{weather.current.windSpeed} m/s</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Pressure</span>
                    <span className="text-sm font-bold text-white font-sans">{weather.current.pressure} hPa</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Theme Weather Hero Status Logo with Ambient Scene - Resolves spacing nicely */}
              <div className="flex flex-col items-center md:items-end text-center md:text-right w-full md:w-auto relative z-10">
                <InteractiveWeatherScene condition={weather.current.condition} />
                <p className={`text-sm font-bold font-display uppercase tracking-widest mt-2 ${theme.textColor}`}>
                  {weather.current.condition}
                </p>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Retrieved today</p>
              </div>
            </section>

            {/* Smart Insights & Alert HUD Row */}
            {weather.insights.alert && (
              <div
                id="hud-environmental-alert"
                className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center space-x-3.5"
              >
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <CloudLightning className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider font-display">Environmental Advisory</p>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{weather.insights.alert}</p>
                </div>
              </div>
            )}

            {/* MAIN FORECAST LAYOUT GRID */}
            <div className="space-y-4">

              {/* Row 1: Hourly Forecast (Full-width detailed bar) */}
              <HourlyForecast weather={weather} />

              {/* Row 2: Two-Column Layout (7-Day Forecast & AI Companion (Left) / Metrics Grid (Right)) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Column 1: Daily 7 Day Forecast & Climate AI Companion directly below it */}
                <div className="lg:col-span-1 space-y-4">
                  <DailyForecast weather={weather} />
                  <ClimateAssistant weather={weather} />
                </div>

                {/* Column 2: Compact 3x3 Symmetrical Metric Grid (including Sunrise, Sunset, Daylight) */}
                <div className="lg:col-span-2 lg:h-full">
                  <BentoGrid weather={weather} />
                </div>
              </div>

              {/* Row 3: Full Screen Climatic Trends Graph */}
              <div className="w-full">
                <WeatherMetricsTrends weather={weather} />
              </div>

            </div>

          </div>
        ) : (
          <div className="p-16 text-center border border-white/5 bg-white/[0.02] rounded-3xl" id="nodata-card">
            <p className="text-sm font-semibold font-mono text-slate-400">Search for a location above to initialize atmospheric fields.</p>
          </div>
        )}

      </main>

      {/* FOOTER METRICS SUMMARY */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-white/5 text-center text-xs text-slate-500">
        <p className="font-sans">
          © 2026 AeroMetric | Real-time weather intelligence
        </p>
      </footer>
    </div>
  );
}
