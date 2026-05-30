  (function () {
    const root = document.querySelector('.dash-root');
    if (!root) return;
    const svg = root.querySelector('svg.world');
    const tip = document.getElementById('map-tooltip');
    const panel = document.getElementById('dossier-panel');
    const body = document.getElementById('panel-body');
    const closeBtn = document.getElementById('panel-close');
    const templates = document.getElementById('dossier-templates');
    // A country is clickable iff a dossier template exists for it (data-driven,
    // so adding/removing tracked states needs no change here).
    const hasDossier = (iso) => !!iso && !!templates.querySelector('.dossier-tpl[data-iso="' + iso + '"]');

    // ---- Tooltip ----
    function showTip(target, text) {
      tip.textContent = text;
      tip.hidden = false;
      const rect = svg.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      tip.style.left = (tRect.left - rect.left + tRect.width / 2) + 'px';
      tip.style.top = (tRect.top - rect.top - 8) + 'px';
    }
    function hideTip() { tip.hidden = true; }

    svg.addEventListener('mousemove', (e) => {
      const t = e.target;
      if (t.tagName !== 'path') return hideTip();
      const iso = t.getAttribute('data-iso');
      const name = t.getAttribute('data-name') || '';
      if (!iso) return showTip(t, name);
      showTip(t, name + (hasDossier(iso) ? ' · click for dossier' : ''));
    });
    svg.addEventListener('mouseleave', hideTip);

    // ---- Panel ----
    function openPanel(iso) {
      const tpl = templates.querySelector('.dossier-tpl[data-iso="' + iso + '"]');
      if (!tpl) return;
      body.replaceChildren(...Array.from(tpl.cloneNode(true).childNodes));
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
    }
    function closePanel() {
      panel.classList.remove('is-open');
      setTimeout(() => { panel.hidden = true; }, 200);
    }
    closeBtn.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    svg.addEventListener('click', (e) => {
      const t = e.target;
      if (t.tagName !== 'path') return;
      const iso = t.getAttribute('data-iso');
      if (hasDossier(iso)) openPanel(iso);
    });
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target;
      if (t.tagName !== 'path') return;
      const iso = t.getAttribute('data-iso');
      if (hasDossier(iso)) { e.preventDefault(); openPanel(iso); }
    });

    // ---- Mode toggle ----
    const modeBtns = root.querySelectorAll('.mode-btn');
    const legendAtt = root.querySelector('.legend-attacker');
    const legendTgt = root.querySelector('.legend-target');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        const mode = btn.getAttribute('data-mode');
        root.setAttribute('data-mode', mode);
        legendAtt.hidden = mode !== 'attacker';
        legendTgt.hidden = mode !== 'target';
      });
    });
    root.setAttribute('data-mode', 'attacker');
  })();
