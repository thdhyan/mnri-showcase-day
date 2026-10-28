/* ==========================================================================
   MNRI Showcase Day — Shared Script (Enhanced)
   ========================================================================== */

(function () {
  "use strict";

  // ---------- Lucide icons render ----------
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  renderIcons();
  // Re-render after fonts settle
  window.addEventListener("load", renderIcons);

  // ---------- Scroll reveal animations ----------
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  // ---------- Active nav link based on current page ----------
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop();
    if (href === currentPage) link.classList.add("active");
  });

  // ---------- Mobile navigation toggle ----------
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navMenu.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------- Interactive poster map (posters.html) ----------
  const mapHotspots = document.querySelectorAll(".map-hotspot.poster");
  const detailPanel = document.getElementById("poster-detail");
  const detailTitle = document.getElementById("detail-title");
  const detailId = document.getElementById("detail-id");
  const detailAbstract = document.getElementById("detail-abstract");
  const detailPresenter = document.getElementById("detail-presenter");
  const detailTopic = document.getElementById("detail-topic");
  const closeDetail = document.querySelector(".close-detail");

  // Poster slots P01–P20 per the event doc ("Student Poster Session — Shepherd Lab 164 + Hallways").
  // Titles/presenters pending student submissions (form deadline Oct 16, review deadline Oct 23, 2026).
  const posterData = {};
  for (let i = 1; i <= 20; i++) {
    const id = "P" + String(i).padStart(2, "0");
    posterData[id] = {
      title: "Poster Slot " + id,
      presenter: "To be announced",
      topic: "Shepherd Lab 164 + Hallways",
      abstract: "Student poster slot pending submission and review. Submission deadline: Oct 16, 2026; reviewed selection deadline: Oct 23, 2026.",
    };
  }

  function openPoster(id) {
    const data = posterData[id] || {
      title: "Poster " + id,
      presenter: "To be announced",
      topic: "—",
      abstract: "Abstract and details to be added prior to the event.",
    };

    detailTitle.innerHTML = 'Poster <span id="detail-id">' + id + "</span>";
    detailAbstract.textContent = data.abstract;
    detailPresenter.innerHTML = "<strong>Presenter:</strong> " + data.presenter;
    detailTopic.innerHTML = "<strong>Topic:</strong> " + data.topic;

    mapHotspots.forEach((h) => h.classList.remove("active"));
    const active = document.querySelector('.map-hotspot.poster[data-poster="' + id + '"]');
    if (active) active.classList.add("active");

    if (detailPanel) {
      detailPanel.hidden = false;
      detailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function closePoster() {
    if (detailPanel) detailPanel.hidden = true;
    mapHotspots.forEach((h) => h.classList.remove("active"));
  }

  mapHotspots.forEach((hotspot) => {
    hotspot.addEventListener("click", () => openPoster(hotspot.dataset.poster));
    hotspot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPoster(hotspot.dataset.poster);
      }
    });
  });

  if (closeDetail) closeDetail.addEventListener("click", closePoster);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailPanel && !detailPanel.hidden) closePoster();
  });

  // ---------- Map layer toggle buttons (visual stub) ----------
  document.querySelectorAll(".map-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const controls = btn.closest(".map-controls");
      if (controls) controls.querySelectorAll(".map-btn").forEach((b) => b.classList.remove("map-btn-active"));
      btn.classList.add("map-btn-active");
    });
  });

  // ---------- Walking route photo carousel (navigation.html) ----------
  const carousel = document.getElementById("routeCarousel");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = Array.from(track.querySelectorAll(".carousel-slide"));
    const dotsWrap = document.getElementById("carouselDots");
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    let index = 0;
    let autoTimer = null;
    const AUTO_MS = 6000;

    // Build dots
    const dots = slides.map((_, i) => {
      const d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Go to image " + (i + 1));
      d.addEventListener("click", () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(d);
      return d;
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d, j) => d.classList.toggle("on", j === index));
      slides.forEach((s, j) => s.setAttribute("aria-hidden", String(j !== index)));
    }

    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function startAuto() { stopAuto(); autoTimer = setInterval(() => goTo(index + 1), AUTO_MS); }
    function restartAuto() { goTo(index); startAuto(); }

    prevBtn.addEventListener("click", () => { goTo(index - 1); restartAuto(); });
    nextBtn.addEventListener("click", () => { goTo(index + 1); restartAuto(); });

    // Pause on hover / focus
    carousel.addEventListener("mouseenter", stopAuto);
    carousel.addEventListener("mouseleave", startAuto);
    carousel.addEventListener("focusin", stopAuto);
    carousel.addEventListener("focusout", startAuto);

    // Keyboard arrows
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { goTo(index - 1); restartAuto(); }
      if (e.key === "ArrowRight") { goTo(index + 1); restartAuto(); }
    });

    // Touch swipe
    let startX = null;
    carousel.addEventListener("pointerdown", (e) => { startX = e.clientX; stopAuto(); });
    function endSwipe(e) {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? index + 1 : index - 1); }
      startX = null;
      startAuto();
    }
    carousel.addEventListener("pointerup", endSwipe);
    carousel.addEventListener("pointercancel", () => { startX = null; startAuto(); });

    goTo(0);
    startAuto();
  }

  // ---------- Page scroll progress + back-to-top ----------
  const progressBar = document.querySelector(".page-progress");
  const backTop = document.querySelector(".back-to-top");

  function updateScrollUI() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    if (backTop) backTop.classList.toggle("show", window.scrollY > 600);
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI);
  updateScrollUI();

  if (backTop) {
    backTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  console.log("MNRI Showcase Day site initialized.");
})();
