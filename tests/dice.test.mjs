import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatRoll, rollDice, secureRandomInt, validateDice } from '../public/assets/js/dice-core.js';

function sequenceRandom(values) {
  let index = 0;
  return (max) => values[index++ % values.length] % max;
}

test('지정한 개수와 면의 범위 안에서 결과를 만든다', () => {
  const result = rollDice(4, 6, sequenceRandom([0, 5, 2, 3]));
  assert.deepEqual(result, { values: [1, 6, 3, 4], total: 14 });
});

test('D4부터 D100까지 지원한다', () => {
  for (const sides of [4, 6, 8, 10, 12, 20, 100]) assert.equal(validateDice(1, sides), true);
});

test('주사위 개수와 종류의 경계를 검증한다', () => {
  assert.throws(() => validateDice(0, 6), /주사위는/);
  assert.throws(() => validateDice(13, 6), /주사위는/);
  assert.throws(() => validateDice(2, 7), /지원하지 않는/);
});

test('안전한 난수는 지정 범위 안의 정수를 반환한다', () => {
  const fakeCrypto = { getRandomValues(array) { array[0] = 23; return array; } };
  assert.equal(secureRandomInt(6, fakeCrypto), 5);
});

test('복사할 결과 문구를 일관되게 만든다', () => {
  assert.equal(formatRoll([2, 5, 6], 6), '3D6: 2, 5, 6 (합계 13)');
});

test('화면 모듈은 핵심 모듈을 버전이 붙은 주소로 불러온다', async () => {
  const source = await readFile(new URL('../public/assets/js/app.js', import.meta.url), 'utf8');
  assert.match(source, /from '\.\/dice-core\.js\?v=[\d-]+'/);
});
