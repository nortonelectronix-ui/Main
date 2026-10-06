const symbols = ['🍎', '🍋', '🍇', '🍓', '🍒', '🥝', '🐱', '🐶', '🦊', '🐼', '🐸', '🦋'];
const board = document.getElementById('board');
const level = document.getElementById('level');
const status = document.getElementById('status');
let firstCard = null;
let locked = false;
let moves = 0;
let matches = 0;
let pairCount = 6;
let hideTimer = null;

function updateStatus() {
  status.textContent = matches === pairCount
    ? `Браво! Откри всички ${pairCount} двойки за ${moves} хода. 🎉`
    : `Ходове: ${moves} · Двойки: ${matches}/${pairCount}`;
}

function reveal(card) {
  card.textContent = card.dataset.symbol;
  card.classList.add('revealed');
  card.setAttribute('aria-label', `Карта ${card.dataset.position}: ${card.dataset.symbol}`);
  card.setAttribute('aria-pressed', 'true');
}

function hide(card) {
  card.textContent = '?';
  card.classList.remove('revealed');
  card.setAttribute('aria-label', `Карта ${card.dataset.position}: скрита`);
  card.setAttribute('aria-pressed', 'false');
}

function flipCard(card) {
  if (locked || card === firstCard || card.disabled) return;
  reveal(card);
  if (!firstCard) {
    firstCard = card;
    return;
  }
  moves += 1;
  const previous = firstCard;
  firstCard = null;
  if (previous.dataset.symbol === card.dataset.symbol) {
    for (const matched of [previous, card]) {
      matched.classList.add('matched');
      matched.disabled = true;
      matched.setAttribute('aria-label', `Карта ${matched.dataset.position}: ${matched.dataset.symbol}, намерена двойка`);
    }
    matches += 1;
  } else {
    locked = true;
    hideTimer = setTimeout(() => {
      hide(previous);
      hide(card);
      locked = false;
      hideTimer = null;
    }, 900);
  }
  updateStatus();
}

function startGame() {
  clearTimeout(hideTimer);
  hideTimer = null;
  firstCard = null;
  locked = false;
  moves = 0;
  matches = 0;
  pairCount = level.value === 'hard' ? 12 : 6;
  const selected = symbols.slice(0, pairCount);
  const deck = [...selected, ...selected];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  board.replaceChildren();
  board.classList.toggle('hard', level.value === 'hard');
  deck.forEach((symbol, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.dataset.position = String(index + 1);
    hide(card);
    card.addEventListener('click', () => flipCard(card));
    board.append(card);
  });
  updateStatus();
}

level.addEventListener('change', startGame);
document.getElementById('restart').addEventListener('click', startGame);
startGame();
