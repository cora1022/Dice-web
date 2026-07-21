import { MAX_DICE, MIN_DICE, formatRoll, rollDice, secureRandomInt } from './dice-core.js?v=20260721-1';

const sideButtons = [...document.querySelectorAll('[data-sides]')];
const countValue = document.querySelector('[data-count-value]');
const decreaseButton = document.querySelector('[data-decrease]');
const increaseButton = document.querySelector('[data-increase]');
const rollButton = document.querySelector('[data-roll]');
const resetButton = document.querySelector('[data-reset]');
const copyButton = document.querySelector('[data-copy]');
const diceGrid = document.querySelector('[data-dice-grid]');
const totalValue = document.querySelector('[data-total]');
const minimumValue = document.querySelector('[data-minimum]');
const maximumValue = document.querySelector('[data-maximum]');
const status = document.querySelector('[data-status]');
const historyList = document.querySelector('[data-history]');
const emptyHistory = document.querySelector('[data-history-empty]');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let count = 2;
let sides = 6;
let latest = null;
let rolling = false;
let history = [];

function renderControls() {
  countValue.textContent = String(count);
  countValue.setAttribute('aria-label', `주사위 ${count}개`);
  decreaseButton.disabled = rolling || count <= MIN_DICE;
  increaseButton.disabled = rolling || count >= MAX_DICE;
  sideButtons.forEach((button) => {
    const selected = Number(button.dataset.sides) === sides;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.disabled = rolling;
  });
  rollButton.disabled = rolling;
  resetButton.disabled = rolling;
}

function renderDice(values = Array.from({ length: count }, () => null), animate = false) {
  diceGrid.replaceChildren();
  diceGrid.classList.toggle('is-rolling', animate);
  values.forEach((value, index) => {
    const die = document.createElement('div');
    die.className = 'die-card';
    if (animate) die.style.setProperty('--delay', `${index * 32}ms`);
    const type = document.createElement('span');
    type.className = 'die-type';
    type.textContent = `D${sides}`;
    const number = document.createElement('strong');
    number.textContent = value ?? '—';
    die.append(type, number);
    diceGrid.appendChild(die);
  });
}

function renderSummary(result = null) {
  totalValue.textContent = result?.total ?? '—';
  minimumValue.textContent = result?.minimum ?? '—';
  maximumValue.textContent = result?.maximum ?? '—';
  copyButton.disabled = !result || rolling;
}

function renderHistory() {
  historyList.replaceChildren();
  emptyHistory.hidden = history.length > 0;
  history.forEach((entry, index) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const result = document.createElement('strong');
    label.textContent = `${entry.values.length}D${entry.sides}`;
    result.textContent = `${entry.values.join(' · ')}  |  합계 ${entry.total}`;
    item.append(label, result);
    item.setAttribute('aria-label', `${index + 1}번째 기록, ${formatRoll(entry.values, entry.sides)}`);
    historyList.appendChild(item);
  });
}

function setRolling(next) {
  rolling = next;
  renderControls();
  copyButton.disabled = next || !latest;
}

function finishRoll(result) {
  latest = { ...result, sides };
  history = [latest, ...history].slice(0, 10);
  renderDice(result.values, !reduceMotion);
  renderSummary(result);
  renderHistory();
  status.textContent = `${count}D${sides} 결과는 ${result.values.join(', ')}, 합계 ${result.total}입니다.`;
  setRolling(false);
}

function startRoll() {
  if (rolling) return;
  const result = rollDice(count, sides);
  setRolling(true);
  status.textContent = '주사위를 굴리는 중입니다.';
  if (reduceMotion) { finishRoll(result); return; }
  let frames = 0;
  const preview = setInterval(() => {
    renderDice(Array.from({ length: count }, () => secureRandomInt(sides) + 1), true);
    frames += 1;
    if (frames >= 6) {
      clearInterval(preview);
      finishRoll(result);
    }
  }, 82);
}

async function copyLatest() {
  if (!latest) return;
  const text = formatRoll(latest.values, latest.sides);
  try {
    await navigator.clipboard.writeText(text);
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
sideButtons.forEach((button) => button.addEventListener('click', () => {
  if (rolling) return;
  sides = Number(button.dataset.sides);
  latest = null;
  renderControls(); renderDice(); renderSummary();
}));
rollButton.addEventListener('click', startRoll);
copyButton.addEventListener('click', copyLatest);
resetButton.addEventListener('click', () => {
  if (rolling) return;
  count = 2; sides = 6; latest = null; history = [];
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

