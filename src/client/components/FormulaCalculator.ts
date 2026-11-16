import { formatSvNumber, parseSvDecimalInput } from '@shared/sv-format';
import { appendNodes } from '../lib/dom';
import { renderLatex } from '../lib/katex-sv';
import { SV_COPY } from '../lib/sv-copy';

const GRAVITY_SV = 9.82;

type CalcFormulaKey = 'work' | 'ep' | 'ek' | 'vfree' | 'eta';

const FORMULA_OPTIONS: Array<{ key: CalcFormulaKey; label: string; latex: string }> = [
  { key: 'work', label: 'Arbete: W = F · s', latex: 'W = F \\cdot s' },
  { key: 'ep', label: 'Lägesenergi: Ep = m · g · h', latex: 'E_p = m \\cdot g \\cdot h' },
  { key: 'ek', label: 'Rörelseenergi: Ek = (m · v²) / 2', latex: 'E_k = \\frac{m \\cdot v^2}{2}' },
  { key: 'vfree', label: 'Fart i dalen: v₂ = √(2 · g · h₁)', latex: 'v_2 = \\sqrt{2 \\cdot g \\cdot h_1}' },
  {
    key: 'eta',
    label: 'Verkningsgrad: η = E_nyttig / E_tillförd',
    latex: '\\eta = \\frac{E_{\\text{nyttig}}}{E_{\\text{tillförd}}}',
  },
];

export function createFormulaCalculator(): HTMLElement {
  const uid = Math.random().toString(36).slice(2, 7);

  const panel = document.createElement('section');
  panel.className = 'widget-panel';
  panel.setAttribute('aria-label', SV_COPY.widgets.calcTitle);

  const title = document.createElement('h3');
  title.textContent = SV_COPY.widgets.calcTitle;

  const twoCol = document.createElement('div');
  twoCol.className = 'calc-two-col';

  // Left: SI Unit Converter
  const convBox = document.createElement('div');
  convBox.className = 'calc-subbox';

  const convHeading = document.createElement('h4');
  convHeading.textContent = SV_COPY.widgets.calcConverterHeading;

  const makePair = (
    leftLabel: string,
    leftDefault: string,
    rightLabel: string,
    rightDefault: string,
    toRight: (v: number) => string,
    toLeft: (v: number) => string,
    suffixId: string,
  ): HTMLElement => {
    const row = document.createElement('div');
    row.className = 'calc-two-col';

    const leftGrp = document.createElement('div');
    leftGrp.className = 'field-group';
    const lLbl = document.createElement('label');
    lLbl.className = 'field-hint';
    lLbl.htmlFor = `conv-l-${suffixId}-${uid}`;
    lLbl.textContent = leftLabel;
    const lIn = document.createElement('input');
    lIn.id = `conv-l-${suffixId}-${uid}`;
    lIn.type = 'text';
    lIn.inputMode = 'decimal';
    lIn.className = 'field-input';
    lIn.value = leftDefault;
    appendNodes(leftGrp, lLbl, lIn);

    const rightGrp = document.createElement('div');
    rightGrp.className = 'field-group';
    const rLbl = document.createElement('label');
    rLbl.className = 'field-hint';
    rLbl.htmlFor = `conv-r-${suffixId}-${uid}`;
    rLbl.textContent = rightLabel;
    const rIn = document.createElement('input');
    rIn.id = `conv-r-${suffixId}-${uid}`;
    rIn.type = 'text';
    rIn.inputMode = 'decimal';
    rIn.className = 'field-input';
    rIn.value = rightDefault;
    appendNodes(rightGrp, rLbl, rIn);

    lIn.addEventListener('input', () => {
      const parsed = parseSvDecimalInput(lIn.value);
      rIn.value = parsed !== null ? toRight(parsed) : '';
    });

    rIn.addEventListener('input', () => {
      const parsed = parseSvDecimalInput(rIn.value);
      lIn.value = parsed !== null ? toLeft(parsed) : '';
    });

    appendNodes(row, leftGrp, rightGrp);
    return row;
  };

  const speedPair = makePair(
    'km/h (dela med 3,6)',
    '72',
    'm/s (gångra med 3,6)',
    '20',
    (kmh) => formatSvNumber(kmh / 3.6, 2),
    (ms) => formatSvNumber(ms * 3.6, 2),
    'spd',
  );

  const energyPair = makePair(
    'kJ (gångra med 1 000)',
    '8,5',
    'J (dela med 1 000)',
    '8 500',
    (kj) => formatSvNumber(kj * 1000, 1),
    (j) => formatSvNumber(j / 1000, 3),
    'eng',
  );

  appendNodes(convBox, convHeading, speedPair, energyPair);

  // Right: Quick Physics Solver
  const solverBox = document.createElement('div');
  solverBox.className = 'calc-subbox';

  const solverHeading = document.createElement('h4');
  solverHeading.textContent = SV_COPY.widgets.calcSolverHeading;

  const selectGroup = document.createElement('div');
  selectGroup.className = 'field-group';
  const selectLabel = document.createElement('label');
  selectLabel.className = 'field-hint';
  selectLabel.htmlFor = `calc-select-${uid}`;
  selectLabel.textContent = SV_COPY.widgets.calcChooseFormula;

  const selectEl = document.createElement('select');
  selectEl.id = `calc-select-${uid}`;
  selectEl.className = 'field-select';
  for (const opt of FORMULA_OPTIONS) {
    const o = document.createElement('option');
    o.value = opt.key;
    o.textContent = opt.label;
    selectEl.appendChild(o);
  }
  appendNodes(selectGroup, selectLabel, selectEl);

  const formulaDisplay = document.createElement('div');
  const inputsGrid = document.createElement('div');
  inputsGrid.className = 'calc-two-col';
  const resultBox = document.createElement('div');
  resultBox.className = 'calc-result';

  appendNodes(solverBox, solverHeading, selectGroup, formulaDisplay, inputsGrid, resultBox);
  appendNodes(twoCol, convBox, solverBox);
  appendNodes(panel, title, twoCol);

  let fieldValues: Record<string, string> = {};
  let speedUnit: 'kmh' | 'ms' = 'kmh';

  const compute = (): void => {
    const key = selectEl.value as CalcFormulaKey;
    const readVal = (name: string): number | null => parseSvDecimalInput(fieldValues[name] ?? '');

    if (key === 'work') {
      const f = readVal('F');
      const s = readVal('s');
      if (f === null || s === null) {
        resultBox.textContent = 'Fyll i både kraft och sträcka för att beräkna arbetet.';
        return;
      }
      const w = f * s;
      resultBox.innerHTML = renderLatex(
        `W = ${formatSvNumber(f, 2)} \\cdot ${formatSvNumber(s, 2)} = ${formatSvNumber(w, 1)}\\text{ J}`,
        false,
      );
      const kj = document.createElement('div');
      kj.className = 'meta-xs';
      kj.textContent = `Motsvarar ${formatSvNumber(w / 1000, 3)} kJ`;
      resultBox.appendChild(kj);
      return;
    }

    if (key === 'ep') {
      const m = readVal('m');
      const h = readVal('h');
      if (m === null || h === null) {
        resultBox.textContent = 'Fyll i massa och höjd för att beräkna lägesenergin.';
        return;
      }
      const ep = m * GRAVITY_SV * h;
      resultBox.innerHTML = renderLatex(
        `E_p = ${formatSvNumber(m, 2)} \\cdot 9{,}82 \\cdot ${formatSvNumber(h, 2)} = ${formatSvNumber(ep, 1)}\\text{ J}`,
        false,
      );
      const kj = document.createElement('div');
      kj.className = 'meta-xs';
      kj.textContent = `Motsvarar ${formatSvNumber(ep / 1000, 2)} kJ`;
      resultBox.appendChild(kj);
      return;
    }

    if (key === 'ek') {
      const m = readVal('m');
      const vRaw = readVal('v');
      if (m === null || vRaw === null) {
        resultBox.textContent = 'Fyll i massa och fart för att beräkna rörelseenergin.';
        return;
      }
      const v = speedUnit === 'kmh' ? vRaw / 3.6 : vRaw;
      const ek = (m * v * v) / 2;
      const prefix =
        speedUnit === 'kmh' ? `v = ${formatSvNumber(vRaw, 2)} / 3,6 = ${formatSvNumber(v, 2)} m/s · ` : '';
      resultBox.innerHTML = '';
      if (prefix) {
        const pEl = document.createElement('div');
        pEl.className = 'meta-xs';
        pEl.textContent = prefix;
        resultBox.appendChild(pEl);
      }
      const mathEl = document.createElement('div');
      mathEl.innerHTML = renderLatex(
        `E_k = \\frac{${formatSvNumber(m, 2)} \\cdot ${formatSvNumber(v, 2)}^2}{2} = ${formatSvNumber(ek, 1)}\\text{ J}`,
        false,
      );
      const kj = document.createElement('div');
      kj.className = 'meta-xs';
      kj.textContent = `Motsvarar ${formatSvNumber(ek / 1000, 2)} kJ`;
      appendNodes(resultBox, mathEl, kj);
      return;
    }

    if (key === 'vfree') {
      const h = readVal('h');
      if (h === null || h < 0) {
        resultBox.textContent = 'Ange en positiv starthöjd.';
        return;
      }
      const v = Math.sqrt(2 * GRAVITY_SV * h);
      resultBox.innerHTML = renderLatex(
        `v_2 = \\sqrt{2 \\cdot 9{,}82 \\cdot ${formatSvNumber(h, 2)}} = ${formatSvNumber(v, 2)}\\text{ m/s}`,
        false,
      );
      const kmhEl = document.createElement('div');
      kmhEl.className = 'meta-xs';
      kmhEl.textContent = `Motsvarar ${formatSvNumber(v * 3.6, 1)} km/h`;
      resultBox.appendChild(kmhEl);
      return;
    }

    const en = readVal('en');
    const et = readVal('et');
    if (en === null || et === null || et <= 0) {
      resultBox.textContent = 'Tillförd energi måste vara större än 0.';
      return;
    }
    const eta = en / et;
    resultBox.innerHTML = renderLatex(
      `\\eta = \\frac{${formatSvNumber(en, 1)}}{${formatSvNumber(et, 1)}} = ${formatSvNumber(eta, 3)}`,
      false,
    );
    const pctEl = document.createElement('div');
    pctEl.className = 'meta-xs';
    pctEl.textContent = `Motsvarar ${formatSvNumber(eta * 100, 1)} %`;
    resultBox.appendChild(pctEl);
  };

  const renderInputs = (): void => {
    const key = selectEl.value as CalcFormulaKey;
    const option = FORMULA_OPTIONS.find((o) => o.key === key) ?? FORMULA_OPTIONS[0]!;
    formulaDisplay.innerHTML = renderLatex(option.latex, true);
    inputsGrid.replaceChildren();

    const addField = (name: string, labelText: string, defaultVal: string): void => {
      fieldValues[name] = defaultVal;
      const grp = document.createElement('div');
      grp.className = 'field-group';
      const lbl = document.createElement('label');
      lbl.className = 'field-hint';
      lbl.htmlFor = `calc-in-${name}-${uid}`;
      lbl.textContent = labelText;
      const inp = document.createElement('input');
      inp.id = `calc-in-${name}-${uid}`;
      inp.type = 'text';
      inp.inputMode = 'decimal';
      inp.className = 'field-input';
      inp.value = defaultVal;
      inp.addEventListener('input', () => {
        fieldValues[name] = inp.value;
        compute();
      });
      appendNodes(grp, lbl, inp);
      inputsGrid.appendChild(grp);
    };

    fieldValues = {};
    if (key === 'work') {
      addField('F', 'Kraft F (N)', '65');
      addField('s', 'Sträcka s (m)', '0,85');
    } else if (key === 'ep') {
      addField('m', 'Massa m (kg)', '62');
      addField('h', 'Höjd h (m)', '10');
    } else if (key === 'ek') {
      addField('m', 'Massa m (kg)', '1 400');
      addField('v', 'Fart v', '72');
      const unitGrp = document.createElement('div');
      unitGrp.className = 'field-group';
      const uLbl = document.createElement('label');
      uLbl.className = 'field-hint';
      uLbl.htmlFor = `calc-unit-${uid}`;
      uLbl.textContent = 'Enhet för fart';
      const uSel = document.createElement('select');
      uSel.id = `calc-unit-${uid}`;
      uSel.className = 'field-select';
      uSel.innerHTML = `
        <option value="kmh">km/h (delas med 3,6)</option>
        <option value="ms">m/s</option>
      `;
      uSel.value = speedUnit;
      uSel.addEventListener('change', () => {
        speedUnit = uSel.value === 'ms' ? 'ms' : 'kmh';
        compute();
      });
      appendNodes(unitGrp, uLbl, uSel);
      inputsGrid.appendChild(unitGrp);
    } else if (key === 'vfree') {
      addField('h', 'Starthöjd h₁ (m)', '24');
    } else {
      addField('en', 'Nyttig energi (J)', '5 892');
      addField('et', 'Tillförd energi (J)', '8 500');
    }

    compute();
  };

  selectEl.addEventListener('change', renderInputs);
  renderInputs();

  return panel;
}

/**
 * Clean geometric coordinate-plane explorer for Matematik chapters with graph_explorer.
 */
export function createGraphExplorer(config?: Record<string, unknown> | null): HTMLElement {
  const mode = config && config.mode === 'quadratic' ? 'quadratic' : 'linear';
  let a = mode === 'quadratic' ? 0.5 : 1.5;
  let b = mode === 'quadratic' ? 0 : 1;
  let c = mode === 'quadratic' ? -2 : 0;

  const panel = document.createElement('section');
  panel.className = 'widget-panel';
  panel.setAttribute('aria-label', 'Funktionsutforskare');

  const title = document.createElement('h3');
  title.textContent = 'Funktionsutforskare';

  const formulaBox = document.createElement('div');
  const grid = document.createElement('div');
  grid.className = 'widget-grid';

  const controls = document.createElement('div');
  controls.className = 'widget-controls';

  const uid = Math.random().toString(36).slice(2, 7);

  const makeSlider = (
    labelText: string,
    min: number,
    max: number,
    step: number,
    init: number,
    onChange: (val: number) => void,
  ): { group: HTMLElement; valEl: HTMLElement } => {
    const group = document.createElement('div');
    group.className = 'slider-control';
    const row = document.createElement('div');
    row.className = 'slider-label-row';
    const lbl = document.createElement('label');
    lbl.htmlFor = `g-${labelText}-${uid}`;
    lbl.textContent = labelText;
    const valEl = document.createElement('strong');
    appendNodes(row, lbl, valEl);
    const inp = document.createElement('input');
    inp.id = `g-${labelText}-${uid}`;
    inp.type = 'range';
    inp.className = 'slider-input';
    inp.min = String(min);
    inp.max = String(max);
    inp.step = String(step);
    inp.value = String(init);
    inp.addEventListener('input', () => onChange(Number(inp.value)));
    appendNodes(group, row, inp);
    return { group, valEl };
  };

  const sA = makeSlider(mode === 'quadratic' ? 'Koefficient a' : 'Lutning k', -3, 3, 0.25, a, (v) => {
    a = v;
    update();
  });
  const sB = makeSlider(mode === 'quadratic' ? 'Koefficient b' : 'M-värde m', -4, 4, 0.5, b, (v) => {
    b = v;
    update();
  });
  appendNodes(controls, sA.group, sB.group);

  let sC: { group: HTMLElement; valEl: HTMLElement } | null = null;
  if (mode === 'quadratic') {
    sC = makeSlider('Konstant c', -4, 4, 0.5, c, (v) => {
      c = v;
      update();
    });
    controls.appendChild(sC.group);
  }

  const infoText = document.createElement('p');
  infoText.className = 'meta-xs';
  controls.appendChild(infoText);

  const svgWrap = document.createElement('div');
  svgWrap.className = 'sim-canvas-wrap';
  svgWrap.innerHTML = `
    <svg viewBox="0 0 360 240" role="img" aria-label="Koordinatsystem med funktionskurva">
      <line x1="20" y1="120" x2="340" y2="120" stroke="var(--gray-3)" stroke-width="1.5" />
      <line x1="180" y1="15" x2="180" y2="225" stroke="var(--gray-3)" stroke-width="1.5" />
      <path class="js-curve" d="" fill="none" stroke="var(--accent)" stroke-width="2" />
      <text x="330" y="114" font-size="11" fill="var(--gray-3)">x</text>
      <text x="186" y="24" font-size="11" fill="var(--gray-3)">y</text>
    </svg>
  `;

  const curveEl = svgWrap.querySelector<SVGPathElement>('.js-curve')!;

  appendNodes(grid, controls, svgWrap);
  appendNodes(panel, title, formulaBox, grid);

  const update = (): void => {
    sA.valEl.textContent = formatSvNumber(a, 2);
    sB.valEl.textContent = formatSvNumber(b, 2);
    if (sC) sC.valEl.textContent = formatSvNumber(c, 2);

    const pts: string[] = [];
    const scaleX = 28; // 1 unit = 28px
    const scaleY = 20; // 1 unit = 20px
    for (let i = 0; i <= 60; i++) {
      const x = -5 + (i / 60) * 10;
      const y = mode === 'quadratic' ? a * x * x + b * x + c : a * x + b;
      const px = 180 + x * scaleX;
      const py = 120 - y * scaleY;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    curveEl.setAttribute('d', pts.join(' '));

    if (mode === 'linear') {
      const signB = b >= 0 ? `+ ${formatSvNumber(b, 2)}` : `- ${formatSvNumber(Math.abs(b), 2)}`;
      formulaBox.innerHTML = renderLatex(`y = ${formatSvNumber(a, 2)}x ${signB}`, false);
      infoText.textContent = `Skär y-axeln i y = ${formatSvNumber(b, 2)}`;
    } else {
      const signB = b >= 0 ? `+ ${formatSvNumber(b, 2)}` : `- ${formatSvNumber(Math.abs(b), 2)}`;
      const signC = c >= 0 ? `+ ${formatSvNumber(c, 2)}` : `- ${formatSvNumber(Math.abs(c), 2)}`;
      formulaBox.innerHTML = renderLatex(`y = ${formatSvNumber(a, 2)}x^2 ${signB}x ${signC}`, false);
      infoText.textContent =
        a === 0
          ? 'När a = 0 blir grafen en rät linje.'
          : `Symmetrilinje x = ${formatSvNumber(-b / (2 * a), 2)}`;
    }
  };

  update();
  return panel;
}
