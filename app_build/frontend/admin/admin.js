document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    if (tab.dataset.tab === "sources") loadSources();
  });
});

async function loadFilterOptions() {
  try {
    const meta = await apiGet("/api/reports/meta/filters");
    const catSel = document.getElementById("f-category");
    meta.event_categories.forEach(c => catSel.insertAdjacentHTML("beforeend", `<option>${c}</option>`));
    const stateSel = document.getElementById("f-state");
    meta.states.forEach(s => stateSel.insertAdjacentHTML("beforeend", `<option>${s}</option>`));
  } catch (e) { console.warn(e); }
}

function credibilityColor(score) {
  if (score >= 0.65) return "#2bb3a3";
  if (score >= 0.4) return "#f5a623";
  return "#e5484d";
}

function statusPill(status) {
  const cls = { Verified: "pill-teal", Pending: "pill-blue", "Auto-Flagged": "pill-amber", Rejected: "pill-red" }[status] || "pill-blue";
  return `<span class="pill ${cls}"><span class="pill-dot"></span>${status}</span>`;
}

function buildQuery() {
  const p = new URLSearchParams();
  const status = document.getElementById("f-status").value;
  const cat = document.getElementById("f-category").value;
  const state = document.getElementById("f-state").value;
  const city = document.getElementById("f-city").value;
  if (status) p.set("verification_status", status);
  if (cat) p.set("event_category", cat);
  if (state) p.set("state", state);
  if (city) p.set("city", city);
  p.set("hide_duplicates", "false");
  p.set("limit", "60");
  return p.toString();
}

async function loadQueue() {
  const tbody = document.getElementById("queue-tbody");
  tbody.innerHTML = `<tr><td colspan="8" style="color:var(--ink-2);">Loading…</td></tr>`;
  try {
    const data = await apiGet(`/api/reports?${buildQuery()}`);
    if (!data.results.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="color:var(--ink-2);">No reports match this filter.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.results.map(r => `
      <tr data-id="${r.id}">
        <td class="mono-tag">${timeAgo(r.reported_at)}</td>
        <td>${r.city}, <span style="color:var(--ink-2)">${r.state}</span></td>
        <td>${r.event_category}${r.is_duplicate ? '<br><span class="mono-tag" style="color:var(--red)">duplicate</span>' : ""}</td>
        <td class="report-text">${r.raw_text}</td>
        <td class="mono-tag">${r.source ? r.source.handle : "—"}</td>
        <td>${Math.round(r.credibility_score * 100)}%
          <div class="credibility-bar"><div style="width:${r.credibility_score * 100}%; background:${credibilityColor(r.credibility_score)}"></div></div>
        </td>
        <td>${statusPill(r.verification_status)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-teal" onclick="setStatus(${r.id}, 'Verified')">Verify</button>
            <button class="btn btn-red" onclick="setStatus(${r.id}, 'Rejected')">Reject</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:var(--red);">Could not reach API. Is the backend running on ${window.WEATHER_API_BASE || "http://localhost:8000"}?</td></tr>`;
  }
}

async function setStatus(id, status) {
  try {
    await apiPatch(`/api/reports/${id}/verify`, { status, actor: "admin_console" });
    loadQueue();
  } catch (e) {
    alert("Failed to update status: " + e.message);
  }
}
window.setStatus = setStatus;

async function loadSources() {
  const tbody = document.getElementById("sources-tbody");
  tbody.innerHTML = `<tr><td colspan="7" style="color:var(--ink-2);">Loading…</td></tr>`;
  try {
    const rows = await apiGet("/api/analytics/sources");
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:var(--ink-2);">No sources yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(s => `
      <tr>
        <td class="mono-tag">${s.handle}</td>
        <td>${s.type}</td>
        <td>
          ${Math.round(s.trust_score * 100)}%
          <div class="trust-meter"><div style="width:${s.trust_score * 100}%"></div></div>
        </td>
        <td>${s.total_reports}</td>
        <td style="color:var(--teal)">${s.verified_reports}</td>
        <td style="color:var(--red)">${s.rejected_reports}</td>
        <td>${s.is_blacklisted ? '<span class="blacklist-badge">Blacklisted</span>' : '<span class="pill pill-teal"><span class="pill-dot"></span>Active</span>'}</td>
      </tr>
    `).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--red);">Could not load sources.</td></tr>`;
  }
}

document.getElementById("btn-refresh").addEventListener("click", loadQueue);
["f-status", "f-category", "f-state"].forEach(id =>
  document.getElementById(id).addEventListener("change", loadQueue)
);
document.getElementById("f-city").addEventListener("keyup", (e) => { if (e.key === "Enter") loadQueue(); });

document.getElementById("btn-ingest").addEventListener("click", async () => {
  const btn = document.getElementById("btn-ingest");
  const status = document.getElementById("ingest-status");
  btn.disabled = true;
  status.textContent = "Ingesting batch through ML pipeline…";
  try {
    const res = await apiPost("/api/ingest/simulate", { count: 25 });
    status.textContent = `Ingested ${res.ingested} new reports.`;
    loadQueue();
  } catch (e) {
    status.textContent = "Ingestion failed: " + e.message;
    status.style.color = "var(--red)";
  } finally {
    btn.disabled = false;
    setTimeout(() => { status.textContent = ""; }, 6000);
  }
});

(async function init() {
  await loadFilterOptions();
  await loadQueue();
})();
