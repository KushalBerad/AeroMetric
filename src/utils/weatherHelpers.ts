import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle, 
  LucideIcon 
} from "lucide-react";

export function getWeatherIcon(condition: string): LucideIcon {
  const cond = condition.toLowerCase();
  if (cond.includes("clear") || cond.includes("sun")) return Sun;
  if (cond.includes("thunder") || cond.includes("lightning") || cond.includes("storm")) return CloudLightning;
  if (cond.includes("snow") || cond.includes("ice") || cond.includes("freeze")) return CloudSnow;
  if (cond.includes("drizzle") || cond.includes("haze") || cond.includes("mist")) return CloudDrizzle;
  if (cond.includes("rain") || cond.includes("shower")) return CloudRain;
  return Cloud; // Fallback to generic Clouds
}

export function getWeatherTheme(condition: string) {
  const cond = condition.toLowerCase();
  
  if (cond.includes("clear") || cond.includes("sun")) {
    return {
      textColor: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/20",
      glowColor: "shadow-amber-400/10",
      shadow: "shadow-amber-500/20",
    };
  }
  
  if (cond.includes("thunder") || cond.includes("lightning") || cond.includes("storm")) {
    return {
      textColor: "text-indigo-400",
      bgColor: "bg-indigo-400/10",
      borderColor: "border-indigo-400/20",
      glowColor: "shadow-indigo-400/10",
      shadow: "shadow-indigo-500/20",
    };
  }

  if (cond.includes("snow") || cond.includes("ice")) {
    return {
      textColor: "text-sky-200",
      bgColor: "bg-sky-200/10",
      borderColor: "border-sky-200/20",
      glowColor: "shadow-sky-200/10",
      shadow: "shadow-sky-300/20",
    };
  }

  if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle")) {
    return {
      textColor: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
      glowColor: "shadow-cyan-400/10",
      shadow: "shadow-cyan-500/20",
    };
  }

  // DEFAULT SUNSET & CLOUDS
  return {
    textColor: "text-slate-300",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/15",
    glowColor: "shadow-slate-400/5",
    shadow: "shadow-slate-500/10",
  };
}

export function getAQICategory(score: number) {
  switch (score) {
    case 1:
      return { label: "Good", color: "text-emerald-400", progress: 20, advice: "Good outdoor conditions" };
    case 2:
      return { label: "Fair", color: "text-teal-400", progress: 40, advice: "Acceptable outdoor baseline" };
    case 3:
      return { label: "Moderate", color: "text-amber-400", progress: 60, advice: "Moderate outdoor conditions" };
    case 4:
      return { label: "Poor", color: "text-orange-400", progress: 80, advice: "Slight ambient throat strain" };
    case 5:
      return { label: "Very Poor", color: "text-rose-500", progress: 100, advice: "Heavy outdoor dust presence" };
    default:
      return { label: "Moderate", color: "text-amber-400", progress: 50, advice: "Stable ambient environment" };
  }
}

export function getUVRisk(uvi: number) {
  if (uvi <= 2) return { label: "Low", color: "text-emerald-400", advice: "Minimal sun exposure risks" };
  if (uvi <= 5) return { label: "Moderate", color: "text-amber-400", advice: "Apply SPF 15+ sunscreen protection" };
  if (uvi <= 7) return { label: "High", color: "text-orange-400", advice: "Seek shade during peak daylight" };
  if (uvi <= 10) return { label: "Very High", color: "text-rose-400", advice: "Wear full protective eye-gear" };
  return { label: "Extreme", color: "text-purple-400", advice: "Stay indoors under shelter" };
}

export function getWindBeaufort(speed: number) {
  if (speed < 1.5) return { label: "Calm", desc: "No noticeable breeze" };
  if (speed < 5.5) return { label: "Breeze", desc: "Gentle leaves rustling" };
  if (speed < 10.8) return { label: "Moderate", desc: "Small branches move" };
  if (speed < 17.2) return { label: "Strong", desc: "Difficult to use umbrella" };
  return { label: "Gale", desc: "High aerodynamic traction! Seek safety" };
}

/**
 * Calculates current temperature offset of current relative to a min/max temperature span
 * for custom horizontal indicator bands.
 */
export function calculateTempProgress(min: number, max: number, current?: number) {
  const span = max - min;
  if (span <= 0) return { left: 0, width: 100, dotLeft: 0 };
  
  // Calculate relative widths across a standard weekly min/max (e.g., -10 to 45)
  const minLimit = -5;
  const maxLimit = 40;
  const totalRange = maxLimit - minLimit;
  
  const left = Math.max(0, Math.min(100, ((min - minLimit) / totalRange) * 100));
  const width = Math.max(20, Math.min(100 - left, (span / totalRange) * 100));
  
  let dotLeft = 0;
  if (current !== undefined) {
    dotLeft = Math.max(0, Math.min(100, ((current - min) / span) * 100));
  }
  
  return { left, width, dotLeft };
}
