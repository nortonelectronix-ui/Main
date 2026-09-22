const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const functionInput = document.getElementById('function-input');
const lowerBoundInput = document.getElementById('lower-bound');
const upperBoundInput = document.getElementById('upper-bound');
const derivativePointInput = document.getElementById('derivative-point');
const calculusResult = document.getElementById('calculus-result');
const calculusError = document.getElementById('calculus-error');

let currentValue = '0';
let previousValue = null;
let operator = null;
let waitingForNewValue = false;

function updateDisplay() {
  display.textContent = currentValue;
}

function applyCalculation(firstValue, currentOperator, secondValue) {
  switch (currentOperator) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '*':
      return firstValue * secondValue;
    case '/':
      return secondValue === 0 ? 'Error' : firstValue / secondValue;
    default:
      return secondValue;
  }
}

function inputDigit(digit) {
  if (waitingForNewValue) {
    currentValue = digit;
    waitingForNewValue = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }

  updateDisplay();
}

function inputDecimal() {
  if (waitingForNewValue) {
    currentValue = '0.';
    waitingForNewValue = false;
    updateDisplay();
    return;
  }

  if (!currentValue.includes('.')) {
    currentValue += '.';
    updateDisplay();
  }
}

function clearDisplay() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  waitingForNewValue = false;
  updateDisplay();
}

function deleteLast() {
  if (waitingForNewValue) {
    return;
  }

  currentValue = currentValue.length <= 1 ? '0' : currentValue.slice(0, -1);
  updateDisplay();
}

function percent() {
  currentValue = String(Number(currentValue) / 100);
  updateDisplay();
}

function performCalculation() {
  if (previousValue === null || operator === null) {
    return;
  }

  const calculation = applyCalculation(previousValue, operator, Number(currentValue));
  currentValue = String(calculation);
  previousValue = null;
  operator = null;
  waitingForNewValue = true;
  updateDisplay();
}

function handleOperator(nextOperator) {
  const inputValue = Number(currentValue);

  if (previousValue === null) {
    previousValue = inputValue;
  } else if (operator) {
    previousValue = applyCalculation(previousValue, operator, inputValue);
    currentValue = String(previousValue);
    updateDisplay();
  }

  operator = nextOperator;
  waitingForNewValue = true;
}

const FUNCTIONS = {
  abs: Math.abs,
  cos: Math.cos,
  exp: Math.exp,
  log: Math.log10,
  ln: Math.log,
  sin: Math.sin,
  sqrt: Math.sqrt,
  tan: Math.tan
};

function tokenize(expression) {
  const tokens = [];
  let position = 0;

  while (position < expression.length) {
    const character = expression[position];
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }

    const numberMatch = expression.slice(position).match(
      /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/
    );
    if (numberMatch) {
      tokens.push({ type: 'number', value: Number(numberMatch[0]) });
      position += numberMatch[0].length;
      continue;
    }

    const identifierMatch = expression.slice(position).match(/^[a-zA-Z]+/);
    if (identifierMatch) {
      tokens.push({ type: 'identifier', value: identifierMatch[0].toLowerCase() });
      position += identifierMatch[0].length;
      continue;
    }

    if ('+-*/^(),'.includes(character)) {
      tokens.push({ type: character, value: character });
      position += 1;
      continue;
    }

    throw new Error(`Unsupported character "${character}".`);
  }

  return tokens;
}

function createFunction(expression) {
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new Error('Enter a function.');
  }

  let position = 0;
  const peek = () => tokens[position];
  const consume = (type) => {
    if (!peek() || peek().type !== type) {
      throw new Error(`Expected "${type}".`);
    }
    return tokens[position++];
  };

  function parseExpression() {
    let value = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')) {
      const operation = consume(peek().type).type;
      const right = parseTerm();
      const left = value;
      value = (x) => operation === '+' ? left(x) + right(x) : left(x) - right(x);
    }
    return value;
  }

  function parseTerm() {
    let value = parsePower();
    while (peek() && (peek().type === '*' || peek().type === '/')) {
      const operation = consume(peek().type).type;
      const right = parsePower();
      const left = value;
      value = (x) => {
        const rightValue = right(x);
        if (operation === '/' && rightValue === 0) {
          throw new Error('Division by zero.');
        }
        return operation === '*' ? left(x) * rightValue : left(x) / rightValue;
      };
    }
    return value;
  }

  function parsePower() {
    const value = parseUnary();
    if (peek() && peek().type === '^') {
      consume('^');
      const exponent = parsePower();
      return (x) => value(x) ** exponent(x);
    }
    return value;
  }

  function parseUnary() {
    if (peek() && (peek().type === '+' || peek().type === '-')) {
      const operation = consume(peek().type).type;
      const value = parseUnary();
      return operation === '-' ? (x) => -value(x) : value;
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const token = peek();
    if (!token) {
      throw new Error('Incomplete function.');
    }
    if (token.type === 'number') {
      consume('number');
      return () => token.value;
    }
    if (token.type === 'identifier') {
      consume('identifier');
      if (token.value === 'x') {
        return (x) => x;
      }
      if (token.value === 'pi' || token.value === 'e') {
        return () => token.value === 'pi' ? Math.PI : Math.E;
      }
      if (!FUNCTIONS[token.value]) {
        throw new Error(`Unsupported function or name "${token.value}".`);
      }
      consume('(');
      const argument = parseExpression();
      consume(')');
      return (x) => FUNCTIONS[token.value](argument(x));
    }
    if (token.type === '(') {
      consume('(');
      const value = parseExpression();
      consume(')');
      return value;
    }
    throw new Error('Expected a number, x, function, or parentheses.');
  }

  const parsed = parseExpression();
  if (peek()) {
    throw new Error('Unexpected input after the function.');
  }
  return (x) => {
    const value = parsed(x);
    if (!Number.isFinite(value)) {
      throw new Error('The function is not finite at the requested point.');
    }
    return value;
  };
}

function readNumber(input, label) {
  const value = Number(input.value);
  if (input.value.trim() === '' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
}

function showCalculusError(error) {
  calculusResult.textContent = '';
  calculusError.textContent = error.message;
}

function calculateIntegral() {
  try {
    const functionAt = createFunction(functionInput.value);
    const a = readNumber(lowerBoundInput, 'The lower bound');
    const b = readNumber(upperBoundInput, 'The upper bound');
    const intervals = 1000;
    const step = (b - a) / intervals;
    let sum = functionAt(a) + functionAt(b);

    for (let index = 1; index < intervals; index += 1) {
      sum += (index % 2 === 0 ? 2 : 4) * functionAt(a + index * step);
    }
    const result = (step / 3) * sum;
    if (!Number.isFinite(result)) {
      throw new Error('The integral result is not finite.');
    }
    calculusError.textContent = '';
    calculusResult.textContent = `Integral ≈ ${result}`;
  } catch (error) {
    showCalculusError(error);
  }
}

function calculateDerivative() {
  try {
    const functionAt = createFunction(functionInput.value);
    const x = readNumber(derivativePointInput, 'The derivative point');
    const step = 1e-5 * Math.max(1, Math.abs(x));
    const result = (functionAt(x + step) - functionAt(x - step)) / (2 * step);
    if (!Number.isFinite(result)) {
      throw new Error('The derivative result is not finite.');
    }
    calculusError.textContent = '';
    calculusResult.textContent = `Derivative ≈ ${result}`;
  } catch (error) {
    showCalculusError(error);
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === 'number') {
      inputDigit(value);
      return;
    }

    if (action === 'decimal') {
      inputDecimal();
      return;
    }

    if (action === 'clear') {
      clearDisplay();
      return;
    }

    if (action === 'delete') {
      deleteLast();
      return;
    }

    if (action === 'percent') {
      percent();
      return;
    }

    if (action === 'operator') {
      handleOperator(value);
      return;
    }

    if (action === 'equals') {
      performCalculation();
    }
  });
});

document.getElementById('integral-button').addEventListener('click', calculateIntegral);
document.getElementById('derivative-button').addEventListener('click', calculateDerivative);

updateDisplay();
