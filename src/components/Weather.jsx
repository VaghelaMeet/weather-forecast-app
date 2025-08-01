import React, { useEffect, useState } from "react";
import { fetchWeather, fetchWeeklyData } from "../Api/Api";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [forecastData, setForecastData] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    if (!city.trim()) {
      setWeather(null);
      setForecastData(null);
      setShowForecast(false);
      setSelectedDayIndex(null);
      setError("");
    }
  }, [city]);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please Enter a City.");
      setWeather(null);
      return;
    }

    try {
      const data = await fetchWeather(city);

      // Convert current temperature from Kelvin to Celsius
      data.main.temp = kelvinToCelsius(data.main.temp);
      // convert wind speed meters/second to km/h
      data.wind.speed = (data.wind.speed * 3.6).toFixed(1);

      setWeather(data);
      setError("");
      setSelectedDayIndex(null);
      setShowForecast(false);

      if (data.id) {
        const forecast = await fetchWeeklyData(data.id);
        setForecastData(forecast);
      }
    } catch (err) {
      setError("City not found.");
      setWeather(null);
    }
  };

  const getWeatherBackground = (main) => {
    const backgrounds = {
      clear: "from-yellow-500 to-orange-500",
      clouds: "from-gray-400 to-gray-500",
      rain: "from-blue-400 to-blue-700",
      thunderstorm: "from-indigo-700 to-black",
      snow: "from-white to-blue-200",
      drizzle: "from-cyan-300 to-blue-500",
      mist: "from-gray-300 to-gray-500",
    };
    return backgrounds[main.toLowerCase()] || "from-slate-400 to-slate-700";
  };

  const showForecastDays = (dayIndex) => {
    if (!forecastData) return;

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayIndex);

    const dayData = forecastData.list.find((item) => {
      const itemDate = new Date(item.dt * 1000);
      return (
        itemDate.getDate() === targetDate.getDate() &&
        itemDate.getMonth() === targetDate.getMonth()
      );
    });

    if (dayData) {
      const forecastWeather = {
        ...dayData,
        name: weather.name,
        sys: { country: weather.sys.country },
        main: {
          ...dayData.main,
          temp: kelvinToCelsius(dayData.main.temp), // ✅ Celsius
        },
        wind: {
          speed: Number((dayData.wind.speed * 3.6).toFixed(1)), // ✅ km/h
        },
      };

      setWeather(forecastWeather);
      setShowForecast(true);
      setSelectedDayIndex(dayIndex);
    }
  };

  // Utilities
  const kelvinToCelsius = (temp) => (temp - 273.15).toFixed(1);

  const formatDate = (timestamp) =>
    new Date(timestamp * 1000).toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  const getWeatherIcon = (main) => {
    const icons = {
      clear: "/sun.png",
      clouds: "/cloud.png",
      rain: "/rain.png",
    };
    return icons[main.toLowerCase()] || "/cloudy.png";
  };

  const getDayName = (index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString("en-IN", { weekday: "short" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-purple-500 via-blue-400 to-yellow-300 text-white transition-all duration-700">
      <h1 className="text-5xl font-extrabold mb-10 drop-shadow-lg">
        Weather App
      </h1>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-lg mb-8 w-full max-w-xl">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter City Name..."
          className="w-full px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70 shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={handleSearch}
          className="bg-white text-blue-600 px-6 py-3 font-semibold rounded-xl hover:bg-blue-100 transition-all shadow-lg"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-red-100 font-medium mb-4">{error}</p>}

      {weather && (
        <div
          className={`relative bg-gradient-to-br ${getWeatherBackground(
            weather.weather[0].main
          )} p-1 rounded-[2.5rem] shadow-2xl max-w-5xl w-full mt-10 transition-all duration-500`}
        >
          <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-inner flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden z-10">
            {/* Weather Info */}
            <div className="text-center flex-1">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="text-white/70 text-sm mt-2">
                {showForecast
                  ? `Forecast for ${formatDate(weather.dt)}`
                  : "Current Weather"}
              </p>

              <img
                src={getWeatherIcon(weather.weather[0].main)}
                alt={weather.weather[0].description}
                className="w-36 h-36 mx-auto my-4 drop-shadow-2xl transition-transform duration-300 hover:scale-110"
              />

              <p className="capitalize text-xl font-medium text-white mb-4">
                {weather.weather[0].description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/90 text-md font-medium bg-white/10 p-5 rounded-2xl shadow-md ring-1 ring-white/20">
                <p>
                  🌡️ Temp:{" "}
                  <span className="font-bold">{weather.main.temp} °C</span>
                </p>
                <p>
                  💧 Humidity:{" "}
                  <span className="font-bold">{weather.main.humidity} %</span>
                </p>
                <p>
                  💨 Wind:{" "}
                  <span className="font-bold">{weather.wind.speed} km/h</span>
                </p>
              </div>
            </div>

            {/* Forecast Buttons */}
            <div className="flex flex-col gap-3 items-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => showForecastDays(i)}
                  className={`w-28 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 ${
                    selectedDayIndex === i
                      ? "bg-white text-gray-900 ring-2 ring-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {getDayName(i)}
                </button>
              ))}
            </div>

            {/* Glow Effects */}
            <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-12 -right-12 w-52 h-52 bg-white/10 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
