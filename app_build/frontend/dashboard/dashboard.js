let map, markerLayer;
let charts = {};

function currentFilters() {
  const p = new URLSearchParams();
  const from = document.getElementById("f-date-from").value;
  const to = document.getElementById("f-date-to").value;
  const cat = document.getElementById("f-category").value;
  const state = document.getElementById("f-state").value;
  const status = document.getElementById("f-status").value;
  if (from) p.set("date_from", from);
  if (to) p.set("date_to", to);
  if (cat) p.set("event_category", cat);
  if (state) p.set("state", state);
  if (status) p.set("verification_status", status);
  return p.toString();
}

async function loadFilterOptions() {
  try {
    const meta = await apiGet("/api/reports/meta/filters");
    const catSel = document.getElementById("f-category");
    meta.event_categories.forEach(c => catSel.insertAdjacentHTML("beforeend", `<option>${c}</option>`));
    const stateSel = document.getElementById("f-state");
    meta.states.forEach(s => stateSel.insertAdjacentHTML("beforeend", `<option>${s}</option>`));
  } catch (e) { console.warn("filter meta failed", e); }
}

function initMap() {
  map = L.map("map", { scrollWheelZoom: false }).setView([22.9734, 78.6569], 5);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 12,
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
}

async function refreshMap() {
  try {
    const points = await apiGet("/api/analytics/map-points?limit=500");
    markerLayer.clearLayers();
    points.forEach(pt => {
      if (pt.lat == null || pt.lon == null) return;
      const color = CATEGORY_COLORS[pt.category] || "#5a6b74";
      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: pt.severity === "Severe" ? 8 : pt.severity === "High" ? 6.5 : 5,
        color, fillColor: color, fillOpacity: 0.75, weight: 1,
      });
      marker.bindPopup(
        `<strong>${pt.category}</strong> · ${pt.severity}<br/>${pt.city}, ${pt.state}<br/>` +
        `<span style="color:#9db3bd">${pt.text}</span><br/><em>${pt.status}</em>`
      );
      marker.addTo(markerLayer);
    });
  } catch (e) { console.warn("map refresh failed", e); }
}

function upsertChart(id, config) {
  if (charts[id]) { charts[id].destroy(); }
  charts[id] = new Chart(document.getElementById(id), config);
}

const chartDefaults = {
  plugins: { legend: { labels: { color: "#b9c9d3", font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: "#7f95a1", font: { size: 10.5 } }, grid: { color: "rgba(255,255,255,0.04)" } },
    y: { ticks: { color: "#7f95a1", font: { size: 10.5 } }, grid: { color: "rgba(255,255,255,0.04)" } },
  },
};

async function refreshCharts() {
  try {
    const ts = await apiGet("/api/analytics/timeseries?days=14");
    upsertChart("chart-timeseries", {
      type: "line",
      data: {
        labels: ts.map(r => r.date),
        datasets: [{ label: "Reports", data: ts.map(r => r.count), borderColor: "#f5a623", backgroundColor: "rgba(245,166,35,0.12)", fill: true, tension: 0.35, pointRadius: 2 }],
      },
      options: { ...chartDefaults, plugins: { legend: { display: false } } },
    });
  } catch (e) { console.warn(e); }

  try {
    const vb = await apiGet("/api/analytics/verification-breakdown");
    const order = ["Verified", "Pending", "Auto-Flagged", "Rejected"];
    const colorMap = { Verified: "#2bb3a3", Pending: "#4f9dde", "Auto-Flagged": "#f5a623", Rejected: "#e5484d" };
    const sorted = order.map(o => vb.find(v => v.status === o) || { status: o, count: 0 });
    upsertChart("chart-verification", {
      type: "doughnut",
      data: { labels: sorted.map(s => s.status), datasets: [{ data: sorted.map(s => s.count), backgroundColor: sorted.map(s => colorMap[s.status]), borderWidth: 0 }] },
      options: { plugins: { legend: { position: "bottom", labels: { color: "#b9c9d3", font: { size: 11 }, padding: 12 } } } },
    });
  } catch (e) { console.warn(e); }

  try {
    const cat = await apiGet("/api/analytics/by-category");
    cat.sort((a, b) => b.count - a.count);
    upsertChart("chart-category", {
      type: "bar",
      data: { labels: cat.map(c => c.category), datasets: [{ data: cat.map(c => c.count), backgroundColor: cat.map(c => CATEGORY_COLORS[c.category] || "#5a6b74"), borderRadius: 4 }] },
      options: { ...chartDefaults, plugins: { legend: { display: false } }, indexAxis: "y" },
    });
  } catch (e) { console.warn(e); }

  try {
    const st = await apiGet("/api/analytics/by-state");
    const top = st.slice(0, 8);
    upsertChart("chart-state", {
      type: "bar",
      data: { labels: top.map(s => s.state), datasets: [{ data: top.map(s => s.count), backgroundColor: "#2bb3a3", borderRadius: 4 }] },
      options: { ...chartDefaults, plugins: { legend: { display: false } } },
    });
  } catch (e) { console.warn(e); }
}

async function refreshKPIs() {
  try {
    const s = await apiGet("/api/analytics/summary");
    document.getElementById("kpi-total").textContent = s.total_reports;
    document.getElementById("kpi-verified").textContent = s.verified;
    document.getElementById("kpi-pending").textContent = s.pending;
    document.getElementById("kpi-flagged").textContent = s.auto_flagged;
    document.getElementById("kpi-rejected").textContent = s.rejected;
    document.getElementById("kpi-dupes").textContent = s.duplicates_filtered;
  } catch (e) { console.warn(e); }
}

function statusPill(status) {
  const cls = { Verified: "pill-teal", Pending: "pill-blue", "Auto-Flagged": "pill-amber", Rejected: "pill-red" }[status] || "pill-blue";
  return `<span class="pill ${cls}"><span class="pill-dot"></span>${status}</span>`;
}

async function refreshTable() {
  const tbody = document.getElementById("reports-tbody");
  try {
    const qs = currentFilters();
    const data = await apiGet(`/api/reports?limit=40${qs ? "&" + qs : ""}`);
    if (!data.results.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--ink-2);">No reports match these filters.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.results.map(r => `
      <tr>
        <td class="mono-tag">${timeAgo(r.reported_at)}</td>
        <td>${r.city}, <span style="color:var(--ink-2)">${r.state}</span></td>
        <td>${r.event_category}</td>
        <td>${r.severity}</td>
        <td class="report-text">${r.raw_text}</td>
        <td>${Math.round(r.credibility_score * 100)}%</td>
        <td>${statusPill(r.verification_status)}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--red);">Could not reach API at ${window.WEATHER_API_BASE || "http://localhost:8000"}. Is the backend running?</td></tr>`;
  }
}

async function refreshAll() {
  await Promise.all([refreshKPIs(), refreshCharts(), refreshMap(), refreshTable()]);
}

document.getElementById("btn-apply").addEventListener("click", refreshTable);
document.getElementById("btn-reset").addEventListener("click", () => {
  ["f-date-from", "f-date-to", "f-category", "f-state", "f-status"].forEach(id => document.getElementById(id).value = "");
  refreshTable();
});

(async function init() {
  initMap();
  await loadFilterOptions();
  await refreshAll();
  setInterval(refreshAll, 20000); // real-time refresh every 20s
})();
