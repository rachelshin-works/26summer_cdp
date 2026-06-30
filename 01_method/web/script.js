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

fetch("bibliography.json")
  .then((res) => res.json())
  .then((data) => {
    renderLinks("by-author-links", data.by_author);
    renderLinks("by-others-links", data.by_others);
  })
  .catch((err) => console.error("bibliography loading error:", err));
