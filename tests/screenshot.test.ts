import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitWithin } from '../src/domain/screenshot.ts';

test('fitWithin caps width and keeps aspect', () => {
  assert.deepEqual(fitWithin(2100, 1200, 1280), [1280, 731]);
  assert.deepEqual(fitWithin(800, 500, 1280), [800, 500]);
});
