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

  // Poster categories (see POSTER_CATEGORIES.md) — colour used for the board on the map + legend.
  const categories = {
    marine:     { name: "Marine & Underwater Robotics",                   color: "#0072B2" },
    learning:   { name: "Robot Learning, Grasping & Loco-manipulation",   color: "#D55E00" },
    perception: { name: "Perception, SLAM & Field/Transport Autonomy",    color: "#009E73" },
    space:      { name: "Spacecraft & Aerospace Systems",                 color: "#7E57C2" },
    wearables:  { name: "Wearables, Soft Robotics & Assistive HRI",       color: "#CC79A7" },
    control:    { name: "Control Theory & Dynamical Systems",             color: "#E69F00" },
    sensing:    { name: "Tactile & Physical Sensing",                     color: "#56B4E9" },
    multiagent: { name: "Multi-agent & Swarm Systems",                    color: "#8C6D31" },
  };

  // Board locations per the final Plan C layout (28 boards).
  const slotWhere = (id) =>
    id[0] === "P" ? "Shep 164 (Drone Lab) — inside" :
    id[0] === "O" ? "Shep 164 outer wall — 1st-floor hallway" :
    (id === "F1" || id === "F2") ? "2nd-floor hallway — Shep 256 glass" :
    id === "F3" ? "2nd-floor hallway — easel" : "2nd-floor hallway — glass over Shep 164";

  // MOCK assignment: 25 posters on 28 boards, same category never on neighbouring boards.
  // Boards not listed here are open slots (room for late additions).
  const assignments = {
    P1:  { cat: "marine",     title: "Design and Development of the MeCO Open-Source AUV", presenter: "David Widhalm" },
    P2:  { cat: "learning",   title: "Reasoning Over Fully-occluded Obstacle for Non-prehensile Loco-manipulation", presenter: "Minghao Zou" },
    P3:  { cat: "perception", title: "FLi-SLAM: FPGA Codesign for ICP Registration in 3D LiDAR SLAM", presenter: "Sangjae Park" },
    P4:  { cat: "space",      title: "Spacecraft Motion Simulation using Cable-Driven Parallel Robots (SPACESiM)", presenter: "Konner Brickey" },
    P5:  { cat: "marine",     title: "SeaCube: Open-Source Autonomous Docking Station for AUV Operations", presenter: "Rishi Mukherjee" },
    P6:  { cat: "learning",   title: "CrowdMAPS: Multiple Actions per State for Robot Imitation Learning", presenter: "Yilong Song" },
    P7:  { cat: "wearables",  title: "Smart Thermally Actuating Textiles: Lumbar Support Garment", presenter: "Audrey Percich" },
    P8:  { cat: "control",    title: "Data-Driven Robust Refinement of Dual-Stage HDD Controllers", presenter: "Erik Lehner" },
    P9:  { cat: "perception", title: "From Rows to Ground Truth: Field Robot for Vineyard Mapping", presenter: "Vamsi Krishna Kocherla" },
    P10: { cat: "learning",   title: "A-PACE: Asynchronous Predictive Alignment for Frozen VLA Execution", presenter: "Tian Xie" },
    P11: { cat: "space",      title: "CABLESSail: Solar Sail Momentum Management Using Shape Control", presenter: "Soojeong Lee" },
    P12: { cat: "sensing",    title: "Tailorable Force Sensing Skins for Manipulators", presenter: "Adam Imdieke" },
    P13: { cat: "learning",   title: "Grasp-TAGS: Task-Aware Grasp Selection for Loco-manipulation", presenter: "Xun Tu" },
    P14: { cat: "marine",     title: "AUV-Assisted Optical-Acoustic Detection of Invasive Mystery Snails", presenter: "Amreen Hossain" },
    P15: { cat: "wearables",  title: "Look and Pick: Gaze-Directed Target Selection", presenter: "Narapareddy, Tumu, Mundada" },
    O1:  { cat: "marine",     title: "Context-Aware Safety Assessment for AUVs in Marine Debris Management", presenter: "Sakshi Singh" },
    O2:  { cat: "perception", title: "Automated Truck Parking Occupancy Detection using 3D Perception", presenter: "Mohammed Jassim Jahubar Ali" },
    O3:  { cat: "learning",   title: "PILOT: Long-Horizon World-Model Planning with Visual Subgoals", presenter: "Hanchen Cui" },
    O4:  { cat: "wearables",  title: "Step Placement Swing Control for Powered Knee-Ankle Prostheses", presenter: "Michael Feldkamp" },
    O5:  { cat: "control",    title: "Active Control of a Laser-Levitated Photonic Metasurface", presenter: "Lucas Myers" },
    F1:  { cat: "marine",     title: "Detection-Driven Underwater Image Enhancement", presenter: "Ayaan Mohammed" },
    F2:  { cat: "space",      title: "Solar Sail Momentum Management Using Predictive Control", presenter: "Ping-Yen Shen" },
    F4:  { cat: "marine",     title: "Overcoming Data Scarcity in Child AUV Position Estimation (SIFT-YOLOv9)", presenter: "Francis Aweenagua" },
    F5:  { cat: "perception", title: "Autonomous Drone for Dynamic Smoke Plume Tracking", presenter: "Srijan Kumar Pal" },
    F6:  { cat: "multiagent", title: "Conflict-Free Distributed Pathfinding for Collective Construction", presenter: "Mario Jerez" },
  };

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
