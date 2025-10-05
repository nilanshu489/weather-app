import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function WeatherTrendChart({ forecast, units }) {
  
  if (!forecast || forecast.length < 2) return null;

  const labels = forecast.map(day =>
    new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })
  );
  const temps = forecast.map(day => Math.round(day.main.temp));

  const data = {
    labels,
    datasets: [
      {
        label: `Daily Temp (${units === "metric" ? "°C" : "°F"})`,
        data: temps,
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#60a5fa",
        pointBackgroundColor: "#2563eb",
        tension: 0.35,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { mode: "index", intersect: false }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: value => value + (units === "metric" ? "°C" : "°F")
        }
      }
    }
  };

  return (
    <div style={{ margin: "32px 0", background: "#f1f5fa", borderRadius: 12, padding: 18 }}>
      <h3 style={{ textAlign: "center", color: "#2563eb", marginBottom: 12 }}>Temperature Trend</h3>
      <Line data={data} options={options} />
    </div>
  );
}
