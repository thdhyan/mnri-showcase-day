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

  // Poster categories (see POSTER_CATEGORIES.md) — 6 map groups, muted colours for board + legend.
  const categories = {
    marine:     { name: "Marine & Underwater Robotics",           color: "#5B7DB1" },
    learning:   { name: "Robot Learning & Manipulation",          color: "#C27C5B" },
    perception: { name: "Perception & Autonomy",                  color: "#7FA48A" },
    systems:    { name: "Aerospace & Control Systems",            color: "#B89B4A" },
    wearables:  { name: "Wearables & Assistive HRI",              color: "#A07AA0" },
    networked:  { name: "Networked & Connected Robotics",         color: "#4E9C9C" },
  };

  // Board locations: Plan C (28 boards) + Solar Vehicle Project wall S1–S5 + easels S6–S8 (36 boards).
  const slotWhere = (id) =>
    id[0] === "P" ? "Shep 164 (Drone Lab) — inside" :
    id[0] === "O" ? "Shep 164 outer wall — 1st-floor hallway" :
    ["S6", "S7", "S8"].includes(id) ? "1st-floor hallway — easel by the Solar Vehicle Project wall" :
    id[0] === "S" ? "Solar Vehicle Project wall — 1st-floor hallway" :
    (id === "F1" || id === "F2") ? "2nd-floor hallway — Shep 256 glass" :
    id === "F3" ? "2nd-floor hallway — easel" : "2nd-floor hallway — glass over Shep 164";

  // MOCK assignment: 33 posters on 36 boards (3 open for expected posters), same category never on neighbouring boards.
  // Boards not listed here are open slots (room for late additions).
  const assignments = {
    P1:  { cat: "marine",     title: "Design and Development of the MeCO Open-Source AUV", presenter: "David Widhalm" },
    P2:  { cat: "learning",   title: "Reasoning Over Fully-occluded Obstacle for Non-prehensile Loco-manipulation", presenter: "Minghao Zou" },
    P3:  { cat: "perception", title: "FLi-SLAM: FPGA Codesign for ICP Registration in 3D LiDAR SLAM", presenter: "Sangjae Park" },
    P4:  { cat: "marine",     title: "SeaCube: Open-Source Autonomous Docking Station for AUV Operations", presenter: "Rishi Mukherjee" },
    P5:  { cat: "wearables", title: "Look and Pick: Gaze-Directed Grasping with Closed-Loop Correction from Smart Glasses", presenter: "Narapareddy, Tumu, Mundada" },
    P6:  { cat: "learning",   title: "CrowdMAPS: Multiple Actions per State for Robot Imitation Learning", presenter: "Yilong Song" },
    P7:  { cat: "wearables", title: "Smart Thermally Actuating Textiles: Lumbar Support Garment", presenter: "Audrey Percich" },
    P8:  { cat: "perception", title: "From Rows to Ground Truth: Field Robot for Vineyard Mapping", presenter: "Vamsi Krishna Kocherla" },
    P9:  { cat: "systems",    title: "Spacecraft Motion Simulation using Cable-Driven Parallel Robots (SPACESiM)", presenter: "Konner Brickey" },
    P10: { cat: "marine",     title: "Detection-Driven Underwater Image Enhancement", presenter: "Ayaan Mohammed" },
    P11: { cat: "learning",   title: "Tailorable Force Sensing Skins for Manipulators", presenter: "Adam Imdieke" },
    P12: { cat: "systems",    title: "CABLESSail: Solar Sail Momentum Management Using Shape Control", presenter: "Soojeong Lee" },
    P13: { cat: "marine",     title: "AUV-Assisted Optical-Acoustic Detection of Invasive Mystery Snails", presenter: "Amreen Hossain" },
    P14: { cat: "systems",    title: "Data-Driven Robust Refinement of Dual-Stage HDD Controllers", presenter: "Erik Lehner" },
    P15: { cat: "learning",   title: "Grasp-TAGS: Task-Aware Grasp Selection for Loco-manipulation", presenter: "Xun Tu" },
    O1:  { cat: "systems",    title: "Active Control of a Laser-Levitated Photonic Metasurface", presenter: "Lucas Myers" },
    O2:  { cat: "marine",     title: "Context-Aware Safety Assessment for AUVs in Marine Debris Management", presenter: "Sakshi Singh" },
    O3:  { cat: "perception", title: "Automated Truck Parking Occupancy Detection using 3D Perception", presenter: "Mohammed Jassim Jahubar Ali" },
    O4:  { cat: "wearables", title: "Step Placement Swing Control for Powered Knee-Ankle Prostheses", presenter: "Michael Feldkamp" },
    O5:  { cat: "learning",   title: "PILOT: Long-Horizon World-Model Planning with Visual Subgoals", presenter: "Hanchen Cui" },
    O6:  { cat: "perception", title: "Vision-Language-Guided Waypoint Generation for Mapless Robot Navigation", presenter: "Kalyan Sai Reddy Lankireddy" },
    S1:  { cat: "networked",  title: "Resource-Aware Data Uploads for Agricultural Robots", presenter: "Yuanzheng Li" },
    S2:  { cat: "learning",   title: "Traceable VLA Policy: From Memory to Motion", presenter: "Mingxi Su" },
    S3:  { cat: "wearables",  title: "Robots for Those in Transition: Exploring Mental Wellness through Design Probes", presenter: "Minghe Lu" },
    S4:  { cat: "perception", title: "From Vision-Language-Action to Motion: Mapless LiDAR Occupancy-Guided Trajectory Refinement", presenter: "Golamari, Mundada, Narapareddy, Tumu" },
    S5:  { cat: "networked",  title: "C-V2X Monitoring and Anomaly Detection", presenter: "Farhad Soleimani" },
    F1:  { cat: "perception", title: "Autonomous Drone for Dynamic Smoke Plume Tracking", presenter: "Srijan Kumar Pal" },
    F2:  { cat: "systems",    title: "Solar Sail Momentum Management Using Predictive Control", presenter: "Ping-Yen Shen" },
    F3:  { cat: "networked",  title: "CAVA: Context-Aware Video Adaptation for Teleoperation", presenter: "Faaiq Bilal" },
    F4:  { cat: "marine",     title: "Overcoming Data Scarcity in Child AUV Position Estimation (SIFT-YOLOv9)", presenter: "Francis Aweenagua" },
    F5:  { cat: "learning",   title: "A-PACE: Asynchronous Predictive Alignment for Frozen VLA Execution", presenter: "Tian Xie" },
    F6:  { cat: "perception", title: "Conflict-Free Distributed Pathfinding for Collective Construction", presenter: "Mario Jerez" },
    F7:  { cat: "systems",    title: "Active Inference for Car Following", presenter: "Varadaraya Ganesh Shenoy" },
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
