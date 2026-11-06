import { expect, test } from 'vitest';
import { evaluateGuess } from '../src/logic/evaluateGuess';
test('Полное совпадение', () => {
  expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
});
test('Нет совпадений', () => {
  expect(evaluateGuess('01234', '56789')).toEqual({ bulls: 0, cows: 0 });
});
test('Только быки', () => {
  expect(evaluateGuess('1234', '1256')).toEqual({ bulls: 2, cows: 0 });
});
test('Только коровы', () => {
  expect(evaluateGuess('1234', '3421')).toEqual({ bulls: 0, cows: 4 });
});
test('Быки и коровы одновременно', () => {
  expect(evaluateGuess('1543', '1453')).toEqual({ bulls: 2, cows: 2 });
});
test('Шестнадцатеричные цифры', () => {
  expect(evaluateGuess('543AF', '536ab')).toEqual({ bulls: 2, cows: 1 });
});
