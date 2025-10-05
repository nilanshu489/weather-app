// Import core React libraries and dependencies
import React, { useState, useEffect } from "react";
import axios from "axios";

// Import the temperature trend chart component and background image from src
import WeatherTrendChart from "./WeatherTrendChart";
import weatherBg from "./weather-bg.jpg";
import "./App.css";

// OpenWeatherMap API key 
const API_KEY = "a2fdecb72c7f0557980b211aac40ea59";

// Main weather dashboard component
function App() {
  // State hooks for city input, temperature units, fetched data & error message
  const [city, setCity] = useState("");
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  // On mount: Check for last searched city in local storage and fetch its weather
  useEffect(() => {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      setCity(lastCity);
      fetchWeather(lastCity, units);
    }
    // Only run once on mount
  }, []);

  // When units change (C<->F): if city is set, update its weather/forecast
  useEffect(() => {
    if (city) fetchWeather(city, units);
  }, [units]);
 
  // Fetches current weather & 5-day forecast for the given city
  const fetchWeather = async (cityName, unitsType = "metric") => {
    if (!cityName) {
      setError("Please enter a city name.");
      return;
    }
    setError("");
    setWeather(null);
    setForecast([]);
    try {
      // Fetch current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unitsType}`
      );
      setWeather(weatherRes.data);
      localStorage.setItem("lastCity", cityName);

      // Fetch forecast (every 8th result for one per day)
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unitsType}`
      );
      const dailyForecasts = forecastRes.data.list.filter((item, idx) => idx % 8 === 0);
      setForecast(dailyForecasts);
    } catch {
      setError("City not found or API error.");
    }
  };

  // Form submit: fetch data for the user-typed city & unit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city, units);
  };

  // Toggle temperature units and update data if city already set
  const toggleUnits = () => {
    setUnits(units === "metric" ? "imperial" : "metric");
    if (city) fetchWeather(city, units === "metric" ? "imperial" : "metric");
  };

  return (
    // App root: full-screen background image and center content
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: `url(${weatherBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      {/* Main glassmorphic card holding all UI */}
      <div
        className="dash-card"
        style={{
          height: "90vh",            // Fit almost entire screen vertically
          overflowY: "auto",         // Only scroll inside panel if needed
          width: "100%",
          maxWidth: "520px",
          boxSizing: "border-box"
        }}
      >
        <h1 className="title">Weather Dashboard</h1>

        {/* Weather search bar */}
        <form className="input-group" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        {/* Units toggle button */}
        <button className="unit-toggle" onClick={toggleUnits}>
          {units === "metric" ? "🌡️ Show Fahrenheit" : "🌡️ Show Celsius"}
        </button>

        {/* Error message, if present */}
        {error && <p className="error-message">{error}</p>}

        {/* Weather info and chart (only when both present) */}
        {weather && forecast.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 24,
              marginTop: 32,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Main weather information card */}
            <div
              style={{
                flex: "0 0 260px",
                background: "#f9fafeef",
                borderRadius: 18,
                boxShadow: "0 2px 16px #93c5fd25",
                textAlign: "center",
                padding: "26px 18px 18px",
                minWidth: 220,
                margin: "auto",
              }}
            >
              <h2
                style={{
                  fontSize: 28,
                  color: "#1360be",
                  marginBottom: 8,
                }}
              >
                🌍 {weather.name}, {weather.sys.country}
              </h2>
              {/* Weather icon */}
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                style={{ width: 95 }}
                alt={weather.weather[0].description}
              />
              {/* Temperature */}
              <div
                style={{
                  fontSize: 50,
                  fontWeight: 800,
                  color: "#007cfb",
                  marginBottom: 6,
                }}
              >
                🌡️ {Math.round(weather.main.temp)}°{units === "metric" ? "C" : "F"}
              </div>
              {/* Weather description */}
              <div
                style={{
                  fontSize: 18,
                  color: "#009f9b",
                  textTransform: "capitalize",
                  marginBottom: 12,
                }}
              >
                {weather.weather[0].description}
              </div>
              {/* Additional details: humidity & wind */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: 9,
                  fontWeight: 600,
                  color: "#355070",
                }}
              >
                <span>💧 {weather.main.humidity}%</span>
                <span>
                  🍃 {weather.wind.speed}
                  {units === "metric" ? " m/s" : " mph"}
                </span>
              </div>
            </div>

            {/* Temperature trend chart, side-by-side on large screens */}
            <div
              style={{
                flex: "1 1 330px",
                background: "#f1f5fa",
                borderRadius: 18,
                padding: "18px 15px 5px",
                boxShadow: "0 3px 14px 0 #38bdf822",
                minWidth: 290,
                maxWidth: 470,
                margin: "auto",
              }}
            >
              <WeatherTrendChart forecast={forecast} units={units} />
            </div>
          </div>
        )}

        {/* 5-Day Weather Forecast cards */}
        {forecast.length > 0 && (
          <div className="forecast">
            <h3>5-Day Weather Forecast</h3>
            <div className="forecast-container">
              {forecast.map((day, idx) => (
                <div className="forecast-day" key={idx}>
                  <div>
                    {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>
                  <img
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />
                  <div>
                    {Math.round(day.main.temp)}°
                    {units === "metric" ? "C" : "F"}
                  </div>
                  <div className="forecast-description">
                    {day.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
