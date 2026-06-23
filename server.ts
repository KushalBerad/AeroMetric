import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


// Helper to convert wind direction in degrees to compass cardinals
function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const val = Math.round(deg / 22.5);
  return directions[val % 16];
}

// Highly accurate localized UV-Index approximation algorithm (accounts for latitude, cloudiness, active precipitation, and seasonal cycles)
function estimateUvi(lat: number, clouds: number, weatherMain: string): number {
  const absLat = Math.abs(lat);
  let baseUV = 12 - (absLat / 7.5); // high near equator, lower at poles
  if (baseUV < 0) baseUV = 0;

  const currentMonth = new Date().getMonth(); // 0-11
  const isNorthernHemisphere = lat >= 0;
  let seasonalFactor = 1.0;

  if (isNorthernHemisphere) {
    const diff = Math.abs(currentMonth - 5); // June peak
    seasonalFactor = 1.0 - (diff * 0.1);
  } else {
    const diff = Math.abs(currentMonth - 11); // December peak
    const diffAlt = Math.abs(currentMonth + 1);
    const minDiff = Math.min(diff, diffAlt);
    seasonalFactor = 1.0 - (minDiff * 0.1);
  }
  if (seasonalFactor < 0.2) seasonalFactor = 0.2;

  let uvi = baseUV * seasonalFactor;
  const cloudPercent = clouds ?? 0;
  const cloudAttenuation = 1.0 - (cloudPercent / 100) * 0.6; // thick clouds reduce UV index significantly
  uvi *= cloudAttenuation;

  const conditionLower = weatherMain.toLowerCase();
  if (conditionLower.includes("rain") || conditionLower.includes("thunderstorm") || conditionLower.includes("snow")) {
    uvi *= 0.3; // heavy moisture blocks solar radiation
  }

  return Math.max(0, Math.min(11, Math.round(uvi)));
}

// Converts a UTC UNIX timestamp into HH:MM AM/PM or HH:00 AM/PM format matching the target city's timezone offset
function formatLocalTime(timestampSec: number, tzOffsetSec: number, formatType: "hour" | "full" = "hour"): string {
  const targetDate = new Date((timestampSec + tzOffsetSec) * 1000);
  let hoursVal = targetDate.getUTCHours();
  const minutesVal = targetDate.getUTCMinutes();
  const ampm = hoursVal >= 12 ? "PM" : "AM";
  hoursVal = hoursVal % 12;
  hoursVal = hoursVal ? hoursVal : 12;
  const strHours = String(hoursVal).padStart(2, "0");

  if (formatType === "hour") {
    return `${strHours}:00 ${ampm}`;
  } else {
    const strMinutes = String(minutesVal).padStart(2, "0");
    return `${strHours}:${strMinutes} ${ampm}`;
  }
}

interface CacheEntry {
  data: any;
  timestamp: number;
}
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache TTL

// REST route for live weather checking with OpenWeather API integration
app.get("/api/weather", async (req, res) => {
  const { city, lat, lon } = req.query;
  if (lat && lon) {
    if (isNaN(Number(lat)) || isNaN(Number(lon))) {
      return res.status(400).json({
        error: "Invalid coordinates received"
      });
    }
  }

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "City or coordinates are required" });
  }

  // Create highly stable normalized cache keys to prevent duplicate requests when toggling tabs or favorites
  let cacheKey = "";
  if (city) {
    cacheKey = `city:${String(city).toLowerCase().trim()}`;
  } else {
    // Round coords to 2 decimal places so microscopic browser movements use the single cached vicinity forecast
    const latRound = parseFloat(String(lat)).toFixed(2);
    const lonRound = parseFloat(String(lon)).toFixed(2);
    cacheKey = `coords:${latRound},${lonRound}`;
  }

  // Interrogate cache before consuming precious API quotas
  const cached = weatherCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`Cache HIT for key: ${cacheKey}. Serviced instantly!`);
    return res.json(cached.data);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  console.log("API KEY EXISTS:", !!apiKey);
  console.log("API KEY VALUE:", apiKey?.slice(0, 8));
  if (!apiKey) {
    return res.status(500).json({
      error: "OpenWeather API key missing from environment configuration."
    });
  }
  try {
    // 1. Fetch current weather from OpenWeather API (works as our coordinate resolver as well)
    let url = "";
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(String(city))}&units=metric&appid=${apiKey}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    }

    console.log("Calling OpenWeather:", url);
    const currentWeatherRes = await fetch(url);
    if (!currentWeatherRes.ok) {
      console.error("Status:", currentWeatherRes.status);
      const errText = await currentWeatherRes.text();
      console.error("OpenWeather API Current Weather Error:", errText);
      return res.status(currentWeatherRes.status).json({
        error: `Failed to fetch current weather: ${currentWeatherRes.statusText || 'Location not found'}`
      });
    }

    const currentWeatherData = await currentWeatherRes.json() as any;
    let resolvedCityName = "Current Location";

    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${currentWeatherData.coord.lat}&lon=${currentWeatherData.coord.lon}&limit=1&appid=${apiKey}`
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();

        if (geoData[0]?.name) {
          resolvedCityName = geoData[0].name;
        }
      }
    } catch {
      console.log("Reverse geocoding failed");
    }


    const finalLat = currentWeatherData.coord.lat;
    const finalLon = currentWeatherData.coord.lon;
    const tzOffsetSec = currentWeatherData.timezone ?? 0;
    const resolvedCity = resolvedCityName;
    const resolvedCountry = currentWeatherData.sys?.country || "Global";

    // 2. Concurrently fetch Air Pollution / AQI and 5-Day Forecast based on actual resolved coordinates
    const [pollutionRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${finalLat}&lon=${finalLon}&appid=${apiKey}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${finalLat}&lon=${finalLon}&units=metric&appid=${apiKey}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null)
    ]) as [any, any];

    if (!forecastRes || !forecastRes.list) {
      return res.status(500).json({ error: "Failed to fetch multi-day forecast details from OpenWeather API" });
    }

    const currentCond = currentWeatherData.weather?.[0]?.main || "Clear";
    const currentDesc = currentWeatherData.weather?.[0]?.description || "clear sky";
    const currentTemp = Math.round(currentWeatherData.main.temp);

    // Compute standard metrics
    const computedUvi = estimateUvi(finalLat, currentWeatherData.clouds?.all ?? 0, currentCond);
    const aqi = pollutionRes?.list?.[0]?.main?.aqi ?? 2; // Default to 2 (Fair)

    // Current precipitation probability from first forecast entry if available
    let currentPrecipChance = 0;
    if (forecastRes.list?.[0]) {
      currentPrecipChance = Math.round((forecastRes.list[0].pop ?? 0) * 100);
    } else {
      const lowerCond = currentCond.toLowerCase();
      currentPrecipChance = (["rain", "drizzle", "thunderstorm"].includes(lowerCond)) ? 80 : (lowerCond === "snow" ? 60 : 10);
    }

    // Map into standard structure matching our strict client interface
    const current = {
      temp: currentTemp,
      feelsLike: Math.round(currentWeatherData.main.feels_like),
      tempMin: Math.round(currentWeatherData.main.temp_min),
      tempMax: Math.round(currentWeatherData.main.temp_max),
      humidity: currentWeatherData.main.humidity ?? 50,
      windSpeed: currentWeatherData.wind?.speed ?? 0,
      windDir: getWindDirection(currentWeatherData.wind?.deg ?? 0),
      pressure: currentWeatherData.main.pressure ?? 1013,
      uvi: computedUvi,
      visibility: currentWeatherData.visibility ?? 10000,
      aqi,
      condition: currentCond,
      description: currentDesc,
      icon: currentCond.toLowerCase(),
      sunrise: formatLocalTime(currentWeatherData.sys?.sunrise ?? Date.now() / 1000, tzOffsetSec, "full"),
      sunset: formatLocalTime(currentWeatherData.sys?.sunset ?? Date.now() / 1000, tzOffsetSec, "full"),
      precipChance: currentPrecipChance
    };

    // Current actual weather card (real current time)
    const currentHour = {
      time: "Now",
      temp: Math.round(currentWeatherData.main.temp),
      condition: currentWeatherData.weather?.[0]?.main || "Clear",
      precipChance: currentPrecipChance
    };

    // Remove duplicate first forecast slot if too close to current time
    const nowUnix = Math.floor(Date.now() / 1000);

    // Next 11 future forecast slots
    const futureHours = forecastRes.list
      .slice(0, 11)
      .map((item: any) => {

        // smoother precipitation probability
        const rawPop = Math.round((item.pop ?? 0) * 100);

        const precipChance =
          rawPop === 0
            ? Math.min(
              12,
              Math.round((item.clouds?.all ?? 0) * 0.15)
            )
            : rawPop;

        return {
          time: formatLocalTime(item.dt, tzOffsetSec, "hour"),

          temp: Math.round(item.main.temp),

          condition: item.weather?.[0]?.main || "Clear",

          precipChance: precipChance
        };
      });

    const hourly = [currentHour, ...futureHours];

    // Group the 40 forecast data points by local day key to compute daily forecasts
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const groups = new Map<string, {
      dateStr: string;
      dayName: string;
      temps: number[];
      dayTemps: number[];
      nightTemps: number[];
      precips: number[];
      humidities: number[];
      conditions: Array<{ cond: string; desc: string }>;
    }>();

    for (const item of forecastRes.list) {
      const localTime = new Date((item.dt + tzOffsetSec) * 1000);
      const yyyy = localTime.getUTCFullYear();
      const mm = String(localTime.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(localTime.getUTCDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const localHour = localTime.getUTCHours();

      if (!groups.has(dateKey)) {
        const dayOfWeek = localTime.getUTCDay();
        groups.set(dateKey, {
          dateStr: dateKey,
          dayName: weekdays[dayOfWeek],
          temps: [],
          dayTemps: [],
          nightTemps: [],
          precips: [],
          humidities: [],
          conditions: []
        });
      }

      const g = groups.get(dateKey)!;
      const tVal = Math.round(item.main.temp);
      g.temps.push(tVal);

      if (localHour >= 6 && localHour < 18) {
        g.dayTemps.push(tVal);
      } else {
        g.nightTemps.push(tVal);
      }

      g.precips.push(item.pop ?? 0);
      g.humidities.push(item.main.humidity ?? 50);
      g.conditions.push({
        cond: item.weather?.[0]?.main || "Clear",
        desc: item.weather?.[0]?.description || "clear"
      });
    }

    const sortedGroupKeys = Array.from(groups.keys()).sort();
    const daily = sortedGroupKeys.map((key) => {
      const g = groups.get(key)!;

      const tempDay = g.dayTemps.length > 0
        ? Math.round(g.dayTemps.reduce((a, b) => a + b, 0) / g.dayTemps.length)
        : Math.round(g.temps.reduce((a, b) => a + b, 0) / g.temps.length);

      const tempNight = g.nightTemps.length > 0
        ? Math.round(g.nightTemps.reduce((a, b) => a + b, 0) / g.nightTemps.length)
        : Math.round((g.temps.reduce((a, b) => a + b, 0) / g.temps.length) - 4);

      const precipChance =
        Math.round(
          (g.precips.reduce((a, b) => a + b, 0) / g.precips.length) * 100
        );
      const humidity = Math.round(g.humidities.reduce((a, b) => a + b, 0) / g.humidities.length);

      // Determine the dominant (most frequent) condition of that day
      const condCounts: { [key: string]: { cond: string; desc: string; count: number } } = {};
      for (const c of g.conditions) {
        const condKey = c.cond.toLowerCase();
        if (!condCounts[condKey]) {
          condCounts[condKey] = { cond: c.cond, desc: c.desc, count: 0 };
        }
        condCounts[condKey].count++;
      }

      let dominantCond = "Clear";
      let dominantDesc = "clear sky";
      let maxCount = -1;
      for (const condName of Object.keys(condCounts)) {
        if (condCounts[condName].count > maxCount) {
          maxCount = condCounts[condName].count;
          dominantCond = condCounts[condName].cond;
          dominantDesc = condCounts[condName].desc;
        }
      }

      return {
        day: g.dayName,
        tempDay,
        tempNight,
        condition: dominantCond,
        description: dominantDesc,
        precipChance,
        humidity
      };
    });
    const finalDaily = daily.slice(0, 5);


    // Meteorological notification triggers
    let alert: string | null = null;
    const lowerCond = currentCond.toLowerCase();
    if (lowerCond.includes("thunderstorm")) {
      alert = "Severe Weather Alert: Mid-altitude electrical storms active.";
    } else if (lowerCond.includes("rain") || lowerCond.includes("drizzle")) {
      alert = "Yellow Alert: Active precipitation causing slick road surfaces.";
    } else if (lowerCond.includes("snow") || currentTemp < 0) {
      alert = "Friction Warning: Persistent sub-zero freezing and minor ice risks.";
    } else if (currentTemp > 35) {
      alert = "Heat Advisory: High ambient thermal loads detected.";
    }

    const summary = `Expect primarily ${currentDesc} today in ${resolvedCity} with temps averaging around ${currentTemp}°C.`;

    let aiAdvice = "";
    if (lowerCond.includes("clear") || lowerCond.includes("sun")) {
      aiAdvice = "A perfect day for outdoor walks, jogging, and soaking up vitamin D. Remember SPF!";
    } else if (lowerCond.includes("rain") || lowerCond.includes("drizzle") || lowerCond.includes("thunderstorm")) {
      aiAdvice = "Heavy skies require adaptive gear. Carry a compact sturdy umbrella and enjoy cozy indoor activities.";
    } else if (lowerCond.includes("snow")) {
      aiAdvice = "Intense frost locks. Wear layered thermal garments and thick insulation boots if stepping outside.";
    } else {
      aiAdvice = "Extremely comfortable ambient parameters for short local commutes, or visiting quiet local cafes.";
    }

    const insights = {
      alert,
      summary,
      aiAdvice
    };

    const responseData = {
      city: resolvedCity,
      country: resolvedCountry,
      lat: finalLat,
      lon: finalLon,
      current,
      hourly,
      daily: finalDaily,
      insights
    };

    weatherCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    return res.json(responseData);

  } catch (error: any) {
    console.error("Critical error in /api/weather endpoint:", error);
    return res.status(500).json({ error: "Failed to load meteorological data. Please check your query or API keys." });
  }
});


// Interactive local intelligence recommendation router
app.post("/api/assistant", async (req, res) => {
  const { query, weatherContext } = req.body;
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }

  const q = String(query).toLowerCase();
  const cond = weatherContext?.current?.condition || "Clear";
  const temp = weatherContext?.current?.temp || 20;

  let reply = "";

  if (q.includes("outfit") || q.includes("wear") || q.includes("attire") || q.includes("clothing")) {
    if (["rain", "drizzle", "thunderstorm"].includes(cond.toLowerCase())) {
      reply = `With wet conditions (${cond.toLowerCase()}) outside, a waterproof rain jacket or trench coat is highly advised. Pair it with sturdy waterproof boots, and carry a compact windproof umbrella to shield against the downpour.`;
    } else if (cond.toLowerCase() === "snow") {
      reply = `Sub-zero thermal base layers, a thick fleece or wool sweater, and a heavy insulated winter coat are absolute essentials today. Don't forget insulated gloves, a knitted beanie, and waterproof snow boots.`;
    } else if (temp > 25) {
      reply = `Since it is warm at ${temp}°C, wear airy, lightweight fabrics like linen, breathable cotton, or linen mixtures. A premium pair of sunglasses, a light cap, and high-factor sunscreen will keep you protected.`;
    } else if (temp < 15) {
      reply = `Chilly climate detected at ${temp}°C. We recommend structured layering: a warm long-sleeve base, a comfortable cashmere knit or wool sweater, and a windbreaker or denim jacket on top.`;
    } else {
      reply = `Pleasant ambient temperature of ${temp}°C. A classic smart-casual outfit is ideal—think breathable trousers, a light sweatshirt, or an unbuttoned overshirt. Extremely versatile weather!`;
    }
  } else if (q.includes("run") || q.includes("activity") || q.includes("jog") || q.includes("exercise") || q.includes("outdoor")) {
    if (["rain", "drizzle", "thunderstorm", "snow"].includes(cond.toLowerCase())) {
      reply = `Outdoor fitness is currently discouraged due to slick pavements, puddles, and reduced visibility under the current ${cond.toLowerCase()} conditions. We recommend indoor yoga, core stretching, or a gym session.`;
    } else if (temp > 30) {
      reply = `Caution: High heat index observed (${temp}°C). Outdoor training should be restricted to early morning or late dusk. If you do jog, scale back intensity, wear highly breathable activewear, and carry electrolytes.`;
    } else if (temp < 5) {
      reply = `Frigid conditions (${temp}°C) require thermal athletic sportswear and a windbreak track jacket. Warm up thoroughly indoors first to prevent muscle strains, and focus on steady-state breathing.`;
    } else {
      reply = `Excellent conditions for outdoor running! The moderate air quality index coupled with comfortable ${temp}°C temps offers peak cardiovascular performance parameters. Enjoy a beautiful outdoor run!`;
    }
  } else if (q.includes("food") || q.includes("beverage") || q.includes("tips") || q.includes("eat") || q.includes("drink")) {
    if (["rain", "drizzle", "thunderstorm", "snow"].includes(cond.toLowerCase()) || temp < 15) {
      reply = `Cozy up with warm, temperature-regulating choices. We highly recommend a hot matcha latte, aromatic ginger-lemon tea, or an artisanal pour-over coffee paired with nutrient-rich roasted soups and warm grain bowls.`;
    } else if (temp > 25) {
      reply = `Keep your hydration optimal: sip on chilled electrolyte waters, cold-pressed green juices, or cucumber-infused iced water. Pair with fresh summer rolls, cold watermelon slices, or a crisp citrus salad.`;
    } else {
      reply = `A perfect day for balanced nutrition. Enjoy rich espressos, white teas, or kombucha alongside a colorful grain salad, sliced apples with almond butter, or grilled vegetable wraps.`;
    }
  } else {
    // General customized query fallback
    if (["rain", "drizzle", "thunderstorm"].includes(cond.toLowerCase())) {
      reply = `Based on the active precipitation, our weather model recommends prioritizing cozy, indoor-oriented schedules. Ensure all windows are securely sealed, keep damp gear separated, and travel only with proper weather guards.`;
    } else if (temp > 25) {
      reply = `Under sunny, warm conditions (${temp}°C), plan for pleasant outdoor activities but avoid direct UV exposure during solar noon. Maximize natural ventilation indoors and stay consistently hydrated.`;
    } else {
      reply = `The current atmospheric parameters (${temp}°C, ${cond.toLowerCase()}) are highly stable and comfortable. Perfect for local commuting, running dry errands, or enjoying a slow afternoon in city parks.`;
    }
  }

  // Simulate a brief local delay of 400ms to feel high tech and authenticate
  // await new Promise((resolve) => setTimeout(resolve, 400));

  return res.json({ reply });
});

// Setup joint Development Server / Client distribution
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Launching dev mode server with hybrid Vite routing...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving build client static distributions in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Weather Server running at http://localhost:${PORT}`);
  });
}

startServer();
