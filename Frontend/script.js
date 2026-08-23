
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
    