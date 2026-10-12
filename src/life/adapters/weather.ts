import { lifeEnv } from "@/life/config";
import { MOCK_WEATHER } from "@/life/mock-data";
import type { WeatherSnapshot } from "@/life/types";

export async function getWeather(): Promise<WeatherSnapshot> {
  const cfg = lifeEnv();
  if (cfg.forceMock || !cfg.openWeatherApiKey || !cfg.weatherLat || !cfg.weatherLon) {
    return {
      ...MOCK_WEATHER,
      location: cfg.weatherLocationLabel,
      mode: cfg.openWeatherApiKey ? "mock" : "unconfigured",
    };
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", cfg.weatherLat);
    url.searchParams.set("lon", cfg.weatherLon);
    url.searchParams.set("appid", cfg.openWeatherApiKey);
    url.searchParams.set("units", "imperial");

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`);
    const data = (await res.json()) as {
      name?: string;
      main: { temp: number; feels_like: number; humidity: number; temp_max: number; temp_min: number };
      weather: { description: string }[];
      wind?: { speed: number };
    };

    return {
      location: cfg.weatherLocationLabel || data.name || "Home area",
      tempF: Math.round(data.main.temp),
      feelsLikeF: Math.round(data.main.feels_like),
      condition: data.weather[0]?.description ?? "Clear",
      humidity: data.main.humidity,
      windMph: Math.round(data.wind?.speed ?? 0),
      highF: Math.round(data.main.temp_max),
      lowF: Math.round(data.main.temp_min),
      mode: "live",
    };
  } catch {
    return { ...MOCK_WEATHER, location: cfg.weatherLocationLabel, mode: "mock" };
  }
}
