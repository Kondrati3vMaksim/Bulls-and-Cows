import { countPossibleSecrets } from './logic/countPossibleSecrets.js';
import { createDigitValidator } from './logic/createDigitValidator.js';
import { generateSecret } from './logic/generateSecret.js';
import {
  configureGame,
  createInitialState,
  resetGame,
  startGame,
  submitGuess,
} from './logic/game.js';
import type { Base, GameState } from './logic/game.js';
import { parseScores, rankScores } from './logic/leaderboard.js';
import type { Score } from './logic/leaderboard.js';

const STORAGE_KEY = 'bulls-and-cows:scores:v1';
const BASES: readonly { value: Base; label: string; hint: string }[] = [
  { value: 2, label: 'BIN · 2', hint: '0–1' },
  { value: 8, label: 'OCT · 8', hint: '0–7' },
  { value: 10, label: 'DEC · 10', hint: '0–9' },
  { value: 16, label: 'HEX · 16', hint: '0–9, A–F' },
];

let game: GameState = createInitialState();
let scores: Score[] = loadScores();
let timer: number | undefined;

function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text) result.textContent = text;
  return result;
}

function add(parent: HTMLElement, ...children: HTMLElement[]): void {
  parent.append(...children);
}

function labelText(text: string, control: HTMLElement): HTMLLabelElement {
  const label = node('label', 'field');
  add(label, node('span', 'field-label', text), control);
  return label;
}

function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function baseName(base: Base): string {
  return BASES.find((entry) => entry.value === base)?.label ?? String(base);
}

function loadScores(): Score[] {
  try {
    return parseScores(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function saveScore(score: Score): void {
  scores = rankScores([...scores, score], 5);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Private browsing/storage restrictions should never prevent completing a round.
  }
}

function cardTitle(kicker: string, title: string, description?: string): HTMLElement {
  const wrapper = node('div', 'card-heading');
  add(wrapper, node('div', 'kicker', kicker), node('h2', '', title));
  if (description) add(wrapper, node('p', 'muted', description));
  return wrapper;
}

function stat(label: string, value: string): HTMLElement {
  const box = node('div', 'stat');
  add(box, node('span', 'stat-value', value), node('span', 'stat-label', label));
  return box;
}

function leaderboard(): HTMLElement {
  const card = node('section', 'panel leaderboard');
  add(card, cardTitle('LEADERBOARD', 'Лучшие результаты', 'Рекорды для выбранных настроек'));
  const items = scores
    .filter((entry) => entry.base === game.base && entry.length === game.length)
    .sort((a, b) => a.attempts - b.attempts || a.elapsedMs - b.elapsedMs)
    .slice(0, 5);

  if (items.length === 0) {
    add(card, node('p', 'empty-message', 'Здесь пока пусто. Первый рекорд может быть твоим.'));
    return card;
  }

  const list = node('ol', 'score-list');
  items.forEach((entry, index) => {
    const row = node('li', 'score-row');
    add(
      row,
      node('span', 'rank', String(index + 1).padStart(2, '0')),
      node('span', 'score-attempts', `${entry.attempts} попыт.`),
      node('span', 'score-time', formatDuration(entry.elapsedMs)),
    );
    add(list, row);
  });
  add(card, list);
  return card;
}

function instructionCard(): HTMLElement {
  const card = node('aside', 'panel rules-panel');
  add(card, cardTitle('HOW TO PLAY', 'Правила игры'));
  const rules = node('div', 'rules');
  const bull = node('p');
  add(bull, node('strong', 'bull-text', '● Бык'), documentText(' — верная цифра на верном месте.'));
  const cow = node('p');
  add(cow, node('strong', 'cow-text', '● Корова'), documentText(' — верная цифра на другом месте.'));
  add(rules, bull, cow, node('p', 'muted', 'Все цифры в секрете различны. Ноль в начале допустим.'));
  add(card, rules);
  return card;
}

function documentText(value: string): HTMLElement {
  return node('span', '', value);
}

function setupScreen(): HTMLElement {
  const grid = node('div', 'content-grid');
  const left = node('section', 'panel main-panel');
  add(
    left,
    cardTitle(
      'NEW ROUND',
      'Настрой раунд',
      'Выбери систему счисления и длину секрета. После старта настройки будут заблокированы.',
    ),
  );
  const form = node('form', 'settings-form');

  const baseSelect = node('select', 'select');
  baseSelect.setAttribute('aria-label', 'Система счисления');
  BASES.forEach(({ value, label }) => {
    const option = node('option', '', label);
    option.value = String(value);
    option.selected = game.base === value;
    add(baseSelect, option);
  });

  const lengthSelect = node('select', 'select');
  lengthSelect.setAttribute('aria-label', 'Длина секрета');
  for (let length = 2; length <= 6; length += 1) {
    const option = node('option', '', `${length} символа`);
    option.value = String(length);
    option.disabled = length > game.base;
    option.selected = game.length === length;
    add(lengthSelect, option);
  }

  const fields = node('div', 'settings-fields');
  add(fields, labelText('Система счисления', baseSelect), labelText('Длина секрета', lengthSelect));
  const info = node('div', 'combination-banner');
  add(info, node('span', 'muted', 'Возможных секретов'), node('strong', '', countPossibleSecrets(game.length, game.base).toLocaleString('ru-RU')));

  baseSelect.addEventListener('change', () => {
    game = configureGame(game, Number(baseSelect.value) as Base, game.length);
    render();
  });
  lengthSelect.addEventListener('change', () => {
    game = configureGame(game, game.base, Number(lengthSelect.value));
    render();
  });

  const button = node('button', 'button primary', 'Начать игру');
  button.type = 'submit';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    game = startGame(game, generateSecret(game.length, game.base), Date.now());
    render();
  });
  add(form, fields, info, button);
  add(left, form);

  const right = node('div', 'right-column');
  add(right, instructionCard(), leaderboard());
  add(grid, left, right);
  return grid;
}

function attemptHistory(): HTMLElement {
  const card = node('section', 'panel history-panel');
  add(card, cardTitle('YOUR MOVES', 'История попыток'));
  if (game.history.length === 0) {
    add(card, node('p', 'empty-message', 'Первая попытка появится здесь.'));
    return card;
  }

  const list = node('ol', 'history-list');
  game.history.forEach((attempt, index) => {
    const item = node('li', 'history-row');
    const number = node('span', 'history-number', String(index + 1).padStart(2, '0'));
    const value = node('code', 'history-guess', attempt.guess);
    const result = node('div', 'history-results');
    add(result, node('span', 'result-bulls', `${attempt.bulls} Б`), node('span', 'result-cows', `${attempt.cows} К`));
    add(item, number, value, result);
    add(list, item);
  });
  add(card, list);
  return card;
}

function gameScreen(): HTMLElement {
  const wrapper = node('div', 'content-grid');
  const main = node('section', 'panel main-panel');
  const won = game.phase === 'won';
  add(
    main,
    cardTitle(
      won ? 'VICTORY' : 'ROUND IN PROGRESS',
      won ? 'Секрет раскрыт!' : 'Угадай комбинацию',
      won ? `Правильный ответ: ${game.secret ?? ''}` : 'Введи уникальные символы и получи подсказку.',
    ),
  );

  const details = node('div', 'stats-row');
  const elapsed = won && game.finishedAt !== null && game.startedAt !== null
    ? game.finishedAt - game.startedAt
    : game.startedAt === null ? 0 : Date.now() - game.startedAt;
  const timeBox = stat('Время', formatDuration(elapsed));
  const timeValue = timeBox.querySelector('.stat-value');
  add(details, stat('Система', baseName(game.base)), stat('Длина', String(game.length)), stat('Попытки', String(game.history.length)), timeBox);
  add(main, details);

  const newGame = node('button', 'button secondary', 'Новая игра');
  newGame.type = 'button';
  newGame.addEventListener('click', () => {
    game = resetGame(game);
    render();
  });

  if (won) {
    const victory = node('div', 'victory');
    add(
      victory,
      node('div', 'victory-symbol', '★'),
      node('p', 'victory-title', 'Комбинация найдена'),
      node('p', 'muted', `${game.history.length} попыток · ${formatDuration(elapsed)}`),
      newGame,
    );
    add(main, victory);
  } else {
    const form = node('form', 'guess-form');
    const input = node('input', 'guess-input');
    input.type = 'text';
    input.required = true;
    input.maxLength = game.length;
    input.placeholder = '0'.repeat(game.length);
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'characters');
    input.setAttribute('aria-label', `Попытка: ${game.length} различных цифры`);
    const hint = BASES.find((entry) => entry.value === game.base)?.hint ?? '';
    const help = node('p', 'form-help', `Доступные символы: ${hint}. Без повторений.`);
    const error = node('p', 'form-error');
    error.setAttribute('role', 'status');
    error.setAttribute('aria-live', 'polite');
    const validator = createDigitValidator(game.base);
    input.addEventListener('input', () => {
      const clean = Array.from(input.value)
        .filter(validator)
        .slice(0, game.length)
        .join('')
        .toUpperCase();
      if (input.value !== clean) input.value = clean;
      error.textContent = '';
    });

    const submit = node('button', 'button primary', 'Проверить');
    submit.type = 'submit';
    const row = node('div', 'guess-entry');
    add(row, input, submit);
    add(form, labelText('Твоя комбинация', row), help, error);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const outcome = submitGuess(game, input.value, Date.now());
      if (outcome.error) {
        error.textContent = outcome.error;
        input.focus();
        return;
      }
      game = outcome.state;
      if (outcome.newlyWon && game.startedAt !== null && game.finishedAt !== null) {
        saveScore({
          base: game.base,
          length: game.length,
          attempts: game.history.length,
          elapsedMs: game.finishedAt - game.startedAt,
          achievedAt: Date.now(),
        });
      }
      render();
    });
    add(main, form, newGame);
    if (timeValue) {
      timer = window.setInterval(() => {
        if (game.phase === 'playing' && game.startedAt !== null) {
          timeValue.textContent = formatDuration(Date.now() - game.startedAt);
        }
      }, 250);
    }
    window.requestAnimationFrame(() => input.focus());
  }

  const right = node('div', 'right-column');
  add(right, attemptHistory(), leaderboard());
  add(wrapper, main, right);
  return wrapper;
}

function render(): void {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
  const root = document.getElementById('app') ?? node('div', 'app');
  root.id = 'app';
  const shell = node('div', 'shell');
  const header = node('header', 'site-header');
  const brand = node('div', 'brand');
  add(brand, node('div', 'brand-mark', 'B·C'), node('div', 'brand-name', 'BULLS & COWS'));
  add(header, brand, node('span', 'header-note', 'THE LOGIC GAME'));
  const hero = node('section', 'hero');
  add(hero, node('span', 'hero-kicker', 'DECODE THE SECRET'), node('h1', '', 'Каждая цифра имеет значение.'), node('p', 'hero-subtitle', 'Логика, внимание и немного стратегии. Разгадай секрет за минимум попыток.'));
  const content = game.phase === 'setup' ? setupScreen() : gameScreen();
  const footer = node('footer', 'site-footer', 'Bulls & Cows · TypeScript · Functional programming');
  add(shell, header, hero, content, footer);
  root.replaceChildren(shell);
  if (!root.isConnected) document.body.prepend(root);
}

render();
