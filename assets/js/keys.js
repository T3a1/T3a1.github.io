// less-style keyboard navigation and status bar. The site works without it.
(() => {
  const body = document.body;
  const msg = document.getElementById('msg');
  const help = document.getElementById('help');
  const form = document.getElementById('search');
  const input = document.getElementById('q');
  const main = document.querySelector('main');
  let hits = [];
  let hitIndex = -1;
  let note = '';

  if (body.dataset.other) {
    try { localStorage.setItem('leandre-lang', document.documentElement.lang); } catch (e) { /* storage blocked */ }
  }

  const lineHeight = () => parseFloat(getComputedStyle(body).lineHeight) || 24;

  function update() {
    if (note) { msg.textContent = note; return; }
    const lh = lineHeight();
    const height = document.documentElement.scrollHeight;
    const total = Math.max(1, Math.round(height / lh));
    const line = Math.min(total, Math.round(window.scrollY / lh) + 1);
    const atEnd = window.innerHeight + window.scrollY >= height - 2;
    msg.textContent = body.dataset.status
      .replace('{page}', body.dataset.page)
      .replace('{line}', line)
      .replace('{total}', total) + (atEnd ? ' ' + body.dataset.end : '');
  }
  function flash(text) {
    note = text; update();
    setTimeout(() => { note = ''; update(); }, 1800);
  }

  function clearHits() {
    hits.forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
    main.normalize();
    hits = []; hitIndex = -1;
  }
  function search(term) {
    clearHits();
    if (!term) return;
    const needle = term.toLowerCase();
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const text = node.textContent;
      let idx = text.toLowerCase().indexOf(needle);
      if (idx < 0) return;
      const frag = document.createDocumentFragment();
      let pos = 0;
      while (idx >= 0) {
        frag.append(text.slice(pos, idx));
        const m = document.createElement('mark');
        m.textContent = text.slice(idx, idx + term.length);
        frag.append(m); hits.push(m);
        pos = idx + term.length;
        idx = text.toLowerCase().indexOf(needle, pos);
      }
      frag.append(text.slice(pos));
      node.replaceWith(frag);
    });
    if (!hits.length) { flash(body.dataset.notFound); return; }
    go(0);
  }
  function go(i) {
    if (!hits.length) return;
    if (hitIndex >= 0) hits[hitIndex].classList.remove('current');
    hitIndex = (i + hits.length) % hits.length;
    hits[hitIndex].classList.add('current');
    hits[hitIndex].scrollIntoView({ block: 'center' });
  }
  function openSearch() { msg.hidden = true; form.hidden = false; input.value = ''; input.focus(); }
  function closeSearch() { form.hidden = true; msg.hidden = false; input.blur(); update(); }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = input.value.trim();
    closeSearch();
    search(value);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest('input, textarea, select')) return;
    const lh = lineHeight();
    const page = window.innerHeight - 3 * lh;
    const atHome = location.pathname === body.dataset.home;
    switch (e.key) {
      case 'j': window.scrollBy(0, lh); break;
      case 'k': window.scrollBy(0, -lh); break;
      case ' ': case 'f': window.scrollBy(0, e.shiftKey ? -page : page); break;
      case 'b': window.scrollBy(0, -page); break;
      case 'g': window.scrollTo(0, 0); break;
      case 'G': window.scrollTo(0, document.documentElement.scrollHeight); break;
      case '/': openSearch(); break;
      case 'n': go(hitIndex + 1); break;
      case 'N': go(hitIndex - 1); break;
      case 'h': case '?': help.hidden = !help.hidden; break;
      case 'l': if (body.dataset.other) location.href = body.dataset.other; break;
      case 'q': case 'Escape':
        if (!help.hidden) help.hidden = true;
        else if (hits.length) clearHits();
        else if (!atHome) location.href = body.dataset.home;
        else window.scrollTo(0, 0);
        break;
      default: return;
    }
    e.preventDefault();
  });

  document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', () => {
    const value = btn.dataset.copy;
    const select = () => {
      const range = document.createRange();
      range.selectNodeContents(btn.previousElementSibling);
      const sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(range);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(value).then(() => flash(body.dataset.copied), select);
    else select();
  }));

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
