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

  // Poster categories + board assignments live in poster-data.js (shared with vote.html).
  const categories = window.MNRI_CATEGORIES || {};
  const assignments = window.MNRI_ASSIGNMENTS || {};

  // IDs: floor-room-number. H = hallway, SV = Solar Vehicle wall, ST = study space.
  const slotWhere = (id) =>
    ["1-164-18", "1-164-19", "1-164-20"].includes(id) ? "1st floor — easels outside the top-left corner of Shep 164 (Drone Lab), facing down" :
    id.startsWith("1-164-") ? "1st floor — Shep 164 (Drone Lab)" :
    id.startsWith("1-H-") ? "1st-floor hallway — Shep 164 outer wall" :
    id.startsWith("1-SV-") ? "1st-floor hallway — Solar Vehicle Project wall" :
    id.startsWith("2-ST-") ? "2nd-floor study space — easel" :
    ["2-H-01", "2-H-02"].includes(id) ? "2nd-floor hallway — Shep 256 glass" :
    id === "2-H-03" ? "2nd-floor hallway — easel" : "2nd-floor hallway — glass over Shep 164";

  // Colour each board by category; unassigned boards render as open slots.
  mapHotspots.forEach((h) => {
    const a = assignments[h.dataset.poster];
    const tile = h.querySelector(".tile");
    if (!tile) return;
    if (a) tile.style.fill = categories[a.cat].color;
    else tile.classList.add("empty");
  });

  // Category legend (count per category), placed before the static legend items.
  const legend = document.getElementById("map-legend");
  if (legend) {
    Object.keys(categories).reverse().forEach((key) => {
      const n = Object.values(assignments).filter((a) => a.cat === key).length;
      const item = document.createElement("span");
      item.className = "legend-item";
      item.innerHTML = '<span class="legend-dot" style="background:' + categories[key].color + '"></span> ' +
        categories[key].name + " (" + n + ")";
      legend.prepend(item);
    });
  }

  function openPoster(id) {
    const a = assignments[id];
    const where = slotWhere(id);

    detailTitle.innerHTML = 'Poster <span id="detail-id">' + id + "</span>" + (a ? " &mdash; " + a.title : " &mdash; Open slot");
    detailAbstract.textContent = "Location: " + where;
    detailPresenter.innerHTML = "<strong>Presenter:</strong> " + (a ? a.presenter : "—");
    detailTopic.innerHTML = "<strong>Category:</strong> " + (a ? categories[a.cat].name : "—");
    const actions = document.getElementById("detail-actions");
    if (actions) {
      const hasPdf = !!a && (window.MNRI_PDFS || []).indexOf(id) !== -1;
      actions.hidden = !a;
      document.getElementById("detail-vote").href = "vote.html?p=" + encodeURIComponent(id);
      const pdfLink = document.getElementById("detail-pdf");
      pdfLink.hidden = !hasPdf;
      if (hasPdf) pdfLink.href = "posters/" + id + ".pdf";
    }

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

  // Hover / focus tooltip: board ID, title and presenter, placed above the board.
  const mapTip = document.getElementById("map-tip");
  function showTip(hotspot) {
    if (!mapTip) return;
    const id = hotspot.dataset.poster;
    const a = assignments[id];
    mapTip.innerHTML = "";
    const head = document.createElement("strong");
    head.textContent = id + (a ? " · " + categories[a.cat].name : " · Open slot");
    mapTip.appendChild(head);
    if (a) {
      const title = document.createElement("span");
      title.className = "map-tip-title";
      title.textContent = a.title;
      const who = document.createElement("span");
      who.className = "map-tip-who";
      who.textContent = a.presenter;
      mapTip.append(title, who);
      mapTip.style.borderTopColor = categories[a.cat].color;
    } else {
      mapTip.style.borderTopColor = "";
    }
    mapTip.hidden = false;

    const box = mapTip.parentElement.getBoundingClientRect();
    const r = hotspot.getBoundingClientRect();
    const tw = mapTip.offsetWidth, th = mapTip.offsetHeight;
    let left = r.left - box.left + r.width / 2 - tw / 2;
    left = Math.max(6, Math.min(left, box.width - tw - 6));
    let top = r.top - box.top - th - 8;
    if (top < 6) top = r.bottom - box.top + 8;
    mapTip.style.left = left + "px";
    mapTip.style.top = top + "px";
  }
  function hideTip() {
    if (mapTip) mapTip.hidden = true;
  }

  mapHotspots.forEach((hotspot) => {
    hotspot.addEventListener("mouseenter", () => showTip(hotspot));
    hotspot.addEventListener("mouseleave", hideTip);
    hotspot.addEventListener("focus", () => showTip(hotspot));
    hotspot.addEventListener("blur", hideTip);
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
