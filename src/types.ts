export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  current: {
    temp: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    humidity: number;
    windSpeed: number;
    windDir: string;
    pressure: number;
    uvi: number;
    visibility: number;
    aqi: number;
    condition: string;
    description: string;
    icon: string;
    sunrise: string;
    sunset: string;
    precipChance: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    condition: string;
    precipChance: number;
  }>;
  daily: Array<{
    day: string;
    tempDay: number;
    tempNight: number;
    condition: string;
    description: string;
    precipChance: number;
    humidity: number;
  }>;
  insights: {
    alert: string | null;
    summary: string;
    aiAdvice: string;
  };
}

export interface AssistantResponse {
  reply: string;
}

export interface FavoriteCity {
  city: string;
  country?: string;
  lat?: number;
  lon?: number;
}
