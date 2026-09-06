import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapText, layoutReceipt, type Measure } from '../src/exportPng.ts';
import { createReceipt } from '../src/engine.ts';
// Deterministic stand-in for canvas measureText: CJK ≈ full size, ASCII ≈ 0.56 size.
const measure: Measure = (text, size) => Array.from(text).reduce((w, c) => w + (c.codePointAt(0)! > 0x2e7f ? size : size * 0.56), 0);
test('折行按宽度截断并保留显式换行', () => {
  assert.deepEqual(wrapText('今日生活超市', 4 * 15 + 1, 15, measure), ['今日生活', '超市']);
  assert.deepEqual(wrapText('第一行\n第二行', 9999, 15, measure), ['第一行', '第二行']);
  assert.deepEqual(wrapText('', 9999, 15, measure), ['']);
  assert.deepEqual(wrapText('abc', 9999, 15, measure), ['abc']);
});
test('普通小票高度覆盖全部内容，双倍清晰度导出', () => {
  const spec = layoutReceipt(createReceipt('喝了三杯咖啡；看到晚霞', 'gentle', () => 0.99), measure);
  assert.equal(spec.scale, 2);
  assert.ok(spec.contentBottom <= spec.height - 8, `content ${spec.contentBottom} within ${spec.height}`);
});
test('30 条超长商品名小票不裁切、不糊', () => {
  const receipt = createReceipt(Array.from({ length: 30 }, (_, i) => `第${i + 1}件小事`).join('；'), 'absurd', () => 0.99);
  receipt.items = receipt.items.map(i => ({ ...i, customName: '长'.repeat(200) }));
  const spec = layoutReceipt(receipt, measure);
  assert.ok(spec.contentBottom <= spec.height - 8, `content ${spec.contentBottom} within ${spec.height}`);
  assert.ok(spec.height * spec.scale <= 16000 + 1, `canvas ${spec.height * spec.scale} within cap`);
  assert.ok(spec.scale > 1, `scale ${spec.scale} keeps text crisp`);
});
