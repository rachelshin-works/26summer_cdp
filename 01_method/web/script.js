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
    const isActive =
      href === page || ((page === "index.html" || page === "") && href === "#");

    link.classList.toggle("active", isActive);
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
