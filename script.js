'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#nav-links');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

// Animation players are implemented in animations.js.

// Arrow/Home/End navigation for all tab groups.
document.querySelectorAll('[role="tablist"]:not(.film-chapters)').forEach(group => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  group.addEventListener('keydown', event => {
    const position = tabs.indexOf(event.target);
    if (position < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (position + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (position + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].click();
    tabs[next].focus();
  });
});

const benchmarkData = {
  alfworld: {name: 'ALFWorld', subtitle: 'Household task completion', score: '98.57', delta: '+2.86', values: [98.57, 95.71, 96.09, 87.86, 86.43, 37.38], note: 'Main-table results. SkillDuet and SEED-API: step-300 checkpoints, 140 evaluation trajectories each. See Appendix E for the other baselines’ checkpoint and evaluation details.'},
  webshop: {name: 'WebShop', subtitle: 'Complete shopping-task success', score: '92.97', delta: '+5.47', values: [92.97, 87.50, 75.78, 86.72, 89.84, 0.00], note: 'Main-table complete-task success on catalog1000. Trained-method checkpoints are selected by peak validation success within 300 steps. Score (terminal reward) is reported separately in the table below; see Appendix E.'}
};
document.querySelectorAll('[data-benchmark]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.benchmark;
  const data = benchmarkData[key];
  document.querySelectorAll('[data-benchmark]').forEach(tab => { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  document.querySelector('#benchmark-panel').setAttribute('aria-labelledby', button.id);
  document.querySelector('#benchmark-subtitle').textContent = data.subtitle;
  document.querySelector('#benchmark-value').innerHTML = `${data.score}<span>%</span>`;
  document.querySelector('#benchmark-delta').innerHTML = `↗ ${data.delta} pp <span>vs. SEED-API</span>`;
  document.querySelector('#benchmark-note').textContent = data.note;
  document.querySelector('#bar-chart').setAttribute('aria-label', `${data.name} success rates`);
  document.querySelectorAll('.bar-row').forEach((row, i) => { row.querySelector('.bar-track>div').style.setProperty('--value', `${data.values[i]}%`); row.querySelector('strong').textContent = data.values[i].toFixed(2); });
}));

const ablations = {
  selection: {label: 'SELECTION CRITERION', title: 'The magnitude of the response shift matters.', text: 'In the historical ALFWorld candidate pool, Strength achieves 97.9% peak validation success and 88.26% normalized AUC, outperforming reward-weighted Utility, success–failure Contrast, and Random selection.', context: 'This earlier candidate-pool study is distinct from the main framework’s independent ten-step windows.', image: 'selection-signals', height: 1132, alt: 'Strength has the highest peak success and validation-curve AUC among the tested Local selection criteria.', caption: 'Local-selection criteria in a historical ALFWorld candidate pool. Figure 4 in the paper.'},
  retention: {label: 'LOCAL RETENTION RATIO', title: 'Keep the useful half, not everything.', text: 'Top50% matches Top25% on ALFWorld and performs best on WebShop among the tested ratios. Top75% performs worse on both tasks, supporting selective consolidation rather than retaining more candidates by default.', context: 'Retention-study peak validation: Top25% = 97.14 / 85.94, Top50% = 97.14 / 92.97, Top75% = 93.57 / 82.81 (ALFWorld / WebShop). The ALFWorld study uses an earlier evaluation sequence.', image: 'retention', height: 1182, alt: 'Top50% retention gives the best overall results among 25%, 50%, and 75% retention ratios.', caption: 'Effect of the Local retention ratio on peak validation success. Figure 5 in the paper.'},
  global: {label: 'MODEL–SKILL COMPATIBILITY', title: 'The right skills for the current model.', text: 'With model parameters fixed, SkillDuet reaches 97.62% ALFWorld success with learned Global, versus 76.67% without Global and 75.24% with neutral text. The same Global does not yield the same benefit when transferred to SEED-API.', context: 'Controlled evaluation across three seeds (420 executions per condition), distinct from Table 1. SEED-API changes from 93.81% to 89.76% with transferred Global; the paired-bootstrap interval for that change includes zero.', image: 'global-ablation', height: 792, alt: 'Removing Global most strongly affects the Clean, Heat, and Cool task categories on ALFWorld.', caption: 'Effect of removing Global from SkillDuet on ALFWorld, with model parameters fixed. Figure 8 in the paper.'}
};
document.querySelectorAll('[data-ablation]').forEach(button => button.addEventListener('click', () => {
  const data = ablations[button.dataset.ablation];
  document.querySelectorAll('[data-ablation]').forEach(tab => { const selected = tab === button; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  document.querySelector('#ablation-panel').setAttribute('aria-labelledby', button.id);
  document.querySelector('#ablation-label').textContent = data.label;
  document.querySelector('#ablation-heading').textContent = data.title;
  document.querySelector('#ablation-copy').textContent = data.text;
  document.querySelector('#ablation-context').textContent = data.context;
  const img = document.querySelector('#ablation-image');
  img.src = `assets/${data.image}.webp`; img.alt = data.alt; img.height = data.height;
  const figure = document.querySelector('#ablation-figure');
  figure.dataset.zoom = img.getAttribute('src'); figure.dataset.caption = data.caption;
}));

const lightbox = document.querySelector('.lightbox');
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  window.SkillDuetMotion?.pauseAll();
  const image = document.querySelector('#lightbox-image');
  image.src = button.dataset.zoom;
  image.alt = button.querySelector('img').alt;
  document.querySelector('#lightbox-caption').textContent = button.dataset.caption;
  lightbox.showModal();
}));
document.querySelector('#close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) { const rect = lightbox.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close(); } });

document.querySelector('#copy-citation').addEventListener('click', async () => {
  const citation = document.querySelector('#bibtex').textContent;
  const button = document.querySelector('#copy-citation');
  const status = document.querySelector('#copy-status');
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(citation);
    else {
      const area = document.createElement('textarea');
      area.value = citation;
      area.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.append(area); area.select();
      const success = document.execCommand('copy'); area.remove(); button.focus();
      if (!success) throw new Error('Clipboard unavailable');
    }
    button.textContent = 'Copied ✓'; status.textContent = 'BibTeX citation copied to clipboard.';
  } catch {
    const range = document.createRange(); range.selectNodeContents(document.querySelector('#bibtex'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Text selected'; status.textContent = 'Clipboard unavailable. The citation is selected; press Control+C or Command+C to copy.';
  }
  window.setTimeout(() => { button.innerHTML = 'Copy citation <span aria-hidden="true">⧉</span>'; }, 3000);
});

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('.nav-links a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`)); });
  }, {rootMargin: '-15% 0px -55% 0px'});
  links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
}
