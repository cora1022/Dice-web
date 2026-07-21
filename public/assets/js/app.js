import { MAX_DICE, MIN_DICE, formatRoll, rollDice } from './dice-core.js?v=20260721-3';

const countValue = document.querySelector('[data-count-value]');
const decreaseButton = document.querySelector('[data-decrease]');
const increaseButton = document.querySelector('[data-increase]');
const rollButton = document.querySelector('[data-roll]');
const resetButton = document.querySelector('[data-reset]');
const copyButton = document.querySelector('[data-copy]');
const diceGrid = document.querySelector('[data-dice-grid]');
const totalValue = document.querySelector('[data-total]');
const status = document.querySelector('[data-status]');
const historyList = document.querySelector('[data-history]');
const emptyHistory = document.querySelector('[data-history-empty]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const FACE_VALUES = Object.freeze({ front: 1, back: 6, right: 3, left: 4, top: 2, bottom: 5 });
const PIP_POSITIONS = Object.freeze({
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
});
const RESULT_ORIENTATIONS = Object.freeze({
  1: [0, 0],
  2: [-90, 0],
  3: [0, -90],
  4: [0, 90],
  5: [90, 0],
  6: [0, 180],
});

let count = 2;
let latest = null;
let rolling = false;
let history = [];

function renderControls() {
  countValue.textContent = String(count);
  countValue.setAttribute('aria-label', `주사위 ${count}개`);
  decreaseButton.disabled = rolling || count <= MIN_DICE;
  increaseButton.disabled = rolling || count >= MAX_DICE;
  rollButton.disabled = rolling;
  resetButton.disabled = rolling;
}

function createFace(name, value) {
  const face = document.createElement('span');
  face.className = `die-face die-face-${name}`;
  face.setAttribute('aria-hidden', 'true');
  for (let position = 1; position <= 9; position += 1) {
    const pip = document.createElement('i');
    pip.className = PIP_POSITIONS[value].includes(position) ? 'pip is-on' : 'pip';
    face.appendChild(pip);
  }
  return face;
}

function renderDice(values = Array.from({ length: count }, () => null), animate = false) {
  diceGrid.replaceChildren();
  diceGrid.classList.toggle('is-rolling', animate);

  values.forEach((value, index) => {
    const die = document.createElement('div');
    const result = value ?? 1;
    const [landX, landY] = value ? RESULT_ORIENTATIONS[result] : [0, 0];
    const direction = index % 2 === 0 ? -1 : 1;

    die.className = value ? 'die-card' : 'die-card is-pending';
    die.setAttribute('role', 'img');
    die.setAttribute('aria-label', value ? `D6 주사위 결과 ${value}` : '굴리기 전 D6 주사위');
    die.style.setProperty('--delay', `${index * 45}ms`);
    die.style.setProperty('--land-x', `${landX}deg`);
    die.style.setProperty('--land-y', `${landY}deg`);
    die.style.setProperty('--view-start-y', `${direction * 420}deg`);
    die.style.setProperty('--view-mid-y', `${direction * 210}deg`);
    die.style.setProperty('--view-late-y', `${direction * 36}deg`);
    die.style.setProperty('--view-bounce-y', `${direction * -4}deg`);
    die.style.setProperty('--travel-start', `${direction * 78}px`);
    die.style.setProperty('--travel-mid', `${direction * 26}px`);
    die.style.setProperty('--travel-bounce', `${direction * -5}px`);

    const shadow = document.createElement('span');
    shadow.className = 'die-shadow';
    shadow.setAttribute('aria-hidden', 'true');

    const cube = document.createElement('span');
    cube.className = 'die-cube';
    Object.entries(FACE_VALUES).forEach(([name, faceValue]) => cube.appendChild(createFace(name, faceValue)));
    const cubeView = document.createElement('span');
    cubeView.className = 'die-cube-view';
    cubeView.appendChild(cube);
    die.append(shadow, cubeView);
    diceGrid.appendChild(die);
  });
}

function renderSummary(result = null) {
  totalValue.textContent = result?.total ?? '—';
  copyButton.disabled = !result || rolling;
}

function renderHistory() {
  historyList.replaceChildren();
  emptyHistory.hidden = history.length > 0;
  history.forEach((entry, index) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const result = document.createElement('strong');
    label.textContent = `${entry.values.length}D6`;
    result.textContent = `${entry.values.join(' · ')}  |  합계 ${entry.total}`;
    item.append(label, result);
    item.setAttribute('aria-label', `${index + 1}번째 기록, ${formatRoll(entry.values)}`);
    historyList.appendChild(item);
  });
}

function setRolling(next) {
  rolling = next;
  rollButton.classList.toggle('is-rolling', next);
  diceGrid.setAttribute('aria-busy', String(next));
  renderControls();
  copyButton.disabled = next || !latest;
}

function finishRoll(result) {
  latest = result;
  history = [latest, ...history].slice(0, 10);
  renderSummary(result);
  renderHistory();
  status.textContent = `${count}D6 결과는 ${result.values.join(', ')}, 합계 ${result.total}입니다.`;
  setRolling(false);
}

function startRoll() {
  if (rolling) return;
  const result = rollDice(count);
  setRolling(true);
  status.textContent = '정육면체 주사위를 굴리는 중입니다.';
  renderDice(result.values, !reduceMotion);
  const duration = reduceMotion ? 0 : 920 + ((count - 1) * 45);
  window.setTimeout(() => finishRoll(result), duration);
}

async function copyLatest() {
  if (!latest) return;
  try {
    await navigator.clipboard.writeText(formatRoll(latest.values));
    status.textContent = '주사위 결과를 복사했습니다.';
  } catch {
    status.textContent = '복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.';
  }
}

decreaseButton.addEventListener('click', () => {
  if (rolling || count <= MIN_DICE) return;
  count -= 1;
  latest = null;
  renderControls(); renderDice(); renderSummary();
});
increaseButton.addEventListener('click', () => {
  if (rolling || count >= MAX_DICE) return;
  count += 1;
  latest = null;
  renderControls(); renderDice(); renderSummary();
});
rollButton.addEventListener('click', startRoll);
copyButton.addEventListener('click', copyLatest);
resetButton.addEventListener('click', () => {
  if (rolling) return;
  count = 2; latest = null; history = [];
  renderControls(); renderDice(); renderSummary(); renderHistory();
  status.textContent = '설정을 초기화했습니다.';
});
document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.repeat || ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
  event.preventDefault(); startRoll();
});

renderControls();
renderDice();
renderSummary();
renderHistory();
