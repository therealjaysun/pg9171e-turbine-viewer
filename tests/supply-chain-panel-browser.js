import { createEducationPanel } from '../src/education/panel.js';

// Exercise the real panel and sourcing view without a renderer or 3D geometry.
const results = document.getElementById('results');
const preferenceKey = 'pg9171e.part-guide';
const widthKey = 'pg9171e.part-guide-width';
const previous = new Map([preferenceKey, widthKey].map(key => [key, localStorage.getItem(key)]));
const tabs = ['operation', 'design', 'watch', 'manufacturing', 'supply'];
const systems = [
  { id: 'compressor', name: 'Axial compressor' },
  { id: 'turbine', name: 'Turbine stages' },
  { id: 'exhaust', name: 'Exhaust assembly' },
  { id: 'bearings', name: 'Bearings and shaft' },
  { id: 'supports', name: 'Base and supports' },
];
const parts = [
  { id: 'compressor-rotor-1', name: 'Compressor rotor stage 1', system: 'compressor', facts: [] },
  { id: 'turbine-wheel-2', name: 'Turbine stage 2', system: 'turbine', facts: [] },
  { id: 'exhaust-frame-struts', name: 'Exhaust frame and struts', system: 'exhaust', facts: [] },
  { id: 'exhaust-diffuser-upper', name: 'Upper exhaust diffuser', system: 'exhaust', facts: [] },
  { id: 'shaft', name: 'Forward and aft wheel shafts', system: 'bearings', facts: [] },
  { id: 'bearing-3', name: 'Bearing 3 tilting pads', system: 'bearings', facts: [] },
  { id: 'base-frame', name: 'Turbine base frame', system: 'supports', facts: [] },
];
let assertions = 0;
let fixture, panel, guide;
const navigations = [];
const heatmaps = [];

function check(condition, message) {
  assertions++;
  if (!condition) throw new Error(message);
}
const tab = name => document.getElementById(`learning-tab-${name}`);
const dialog = () => document.getElementById('sourcing-dialog');
const supplyPanel = () => document.getElementById('learning-supply');
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
function key(node, value, options = {}) {
  node.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options }));
}
function change(node, value) {
  node.value = value;
  node.dispatchEvent(new Event('change', { bubbles: true }));
}
function search(value) {
  const node = dialog().querySelector('input[type="search"]');
  node.value = value;
  node.dispatchEvent(new Event('input', { bubbles: true }));
}
function dotIds() {
  return [...dialog().querySelectorAll('.sourcing-dot')].map(dot => dot.dataset.supplyPart);
}
function active(name) {
  for (const value of tabs) {
    const selected = value === name;
    check(tab(value).getAttribute('aria-selected') === String(selected), `${value}: accessible selected state`);
    check(tab(value).tabIndex === (selected ? 0 : -1), `${value}: roving tab focus`);
    check(document.getElementById(`learning-${value}`).hidden === !selected, `${value}: matching panel visibility`);
  }
}
function mount() {
  fixture = document.createElement('section');
  fixture.innerHTML = `<div class="test-actions">
    <button id="learning-toggle">Part guide</button>
    <button id="sourcing-open">Sourcing grid</button>
    <button id="menu-toggle">Assembly</button>
  </div>
  <div class="workspace">
    <aside id="assembly-panel" class="assembly-panel"><button>Tree selection</button></aside>
    <div class="viewport">Synthetic model viewport</div>
    <aside id="learning-panel" class="learning-panel" hidden>
      <div class="learning-heading"><button id="learning-close">Close part guide</button>
        <h2 id="learning-title" tabindex="-1"></h2><p id="learning-system"></p>
      </div>
      <div class="learning-tabs" role="tablist" aria-label="Part guide sections">${tabs.map(value => `<button role="tab" id="learning-tab-${value}" data-lesson-tab="${value}" aria-controls="learning-${value}">${value === 'supply' ? 'Supply Chain' : value}</button>`).join('')}</div>
      <div id="learning-content" class="learning-content"></div>
    </aside>
  </div><div id="learning-announcement" role="status"></div>`;
  document.body.append(fixture);
  panel = document.getElementById('learning-panel');
  guide = createEducationPanel({
    systems, parts,
    onNavigate(id) {
      navigations.push(id);
      const part = parts.find(candidate => candidate.id === id);
      check(Boolean(part), 'Grid navigation returns a known part ID');
      // Mirror the viewer integration: select/recenter, then show Supply Chain.
      guide.selectPart(part);
      guide.showSupply();
    },
    onHeatmap(mode) { heatmaps.push(mode); },
  });
}
function unmount() {
  dialog()?.remove();
  fixture?.remove();
}

try {
  localStorage.removeItem(preferenceKey);
  localStorage.removeItem(widthKey);
  mount();
  active('operation');
  guide.selectPart(parts.find(part => part.id === 'shaft'));
  check(!panel.hidden, 'Part selection opens the guide by default');
  tab('manufacturing').click();
  key(tab('manufacturing'), 'ArrowRight');
  active('supply');
  check(document.activeElement === tab('supply'), 'Keyboard enters Supply Chain after Manufacturing');
  check(document.getElementById('learning-general-sources').hidden, 'Supply sources replace unrelated general reading');
  check(supplyPanel().querySelector('.supply-price').textContent === 'Quote required', 'Part pricing explicitly requires a quote');
  check(supplyPanel().textContent.includes('two wheel shafts'), 'Price scope describes the selected shaft group');
  const mini = supplyPanel().querySelector('.kraljic-chart.compact');
  check(mini.querySelectorAll('.kraljic-quadrant').length === 4, 'Mini grid includes four sourcing quadrants');
  check(mini.querySelectorAll('.sourcing-dot').length === 1, 'Mini grid shows only the selected part');
  check(mini.querySelector('.sourcing-dot.selected').dataset.supplyPart === 'shaft', 'Mini grid highlights the selected shaft');
  check(mini.querySelector('.has-selection').dataset.quadrant === 'strategic', 'High-risk, high-impact shaft highlights Strategic');
  check(mini.querySelector('.sourcing-dot').getAttribute('aria-pressed') === 'true', 'Mini selection is announced accessibly');
  for (const title of ['Leverage', 'Strategic', 'Non-critical', 'Bottleneck']) {
    check(mini.textContent.includes(title), `Grid explains the ${title} category`);
  }
  check(mini.textContent.includes('Supply risk') && mini.textContent.includes('business impact'), 'Grid labels both sourcing axes');
  const sources = [...supplyPanel().querySelectorAll('.supply-sources a')];
  check(sources.length >= 3, 'Part shows multiple research sources');
  for (const source of sources) {
    check(source.href.startsWith('https://') && source.textContent.trim(), 'Research sources have readable HTTPS links');
    check(source.target === '_blank' && source.rel.includes('noreferrer'), 'Research links preserve the model tab');
    check(source.nextElementSibling?.textContent.trim(), 'Each source states its evidentiary scope');
  }

  key(tab('supply'), 'ArrowRight');
  active('operation');
  key(tab('operation'), 'ArrowLeft');
  active('supply');
  key(tab('supply'), 'Home');
  active('operation');
  key(tab('operation'), 'End');
  active('supply');

  const panelHeat = supplyPanel().querySelector('.supply-heat-control select');
  change(panelHeat, 'cost');
  check(heatmaps.at(-1) === 'cost', 'Cost heat map reaches the viewer callback');
  const shaftCostColor = supplyPanel().querySelector('.sourcing-dot').style.getPropertyValue('--heat');
  check(Boolean(shaftCostColor), 'Selected dot receives a heat-map color');
  const expand = supplyPanel().querySelector('.supply-expand');
  expand.focus();
  expand.click();
  check(dialog().open, 'Expand opens the modal sourcing grid');
  check(dialog().querySelector('[role="status"]').textContent.startsWith(`${parts.length} of ${parts.length}`), 'Expanded count represents the supplied parts');
  check(dotIds().length === parts.length && new Set(dotIds()).size === parts.length, 'All selected-model parts have separate, unique dots');
  const allDots = [...dialog().querySelectorAll('.sourcing-dot')];
  check(new Set(allDots.map(dot => dot.textContent)).size === parts.length, 'Each dot has a distinct reference number');
  check(dialog().querySelectorAll('.sourcing-part-row').length === parts.length, 'Expanded grid also offers a navigable part list');
  for (const part of parts) {
    check(allDots.some(dot => dot.dataset.supplyPart === part.id && dot.getAttribute('aria-label').includes(part.name)), `Dot identifies ${part.id}`);
  }
  check(dialog().querySelector('.sourcing-dot.selected')?.dataset.supplyPart === 'shaft', 'Expanded grid retains the part selection');
  check(dialog().querySelector('.supply-heat-control select').value === 'cost', 'Expanded heat-map control starts in the current mode');
  change(dialog().querySelector('.supply-heat-control select'), 'criticality');
  check(heatmaps.at(-1) === 'criticality', 'Criticality heat map reaches the viewer callback');
  check([...document.querySelectorAll('.supply-heat-control select')].every(select => select.value === 'criticality'), 'Panel and expanded controls stay synchronized');
  check(allDots.find(dot => dot.dataset.supplyPart === 'shaft').style.getPropertyValue('--heat') === shaftCostColor, 'Shaft cost and criticality both use their top-band color');

  search('  BEARING 3  ');
  check(dotIds().join() === 'bearing-3', 'Search matches names without case or surrounding-space sensitivity');
  search('exhaust-diffuser-upper');
  check(dotIds().join() === 'exhaust-diffuser-upper', 'Search also matches the part ID');
  change(dialog().querySelector('.sourcing-filters select'), 'bearings');
  check(dotIds().length === 0, 'Search and assembly filters intersect');
  check(dialog().querySelector('.sourcing-results').textContent.includes('No matching components'), 'Empty intersection provides useful feedback');
  search('');
  check(dotIds().length === 2 && dotIds().includes('shaft') && dotIds().includes('bearing-3'), 'Assembly filter restricts the grid to that assembly');
  change(dialog().querySelector('.sourcing-filters select'), '');
  const opportunity = dialog().querySelector('input[type="checkbox"]');
  opportunity.checked = true;
  opportunity.dispatchEvent(new Event('change', { bubbles: true }));
  check(dotIds().length === 0, 'Critical functional fixtures are not fabricated into cost opportunities');
  check(dialog().querySelector('.sourcing-results').textContent.includes('cost ≥4 and criticality ≤2'), 'Empty opportunity result explains its threshold');
  opportunity.checked = false;
  opportunity.dispatchEvent(new Event('change', { bubbles: true }));
  check(dotIds().length === parts.length, 'Clearing opportunity filter restores the complete grid');
  dialog().querySelector('[data-supply-part="bearing-3"]').click();
  await settle();
  check(!dialog().open && navigations.at(-1) === 'bearing-3', 'Clicking a dot closes the grid and requests viewer navigation');
  check(document.getElementById('learning-title').textContent === 'Bearing 3 tilting pads', 'Navigation refreshes the selected part guide');
  active('supply');
  check(supplyPanel().querySelector('.sourcing-dot.selected').dataset.supplyPart === 'bearing-3', 'New mini grid follows the navigated part');
  check(supplyPanel().querySelector('.supply-heat-control select').value === 'criticality', 'Heat-map mode survives selection and rerender');
  change(supplyPanel().querySelector('.supply-heat-control select'), 'none');
  check(heatmaps.at(-1) === 'none', 'Original materials can be restored through the callback');

  const quickOpen = document.getElementById('sourcing-open');
  quickOpen.focus();
  quickOpen.click();
  check(dialog().open, 'Quick navigation button opens the grid');
  check(dialog().querySelector('input[type="search"]').value === '' && dotIds().length === parts.length, 'Reopening resets exploration filters');
  dialog().querySelector('.dialog-heading button').click();
  await settle();
  check(!dialog().open && document.activeElement === quickOpen, 'Closing the modal returns focus to its quick-navigation opener');
  quickOpen.click();
  const shaftRow = [...dialog().querySelectorAll('.sourcing-part-row')].find(row => row.textContent.includes('Forward and aft wheel shafts'));
  shaftRow.click();
  await settle();
  check(!dialog().open && navigations.at(-1) === 'shaft', 'Part-list navigation closes the grid and targets the selected component');

  const separator = panel.querySelector('[role="separator"]');
  check(separator.getAttribute('aria-orientation') === 'vertical' && separator.tabIndex === 0, 'Guide resize is an accessible keyboard separator');
  separator.focus();
  key(separator, 'Home');
  const min = Number(separator.getAttribute('aria-valuemin'));
  key(separator, 'ArrowLeft');
  check(Number(separator.getAttribute('aria-valuenow')) === min + 24, 'Left arrow widens the right-hand guide');
  key(separator, 'ArrowLeft', { shiftKey: true });
  check(Number(separator.getAttribute('aria-valuenow')) === min + 88, 'Shift uses a larger resize increment');
  key(separator, 'ArrowRight');
  check(Number(separator.getAttribute('aria-valuenow')) === min + 64, 'Right arrow narrows the guide');
  key(separator, 'End');
  check(separator.getAttribute('aria-valuenow') === separator.getAttribute('aria-valuemax'), 'End respects the available-space maximum');
  key(separator, 'Home');
  key(separator, 'ArrowRight');
  check(Number(separator.getAttribute('aria-valuenow')) === min, 'Resize cannot pass the minimum width');
  key(separator, 'ArrowLeft', { shiftKey: true });
  const savedWidth = Number(separator.getAttribute('aria-valuenow'));
  check(localStorage.getItem(widthKey) === String(savedWidth), 'Resize persists the chosen width');
  guide.selectPart(parts[0]);
  check(panel.style.getPropertyValue('--guide-width') === `${savedWidth}px`, 'Selection preserves the resized width');

  document.getElementById('learning-close').focus();
  document.getElementById('learning-close').click();
  check(panel.hidden && localStorage.getItem(preferenceKey) === 'hidden', 'Closing saves the hidden-guide preference');
  check(document.activeElement === document.getElementById('learning-toggle'), 'Closing guide restores focus to its toggle');
  guide.selectPart(parts[1]);
  check(panel.hidden, 'Ordinary selection respects the hidden preference');
  quickOpen.click();
  check(dialog().open && panel.hidden, 'Quick grid remains available with the guide hidden');
  dialog().querySelector('[data-supply-part="base-frame"]').click();
  await settle();
  check(!panel.hidden && navigations.at(-1) === 'base-frame', 'Explicit grid navigation reopens the selected part guide');
  active('supply');
  tab('supply').focus();
  key(panel, 'Escape');
  check(panel.hidden && localStorage.getItem(preferenceKey) === 'hidden', 'Escape hides and remembers the guide');

  // A fresh instance simulates a reload, proving both preferences are consumed.
  unmount();
  mount();
  guide.selectPart(parts[0]);
  check(panel.hidden, 'Fresh panel instance consumes the saved hide preference');
  document.getElementById('learning-toggle').click();
  check(!panel.hidden, 'Saved hidden guide can be reopened');
  check(panel.style.getPropertyValue('--guide-width') === `${savedWidth}px`, 'Fresh panel instance restores the saved width');
  guide.showSupply();
  guide.selectSystem('exhaust');
  active('supply');
  check(supplyPanel().querySelectorAll('.supply-overview-list button').length === 2, 'System Supply Chain overview lists only its components');
  check(supplyPanel().textContent.includes('2 researched components'), 'System research overview reports its own scope');

  results.textContent = `PASS: ${assertions} supply chain panel assertions`;
  results.dataset.status = 'passed';
} catch (error) {
  results.textContent = `FAIL after ${assertions} assertions: ${error.stack}`;
  results.dataset.status = 'failed';
  throw error;
} finally {
  for (const [name, value] of previous) {
    if (value === null) localStorage.removeItem(name);
    else localStorage.setItem(name, value);
  }
  unmount();
}
