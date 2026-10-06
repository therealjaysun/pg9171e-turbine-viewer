import { createEducationPanel } from '../src/education/panel.js';

const results = document.getElementById('results');
const preferenceKey = 'pg9171e.part-guide';
const previousPreference = localStorage.getItem(preferenceKey);
let assertions = 0;
function check(condition, message) {
  assertions++;
  if (!condition) throw new Error(message);
}
const systems = [
  { id: 'compressor', name: 'Axial compressor' },
  { id: 'turbine', name: 'Turbine stages' }
];
const parts = [
  { id: 'compressor-rotor-1', name: 'Compressor rotor stage 1', system: 'compressor', facts: [] },
  { id: 'turbine-wheel-2', name: 'Turbine stage 2', system: 'turbine', facts: [] }
];
const fixture = document.createElement('div');
fixture.innerHTML = `<div class="workspace">
  <button id="learning-toggle">Part guide</button><button id="menu-toggle">Assembly</button>
  <div id="assembly-panel"></div>
  <aside id="learning-panel" hidden><button id="learning-close">Close part guide</button>
    <h2 id="learning-title" tabindex="-1"></h2><p id="learning-system"></p>
    <div role="tablist">${['operation', 'design', 'watch', 'manufacturing'].map(tab => `<button role="tab" id="learning-tab-${tab}" data-lesson-tab="${tab}" aria-controls="learning-${tab}">${tab}</button>`).join('')}</div>
    <div id="learning-content"></div>
  </aside><div id="learning-announcement"></div>
</div>`;
document.body.append(fixture);
const tab = name => document.getElementById(`learning-tab-${name}`);
const panel = document.getElementById('learning-panel');
const toggle = document.getElementById('learning-toggle');
function active(name) {
  for (const button of fixture.querySelectorAll('[role="tab"]')) {
    const selected = button.dataset.lessonTab === name;
    check(button.getAttribute('aria-selected') === String(selected), 'Tab selection mismatch');
    check(button.tabIndex === (selected ? 0 : -1), 'Roving tab focus mismatch');
    check(document.getElementById(button.getAttribute('aria-controls')).hidden !== selected, 'Tab panel visibility mismatch');
  }
}
try {
  localStorage.removeItem(preferenceKey);
  const guide = createEducationPanel({ systems, parts });
  active('operation');
  guide.selectPart(parts[0]);
  check(!panel.hidden, 'Part selection opens guide');
  tab('watch').click();
  tab('watch').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  active('manufacturing');
  check(document.activeElement === tab('manufacturing'), 'Keyboard focus enters manufacturing tab');
  check(document.getElementById('learning-general-sources').hidden, 'Unrelated general references are hidden');
  const notes = document.getElementById('learning-manufacturing');
  check(notes.querySelectorAll('.manufacturing-steps li').length >= 5, 'Production and inspection steps render');
  check(notes.querySelectorAll('.manufacturing-citations a').length >= 5, 'Per-claim references render');
  for (const link of notes.querySelectorAll('a')) {
    check(link.href.startsWith('https://'), 'Sources use HTTPS');
    check(link.target === '_blank' && link.rel.includes('noreferrer'), 'Source links keep the model open');
  }
  guide.selectPart(parts[1]);
  active('manufacturing');
  check(document.getElementById('learning-title').textContent === parts[1].name, 'Guide follows selected component');
  document.getElementById('learning-close').focus();
  document.getElementById('learning-close').click();
  check(panel.hidden && document.activeElement === toggle, 'Closing restores focus');
  check(localStorage.getItem(preferenceKey) === 'hidden', 'Hide preference saved');
  guide.selectPart(parts[0]);
  check(panel.hidden, 'Selection honors hidden preference');
  toggle.click();
  check(!panel.hidden && localStorage.getItem(preferenceKey) === 'visible', 'Guide reopens');
  guide.selectSystem('turbine');
  active('manufacturing');
  const families = [...document.querySelectorAll('.manufacturing-family')];
  check(families.length >= 6, 'System lists distinct manufacturing families');
  for (const family of families) {
    check(family.children.length === 1, 'Family detail is lazy rendered');
    family.open = true;
    family.dispatchEvent(new Event('toggle'));
    check(family.querySelector('.manufacturing-content'), 'Expanded family has complete notes');
  }
  tab('manufacturing').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  active('operation');
  check(!document.getElementById('learning-general-sources').hidden, 'Function sources return');
  tab('operation').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
  active('manufacturing');
  panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check(panel.hidden, 'Escape hides guide');
  results.textContent = `PASS: ${assertions} manufacturing panel assertions`;
  results.dataset.status = 'passed';
} catch (error) {
  results.textContent = `FAIL after ${assertions} assertions: ${error.stack}`;
  results.dataset.status = 'failed';
  throw error;
} finally {
  if (previousPreference === null) localStorage.removeItem(preferenceKey);
  else localStorage.setItem(preferenceKey, previousPreference);
  fixture.remove();
}
