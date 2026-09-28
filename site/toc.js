// Highlights the contents-rail link for the section currently being read.
(() => {
  const links = [...document.querySelectorAll('.toc a')];
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const visible = new Set();

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    }
    const current = [...byId.keys()].find((id) => visible.has(id));
    if (!current) return;
    for (const [id, a] of byId) a.classList.toggle('active', id === current);
  }, { rootMargin: '-20% 0px -60% 0px' });

  for (const id of byId.keys()) {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  }
})();
