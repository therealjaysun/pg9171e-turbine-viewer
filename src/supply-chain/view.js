import { supplyForPart, quadrantFor, quadrants, heatColors, heatColor, ratingNames, isCostOpportunity, frameworkSource } from './index.js';
import './view.css';

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function link(reference) {
  const node = el('a', reference.label);
  node.href = reference.url;
  node.target = '_blank';
  node.rel = 'noreferrer';
  return node;
}
export function createSupplyView({ parts, systems, onNavigate, onHeatmap }) {
  const records = new Map(parts.map(part => [part.id, supplyForPart(part)]));
  const numbers = new Map(parts.map((part, index) => [part.id, index + 1]));
  let selected = null, mode = 'none', returnFocus;
  let searchText = '', systemFilter = '', opportunityOnly = false;
  const dialog = el('dialog', null, 'sourcing-dialog');
  dialog.id = 'sourcing-dialog';
  dialog.setAttribute('aria-labelledby', 'sourcing-title');
  dialog.innerHTML = `<div class="dialog-heading"><div><span class="eyebrow">${parts.length} COMPONENTS · SOURCING RESEARCH</span><h2 id="sourcing-title">Kraljic sourcing grid</h2></div><button class="icon-btn" aria-label="Close sourcing grid">✕</button></div><div class="sourcing-body"></div>`;
  document.body.append(dialog);
  const body = dialog.querySelector('.sourcing-body');
  dialog.querySelector('button').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  function navigate(part) {
    if (dialog.open) { returnFocus = null; dialog.close(); }
    onNavigate(part.id);
  }
  function legend() {
    const node = el('div', null, 'supply-legend');
    heatColors.forEach((color, index) => {
      const item = el('span', `${index + 1}`);
      item.style.setProperty('--heat', color);
      item.title = ratingNames[index];
      node.append(item);
    });
    node.append(el('small', '1 low → 5 very high · Analyst ratings'));
    return node;
  }
  function heatControl() {
    const node = el('div', null, 'supply-heat-control');
    const label = el('label', 'Color the model');
    const select = el('select');
    select.setAttribute('aria-label', 'Supply chain heat map');
    for (const [value, text] of [['none', 'Original materials'], ['cost', 'Relative replacement cost'], ['criticality', 'Operational criticality']]) {
      const option = el('option', text); option.value = value; select.append(option);
    }
    select.value = mode;
    select.onchange = () => {
      mode = select.value;
      for (const other of document.querySelectorAll('.supply-heat-control select')) other.value = mode;
      for (const dot of document.querySelectorAll('[data-supply-part]')) dot.style.setProperty('--heat', heatColor(records.get(dot.dataset.supplyPart), mode) || '#537a70');
      onHeatmap(mode);
    };
    label.append(select); node.append(label, legend());
    return node;
  }
  function grid(shownParts, compact = false) {
    const wrapper = el('div', null, `kraljic-chart${compact ? ' compact' : ''}`);
    wrapper.append(el('div', 'Profit / business impact ↑', 'kraljic-y-title'));
    const matrix = el('div', null, 'kraljic-matrix');
    for (const [key, quadrant] of Object.entries(quadrants)) {
      const cell = el('section', null, 'kraljic-quadrant');
      cell.dataset.quadrant = key;
      const members = shownParts.filter(part => quadrantFor(records.get(part.id)) === key);
      if (members.some(part => part.id === selected)) cell.classList.add('has-selection');
      cell.append(el('h4', quadrant.title), el('p', quadrant.caption), el('small', quadrant.axes));
      const dots = el('div', null, 'kraljic-dots');
      for (const part of members) {
        const record = records.get(part.id);
        const dot = el('button', compact ? '●' : String(numbers.get(part.id)), 'sourcing-dot');
        dot.dataset.supplyPart = part.id;
        dot.style.setProperty('--heat', heatColor(record, mode) || '#537a70');
        dot.classList.toggle('selected', part.id === selected);
        dot.setAttribute('aria-pressed', String(part.id === selected));
        const description = `${part.name} · ${quadrant.title} · cost ${record.cost}/5 · criticality ${record.criticality}/5 · supply risk ${record.supplyRisk}/5 · impact ${record.businessImpact}/5`;
        dot.title = `${description}. Select to center on this part.`;
        dot.setAttribute('aria-label', `Center on ${description}`);
        dot.onclick = () => navigate(part);
        dots.append(dot);
      }
      if (!compact && !members.length) dots.append(el('span', 'No parts in this view', 'supply-empty'));
      cell.append(dots); matrix.append(cell);
    }
    wrapper.append(matrix, el('div', 'Low ← Supply risk → High', 'kraljic-x-title'));
    return wrapper;
  }
  function method() {
    const details = el('details', null, 'supply-method');
    details.append(el('summary', 'How to read the ratings'));
    details.append(el('p', 'Each score is an analyst assessment on a 1–5 scale. Cost compares replacement scope and manufacturing burden; it is not a dollar estimate. Criticality describes operational consequence, not failure probability.'));
    details.append(el('p', 'The grid uses supply risk and profit / business impact (a procurement-and-availability proxy). Scores 1–2 are low, 3–5 high. No plant spend, stock or outage economics were supplied. Dots are grouped by quadrant; positions inside it carry no finer score.'));
    details.append(el('p', '“Non-critical” is a purchasing category, not a safety judgment. A model selection can contain many parts or overlap other selections; ratings cannot be added into a budget.'));
    details.append(link(frameworkSource));
    return details;
  }
  function opportunity(shownParts = parts) {
    const found = shownParts.filter(part => isCostOpportunity(records.get(part.id)));
    const node = el('div', null, 'supply-opportunity');
    node.append(el('h3', found.length ? `${found.length} expensive, low-criticality candidates` : 'No expensive, low-criticality parts identified'));
    node.append(el('p', `Screen: cost ≥4 and operational criticality ≤2. ${shownParts.length} modeled groups assessed. ${found.length ? 'Review each candidate’s scope and evidence.' : 'These are functional turbine components. This does not rule out savings through qualified competition, repair or shared spares.'}`));
    return node;
  }
  function expandButton() {
    const button = el('button', 'Expand sourcing grid ↗', 'supply-expand');
    button.onclick = () => open();
    return button;
  }
  function renderPanel(part, systemId) {
    const section = el('div', null, 'supply-content');
    const record = part && records.get(part.id);
    section.append(heatControl());
    if (!record) {
      const shown = systemId ? parts.filter(p => p.system === systemId) : parts;
      section.append(el('p', `${shown.length} researched components. Select a part to see its sourcing assessment, or expand the grid to explore the full turbine.`, 'learning-summary'), expandButton(), opportunity(shown), method());
      const list = el('div', null, 'supply-overview-list');
      for (const item of shown) {
        const button = el('button', item.name);
        button.onclick = () => navigate(item);
        list.append(button);
      }
      section.append(list);
      return section;
    }
    section.append(el('p', 'RESEARCHED 06 OCT 2026 · PROVISIONAL ASSESSMENT', 'supply-dateline'));
    const stats = el('div', null, 'supply-stats');
    for (const [key, label] of [['cost', 'Relative cost'], ['criticality', 'Operational criticality']]) {
      const stat = el('div');
      stat.style.setProperty('--heat', heatColor(record, key));
      stat.append(el('span', label), el('strong', `${record[key]} / 5`)); stats.append(stat);
    }
    section.append(stats, el('h3', 'Quote required', 'supply-price'), el('p', record.scope, 'learning-summary'));
    section.append(el('h3', `Sourcing position · ${quadrants[quadrantFor(record)].title}`, 'learning-section-title'), grid([part], true), expandButton());
    section.append(el('p', `Supply risk ${record.supplyRisk}/5 · Business impact ${record.businessImpact}/5`, 'supply-score-note'));
    for (const [heading, text] of [['Cost basis', record.costBasis], ['Operational criticality', record.criticalityBasis], ['Supply market', record.riskBasis], ['Business impact', record.impactBasis], ['Sourcing approach', record.strategy], ['Price evidence', record.priceEvidence]]) {
      section.append(el('h3', heading, 'learning-section-title'), el('p', text, 'learning-prose'));
    }
    section.append(el('h3', 'Supplier routes to qualify', 'learning-section-title'));
    const suppliers = el('ul', null, 'learning-prose');
    record.suppliers.forEach(text => suppliers.append(el('li', text)));
    section.append(suppliers);
    const limits = el('details', null, 'supply-method');
    limits.append(el('summary', 'Scope and evidence limits'));
    record.limitations.forEach(text => limits.append(el('p', text)));
    section.append(limits, opportunity(), method());
    const sources = el('section', null, 'learning-sources supply-sources');
    sources.append(el('h3', 'Component research sources', 'learning-section-title'));
    for (const reference of record.references) sources.append(link(reference), el('p', reference.scope));
    section.append(sources);
    return section;
  }
  function renderDialog() {
    body.replaceChildren();
    body.append(el('p', 'Select a dot or list entry to center the model on that part. The outline marks your selection.', 'sourcing-intro'), heatControl());
    const filters = el('div', null, 'sourcing-filters');
    const search = el('input'); search.type = 'search'; search.placeholder = 'Find a component…'; search.setAttribute('aria-label', 'Find a component'); search.value = searchText;
    const system = el('select'); system.setAttribute('aria-label', 'Filter sourcing grid by assembly');
    for (const [value, text] of [['', 'All assemblies'], ...systems.map(s => [s.id, s.name])]) { const option = el('option', text); option.value = value; system.append(option); }
    system.value = systemFilter;
    const label = el('label', 'Expensive + low criticality'); const checkbox = el('input'); checkbox.type = 'checkbox'; checkbox.checked = opportunityOnly; label.prepend(checkbox);
    filters.append(search, system, label); body.append(filters);
    const count = el('p', null, 'supply-score-note');
    count.setAttribute('role', 'status');
    const results = el('div', null, 'sourcing-results');
    body.append(count, results, opportunity(), method());
    const update = () => {
      const matching = parts.filter(p => (!systemFilter || p.system === systemFilter) && `${p.name} ${p.id}`.toLowerCase().includes(searchText.toLowerCase().trim()) && (!opportunityOnly || isCostOpportunity(records.get(p.id))));
      results.replaceChildren();
      count.textContent = `${matching.length} of ${parts.length} components · Numbers identify individual parts`;
      if (!matching.length) results.append(el('p', opportunityOnly ? 'No components meet cost ≥4 and criticality ≤2. Clear this filter to explore all parts.' : 'No matching components. Try another name or assembly.', 'supply-empty'));
      const layout = el('div', null, 'sourcing-layout');
      layout.append(grid(matching));
      const list = el('div', null, 'sourcing-part-list'); list.setAttribute('aria-label', 'Components in sourcing grid');
      for (const part of matching) {
        const record = records.get(part.id);
        const button = el('button', null, 'sourcing-part-row');
        button.classList.toggle('selected', part.id === selected);
        button.append(el('span', String(numbers.get(part.id)), 'sourcing-number'), el('span', part.name), el('small', `${quadrants[quadrantFor(record)].title} · Cost ${record.cost} · Criticality ${record.criticality}`));
        button.onclick = () => navigate(part); list.append(button);
      }
      layout.append(list); results.append(layout);
    };
    search.oninput = () => { searchText = search.value; update(); };
    system.onchange = () => { systemFilter = system.value; update(); };
    checkbox.onchange = () => { opportunityOnly = checkbox.checked; update(); };
    update();
  }
  function open() {
    returnFocus = document.activeElement;
    searchText = ''; systemFilter = ''; opportunityOnly = false;
    renderDialog();
    if (!dialog.open) dialog.showModal();
  }
  document.getElementById('sourcing-open')?.addEventListener('click', open);
  return { renderPanel, open, select: id => { selected = id; }, getMode: () => mode };
}
