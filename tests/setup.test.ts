import { expect, test } from 'vitest';
test('test runner can execute an assertion', () => {
  expect('A'.toLowerCase()).toBe('a');
});
