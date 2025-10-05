import React, { useState, useEffect } from "react";
import axios from "axios";
import WeatherTrendChart from "./WeatherTrendChart";
import weatherBg from "./weather-bg.jpg"; 
import "./App.css";

const API_KEY = "a2fdecb72c7f0557980b211aac40ea59";

function App() {
  const [city, setCity] = useState("");
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      setCity(lastCity);
      fetchWeather(lastCity, units);
    }
    
    
  }, []);

  useEffect(() => {
    if (city) fetchWeather(city, units);
    
  }, [units]);

  const fetchWeather = async (cityName, unitsType = "metric") => {
    if (!cityName) {
      setError("Please enter a city name.");
      return;
    }
    setError("");
    setWeather(null);
    setForecast([]);
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unitsType}`
      );
      setWeather(weatherRes.data);
      localStorage.setItem("lastCity", cityName);

      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unitsType}`
      );
      const dailyForecasts = forecastRes.data.list.filter((item, idx) => idx % 8 === 0);
      setForecast(dailyForecasts);
    } catch {
      setError("City not found or API error.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city, units);
  };

  const toggleUnits = () => {
    setUnits(units === "metric" ? "imperial" : "metric");
    if (city) fetchWeather(city, units === "metric" ? "imperial" : "metric");
  };

  return (
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
      <div
        className="dash-card"
        style={{
          height: "90vh", 
          overflowY: "auto", 
          width: "100%",
          maxWidth: "520px",
          boxSizing: "border-box"
        }}
      >
        <h1 className="title">Weather Dashboard</h1>
        <form className="input-group" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
        <button className="unit-toggle" onClick={toggleUnits}>
          {units === "metric" ? "🌡️ Show Fahrenheit" : "🌡️ Show Celsius"}
        </button>
        {error && <p className="error-message">{error}</p>}

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
              <img
                src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                style={{ width: 95 }}
                alt={weather.weather[0].description}
              />
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
