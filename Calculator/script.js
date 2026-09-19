const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

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

updateDisplay();
