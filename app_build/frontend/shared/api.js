// Central API config. Change API_BASE when deploying the backend elsewhere.
const API_BASE = (window.WEATHER_API_BASE) || "http://localhost:8000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`);
  return res.json();
}

const CATEGORY_COLORS = {
  "Rainfall": "#4f9dde",
  "Thunderstorm": "#9b7ee8",
  "Flooding": "#e5484d",
  "Heatwave": "#f5a623",
  "Fog": "#7f95a1",
  "Dust Storm": "#c98a4b",
  "Strong Wind": "#2bb3a3",
  "Cyclone": "#e565a3",
  "Hail": "#69c2e8",
  "Snowfall": "#d9eef7",
  "Other": "#5a6b74",
};

const STATUS_COLORS = {
  "Verified": "teal",
  "Pending": "blue",
  "Auto-Flagged": "amber",
  "Rejected": "red",
};

function timeAgo(iso) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso + "Z".replace("ZZ","Z")).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
