import { formatSvNumber } from '@shared/sv-format';
import { appendNodes } from '../lib/dom';
import { SV_COPY } from '../lib/sv-copy';

const GRAVITY_SV = 9.82;

function formatEnergyFull(joules: number): string {
  if (joules >= 1000) {
    return `${formatSvNumber(joules / 1000, 2)} kJ (${formatSvNumber(Math.round(joules), 0)} J)`;
  }
  return `${formatSvNumber(Math.round(joules), 0)} J`;
}

function formatEnergyCompact(joules: number): string {
  if (joules >= 1000) {
    return `${formatSvNumber(joules / 1000, 2)} kJ`;
  }
  return `${formatSvNumber(Math.round(joules), 0)} J`;
}

export function createPhysicsSimulator(config?: Record<string, unknown> | null): HTMLElement {
  const initialFriction = Boolean(config && config.defaultFriction);
  const initialHeight =
    config && typeof config.defaultHeight === 'number' && config.defaultHeight >= 4 && config.defaultHeight <= 40
      ? config.defaultHeight
      : 24;
  const initialMass =
    config && typeof config.defaultMass === 'number' && config.defaultMass >= 10 && config.defaultMass <= 120
      ? config.defaultMass
      : 50;

  let posPct = 40;
  let startHeight = initialHeight;
  let mass = initialMass;
  let hasFriction = initialFriction;
  let frictionLossPct = 42.6;

  const panel = document.createElement('section');
  panel.className = 'widget-panel';
  panel.setAttribute('aria-label', SV_COPY.widgets.simTitle);

  const headerRow = document.createElement('div');
  headerRow.className = 'row-between';

  const title = document.createElement('h3');
  title.textContent = SV_COPY.widgets.simTitle;

  const presetsWrap = document.createElement('div');
  presetsWrap.className = 'row-wrap';

  const presetCoasterBtn = document.createElement('button');
  presetCoasterBtn.type = 'button';
  presetCoasterBtn.className = 'btn btn-surface btn-sm';
  presetCoasterBtn.textContent = SV_COPY.widgets.simPresetCoaster;

  const presetSledBtn = document.createElement('button');
  presetSledBtn.type = 'button';
  presetSledBtn.className = 'btn btn-surface btn-sm';
  presetSledBtn.textContent = SV_COPY.widgets.simPresetSled;

  appendNodes(presetsWrap, presetCoasterBtn, presetSledBtn);
  appendNodes(headerRow, title, presetsWrap);

  const modeRow = document.createElement('div');
  modeRow.className = 'tab-bar';
  modeRow.setAttribute('role', 'group');
  modeRow.setAttribute('aria-label', 'Friktionsläge');

  const noFricBtn = document.createElement('button');
  noFricBtn.type = 'button';
  noFricBtn.className = 'tab-btn';
  noFricBtn.textContent = SV_COPY.widgets.simNoFriction;

  const fricBtn = document.createElement('button');
  fricBtn.type = 'button';
  fricBtn.className = 'tab-btn';
  fricBtn.textContent = SV_COPY.widgets.simWithFriction;

  appendNodes(modeRow, noFricBtn, fricBtn);

  const grid = document.createElement('div');
  grid.className = 'widget-grid';

  // Left Controls
  const controls = document.createElement('div');
  controls.className = 'widget-controls';

  const uid = Math.random().toString(36).slice(2, 7);

  // Position slider
  const posGroup = document.createElement('div');
  posGroup.className = 'slider-control';
  const posLabelRow = document.createElement('div');
  posLabelRow.className = 'slider-label-row';
  const posLabel = document.createElement('label');
  posLabel.htmlFor = `sim-pos-${uid}`;
  posLabel.textContent = SV_COPY.widgets.simPosition;
  const posValEl = document.createElement('strong');
  appendNodes(posLabelRow, posLabel, posValEl);

  const posInput = document.createElement('input');
  posInput.id = `sim-pos-${uid}`;
  posInput.type = 'range';
  posInput.className = 'slider-input';
  posInput.min = '0';
  posInput.max = '100';
  posInput.step = '1';
  posInput.value = String(posPct);

  const jumpRow = document.createElement('div');
  jumpRow.className = 'row-wrap';
  const jumpSpecs = [
    { label: SV_COPY.widgets.simTop, val: 0 },
    { label: SV_COPY.widgets.simMiddle, val: 50 },
    { label: SV_COPY.widgets.simValley, val: 100 },
  ];
  for (const spec of jumpSpecs) {
    const jb = document.createElement('button');
    jb.type = 'button';
    jb.className = 'btn btn-surface btn-sm';
    jb.textContent = spec.label;
    jb.addEventListener('click', () => {
      posPct = spec.val;
      posInput.value = String(spec.val);
      update();
    });
    jumpRow.appendChild(jb);
  }
  appendNodes(posGroup, posLabelRow, posInput, jumpRow);

  // Start height slider
  const hGroup = document.createElement('div');
  hGroup.className = 'slider-control';
  const hLabelRow = document.createElement('div');
  hLabelRow.className = 'slider-label-row';
  const hLabel = document.createElement('label');
  hLabel.htmlFor = `sim-h-${uid}`;
  hLabel.textContent = `${SV_COPY.widgets.simStartHeight} h₁`;
  const hValEl = document.createElement('strong');
  appendNodes(hLabelRow, hLabel, hValEl);
  const hInput = document.createElement('input');
  hInput.id = `sim-h-${uid}`;
  hInput.type = 'range';
  hInput.className = 'slider-input';
  hInput.min = '4';
  hInput.max = '40';
  hInput.step = '1';
  hInput.value = String(startHeight);
  appendNodes(hGroup, hLabelRow, hInput);

  // Mass slider
  const mGroup = document.createElement('div');
  mGroup.className = 'slider-control';
  const mLabelRow = document.createElement('div');
  mLabelRow.className = 'slider-label-row';
  const mLabel = document.createElement('label');
  mLabel.htmlFor = `sim-m-${uid}`;
  mLabel.textContent = `${SV_COPY.widgets.simMass} m`;
  const mValEl = document.createElement('strong');
  appendNodes(mLabelRow, mLabel, mValEl);
  const mInput = document.createElement('input');
  mInput.id = `sim-m-${uid}`;
  mInput.type = 'range';
  mInput.className = 'slider-input';
  mInput.min = '10';
  mInput.max = '120';
  mInput.step = '1';
  mInput.value = String(mass);
  appendNodes(mGroup, mLabelRow, mInput);

  // Friction loss slider
  const fGroup = document.createElement('div');
  fGroup.className = 'slider-control';
  const fLabelRow = document.createElement('div');
  fLabelRow.className = 'slider-label-row';
  const fLabel = document.createElement('label');
  fLabel.htmlFor = `sim-f-${uid}`;
  fLabel.textContent = SV_COPY.widgets.simFrictionLoss;
  const fValEl = document.createElement('strong');
  appendNodes(fLabelRow, fLabel, fValEl);
  const fInput = document.createElement('input');
  fInput.id = `sim-f-${uid}`;
  fInput.type = 'range';
  fInput.className = 'slider-input';
  fInput.min = '5';
  fInput.max = '60';
  fInput.step = '0.2';
  fInput.value = String(frictionLossPct);
  appendNodes(fGroup, fLabelRow, fInput);

  const insightEl = document.createElement('p');
  insightEl.className = 'meta-xs';

  appendNodes(controls, posGroup, hGroup, mGroup, fGroup, insightEl);

  // Right Visuals (Geometric SVG + Metrics + Bars)
  const visuals = document.createElement('div');
  visuals.className = 'stack-md';

  const svgWrap = document.createElement('div');
  svgWrap.className = 'sim-canvas-wrap';
  svgWrap.innerHTML = `
    <svg viewBox="0 0 500 155" role="img" aria-label="Bana för energibevarande">
      <line x1="30" y1="134" x2="470" y2="134" stroke="var(--gray-3)" stroke-width="1.5" />
      <text x="34" y="149" font-size="11" fill="var(--gray-3)">${SV_COPY.widgets.simZeroLevel}</text>
      <path class="js-slope-area" d="" fill="var(--gray-2)" />
      <path class="js-slope-path" d="" fill="none" stroke="var(--gray-4)" stroke-width="2" />
      <text class="js-height-label" x="48" y="30" font-size="11" fill="var(--gray-3)">h₁</text>
      <g class="js-cart" transform="translate(40,22)">
        <rect x="-8" y="-12" width="16" height="10" rx="2" fill="var(--accent)" />
      </g>
    </svg>
  `;

  const slopeAreaEl = svgWrap.querySelector<SVGPathElement>('.js-slope-area')!;
  const slopePathEl = svgWrap.querySelector<SVGPathElement>('.js-slope-path')!;
  const heightLabelEl = svgWrap.querySelector<SVGTextElement>('.js-height-label')!;
  const cartEl = svgWrap.querySelector<SVGGElement>('.js-cart')!;

  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'sim-metrics-grid';

  const createMetricCell = (labelText: string): { cell: HTMLElement; valEl: HTMLElement; subEl: HTMLElement } => {
    const cell = document.createElement('div');
    cell.className = 'sim-metric-cell';
    const lbl = document.createElement('span');
    lbl.className = 'meta-xs';
    lbl.textContent = labelText;
    const valEl = document.createElement('span');
    valEl.className = 'sim-metric-val';
    const subEl = document.createElement('span');
    subEl.className = 'meta-xs';
    appendNodes(cell, lbl, valEl, subEl);
    return { cell, valEl, subEl };
  };

  const mH = createMetricCell(`${SV_COPY.widgets.simHeight} h`);
  const mV = createMetricCell(`${SV_COPY.widgets.simSpeed} v`);
  const mEmek = createMetricCell(SV_COPY.widgets.simMechEnergy);
  const mEtot = createMetricCell(SV_COPY.widgets.simStartEnergy);
  appendNodes(metricsGrid, mH.cell, mV.cell, mEmek.cell, mEtot.cell);

  const barsBox = document.createElement('div');
  barsBox.className = 'sim-bars';

  const createBarRow = (labelText: string, fillClass: string): { row: HTMLElement; textEl: HTMLElement; fillEl: HTMLElement } => {
    const row = document.createElement('div');
    row.className = 'sim-bar-row';
    const top = document.createElement('div');
    top.className = 'row-between';
    const lbl = document.createElement('span');
    lbl.textContent = labelText;
    const textEl = document.createElement('span');
    appendNodes(top, lbl, textEl);
    const track = document.createElement('div');
    track.className = 'sim-bar-track';
    const fillEl = document.createElement('div');
    fillEl.className = `sim-bar-fill ${fillClass}`;
    track.appendChild(fillEl);
    appendNodes(row, top, track);
    return { row, textEl, fillEl };
  };

  const barEp = createBarRow(`${SV_COPY.widgets.simEpLabel} (Ep)`, 'is-ep');
  const barEk = createBarRow(`${SV_COPY.widgets.simEkLabel} (Ek)`, 'is-ek');
  const barWf = createBarRow(`${SV_COPY.widgets.simWfLabel} (Wf)`, 'is-wf');
  appendNodes(barsBox, barEp.row, barEk.row, barWf.row);

  appendNodes(visuals, svgWrap, metricsGrid, barsBox);
  appendNodes(grid, controls, visuals);
  appendNodes(panel, headerRow, modeRow, grid);

  const update = (): void => {
    noFricBtn.classList.toggle('is-active', !hasFriction);
    fricBtn.classList.toggle('is-active', hasFriction);
    fGroup.hidden = !hasFriction;

    const p = posPct / 100;
    const fricRatio = hasFriction ? frictionLossPct / 100 : 0;

    posValEl.textContent = `${formatSvNumber(Math.round(posPct), 0)} %`;
    hValEl.textContent = `${formatSvNumber(startHeight, 0)} m`;
    mValEl.textContent = `${formatSvNumber(mass, 0)} kg`;
    fValEl.textContent = `${formatSvNumber(frictionLossPct, 1)} %`;

    const hCurr = startHeight * 0.5 * (1 + Math.cos(Math.PI * p));
    const eTot = mass * GRAVITY_SV * startHeight;
    const eP = mass * GRAVITY_SV * hCurr;
    const wF = eTot * fricRatio * p;
    const eK = Math.max(0, eTot - eP - wF);
    const eMek = eP + eK;
    const v = Math.sqrt((2 * eK) / mass);

    mH.valEl.textContent = `${formatSvNumber(hCurr, 1)} m`;
    mV.valEl.textContent = `${formatSvNumber(v, 1)} m/s`;
    mV.subEl.textContent = `${formatSvNumber(v * 3.6, 0)} km/h`;
    mEmek.valEl.textContent = formatEnergyCompact(eMek);
    mEtot.valEl.textContent = formatEnergyCompact(eTot);

    barEp.textEl.textContent = formatEnergyFull(eP);
    barEk.textEl.textContent = formatEnergyFull(eK);
    barWf.textEl.textContent = formatEnergyFull(wF);

    const safeTot = eTot > 0 ? eTot : 1;
    barEp.fillEl.style.width = `${((eP / safeTot) * 100).toFixed(1)}%`;
    barEk.fillEl.style.width = `${((eK / safeTot) * 100).toFixed(1)}%`;
    barWf.fillEl.style.width = `${((wF / safeTot) * 100).toFixed(1)}%`;

    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const px = 40 + t * 420;
      const py = 134 - 0.5 * (1 + Math.cos(Math.PI * t)) * 112;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    const pathStr = pts.join(' ');
    slopePathEl.setAttribute('d', pathStr);
    slopeAreaEl.setAttribute('d', `${pathStr} L 460 134 L 40 134 Z`);

    const cartX = 40 + p * 420;
    const cartY = 134 - (hCurr / startHeight) * 112;
    cartEl.setAttribute('transform', `translate(${cartX.toFixed(1)},${cartY.toFixed(1)})`);
    heightLabelEl.textContent = `h₁ = ${formatSvNumber(startHeight, 0)} m`;

    insightEl.textContent = hasFriction
      ? `Med friktion har ${formatSvNumber(Math.round(wF), 0)} J omvandlats till värme.`
      : `Utan friktion är den mekaniska energin konstant ${formatSvNumber(Math.round(eTot), 0)} J.`;
  };

  posInput.addEventListener('input', () => {
    posPct = Number(posInput.value);
    update();
  });
  hInput.addEventListener('input', () => {
    startHeight = Number(hInput.value);
    update();
  });
  mInput.addEventListener('input', () => {
    mass = Number(mInput.value);
    update();
  });
  fInput.addEventListener('input', () => {
    frictionLossPct = Number(fInput.value);
    update();
  });

  noFricBtn.addEventListener('click', () => {
    hasFriction = false;
    update();
  });
  fricBtn.addEventListener('click', () => {
    hasFriction = true;
    update();
  });

  presetCoasterBtn.addEventListener('click', () => {
    startHeight = 24;
    mass = 80;
    posPct = 100;
    hasFriction = false;
    hInput.value = '24';
    mInput.value = '80';
    posInput.value = '100';
    update();
  });

  presetSledBtn.addEventListener('click', () => {
    startHeight = 8;
    mass = 45;
    frictionLossPct = 42.6;
    posPct = 100;
    hasFriction = true;
    hInput.value = '8';
    mInput.value = '45';
    fInput.value = '42.6';
    posInput.value = '100';
    update();
  });

  update();
  return panel;
}
