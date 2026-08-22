
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
    