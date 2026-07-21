export const SUPPORTED_SIDES = Object.freeze([4, 6, 8, 10, 12, 20, 100]);
export const MIN_DICE = 1;
export const MAX_DICE = 12;

export function secureRandomInt(maxExclusive, cryptoSource = globalThis.crypto) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new RangeError('최댓값은 양의 정수여야 합니다.');
  if (!cryptoSource?.getRandomValues) throw new Error('안전한 난수를 사용할 수 없습니다.');
  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  do { cryptoSource.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % maxExclusive;
}

export function validateDice(count, sides) {
  if (!Number.isInteger(count) || count < MIN_DICE || count > MAX_DICE) {
    throw new RangeError(`주사위는 ${MIN_DICE}개에서 ${MAX_DICE}개까지 굴릴 수 있습니다.`);
  }
  if (!SUPPORTED_SIDES.includes(sides)) throw new RangeError('지원하지 않는 주사위 종류입니다.');
  return true;
}

export function rollDice(count, sides, randomInt = secureRandomInt) {
  validateDice(count, sides);
  const values = Array.from({ length: count }, () => randomInt(sides) + 1);
  return {
    values,
    total: values.reduce((sum, value) => sum + value, 0),
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
}

export function formatRoll(values, sides) {
  if (!Array.isArray(values) || values.length === 0) throw new Error('복사할 주사위 결과가 없습니다.');
  return `${values.length}D${sides}: ${values.join(', ')} (합계 ${values.reduce((sum, value) => sum + value, 0)})`;
}

