import { assemblyEducation, educationForPart, educationForSystem } from './index.js';
import './panel.css';

const tabs = ['operation', 'design', 'watch'];
const headings = { operation: 'How it works', design: 'Design considerations', watch: 'In service' };

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function createEducationPanel({ systems, parts }) {
  const panel = document.getElementById('learning-panel');
  const toggle = document.getElementById('learning-toggle');
  const content = document.getElementById('learning-content');
  const buttons = [...panel.querySelectorAll('[role="tab"]')];
  let autoShow = true;
  let activeTab = 'operation';
  let current = { title: 'PG9171E gas turbine', system: 'Complete assembly', lesson: assemblyEducation, facts: [] };
  try { autoShow = localStorage.getItem('pg9171e.part-guide') !== 'hidden'; } catch { /* Storage may be unavailable in private contexts. */ }

  function visibility(visible, remember = false) {
    const returnFocus = !visible && panel.contains(document.activeElement);
    panel.hidden = !visible;
    document.querySelector('.workspace').classList.toggle('guide-open', visible);
    toggle.setAttribute('aria-expanded', String(visible));
    toggle.setAttribute('aria-label', visible ? 'Hide part guide' : 'Show part guide');
    toggle.title = visible ? 'Hide part guide' : 'Show part guide';
    if (remember) {
      autoShow = visible;
      try { localStorage.setItem('pg9171e.part-guide', visible ? 'visible' : 'hidden'); } catch { /* Keep the in-memory preference. */ }
    }
    if (returnFocus) toggle.focus();
  }

  function render() {
    document.getElementById('learning-title').textContent = current.title;
    document.getElementById('learning-system').textContent = current.system;
    document.getElementById('learning-announcement').textContent = `Part guide: ${current.title}`;
    content.replaceChildren();
    for (const tab of tabs) {
      const section = element('section');
      section.id = `learning-${tab}`;
      section.setAttribute('role', 'tabpanel');
      section.setAttribute('aria-labelledby', `learning-tab-${tab}`);
      section.tabIndex = 0;
      section.hidden = activeTab !== tab;
      if (tab === 'operation') {
        section.append(element('p', current.lesson.summary, 'learning-summary'));
        const insight = element('div', null, 'learning-insight');
        insight.append(element('h3', 'Key idea'), element('p', current.lesson.keyIdea));
        section.append(insight);
      }
      section.append(element('h3', headings[tab], 'learning-section-title'));
      const body = element(tab === 'operation' ? 'div' : 'ul', null, 'learning-prose');
      for (const text of current.lesson[tab]) body.append(element(tab === 'operation' ? 'p' : 'li', text));
      section.append(body);
      if (tab === 'operation' && current.facts.length) {
        section.append(element('h3', 'Model details', 'learning-section-title'));
        const facts = element('dl', null, 'learning-facts');
        for (const [key, value] of current.facts) {
          const row = element('div');
          row.append(element('dt', key), element('dd', value));
          facts.append(row);
        }
        section.append(facts);
      }
      content.append(section);
    }
    const sources = element('section', null, 'learning-sources');
    sources.append(element('h3', 'Further reading', 'learning-section-title'));
    for (const reference of current.lesson.references) {
      const link = element('a', reference.label);
      link.href = reference.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      const arrow = element('span', '\u2197');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      sources.append(link);
    }
    sources.append(element('p', 'Video-based configuration with general engineering context. Geometry is reconstructed; service limits are not modeled.', 'learning-caveat'));
    content.append(sources);
    setTab(activeTab);
    content.scrollTop = 0;
  }

  function setTab(tab) {
    activeTab = tab;
    for (const button of buttons) {
      const active = button.dataset.lessonTab === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      document.getElementById(`learning-${button.dataset.lessonTab}`).hidden = !active;
    }
    content.scrollTop = 0;
  }

  toggle.addEventListener('click', () => visibility(panel.hidden, true));
  document.getElementById('learning-close').addEventListener('click', () => visibility(false, true));
  for (const button of buttons) {
    button.addEventListener('click', () => setTab(button.dataset.lessonTab));
    button.addEventListener('keydown', event => {
      const index = tabs.indexOf(activeTab);
      const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      setTab(tabs[next]);
      buttons[next].focus();
    });
  }
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); visibility(false, true); }
  });
  render();

  function update(next, selected) {
    current = next;
    render();
    if (selected && autoShow) visibility(true);
    if (selected && matchMedia('(max-width: 760px)').matches) {
      const tree = document.getElementById('assembly-panel');
      const returnFocus = tree.contains(document.activeElement);
      tree.classList.remove('open');
      if (returnFocus) {
        const destination = panel.hidden ? document.getElementById('menu-toggle') : document.getElementById('learning-title');
        destination.focus({ preventScroll: true });
      }
    }
  }

  return {
    selectPart(part) {
      update(part ? {
        title: part.name,
        system: systems.find(system => system.id === part.system)?.name || 'Component',
        lesson: educationForPart(part) || assemblyEducation,
        facts: part.facts || []
      } : { title: 'PG9171E gas turbine', system: 'Complete assembly', lesson: assemblyEducation, facts: [] }, Boolean(part));
    },
    selectSystem(id) {
      const system = systems.find(system => system.id === id);
      update({ title: system.name, system: 'Assembly overview', lesson: educationForSystem(id), facts: [['Selectable components', String(parts.filter(part => part.system === id).length)]] }, true);
    }
  };
}
