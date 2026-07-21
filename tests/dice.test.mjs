import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DIE_SIDES, formatRoll, rollDice, secureRandomInt, validateDice } from '../public/assets/js/dice-core.js';

function sequenceRandom(values) {
  let index = 0;
  return (max) => values[index++ % values.length] % max;
}

test('D6 결과와 합계를 만든다', () => {
  const result = rollDice(4, sequenceRandom([0, 5, 2, 3]));
  assert.deepEqual(result, { values: [1, 6, 3, 4], total: 14 });
  assert.equal(DIE_SIDES, 6);
});

test('주사위 개수의 경계를 검증한다', () => {
  assert.equal(validateDice(1), true);
  assert.equal(validateDice(12), true);
  assert.throws(() => validateDice(0), /주사위는/);
  assert.throws(() => validateDice(13), /주사위는/);
});

test('모든 굴림은 1부터 6 사이의 값만 만든다', () => {
  for (let seed = 0; seed < 18; seed += 1) {
    const result = rollDice(3, sequenceRandom([seed, seed + 1, seed + 2]));
    assert.ok(result.values.every((value) => value >= 1 && value <= 6));
  }
});

test('안전한 난수는 지정 범위 안의 정수를 반환한다', () => {
  const fakeCrypto = { getRandomValues(array) { array[0] = 23; return array; } };
  assert.equal(secureRandomInt(6, fakeCrypto), 5);
});

test('복사할 결과 문구를 D6 형식으로 만든다', () => {
  assert.equal(formatRoll([2, 5, 6]), '3D6: 2, 5, 6 (합계 13)');
});

test('화면 모듈은 핵심 모듈을 버전이 붙은 주소로 불러온다', async () => {
  const source = await readFile(new URL('../public/assets/js/app.js', import.meta.url), 'utf8');
  assert.match(source, /from '\.\/dice-core\.js\?v=[\d-]+'/);
});

test('화면은 정육면체의 여섯 면을 모두 생성한다', async () => {
  const source = await readFile(new URL('../public/assets/js/app.js', import.meta.url), 'utf8');
  assert.match(source, /front: 1, back: 6, right: 3, left: 4, top: 2, bottom: 5/);
  assert.match(source, /RESULT_ORIENTATIONS/);
  assert.match(source, /cubeView\.className = 'die-cube-view'/);
});

test('카메라 각도와 결과 면을 분리하고 초기 큐브를 평면화하지 않는다', async () => {
  const styles = await readFile(new URL('../public/assets/css/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.die-cube-view\{[^}]*transform:rotateX\(-14deg\) rotateY\(22deg\)/);
  assert.match(styles, /\.dice-grid\{perspective:none\}/);
  assert.match(styles, /\.die-card\.is-pending \.die-cube\{opacity:1;filter:none\}/);
  assert.match(styles, /\.dice-grid\.is-rolling \.die-cube-view\{animation:cube-roll-to-result/);
});
