function renderLinks(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>`,
    )
    .join("");
}

function setActiveMenu() {
  const page = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".menu-item > a").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === page);
  });
}

const analysisSectionKeys = [
  "onthological_analysis",
  "historical_analysis",
  "visual_analysis",
];

const sectionImages = {
  onthological_analysis: "images/methodology.png",
  historical_analysis: "images/site-specific.png",
  visual_analysis: "images/example.png",
};

function sectionId(key) {
  return key.replace(/_/g, "-");
}

function scrollToAnalysisSection(id) {
  const target = document.getElementById(id);
  const scrollContainer = document.querySelector(".analysis_container");
  if (!target || !scrollContainer) return;

  scrollContainer.scrollTo({
    top: target.offsetTop - scrollContainer.offsetTop,
    behavior: "smooth",
  });
}

function setActiveSubmenuLink(id) {
  const nav = document.getElementById("analysis-nav");
  if (!nav) return;

  nav.querySelectorAll(".submenu-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function renderAnalysisNav(data) {
  const nav = document.getElementById("analysis-nav");
  if (!nav) return;

  nav.innerHTML = analysisSectionKeys
    .map((key) => {
      const item = data[key]?.[0];
      if (!item) return "";

      return `<a href="#${sectionId(key)}" class="submenu-link">${item.title}</a>`;
    })
    .join("");

  nav.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    e.preventDefault();
    const id = link.getAttribute("href").slice(1);
    setActiveSubmenuLink(id);
    scrollToAnalysisSection(id);
  });
}

function renderAnalysis(data) {
  const container = document.getElementById("analysis-sections");
  if (!container) return;

  container.innerHTML = analysisSectionKeys
    .map((key) => {
      const item = data[key]?.[0];
      if (!item) return "";

      const paragraphs = item.contents
        .split("\n\n")
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join("");

      return `
        <div class="analysis-row" id="${sectionId(key)}">
          <div class="analysis-section">
            <div class="header">
              <h1>${item.title}</h1>
            </div>
            <div class="analysis-content">${paragraphs}</div>
          </div>
          <div class="analysis-image">
            <img src="${sectionImages[key]}" alt="${item.title}" />
          </div>
        </div>
      `;
    })
    .join("");
}

const analysisContainer = document.getElementById("analysis-sections");
if (analysisContainer) {
  fetch("analysis.json")
    .then((res) => res.json())
    .then((data) => {
      renderAnalysis(data);
      renderAnalysisNav(data);

      const hash = window.location.hash.slice(1);
      if (hash) {
        setActiveSubmenuLink(hash);
        scrollToAnalysisSection(hash);
      }
    })
    .catch((err) => console.error("analysis loading error:", err));
}

setActiveMenu();

if (document.getElementById("by-author-links")) {
  fetch("bibliography.json")
    .then((res) => res.json())
    .then((data) => {
      renderLinks("by-author-links", data.by_author);
      renderLinks("by-others-links", data.by_others);
    })
    .catch((err) => console.error("bibliography loading error:", err));
}

function fitDiagram() {
  const container = document.querySelector(".diagram_container");
  const title = document.querySelector(".diagram-title");
  const fit = document.querySelector(".diagram-fit");
  const stage = document.querySelector(".diagram-stage");
  if (!container || !fit || !stage) return;

  const designWidth = 1173;
  const designHeight = 1024;
  const topCrop = 70;
  const contentHeight = designHeight - topCrop;

  const width = container.clientWidth;
  if (width < 50) return;

  let usedAbove = 0;
  if (title) {
    const titleStyle = getComputedStyle(title);
    usedAbove =
      title.offsetHeight +
      (parseFloat(titleStyle.marginTop) || 0) +
      (parseFloat(titleStyle.marginBottom) || 0);
  }

  const availableHeight = Math.max(container.clientHeight - usedAbove, 50);
  const scaleX = width / designWidth;
  const scaleY = availableHeight / contentHeight;

  fit.style.width = `${width}px`;
  fit.style.height = `${availableHeight}px`;
  stage.style.top = `${-topCrop * scaleY}px`;
  stage.style.transform = `scale(${scaleX}, ${scaleY})`;

  const indicator = document.querySelector(".diagram-indicator");
  if (indicator) {
    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const baseWidth = 12 * rootFont;
    indicator.style.width = `${baseWidth * Math.min(scaleX, 1)}px`;
  }

  // Keep text proportionally upright, but let it shrink with the diagram
  // (instead of locking to fixed screen pixels and overflowing).
  const textScale = Math.min(scaleX, scaleY);
  const invSx = textScale / scaleX;
  const invSy = textScale / scaleY;
  stage.style.setProperty("--inv-sx", String(invSx));
  stage.style.setProperty("--inv-sy", String(invSy));

  stage.querySelectorAll(".d-rel--rot, .d-rel--stack").forEach((el) => {
    if (!el.dataset.rot) {
      const match = (el.getAttribute("style") || "").match(
        /rotate\(([^)]+)\)/,
      );
      el.dataset.rot = match ? match[1] : "0deg";
    }
    el.style.transform = `scale(${invSx}, ${invSy}) rotate(${el.dataset.rot})`;
  });
}

const DIAGRAM_SETS = {
  1: [
    "vector3",
    "vector4",
    "vector5",
    "vector6",
    "vector10",
    "vector12",
    "arrow42",
    "arrow43",
    "arrow44",
  ],
  2: [
    "vector7",
    "arrow28",
    "arrow30",
    "arrow31",
    "arrow32",
    "arrow45",
    "arrow46",
  ],
  3: [
    "vector8",
    "arrow36",
    "arrow38",
    "arrow39",
    "arrow34",
    "arrow35",
  ],
  4: ["arrow33", "arrow40", "arrow41", "arrow48"],
};

function assetNameFromSrc(src) {
  const match = src.match(/(vector\d+|arrow\d+)/i);
  return match ? match[1].toLowerCase() : null;
}

function initDiagramSets() {
  const stage = document.querySelector(".diagram-stage");
  if (!stage) return;

  const assetToSet = {};
  Object.entries(DIAGRAM_SETS).forEach(([setId, assets]) => {
    assets.forEach((name) => {
      assetToSet[name] = setId;
    });
  });

  const wraps = [];
  stage.querySelectorAll(".d-vector, .d-arrow").forEach((wrap) => {
    const img = wrap.querySelector("img");
    if (!img) return;
    const name = assetNameFromSrc(img.getAttribute("src") || "");
    if (!name) return;

    wrap.dataset.asset = name;
    wraps.push(wrap);

    const setId = assetToSet[name];
    if (!setId) return;

    wrap.classList.add("diagram-asset");
    wrap.dataset.set = setId;
    wrap.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleDiagramSet(setId);
    });
  });

  let activeSet = null;

  function applyDiagramSet(nextSet) {
    wraps.forEach((wrap) => {
      const setId = wrap.dataset.set;
      wrap.classList.remove("is-dimmed", "is-active");
      if (!nextSet) return;
      if (setId === nextSet) {
        wrap.classList.add("is-active");
      } else {
        wrap.classList.add("is-dimmed");
      }
    });
  }

  function toggleDiagramSet(setId) {
    activeSet = activeSet === setId ? null : setId;
    applyDiagramSet(activeSet);
  }

  function clearDiagramSet() {
    activeSet = null;
    applyDiagramSet(null);
  }

  stage.addEventListener("click", () => clearDiagramSet());
}

if (document.querySelector(".diagram-stage")) {
  const container = document.querySelector(".diagram_container");
  const runFit = () => requestAnimationFrame(fitDiagram);

  runFit();
  window.addEventListener("load", runFit);
  window.addEventListener("resize", runFit);

  if (container && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(runFit).observe(container);
  }

  initDiagramSets();
}
