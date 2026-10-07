// A left-edge separator: dragging left grows the right-hand guide.
export function enableGuideResize(panel) {
  const handle = document.createElement('div');
  handle.className = 'learning-resize';
  handle.tabIndex = 0;
  handle.setAttribute('role', 'separator');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-label', 'Resize part guide');
  handle.setAttribute('aria-controls', panel.id);
  handle.title = 'Drag left to widen · Arrow keys to resize · Double-click to reset';
  panel.prepend(handle);
  const key = 'pg9171e.part-guide-width';
  let preferred;
  try { preferred = Number(localStorage.getItem(key)) || undefined; } catch { /* Optional persistence. */ }
  const limits = () => {
    const workspace = panel.closest('.workspace');
    const tree = workspace.querySelector('.assembly-panel');
    return { min: 308, max: Math.max(308, Math.min(760, workspace.clientWidth - (tree?.offsetWidth || 0) - 280)) };
  };
  function apply(value = preferred, remember = false) {
    const { min, max } = limits();
    const width = Math.round(Math.max(min, Math.min(max, value || (innerWidth <= 1100 ? 308 : 384))));
    panel.style.setProperty('--guide-width', `${width}px`);
    handle.setAttribute('aria-valuemin', String(min));
    handle.setAttribute('aria-valuemax', String(max));
    handle.setAttribute('aria-valuenow', String(width));
    handle.setAttribute('aria-valuetext', `${width} pixels wide`);
    if (remember) {
      preferred = width;
      try { localStorage.setItem(key, String(width)); } catch { /* Keep in memory. */ }
    }
  }
  let drag;
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || innerWidth <= 760) return;
    event.preventDefault();
    handle.focus();
    drag = { x: event.clientX, width: panel.getBoundingClientRect().width };
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing-guide');
  });
  handle.addEventListener('pointermove', event => {
    if (drag) apply(drag.width + drag.x - event.clientX, true);
  });
  const finish = () => { drag = null; document.body.classList.remove('resizing-guide'); };
  handle.addEventListener('pointerup', finish);
  handle.addEventListener('pointercancel', finish);
  handle.addEventListener('lostpointercapture', finish);
  handle.addEventListener('keydown', event => {
    const { min, max } = limits();
    const width = Number(handle.getAttribute('aria-valuenow'));
    const step = event.shiftKey ? 64 : 24;
    const next = { ArrowLeft: width + step, ArrowRight: width - step, Home: min, End: max }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    apply(next, true);
  });
  handle.addEventListener('dblclick', () => { preferred = undefined; apply(undefined, true); });
  new ResizeObserver(() => apply()).observe(panel.closest('.workspace'));
  apply();
  return { refresh: () => apply() };
}
