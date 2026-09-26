let capturedLat = null, capturedLon = null;

document.getElementById("btn-geo").addEventListener("click", () => {
  const status = document.getElementById("geo-status");
  if (!navigator.geolocation) {
    status.textContent = "Geolocation isn't supported by this browser.";
    return;
  }
  status.textContent = "Requesting location…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      capturedLat = pos.coords.latitude;
      capturedLon = pos.coords.longitude;
      status.textContent = `📍 Location attached: ${capturedLat.toFixed(4)}, ${capturedLon.toFixed(4)}`;
      status.style.color = "var(--teal)";
    },
    (err) => {
      status.textContent = "Couldn't get location — you can still submit without it.";
    }
  );
});

document.getElementById("report-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitStatus = document.getElementById("submit-status");
  const successBox = document.getElementById("success-box");
  const payload = {
    text: document.getElementById("text").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    hashtags: document.getElementById("hashtags").value.trim() || "#IMD",
    media_url: document.getElementById("media_url").value.trim() || null,
    media_type: document.getElementById("media_url").value.trim() ? "image" : "none",
    latitude: capturedLat,
    longitude: capturedLon,
    reporter_handle: "citizen_web_" + Math.random().toString(36).slice(2, 8),
  };

  submitStatus.textContent = "Submitting…";
  submitStatus.style.color = "var(--ink-2)";
  try {
    const result = await apiPost("/api/reports/citizen", payload);
    successBox.classList.add("show");
    successBox.innerHTML =
      `<b>Report received.</b> Our ML pipeline classified this as <b>${result.event_category}</b> ` +
      `(${Math.round(result.category_confidence * 100)}% confidence) with a credibility score of ` +
      `<b>${Math.round(result.credibility_score * 100)}%</b>. Status: <b>${result.verification_status}</b>.`;
    document.getElementById("report-form").reset();
    capturedLat = capturedLon = null;
    document.getElementById("geo-status").textContent = "Location not attached yet — reports with GPS data are prioritized for verification.";
    document.getElementById("geo-status").style.color = "var(--ink-2)";
    submitStatus.textContent = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    submitStatus.textContent = "Submission failed: " + err.message;
    submitStatus.style.color = "var(--red)";
  }
});
