
/* =========================================================
   SAKHIGO LIVE LOCATION SHARING
   Backend: Spring Boot + PostgreSQL
   ========================================================= */
(function initLiveLocationSharing() {
  const API_BASE = window.SAKHIGO_API_BASE || "https://sakhigo-backend.onrender.com/api/live-location";
  const TRACKING_PATH = window.SAKHIGO_TRACKING_PATH || window.location.pathname;
  const MAPS_API_KEY = window.SAKHIGO_MAPS_API_KEY || "PUT_YOUR_GOOGLE_MAPS_KEY_HERE";

  const consoleSection = document.getElementById("console");
  if (!consoleSection) return;

  const styleId = "sakhigo-live-location-injected";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `.sakhigo-live-card{grid-column:1/-1}.sakhigo-live-actions{display:flex;gap:10px;flex-wrap:wrap}.sakhigo-live-actions button{min-height:44px}.sakhigo-live-link{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.sakhigo-live-link input{flex:1;min-width:220px}.sakhigo-live-map{width:100%;height:360px;border-radius:18px;overflow:hidden;margin-top:16px;background:#17131b}.sakhigo-live-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(51,217,178,.12);color:var(--teal);font-size:.82rem}.sakhigo-live-dot{width:8px;height:8px;border-radius:50%;background:currentColor}.sakhigo-live-meta{font-size:.86rem;opacity:.8;margin-top:8px}.sakhigo-live-error{color:#ff8ca0}.sakhigo-live-success{color:var(--teal)}`;
    document.head.appendChild(style);
  }

  const grid = consoleSection.querySelector(".console-grid");
  if (!grid) return;

  const card = document.createElement("div");
  card.className = "console-card sakhigo-live-card";
  card.innerHTML = `
    <div class="console-card-head">
      <div class="feat-ic" style="background:rgba(51,217,178,.12);color:var(--teal);margin-bottom:0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s7-7.58 7-13a7 7 0 10-14 0c0 5.42 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
      <div>
        <h4>Live Location Sharing</h4>
        <p class="console-card-sub">Share a temporary live tracking link with someone you trust</p>
      </div>
    </div>
    <div id="liveOwnerPanel">
      <label class="console-card-sub" for="liveDuration">Sharing duration</label>
      <select id="liveDuration" class="guardian-input" style="margin:8px 0 12px">
        <option value="15">15 minutes</option>
        <option value="30" selected>30 minutes</option>
        <option value="60">1 hour</option>
        <option value="120">2 hours</option>
        <option value="240">4 hours</option>
      </select>
      <div class="sakhigo-live-actions">
        <button id="startLiveBtn" class="btn-primary" type="button">Start Live Location</button>
        <button id="stopLiveBtn" class="btn-ghost" type="button" hidden>Stop Sharing</button>
      </div>
      <p id="liveOwnerStatus" class="console-status" aria-live="polite">Your location is not being shared.</p>
      <div id="liveShareBox" class="sakhigo-live-link" hidden>
        <input id="liveShareLink" class="guardian-input" readonly aria-label="Live tracking link">
        <button id="liveShareBtn" class="btn-primary" type="button">Share Link</button>
        <a id="liveWhatsAppBtn" class="btn-ghost" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
    <div id="liveViewerPanel" hidden>
      <div class="sakhigo-live-badge"><span class="sakhigo-live-dot"></span> Live tracking</div>
      <p id="liveViewerStatus" class="console-status" aria-live="polite">Connecting…</p>
      <div id="liveMap" class="sakhigo-live-map" aria-label="Live location map"></div>
      <p id="liveViewerMeta" class="sakhigo-live-meta"></p>
    </div>
  `;
  grid.prepend(card);

  const $ = (id) => document.getElementById(id);
  const durationEl = $("liveDuration");
  const startBtn = $("startLiveBtn");
  const stopBtn = $("stopLiveBtn");
  const ownerStatus = $("liveOwnerStatus");
  const shareBox = $("liveShareBox");
  const shareLink = $("liveShareLink");
  const shareBtn = $("liveShareBtn");
  const waBtn = $("liveWhatsAppBtn");
  const viewerPanel = $("liveViewerPanel");
  const viewerStatus = $("liveViewerStatus");
  const viewerMeta = $("liveViewerMeta");
  const mapEl = $("liveMap");

  let watchId = null;
  let ownerToken = null;
  let viewerTimer = null;
  let googleMap = null;
  let googleMarker = null;
  let googleMapsPromise = null;

  function isHttpsOrLocalhost() {
    return location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  }

  function trackingUrl(token) {
    const url = new URL(TRACKING_PATH, window.location.href);
    url.searchParams.set("track", token);
    return url.href;
  }

  async function loadGoogleMaps() {
    if (window.google?.maps) return window.google.maps;
    if (MAPS_API_KEY === "PUT_YOUR_GOOGLE_MAPS_KEY_HERE") throw new Error("Google Maps API key is not configured.");
    if (googleMapsPromise) return googleMapsPromise;
    googleMapsPromise = new Promise((resolve, reject) => {
      const callback = "__sakhigoGoogleMapsReady";
      window[callback] = () => {
        delete window[callback];
        resolve(window.google.maps);
      };
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_API_KEY)}&v=weekly&callback=${callback}`;
      script.async = true;
      script.onerror = () => reject(new Error("Google Maps could not be loaded."));
      document.head.appendChild(script);
    });
    return googleMapsPromise;
  }

  async function renderMap(lat, lng) {
    try {
      const maps = await loadGoogleMaps();
      if (!googleMap) {
        googleMap = new maps.Map(mapEl, { center: { lat, lng }, zoom: 16, streetViewControl: false, mapTypeControl: false });
        googleMarker = new maps.Marker({ position: { lat, lng }, map: googleMap, title: "SakhiGo live location" });
      } else {
        const p = { lat, lng };
        googleMap.setCenter(p);
        googleMarker.setPosition(p);
      }
    } catch (e) {
      mapEl.innerHTML = `<div style="padding:20px">Map unavailable. <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${lat},${lng}">Open location in Google Maps</a></div>`;
    }
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    if (!response.ok) {
      let message = "Request failed";
      try { message = (await response.json()).message || message; } catch {}
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function sendLocation(position) {
    if (!ownerToken) return;
    try {
      const { latitude, longitude, accuracy } = position.coords;
      await api(`/sessions/${encodeURIComponent(ownerToken)}/location`, {
        method: "PUT",
        body: JSON.stringify({ latitude, longitude, accuracy: accuracy ?? null })
      });
      ownerStatus.textContent = `Live location is active • updated ${new Date().toLocaleTimeString()}`;
      ownerStatus.classList.add("sakhigo-live-success");
    } catch (e) {
      ownerStatus.textContent = `Location update failed: ${e.message}`;
      ownerStatus.classList.add("sakhigo-live-error");
    }
  }

  function locationError(error) {
    const messages = {
      1: "Location permission was denied. Allow location access and try again.",
      2: "Your device could not determine the location.",
      3: "Location request timed out. Try again."
    };
    return messages[error.code] || "Could not get your location.";
  }

  async function startSharing() {
    if (!navigator.geolocation) {
      ownerStatus.textContent = "This browser does not support location services.";
      return;
    }
    if (!isHttpsOrLocalhost()) {
      ownerStatus.textContent = "Location sharing requires HTTPS (or localhost during development).";
      return;
    }

    startBtn.disabled = true;
    ownerStatus.textContent = "Creating secure tracking session…";
    try {
      const session = await api("/sessions", {
        method: "POST",
        body: JSON.stringify({ durationMinutes: Number(durationEl.value) })
      });
      ownerToken = session.shareToken;
      const url = trackingUrl(ownerToken);
      shareLink.value = url;
      waBtn.href = `https://wa.me/?text=${encodeURIComponent("Track my live location on SakhiGo: " + url)}`;
      shareBox.hidden = false;
      stopBtn.hidden = false;
      startBtn.hidden = true;

      ownerStatus.textContent = "Requesting your live location…";
      watchId = navigator.geolocation.watchPosition(sendLocation, (err) => {
        ownerStatus.textContent = locationError(err);
        ownerStatus.classList.add("sakhigo-live-error");
      }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });

      ownerStatus.textContent = `Live location active until ${new Date(session.expiresAt).toLocaleTimeString()}.`;
    } catch (e) {
      ownerStatus.textContent = `Could not start sharing: ${e.message}`;
      startBtn.disabled = false;
    }
  }

  async function stopSharing() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (ownerToken) {
      try { await api(`/sessions/${encodeURIComponent(ownerToken)}`, { method: "DELETE" }); } catch {}
    }
    ownerToken = null;
    stopBtn.hidden = true;
    startBtn.hidden = false;
    startBtn.disabled = false;
    shareBox.hidden = true;
    ownerStatus.textContent = "Live location sharing has stopped.";
    ownerStatus.classList.remove("sakhigo-live-error", "sakhigo-live-success");
  }

  async function viewerPoll(token) {
    try {
      const data = await api(`/sessions/${encodeURIComponent(token)}`);
      if (!data.active) throw new Error("Tracking has ended.");
      viewerStatus.textContent = data.locationUpdatedAt
        ? `Last update: ${new Date(data.locationUpdatedAt).toLocaleTimeString()}`
        : "Waiting for the user's first location update…";
      if (data.latitude != null && data.longitude != null) {
        await renderMap(data.latitude, data.longitude);
        viewerMeta.textContent = data.accuracy != null
          ? `Accuracy: about ${Math.round(data.accuracy)} m • Sharing ends ${new Date(data.expiresAt).toLocaleTimeString()}`
          : `Sharing ends ${new Date(data.expiresAt).toLocaleTimeString()}`;
      }
    } catch (e) {
      viewerStatus.textContent = e.message;
      if (viewerTimer) clearInterval(viewerTimer);
      viewerTimer = null;
    }
  }

  async function initViewer(token) {
    $("liveOwnerPanel").hidden = true;
    viewerPanel.hidden = false;
    viewerStatus.textContent = "Connecting to live location…";
    await viewerPoll(token);
    viewerTimer = setInterval(() => viewerPoll(token), 5000);
  }

  startBtn.addEventListener("click", startSharing);
  stopBtn.addEventListener("click", stopSharing);
  shareBtn.addEventListener("click", async () => {
    if (!shareLink.value) return;
    if (navigator.share) {
      try { await navigator.share({ title: "SakhiGo Live Location", text: "Track my live location", url: shareLink.value }); } catch {}
    } else {
      shareLink.select();
      try { await navigator.clipboard.writeText(shareLink.value); } catch {}
      shareBtn.textContent = "Link copied";
      setTimeout(() => shareBtn.textContent = "Share Link", 1600);
    }
  });

  const token = new URLSearchParams(window.location.search).get("track");
  if (token) initViewer(token);

  window.addEventListener("beforeunload", () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    if (viewerTimer) clearInterval(viewerTimer);
  });
})();
