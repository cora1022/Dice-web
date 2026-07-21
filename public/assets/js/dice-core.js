export const DIE_SIDES = 6;
export const MIN_DICE = 1;
export const MAX_DICE = 12;
export const ROLL_ANIMATION_MS = 840;

export function secureRandomInt(maxExclusive, cryptoSource = globalThis.crypto) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new RangeError('최댓값은 양의 정수여야 합니다.');
  if (!cryptoSource?.getRandomValues) throw new Error('안전한 난수를 사용할 수 없습니다.');
  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  do { cryptoSource.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % maxExclusive;
}

export function validateDice(count) {
  if (!Number.isInteger(count) || count < MIN_DICE || count > MAX_DICE) {
    throw new RangeError(`주사위는 ${MIN_DICE}개에서 ${MAX_DICE}개까지 굴릴 수 있습니다.`);
  }
  return true;
}

export function getDiceLayout(count) {
  validateDice(count);
  return {
    desktopColumns: count <= 4 ? count : count <= 6 ? 3 : 4,
    mobileColumns: count === 1 ? 1 : count <= 4 ? 2 : 3,
  };
}

export function getRollDelay(index) {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_DICE) {
    throw new RangeError('The die index is out of range.');
  }
  return ((index % 4) * 18) + (Math.floor(index / 4) * 8);
}

export function getRollDuration(count) {
  validateDice(count);
  const delays = Array.from({ length: count }, (_, index) => getRollDelay(index));
  return ROLL_ANIMATION_MS + Math.max(...delays);
}

export function rollDice(count, randomInt = secureRandomInt) {
  validateDice(count);
  const values = Array.from({ length: count }, () => randomInt(DIE_SIDES) + 1);
  return {
    values,
    total: values.reduce((sum, value) => sum + value, 0),
  };
}

export function formatRoll(values) {
  if (!Array.isArray(values) || values.length === 0) throw new Error('복사할 주사위 결과가 없습니다.');
  return `${values.length}D6: ${values.join(', ')} (합계 ${values.reduce((sum, value) => sum + value, 0)})`;
}
