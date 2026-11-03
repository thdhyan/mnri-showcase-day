/* Poster data shared by the map (posters.html), voting (vote.html) and QR codes.
   Keyed by board ID. Boards not listed are open slots. */
(function () {
  "use strict";

  // Poster categories (see POSTER_CATEGORIES.md) — 6 map groups, muted colours for board + legend.
  window.MNRI_CATEGORIES = {
  marine:     { name: "Marine & Underwater Robotics",           color: "#5B7DB1" },
  learning:   { name: "Robot Learning & Manipulation",          color: "#C27C5B" },
  perception: { name: "Perception & Autonomy",                  color: "#7FA48A" },
  systems:    { name: "Aerospace & Control Systems",            color: "#B89B4A" },
  wearables:  { name: "Wearables & Assistive HRI",              color: "#A07AA0" },
  networked:  { name: "Networked & Connected Robotics",         color: "#4E9C9C" },
};

  // MOCK assignment: 34 submitted posters, 2 expected slots, 2 optional overflow easels.
  window.MNRI_ASSIGNMENTS = {
  "1-164-01":  { cat: "marine",     title: "Design and Development of the MeCO Open-Source AUV", presenter: "David Widhalm" },
  "1-164-02":  { cat: "learning",   title: "Reasoning Over Fully-occluded Obstacle for Non-prehensile Loco-manipulation", presenter: "Minghao Zou" },
  "1-164-03":  { cat: "marine",     title: "SeaCube: Open-Source Autonomous Docking Station for AUV Operations", presenter: "Rishi Mukherjee" },
  "1-164-04":  { cat: "perception", title: "FLi-SLAM: FPGA Codesign for ICP Registration in 3D LiDAR SLAM", presenter: "Sangjae Park" },
  "1-164-05":  { cat: "wearables", title: "Look and Pick: Gaze-Directed Grasping with Closed-Loop Correction from Smart Glasses", presenter: "Narapareddy, Tumu, Mundada" },
  "1-164-06":  { cat: "learning",   title: "CrowdMAPS: Multiple Actions per State for Robot Imitation Learning", presenter: "Yilong Song" },
  "1-164-07":  { cat: "wearables", title: "Smart Thermally Actuating Textiles: Lumbar Support Garment", presenter: "Audrey Percich" },
  "1-164-08":  { cat: "perception", title: "From Rows to Ground Truth: Field Robot for Vineyard Mapping", presenter: "Vamsi Krishna Kocherla" },
  "1-164-09":  { cat: "systems",    title: "Spacecraft Motion Simulation using Cable-Driven Parallel Robots (SPACESiM)", presenter: "Konner Brickey" },
  "1-164-10": { cat: "marine",     title: "Detection-Driven Underwater Image Enhancement", presenter: "Ayaan Mohammed" },
  "1-164-11": { cat: "learning",   title: "Tailorable Force Sensing Skins for Manipulators", presenter: "Adam Imdieke" },
  "1-164-12": { cat: "systems",    title: "CABLESSail: Solar Sail Momentum Management Using Shape Control", presenter: "Soojeong Lee" },
  "1-164-13": { cat: "marine",     title: "AUV-Assisted Optical-Acoustic Detection of Invasive Mystery Snails", presenter: "Amreen Hossain" },
  "1-164-14": { cat: "systems",    title: "Data-Driven Robust Refinement of Dual-Stage HDD Controllers", presenter: "Erik Lehner" },
  "1-164-15": { cat: "learning",   title: "Grasp-TAGS: Task-Aware Grasp Selection for Loco-manipulation", presenter: "Xun Tu" },
  "1-H-01":  { cat: "systems",    title: "Active Control of a Laser-Levitated Photonic Metasurface", presenter: "Lucas Myers" },
  "1-H-02":  { cat: "marine",     title: "Context-Aware Safety Assessment for AUVs in Marine Debris Management", presenter: "Sakshi Singh" },
  "1-H-03":  { cat: "perception", title: "Automated Truck Parking Occupancy Detection using 3D Perception", presenter: "Mohammed Jassim Jahubar Ali" },
  "1-H-04":  { cat: "wearables", title: "Step Placement Swing Control for Powered Knee-Ankle Prostheses", presenter: "Michael Feldkamp" },
  "1-H-05":  { cat: "learning",   title: "PILOT: Long-Horizon World-Model Planning with Visual Subgoals", presenter: "Hanchen Cui" },
  "1-H-06":  { cat: "perception", title: "Vision-Language-Guided Waypoint Generation for Mapless Robot Navigation", presenter: "Kalyan Sai Reddy Lankireddy" },
  "1-SV-01":  { cat: "networked",  title: "Resource-Aware Data Uploads for Agricultural Robots", presenter: "Yuanzheng Li" },
  "1-SV-02":  { cat: "learning",   title: "Traceable VLA Policy: From Memory to Motion", presenter: "Mingxi Su" },
  "1-SV-03":  { cat: "wearables",  title: "Robots for Those in Transition: Exploring Mental Wellness through Design Probes", presenter: "Minghe Lu" },
  "1-SV-04":  { cat: "perception", title: "From Vision-Language-Action to Motion: Mapless LiDAR Occupancy-Guided Trajectory Refinement", presenter: "Golamari, Mundada, Narapareddy, Tumu" },
  "1-SV-05":  { cat: "networked",  title: "C-V2X Monitoring and Anomaly Detection", presenter: "Farhad Soleimani" },
  "1-164-18":  { cat: "perception", title: "FarmGuard: Unmanned Aerial Robotic Defender for Deer Detection and Deterrence", presenter: "Maria Gini" },
  "1-164-17":  { cat: "networked", title: "DRIVE-SAFE: Remote and Cooperative Autonomous Driving in Dynamic Environments using 5G/NextG Technology", presenter: "Lalitaditya Divakarla" },
  "2-H-01":  { cat: "perception", title: "Autonomous Drone for Dynamic Smoke Plume Tracking", presenter: "Srijan Kumar Pal" },
  "2-H-02":  { cat: "systems",    title: "Solar Sail Momentum Management Using Predictive Control", presenter: "Ping-Yen Shen" },
  "2-H-03":  { cat: "networked",  title: "CAVA: Context-Aware Video Adaptation for Teleoperation", presenter: "Faaiq Bilal" },
  "2-H-04":  { cat: "marine",     title: "Overcoming Data Scarcity in Child AUV Position Estimation (SIFT-YOLOv9)", presenter: "Francis Aweenagua" },
  "2-H-05":  { cat: "learning",   title: "A-PACE: Asynchronous Predictive Alignment for Frozen VLA Execution", presenter: "Tian Xie" },
  "2-H-06":  { cat: "perception", title: "Conflict-Free Distributed Pathfinding for Collective Construction", presenter: "Mario Jerez" },
  "2-H-07":  { cat: "systems",    title: "Active Inference for Car Following", presenter: "Varadaraya Ganesh Shenoy" },
};

  // TEMPORARY: assignments are hidden while presenters choose their own slots (all boards show as open).
  // Full list kept in MNRI_ASSIGNMENTS_FULL; to restore, delete the next two lines' reset. Only Rishi (1-164-03) assigned so far.
  window.MNRI_ASSIGNMENTS_FULL = window.MNRI_ASSIGNMENTS;
  window.MNRI_ASSIGNMENTS = { "1-164-03": window.MNRI_ASSIGNMENTS_FULL["1-164-03"] };

  // Boards with a poster PDF in posters/<board>.pdf (shown on the map panel and vote page).
  window.MNRI_PDFS = ["1-164-01", "1-164-02", "1-164-03", "1-164-04", "1-164-05", "1-164-06", "1-164-07", "1-164-08", "1-164-09", "1-164-10", "1-164-11", "1-164-12", "1-164-13", "1-164-14", "1-164-15", "1-164-18", "1-H-01", "1-H-02", "1-H-03", "1-H-04", "1-H-05", "2-H-01", "2-H-02", "2-H-04", "2-H-05", "2-H-06"];
})();
