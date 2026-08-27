
      /* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

      const navToggle = document.getElementById("navToggle");

      const mobileNav = document.getElementById("mobileNav");

      function closeNav() {
        navToggle.classList.remove("active");

        navToggle.setAttribute("aria-expanded", "false");

        navToggle.setAttribute("aria-label", "Open navigation menu");

        mobileNav.classList.remove("open");

        mobileNav.setAttribute("aria-hidden", "true");
      }

      navToggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.toggle("open");

        navToggle.classList.toggle("active", isOpen);

        navToggle.setAttribute("aria-expanded", String(isOpen));

        navToggle.setAttribute(
          "aria-label",
          isOpen ? "Close navigation menu" : "Open navigation menu",
        );

        mobileNav.setAttribute("aria-hidden", String(!isOpen));
      });

      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
      });

      /* =========================================================
   SOS HOLD DEMO
   ========================================================= */

      const sosBtn = document.getElementById("sosBtn");

      const progressCircle = document.getElementById("progressCircle");

      const sosLabel = document.getElementById("sosLabel");

      const sosCaption = document.getElementById("sosCaption");

      const CIRC = 2 * Math.PI * 92;

      progressCircle.style.strokeDasharray = CIRC;

      progressCircle.style.strokeDashoffset = CIRC;

      let holdTimer = null;
      let holdStart = null;
      let sosSent = false;

      const HOLD_MS = 2000;

      function startHold(e) {
        if (sosSent) return;

        e.preventDefault();

        holdStart = Date.now();

        sosBtn.classList.add("holding");

        sosLabel.textContent = "Keep holding…";

        sosCaption.textContent = "Holding — release to cancel the demo.";

        holdTimer = requestAnimationFrame(tickHold);
      }

      function tickHold() {
        const elapsed = Date.now() - holdStart;

        const pct = Math.min(elapsed / HOLD_MS, 1);

        progressCircle.style.strokeDashoffset = CIRC * (1 - pct);

        if (pct >= 1) {
          triggerSOS();

          return;
        }

        holdTimer = requestAnimationFrame(tickHold);
      }

      function cancelHold() {
        if (sosSent) return;

        cancelAnimationFrame(holdTimer);

        progressCircle.style.strokeDashoffset = CIRC;

        sosBtn.classList.remove("holding");

        sosLabel.textContent = "Hold 2s";

        sosCaption.textContent =
          "This is a live demo. Press & hold — in the real app, this alerts your guardians and police instantly.";
      }

      function triggerSOS() {
        cancelAnimationFrame(holdTimer);

        sosSent = true;

        sosBtn.classList.remove("holding");

        sosBtn.classList.add("sent");

        sosLabel.textContent = "Alert sent";

        sosCaption.textContent =
          "That's the whole gesture. In the real app, guardians and police get notified in seconds.";

        setTimeout(() => {
          sosSent = false;

          sosBtn.classList.remove("sent");

          sosLabel.textContent = "Hold 2s";

          sosCaption.textContent =
            "This is a live demo. Press & hold — in the real app, this alerts your guardians and police instantly.";

          progressCircle.style.strokeDashoffset = CIRC;
        }, 2600);
      }

      sosBtn.addEventListener("mousedown", startHold);

      sosBtn.addEventListener("touchstart", startHold, {
        passive: false,
      });

      ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((event) => {
        sosBtn.addEventListener(event, cancelHold);
      });

      /* =========================================================
   CURRENT LOCATION
   ========================================================= */

      const locationBtn = document.getElementById("locationBtn");

      const locationResult = document.getElementById("locationResult");

      const locationStatus = document.getElementById("locationStatus");

      const mapLink = document.getElementById("mapLink");

      const shareLocationBtn = document.getElementById("shareLocationBtn");

      const whatsappBtn = document.getElementById("whatsappBtn");

      let currentLatitude = null;
      let currentLongitude = null;

      /* Get Current Location */

      locationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          locationStatus.textContent =
            "Location services are not supported by this browser.";

          return;
        }

        locationBtn.disabled = true;

        locationBtn.textContent = "Getting Location...";

        locationStatus.textContent = "Please allow location access...";

        navigator.geolocation.getCurrentPosition(
          (position) => {
            currentLatitude = position.coords.latitude;

            currentLongitude = position.coords.longitude;

            const mapsUrl = `https://www.google.com/maps?q=${currentLatitude},${currentLongitude}`;

            locationStatus.textContent = `Location found: ${currentLatitude.toFixed(5)}, ${currentLongitude.toFixed(5)}`;

            mapLink.href = mapsUrl;

            const whatsappMessage = `My current location: ${mapsUrl}`;

            whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

            locationResult.classList.add("show");

            locationBtn.disabled = false;

            locationBtn.textContent = "Update My Location";
          },

          (error) => {
            locationBtn.disabled = false;

            locationBtn.textContent = "Get Current Location";

            if (error.code === error.PERMISSION_DENIED) {
              locationStatus.textContent =
                "Location permission was denied. Please allow location access.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              locationStatus.textContent =
                "Your location could not be determined.";
            } else if (error.code === error.TIMEOUT) {
              locationStatus.textContent =
                "Location request timed out. Please try again.";
            } else {
              locationStatus.textContent =
                "Unable to get your current location.";
            }
          },

          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      });

      /* =========================================================
   SHARE LOCATION
   ========================================================= */

      shareLocationBtn.addEventListener("click", async () => {
        if (currentLatitude === null || currentLongitude === null) {
          return;
        }

        const mapsUrl = `https://www.google.com/maps?q=${currentLatitude},${currentLongitude}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "My SakhiGo Location",

              text: "Here is my current location:",

              url: mapsUrl,
            });
          } catch (error) {
            /*
          User cancelled the
          native sharing menu.
        */
          }
        } else {
          /*
        Fallback for browsers
        without Web Share API.
      */

          whatsappBtn.click();
        }
      });

      /* =========================================================
   SHARED HELPERS
   ========================================================= */

      function escapeHtml(str) {
        return String(str).replace(
          /[&<>"']/g,
          (ch) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[ch],
        );
      }

      function isValidPhone(raw) {
        const cleaned = raw.replace(/[\s-]/g, "");
        return /^\+?[0-9]{7,15}$/.test(cleaned);
      }

      function distanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (d) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      function formatDistance(m) {
        return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
      }

      async function copyText(text, btn, defaultLabel) {
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied!";
        } catch (err) {
          btn.textContent = "Couldn't copy — select the text manually";
        }

        setTimeout(() => {
          btn.textContent = defaultLabel;
        }, 2200);
      }

      function geolocationErrorMessage(error) {
        if (error.code === error.PERMISSION_DENIED) {
          return "Location permission was denied. Please allow location access and try again.";
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          return "Your location could not be determined right now.";
        }
        if (error.code === error.TIMEOUT) {
          return "Location request timed out. Please try again.";
        }
        return "Unable to get your current location.";
      }

      /* =========================================================
   GUARDIANS (localStorage)
   ========================================================= */

      const GUARDIANS_KEY = "sakhigo_guardians";

      const guardianForm = document.getElementById("guardianForm");
      const guardianNameInput = document.getElementById("guardianName");
      const guardianPhoneInput = document.getElementById("guardianPhone");
      const guardianError = document.getElementById("guardianError");
      const guardianList = document.getElementById("guardianList");
      const guardianEmpty = document.getElementById("guardianEmpty");

      function loadGuardians() {
        try {
          const parsed = JSON.parse(localStorage.getItem(GUARDIANS_KEY) || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          return [];
        }
      }

      function saveGuardians(list) {
        try {
          localStorage.setItem(GUARDIANS_KEY, JSON.stringify(list));
        } catch (err) {
          /* Storage unavailable (private mode / full) — fail silently, list stays in-memory for this session. */
        }
      }

      function makeId() {
        return typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `g_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      }

      function renderGuardians() {
        const guardians = loadGuardians();

        guardianEmpty.hidden = guardians.length > 0;

        guardianList.innerHTML = guardians
          .map((g) => {
            const initial = escapeHtml((g.name || "?").trim().charAt(0).toUpperCase() || "?");

            return `
            <li class="guardian-item" data-id="${escapeHtml(g.id)}">
              <span class="guardian-avatar">${initial}</span>
              <span class="guardian-meta">
                <strong>${escapeHtml(g.name)}</strong>
                <span>${escapeHtml(g.phone)}</span>
              </span>
              <button type="button" class="guardian-remove" data-id="${escapeHtml(g.id)}" aria-label="Remove ${escapeHtml(g.name)}">
                &times;
              </button>
            </li>`;
          })
          .join("");
      }

      guardianForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = guardianNameInput.value.trim();
        const phone = guardianPhoneInput.value.trim();

        guardianError.hidden = true;

        if (!name || !phone) {
          guardianError.textContent = "Please add both a name and a phone number.";
          guardianError.hidden = false;
          return;
        }

        if (!isValidPhone(phone)) {
          guardianError.textContent =
            "That phone number doesn't look right. Include the country code, e.g. +91 98765 43210.";
          guardianError.hidden = false;
          return;
        }

        const guardians = loadGuardians();
        guardians.push({ id: makeId(), name, phone });
        saveGuardians(guardians);
        renderGuardians();

        guardianForm.reset();
        guardianNameInput.focus();
      });

      guardianList.addEventListener("click", (e) => {
        const btn = e.target.closest(".guardian-remove");
        if (!btn) return;

        const id = btn.getAttribute("data-id");
        const guardians = loadGuardians().filter((g) => g.id !== id);
        saveGuardians(guardians);
        renderGuardians();
      });

      renderGuardians();

      /* =========================================================
   REAL EMERGENCY SOS
   ========================================================= */

      const realSosBtn = document.getElementById("realSosBtn");
      const realSosFill = document.getElementById("realSosFill");
      const realSosBtnLabel = document.getElementById("realSosBtnLabel");
      const realSosStatus = document.getElementById("realSosStatus");
      const sosActions = document.getElementById("sosActions");
      const sosShareBtn = document.getElementById("sosShareBtn");
      const sosCopyBtn = document.getElementById("sosCopyBtn");
      const sosGuardianLinks = document.getElementById("sosGuardianLinks");

      const REAL_HOLD_MS = 2000;
      const DEFAULT_SOS_STATUS = realSosStatus.textContent;

      let realHoldRAF = null;
      let realHoldStart = null;
      let realSosSent = false;
      let currentSosMessage = "";

      function startRealHold(e) {
        if (realSosSent) return;

        e.preventDefault();

        realHoldStart = Date.now();
        realSosBtn.classList.add("holding");
        realSosBtnLabel.textContent = "Keep holding…";
        realSosStatus.textContent = "Holding — release to cancel.";

        realHoldRAF = requestAnimationFrame(tickRealHold);
      }

      function tickRealHold() {
        const elapsed = Date.now() - realHoldStart;
        const pct = Math.min(elapsed / REAL_HOLD_MS, 1);

        realSosFill.style.width = `${pct * 100}%`;

        if (pct >= 1) {
          triggerRealSOS();
          return;
        }

        realHoldRAF = requestAnimationFrame(tickRealHold);
      }

      function cancelRealHold() {
        if (realSosSent) return;

        cancelAnimationFrame(realHoldRAF);
        realSosFill.style.width = "0%";
        realSosBtn.classList.remove("holding");
        realSosBtnLabel.textContent = "Hold to send SOS";
        realSosStatus.textContent = DEFAULT_SOS_STATUS;
      }

      function renderGuardianQuickLinks(message) {
        const guardians = loadGuardians();
        const body = encodeURIComponent(message);

        if (guardians.length === 0) {
          sosGuardianLinks.innerHTML = `<p class="console-empty" style="margin: 10px 0 0">
            No guardians saved — add one above to get one-tap text, WhatsApp, and call links here.
          </p>`;
          return;
        }

        sosGuardianLinks.innerHTML = guardians
          .map((g) => {
            const cleaned = g.phone.replace(/[\s-]/g, "");
            const waDigits = cleaned.replace(/[^\d]/g, "");

            return `
            <div class="guardian-quick-row">
              <span class="guardian-quick-name">${escapeHtml(g.name)}</span>
              <a class="guardian-quick-link" href="sms:${encodeURIComponent(cleaned)}?body=${body}">Text</a>
              <a class="guardian-quick-link" href="https://wa.me/${waDigits}?text=${body}" target="_blank" rel="noopener">WhatsApp</a>
              <a class="guardian-quick-link" href="tel:${encodeURIComponent(cleaned)}">Call</a>
            </div>`;
          })
          .join("");
      }

      function showSosActions(message) {
        currentSosMessage = message;
        renderGuardianQuickLinks(message);
        sosActions.hidden = false;
      }

      function triggerRealSOS() {
        cancelAnimationFrame(realHoldRAF);
        realSosSent = true;

        realSosBtn.classList.remove("holding");
        realSosBtn.classList.add("sent");
        realSosBtnLabel.textContent = "Locating…";
        realSosStatus.textContent = "Getting your live location…";

        const fallbackMessage =
          "EMERGENCY — I need help and my location isn't available right now. Please call me or reach out immediately. Sent via SakhiGo.";

        if (!navigator.geolocation) {
          realSosBtnLabel.textContent = "Alert ready";
          realSosStatus.textContent =
            "This browser can't get your location — use the buttons below to reach out now.";
          showSosActions(fallbackMessage);
          rearmRealSos();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `EMERGENCY — I need help right now. My live location: ${mapsUrl}. Sent via SakhiGo.`;

            realSosBtnLabel.textContent = "Alert ready";
            realSosStatus.textContent =
              "Location found. Use a button below to notify your guardians and the police now.";

            showSosActions(message);
            rearmRealSos();
          },
          (error) => {
            realSosBtnLabel.textContent = "Alert ready";
            realSosStatus.textContent = `${geolocationErrorMessage(error)} You can still reach out below.`;

            showSosActions(fallbackMessage);
            rearmRealSos();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      }

      function rearmRealSos() {
        setTimeout(() => {
          realSosSent = false;
          realSosBtn.classList.remove("sent");
          realSosFill.style.width = "0%";
          realSosBtnLabel.textContent = "Hold to send SOS";
        }, 3000);
      }

      realSosBtn.addEventListener("mousedown", startRealHold);
      realSosBtn.addEventListener("touchstart", startRealHold, { passive: false });

      ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((event) => {
        realSosBtn.addEventListener(event, cancelRealHold);
      });

      sosShareBtn.addEventListener("click", async () => {
        if (!currentSosMessage) return;

        if (navigator.share) {
          try {
            await navigator.share({ title: "SakhiGo — Emergency Alert", text: currentSosMessage });
          } catch (err) {
            /* User cancelled the native share sheet. */
          }
        } else {
          copyText(currentSosMessage, sosShareBtn, "Share alert now (all apps)");
        }
      });

      sosCopyBtn.addEventListener("click", () => {
        if (!currentSosMessage) return;
        copyText(currentSosMessage, sosCopyBtn, "Copy alert message");
      });

      /* =========================================================
   SAFE PUBLIC AREAS NEARBY (OpenStreetMap Overpass API)
   ========================================================= */

      const findSafeBtn = document.getElementById("findSafeBtn");
      const safeStatus = document.getElementById("safeStatus");
      const safeList = document.getElementById("safeList");
      const safeWidenBtn = document.getElementById("safeWidenBtn");

      const SAFE_TYPES = {
        police: { label: "Police station", color: "var(--rose)" },
        hospital: { label: "Hospital", color: "var(--teal)" },
        pharmacy: { label: "Pharmacy", color: "var(--teal)" },
        bus_station: { label: "Bus station", color: "var(--violet)" },
        mall: { label: "Shopping mall", color: "var(--saffron)" },
        supermarket: { label: "Supermarket", color: "var(--saffron)" },
      };

      function typeInfoFor(tags) {
        if (tags.amenity && SAFE_TYPES[tags.amenity]) return SAFE_TYPES[tags.amenity];
        if (tags.shop && SAFE_TYPES[tags.shop]) return SAFE_TYPES[tags.shop];
        return { label: "Public place", color: "var(--text-dim)" };
      }

      function buildOverpassQuery(lat, lon, radius) {
        const around = `(around:${radius},${lat},${lon})`;
        return `[out:json][timeout:15];(
          node["amenity"="police"]${around};
          node["amenity"="hospital"]${around};
          node["amenity"="pharmacy"]${around};
          node["amenity"="bus_station"]${around};
          node["shop"="mall"]${around};
          node["shop"="supermarket"]${around};
        );out center 30;`;
      }

      function renderSafeList(items, lat, lon) {
        safeList.innerHTML = items
          .map((item) => {
            const info = typeInfoFor(item.tags || {});
            const name = escapeHtml(item.tags?.name || info.label);
            const dist = formatDistance(item.distance);
            const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`;

            return `
            <li class="safe-item">
              <span class="safe-dot" style="background: ${info.color}"></span>
              <span class="safe-meta">
                <strong>${name}</strong>
                <span>${info.label} · ${dist} away</span>
              </span>
              <a class="safe-directions" href="${dirUrl}" target="_blank" rel="noopener">Directions</a>
            </li>`;
          })
          .join("");
      }

      async function fetchSafeAreas(lat, lon, radius) {
        findSafeBtn.disabled = true;
        findSafeBtn.textContent = "Searching…";
        safeWidenBtn.hidden = true;
        safeStatus.textContent = "Searching nearby police, hospitals, malls & stores…";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
          const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(buildOverpassQuery(lat, lon, radius))}`,
            signal: controller.signal,
          });

          if (!response.ok) throw new Error("Overpass request failed");

          const data = await response.json();

          const items = (data.elements || [])
            .map((el) => {
              const elLat = el.lat ?? el.center?.lat;
              const elLon = el.lon ?? el.center?.lon;
              if (elLat == null || elLon == null) return null;

              return {
                ...el,
                lat: elLat,
                lon: elLon,
                distance: distanceMeters(lat, lon, elLat, elLon),
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 8);

          if (items.length === 0) {
            safeList.innerHTML = "";
            safeStatus.textContent = `No mapped safe spots found within ${(radius / 1000).toFixed(1)} km. Try widening the search, or use the helplines below.`;

            if (radius < 5000) {
              safeWidenBtn.hidden = false;
              safeWidenBtn.onclick = () => fetchSafeAreas(lat, lon, 5000);
            }
          } else {
            renderSafeList(items, lat, lon);
            safeStatus.textContent = `${items.length} safe spot${items.length > 1 ? "s" : ""} found nearby, closest first.`;
          }
        } catch (err) {
          safeList.innerHTML = "";
          safeStatus.textContent =
            "Couldn't reach the map data service right now. Check your connection and try again, or head to a well-lit main road and use a helpline below.";
        } finally {
          clearTimeout(timeoutId);
          findSafeBtn.disabled = false;
          findSafeBtn.textContent = "Find safe areas near me";
        }
      }

      findSafeBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          safeStatus.textContent = "Location services are not supported by this browser.";
          return;
        }

        findSafeBtn.disabled = true;
        findSafeBtn.textContent = "Getting your location…";
        safeStatus.textContent = "Please allow location access…";

        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchSafeAreas(position.coords.latitude, position.coords.longitude, 2000);
          },
          (error) => {
            findSafeBtn.disabled = false;
            findSafeBtn.textContent = "Find safe areas near me";
            safeStatus.textContent = geolocationErrorMessage(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      });



/* =========================================================
   SAKHIGO JOURNEY SAFETY PLANNER
   Uses open geocoding/routing services, then applies a small
   explainable safety layer for the MVP demo.
   ========================================================= */
(function initJourneyPlanner(){
  const destinationInput = document.getElementById("destinationInput");
  const suggestionsEl = document.getElementById("destinationSuggestions");
  const departureTime = document.getElementById("departureTime");
  const travelMode = document.getElementById("travelMode");
  const useLocationBtn = document.getElementById("useLocationBtn");
  const planBtn = document.getElementById("planJourneyBtn");
  const statusEl = document.getElementById("journeyStatus");
  const mapEl = document.getElementById("journeyMap");
  const titleEl = document.getElementById("journeyTitle");
  const metaEl = document.getElementById("journeyMeta");
  const scoreEl = document.getElementById("journeyScore");
  const factsEl = document.getElementById("journeyFacts");
  const guidanceEl = document.getElementById("journeyGuidance");
  const actionsEl = document.getElementById("journeyActions");
  const startBtn = document.getElementById("startJourneyBtn");
  const directionsBtn = document.getElementById("routeDirectionsBtn");
  const nearestSafeBtn = document.getElementById("nearestSafeBtn");
  const checkinBar = document.getElementById("checkinBar");
  const checkinBtn = document.getElementById("checkinBtn");
  const checkinTimer = document.getElementById("checkinTimer");

  if (!destinationInput || !planBtn || !mapEl) return;

  let map = null;
  let routeLayer = null;
  let startMarker = null;
  let destinationMarker = null;
  let currentPosition = null;
  let destination = null;
  let routeData = null;
  let safePoints = [];
  let lastSafePoint = null;
  let autocompleteTimer = null;
  let journeyStarted = false;
  let checkinInterval = null;
  let checkinSeconds = 420;
  let safeMarkerLayer = null;

  function pad(n){return String(n).padStart(2,"0");}
  function setDefaultDeparture(){
    const d = new Date(Date.now() + 10*60*1000);
    d.setSeconds(0,0);
    departureTime.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  setDefaultDeparture();

  function initMap(lat=20.5937, lon=78.9629){
    if (map) return;
    if (!window.L){
      mapEl.innerHTML = '<div style="padding:20px;color:#bbb">Map library could not load. Route details and directions are still available below.</div>';
      return;
    }
    map = L.map(mapEl,{zoomControl:true,scrollWheelZoom:false}).setView([lat,lon],13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
  }
  initMap();

  function clearMapLayers(){
    if (!map) return;
    if (routeLayer){ map.removeLayer(routeLayer); routeLayer=null; }
    if (startMarker){ map.removeLayer(startMarker); startMarker=null; }
    if (destinationMarker){ map.removeLayer(destinationMarker); destinationMarker=null; }
  }

  function getCurrentLocation(options={}){
    return new Promise((resolve,reject)=>{
      if (!navigator.geolocation){reject(new Error("Location services are not supported by this browser."));return;}
      navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:12000,maximumAge:30000,...options});
    });
  }

  async function reverseGeocode(lat,lon){
    const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const response=await fetch(url,{headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("Reverse geocoding failed");
    const data=await response.json();
    return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }

  async function geocodeDestination(query){
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`;
    const response=await fetch(url,{headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("Destination search is unavailable right now.");
    const data=await response.json();
    return data.map(x=>({lat:Number(x.lat),lon:Number(x.lon),label:x.display_name}));
  }

  function showSuggestions(items){
    suggestionsEl.innerHTML="";
    if(!items.length){suggestionsEl.hidden=true;return;}
    items.forEach(item=>{
      const b=document.createElement("button");
      b.type="button"; b.className="destination-suggestion"; b.textContent=item.label;
      b.addEventListener("click",()=>{
        destination=item; destinationInput.value=item.label; suggestionsEl.hidden=true;
      });
      suggestionsEl.appendChild(b);
    });
    suggestionsEl.hidden=false;
  }

  destinationInput.addEventListener("input",()=>{
    destination=null;
    const q=destinationInput.value.trim();
    clearTimeout(autocompleteTimer);
    if(q.length<3){suggestionsEl.hidden=true;return;}
    autocompleteTimer=setTimeout(async()=>{
      try{ showSuggestions(await geocodeDestination(q)); }catch{ suggestionsEl.hidden=true; }
    },500);
  });

  useLocationBtn.addEventListener("click", async()=>{
    try{
      statusEl.textContent="Getting your current location…";
      const pos=await getCurrentLocation();
      currentPosition={lat:pos.coords.latitude,lon:pos.coords.longitude};
      const label=await reverseGeocode(currentPosition.lat,currentPosition.lon);
      useLocationBtn.textContent="Location ready";
      useLocationBtn.dataset.ready="true";
      statusEl.textContent="Current location is ready. Now enter your destination.";
      initMap(currentPosition.lat,currentPosition.lon);
      if(map) map.setView([currentPosition.lat,currentPosition.lon],15);
      if(destinationInput.value.trim()==="") destinationInput.placeholder=`Current area: ${label.split(",")[0]}`;
    }catch(err){ statusEl.textContent=err.message || "Could not get your current location."; }
  });

  async function loadStart(){
    if(currentPosition) return currentPosition;
    const pos=await getCurrentLocation();
    currentPosition={lat:pos.coords.latitude,lon:pos.coords.longitude};
    return currentPosition;
  }

  async function routeBetween(start,end,mode){
    const profile=mode==="driving"?"driving":"foot";
    const url=`https://router.project-osrm.org/route/v1/${profile}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    const response=await fetch(url);
    if(!response.ok) throw new Error("Routing service is unavailable right now.");
    const data=await response.json();
    if(data.code!=="Ok" || !data.routes?.length) throw new Error("No practical route was found to that destination.");
    return data;
  }

  function uniqueById(items){const seen=new Set();return items.filter(x=>{const id=x.id||`${x.lat},${x.lon}`;if(seen.has(id))return false;seen.add(id);return true;});}

  async function getSafePoints(lat,lon,radius=1800){
    const query=`[out:json][timeout:12];(nwr[amenity~"police|hospital|pharmacy|fire_station|clinic|community_centre"](around:${radius},${lat},${lon});nwr[shop~"convenience|supermarket|mall"](around:${radius},${lat},${lon});nwr[amenity="bank"](around:${radius},${lat},${lon}););out center tags;`;
    const response=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"text/plain"},body:query});
    if(!response.ok) throw new Error("Safe-point service is unavailable.");
    const data=await response.json();
    return uniqueById((data.elements||[]).map(el=>({
      id:el.id,tags:el.tags||{},lat:el.lat??el.center?.lat,lon:el.lon??el.center?.lon
    })).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)).map(x=>({...x,name:x.tags.name||"Safe public point",type:getPointType(x.tags)})));
  }

  function getPointType(tags){
    if(tags.amenity==="police") return "Police";
    if(tags.amenity==="hospital") return "Hospital";
    if(tags.amenity==="pharmacy") return "Pharmacy";
    if(tags.amenity==="fire_station") return "Fire station";
    if(tags.amenity==="clinic") return "Clinic";
    if(tags.amenity==="community_centre") return "Community centre";
    if(tags.shop) return "Public / staffed place";
    return "Public place";
  }

  function distanceM(a,b){
    const R=6371000, p1=a.lat*Math.PI/180,p2=b.lat*Math.PI/180,dp=(b.lat-a.lat)*Math.PI/180,dl=(b.lon-a.lon)*Math.PI/180;
    const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
  }

  function fmtDistance(m){return m<1000?`${Math.round(m)} m`:`${(m/1000).toFixed(1)} km`;}
  function fmtDuration(sec){const mins=Math.max(1,Math.round(sec/60));if(mins<60)return `${mins} min`;return `${Math.floor(mins/60)}h ${mins%60}m`;}

  function scoreJourney(route, departure){
    const hour=departure.getHours()+departure.getMinutes()/60;
    const prefs=[...document.querySelectorAll(".journey-pref:checked")].map(x=>x.value);
    let score=92;
    if(hour>=19 && hour<21) score-=8;
    if(hour>=21 && hour<23) score-=16;
    if(hour>=23 || hour<5) score-=28;
    if(route.distance>8000) score-=4;
    if(route.duration/60>55) score-=5;
    if(!prefs.includes("lighting")) score+=2;
    if(!prefs.includes("crowd")) score+=2;
    if(!prefs.includes("public")) score+=2;
    if(!prefs.includes("familiar")) score+=1;
    const safeBoost=Math.min(8, safePoints.length*1.5);
    score+=safeBoost;
    return Math.max(38,Math.min(97,Math.round(score)));
  }

  function riskLabel(score){return score>=80?"LOW RISK · RECOMMENDED":score>=65?"MEDIUM RISK · USE CAUTION":"HIGHER RISK · CONSIDER A SAFER WINDOW";}

  function routeCautions(score, departure){
    const hour=departure.getHours();
    const caution=[];
    if(hour>=21 || hour<5)caution.push("Late-night isolation can increase risk.");
    if(!safePoints.length)caution.push("Few nearby public anchors were found.");
    if(score<65)caution.push("Consider an earlier departure or a safer public stop.");
    return caution;
  }

  function addSafeMarkers(points){
    if(!map) return;
    if(safeMarkerLayer){ safeMarkerLayer.clearLayers(); } else { safeMarkerLayer = L.layerGroup().addTo(map); }
    points.slice(0,12).forEach(p=>{
      L.circleMarker([p.lat,p.lon],{radius:5,color:"#f0b34f",weight:2,fillOpacity:.7}).addTo(safeMarkerLayer).bindPopup(`<strong>${escapeHtml(p.name)}</strong><br>${escapeHtml(p.type)}<br><a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank" rel="noopener">Directions</a>`);
    });
  }

  function suggestedWindow(departure, score){
    const start = new Date(departure.getTime() - 10*60*1000);
    const end = new Date(departure.getTime() + (score >= 80 ? 10 : 5)*60*1000);
    return `${start.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}–${end.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}`;
  }

  function updateFacts(score, route, cautions, departure){
    const nextCheck=Math.max(7,Math.min(15,Math.round(route.duration/60/2)));
    factsEl.innerHTML=`
      <div><strong>Route</strong><span>${fmtDistance(route.distance)} · ${fmtDuration(route.duration)}</span></div>
      <div><strong>Safe points</strong><span>${safePoints.length} nearby</span></div>
      <div><strong>Departure window</strong><span>${suggestedWindow(departure,score)}</span></div>
      <div><strong>Next check-in</strong><span>${nextCheck} min</span></div>`;
  }

  function updateGuidance(score, departure, route){
    const hour=departure.getHours();
    const suggested=hour>=22 || hour<5 ? "Try leaving earlier if possible; SakhiGo sees a late-night context here." : "Keep to the recommended route and stay close to public anchors.";
    const pointText=safePoints[0]?` Nearest safe point: ${safePoints[0].name} (${fmtDistance(distanceM(currentPosition,safePoints[0]))}).`:" Consider a staffed public place as your fallback stop.";
    guidanceEl.innerHTML=`<strong>Next action</strong><span>${riskLabel(score)}. ${suggested}${pointText}</span>`;
  }

  function formatRouteTitle(){
    const raw=destinationInput.value.trim()||destination?.label||"Destination";
    const short=raw.split(",")[0];
    titleEl.textContent=`To ${short}`;
  }

  async function planJourney(){
    try{
      planBtn.disabled=true; planBtn.textContent="Analyzing route…"; statusEl.textContent="Getting your location, destination and route…";
      if(!destination){
        const q=destinationInput.value.trim();
        if(q.length<3) throw new Error("Enter a destination first.");
        const matches=await geocodeDestination(q);
        if(!matches.length) throw new Error("I couldn't find that destination. Try a nearby landmark, campus, or full address.");
        destination=matches[0]; destinationInput.value=destination.label;
      }
      const start=await loadStart();
      routeData=await routeBetween(start,destination,travelMode.value);
      const dep=new Date(departureTime.value);
      if(Number.isNaN(dep.getTime())) throw new Error("Choose a departure time.");
      safePoints=[];
      try{safePoints=await getSafePoints(start.lat,start.lon,2200);}catch{safePoints=[];}
      lastSafePoint=safePoints.sort((a,b)=>distanceM(start,a)-distanceM(start,b))[0]||null;
      clearMapLayers();
      initMap(start.lat,start.lon);
      if(map){
        routeLayer=L.geoJSON(routeData.routes[0].geometry,{style:{color:"#b49bff",weight:6,opacity:.9}}).addTo(map);
        startMarker=L.circleMarker([start.lat,start.lon],{radius:7,color:"#78ffb5",weight:3,fillOpacity:1}).addTo(map).bindTooltip("You");
        destinationMarker=L.circleMarker([destination.lat,destination.lon],{radius:7,color:"#ff6f8f",weight:3,fillOpacity:1}).addTo(map).bindTooltip("Destination");
        addSafeMarkers(safePoints);
        const bounds=routeLayer.getBounds(); if(bounds.isValid()) map.fitBounds(bounds,{padding:[28,28]});
      }
      const score=scoreJourney(routeData.routes[0],dep);
      const cautions=routeCautions(score,dep);
      scoreEl.textContent=score; titleEl.textContent=`To ${destination.label.split(",")[0]}`;
      metaEl.textContent=`${destination.label} · ${dep.toLocaleString([], {dateStyle:"medium",timeStyle:"short"})}`;
      updateFacts(score,routeData.routes[0],cautions,dep); updateGuidance(score,dep,routeData.routes[0]);
      actionsEl.hidden=false;
      directionsBtn.onclick=()=>window.open(`https://www.google.com/maps/dir/?api=1&origin=${currentPosition.lat},${currentPosition.lon}&destination=${destination.lat},${destination.lon}&travelmode=${travelMode.value}`,"_blank","noopener");
      nearestSafeBtn.onclick=()=>{
        if(lastSafePoint) window.open(`https://www.google.com/maps/dir/?api=1&origin=${currentPosition.lat},${currentPosition.lon}&destination=${lastSafePoint.lat},${lastSafePoint.lon}`,"_blank","noopener");
        else statusEl.textContent="No mapped safe point was found nearby. Use the Safe Areas panel below.";
      };
      statusEl.textContent=`${riskLabel(score)} — route calculated. Departure window can be adjusted and recalculated.`;
      planBtn.textContent="Recalculate safer route";
    }catch(err){
      statusEl.textContent=err.message||"Couldn't calculate the route.";
      actionsEl.hidden=true;
    }finally{planBtn.disabled=false;if(planBtn.textContent!=="Recalculate safer route")planBtn.textContent="Calculate safer route";}
  }

  window.SakhiGoJourney = {
    getState(){ return { active: journeyStarted, destination, currentPosition, routeData, safePoints, nearestSafePoint: lastSafePoint }; },
    getNearestSafePoint(){ return lastSafePoint; },
    openNearestSafePoint(){
      if(!lastSafePoint || !currentPosition) return false;
      const url=`https://www.google.com/maps/dir/?api=1&origin=${currentPosition.lat},${currentPosition.lon}&destination=${lastSafePoint.lat},${lastSafePoint.lon}`;
      window.open(url,"_blank","noopener");
      guidanceEl.innerHTML=`<strong>Safety reroute</strong><span>Head toward ${escapeHtml(lastSafePoint.name)} — ${escapeHtml(lastSafePoint.type)}.</span>`;
      statusEl.textContent="Nearest mapped safe point opened for directions.";
      return true;
    }
  };

  planBtn.addEventListener("click",planJourney);

  startBtn.addEventListener("click",()=>{
    if(!routeData){return;}
    journeyStarted=true; checkinBar.hidden=false; checkinSeconds=420; startBtn.textContent="Journey active"; startBtn.disabled=true;
    statusEl.textContent="Journey started. Keep SakhiGo open for check-ins; use SOS if something feels wrong.";
    if(checkinInterval) clearInterval(checkinInterval);
    checkinInterval=setInterval(()=>{
      checkinSeconds--;
      if(checkinSeconds<=0){checkinSeconds=420; statusEl.textContent="Check-in due — please confirm you're safe."; checkinBtn.textContent="I'm safe — check in";}
      const m=Math.floor(checkinSeconds/60),s=checkinSeconds%60; checkinTimer.textContent=`Next check-in in ${m}m ${String(s).padStart(2,"0")}s`;
    },1000);
  });

  checkinBtn.addEventListener("click",()=>{checkinSeconds=420;checkinBtn.textContent="Checked in ✓";statusEl.textContent="Check-in recorded on this device. Next reminder is in 7 minutes.";setTimeout(()=>checkinBtn.textContent="I'm safe",1800);});

  window.addEventListener("beforeunload",()=>{if(checkinInterval) clearInterval(checkinInterval);});
})();

      /* =========================================================
   SERVICE WORKER (offline app shell)
   ========================================================= */

      if (
        "serviceWorker" in navigator &&
        (location.protocol === "https:" || location.hostname === "localhost")
      ) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("sw.js").catch(() => {
            /* Offline caching is a nice-to-have — safe to ignore if registration fails. */
          });
        });
      }
    
    /* =========================================================
   SAKHIGO AI ASSISTANT (Gemini API, called directly from the browser)
   ========================================================= */

    (function initSakhiAI() {
      const GEMINI_KEY_STORAGE = "sakhigo_gemini_key";
      // Change this if Google renames/retires the model — check https://aistudio.google.com
      // for the exact model name your API key currently has access to.
      const GEMINI_MODEL = "gemini-2.5-flash";
      const GEMINI_URL = (key) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

      const SYSTEM_INSTRUCTION = [
        "You are Sakhi, a calm and supportive safety assistant inside the SakhiGo app, used mainly by women in India.",
        "Keep replies short (2-5 sentences), practical, warm, and non-alarmist.",
        "If the user describes danger that sounds current or urgent, your FIRST sentence must tell them to call 112 (India's emergency number) or 100 (police) right now, and to use SakhiGo's SOS button — then keep helping.",
        "You cannot see the user's location, contact anyone, or send messages on their behalf — never imply that you can. Direct them to the app's SOS button and helplines for that.",
        "You can: give general safety tips, calming grounding guidance, what to do in common unsafe situations, and general informational answers.",
        "You are not a doctor or lawyer — for medical or legal questions, say so briefly and suggest a relevant professional or helpline.",
      ].join(" ");

      const fabBtn = document.getElementById("aiFabBtn");
      const panel = document.getElementById("aiPanel");
      const closeBtn = document.getElementById("aiCloseBtn");
      const settingsBtn = document.getElementById("aiSettingsBtn");
      const settingsPanel = document.getElementById("aiSettings");
      const keyInput = document.getElementById("aiKeyInput");
      const saveKeyBtn = document.getElementById("aiSaveKeyBtn");
      const clearKeyBtn = document.getElementById("aiClearKeyBtn");
      const messagesEl = document.getElementById("aiMessages");
      const form = document.getElementById("aiForm");
      const input = document.getElementById("aiInput");

      if (!fabBtn || !panel) return; // widget not present on this page

      let history = []; // { role: "user" | "model", text: string }
      let sending = false;

      function getKey() {
        try {
          return localStorage.getItem(GEMINI_KEY_STORAGE) || "";
        } catch (err) {
          return "";
        }
      }

      function setKey(key) {
        try {
          localStorage.setItem(GEMINI_KEY_STORAGE, key);
        } catch (err) {
          /* localStorage unavailable (private mode) — key just won't persist. */
        }
      }

      function removeKey() {
        try {
          localStorage.removeItem(GEMINI_KEY_STORAGE);
        } catch (err) {
          /* ignore */
        }
      }

      function openPanel(focusInput = true) {
        panel.hidden = false;
        fabBtn.setAttribute("aria-expanded", "true");

        if (!focusInput) return;

        if (!getKey()) {
          settingsPanel.hidden = false;
          keyInput.focus();
        } else {
          input.focus();
        }
      }

      function closePanel() {
        panel.hidden = true;
        fabBtn.setAttribute("aria-expanded", "false");
      }

      fabBtn.addEventListener("click", () => {
        if (panel.hidden) openPanel();
        else closePanel();
      });

      // Hover-to-open: hovering the button (or the open panel) keeps it open;
      // moving away from both closes it after a short delay so moving the
      // mouse from the button to the panel doesn't flicker it shut.
      let hoverCloseTimer = null;

      function cancelHoverClose() {
        if (hoverCloseTimer) {
          clearTimeout(hoverCloseTimer);
          hoverCloseTimer = null;
        }
      }

      function scheduleHoverClose() {
        cancelHoverClose();
        hoverCloseTimer = setTimeout(() => {
          closePanel();
        }, 250);
      }

      fabBtn.addEventListener("mouseenter", () => {
        cancelHoverClose();
        openPanel(false);
      });

      fabBtn.addEventListener("mouseleave", scheduleHoverClose);
      panel.addEventListener("mouseenter", cancelHoverClose);
      panel.addEventListener("mouseleave", scheduleHoverClose);

      closeBtn.addEventListener("click", closePanel);

      settingsBtn.addEventListener("click", () => {
        settingsPanel.hidden = !settingsPanel.hidden;
        if (!settingsPanel.hidden) {
          keyInput.value = getKey();
          keyInput.focus();
        }
      });

      saveKeyBtn.addEventListener("click", () => {
        const value = keyInput.value.trim();
        if (!value) return;
        setKey(value);
        settingsPanel.hidden = true;
        input.focus();
      });

      clearKeyBtn.addEventListener("click", () => {
        removeKey();
        keyInput.value = "";
      });

      function appendMessage(role, text) {
        const div = document.createElement("div");
        div.className =
          role === "user" ? "ai-msg ai-msg-user" : role === "error" ? "ai-msg ai-msg-error" : "ai-msg ai-msg-bot";

        const p = document.createElement("p");
        p.textContent = text; // textContent — never innerHTML — so nothing here can inject markup
        div.appendChild(p);

        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      function appendTyping() {
        const div = document.createElement("div");
        div.className = "ai-msg ai-msg-typing";
        div.id = "aiTypingIndicator";
        div.textContent = "Sakhi is typing…";
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      function removeTyping() {
        const el = document.getElementById("aiTypingIndicator");
        if (el) el.remove();
      }

      async function callGemini(userText) {
        const key = getKey();

        const contents = history
          .slice(-10) // keep the last few turns so replies stay quick and on-topic
          .concat([{ role: "user", text: userText }])
          .map((turn) => ({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
          }));

        const response = await fetch(GEMINI_URL(key), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents,
          }),
        });

        if (!response.ok) {
          if (response.status === 400 || response.status === 403) {
            throw new Error("Your Gemini API key looks invalid or isn't enabled for this model. Check it in Settings.");
          }
          if (response.status === 429) {
            throw new Error("Gemini's free-tier rate limit was hit. Wait a moment and try again.");
          }
          throw new Error("Gemini couldn't answer that right now. Please try again.");
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();

        if (!text) {
          throw new Error("Gemini didn't return a reply — please try rephrasing.");
        }

        return text;
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (sending) return;

        const text = input.value.trim();
        if (!text) return;

        if (!getKey()) {
          settingsPanel.hidden = false;
          keyInput.focus();
          return;
        }

        appendMessage("user", text);
        history.push({ role: "user", text });
        input.value = "";

        sending = true;
        input.disabled = true;
        appendTyping();

        try {
          const reply = await callGemini(text);
          removeTyping();
          appendMessage("bot", reply);
          history.push({ role: "model", text: reply });
        } catch (err) {
          removeTyping();
          appendMessage("error", err.message || "Something went wrong talking to Gemini.");
        } finally {
          sending = false;
          input.disabled = false;
          input.focus();
        }
      });
    })();
