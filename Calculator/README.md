# Main

This project contains a simple JavaScript calculator with button controls.

It also provides numerical calculus operations. The parser is deliberately
restricted and does not use `eval` or execute arbitrary JavaScript.

## Numerical calculus

Enter a function in terms of `x`, then provide the relevant values:

- **Integral:** bounds `a` and `b`; the result uses composite Simpson's rule
  with 1,000 subintervals.
- **Derivative:** point `x`; the result uses a central finite difference.

Supported syntax:

- Operators: `+`, `-`, `*`, `/`, `^`, unary `+` and `-`
- Parentheses, decimal/scientific numbers, and the variable `x`
- Constants: `pi`, `e`
- Functions (with parentheses): `sin`, `cos`, `tan`, `sqrt`, `abs`, `exp`,
  `ln`, and `log` (base 10)

Implicit multiplication (such as `2x`) is not supported; write `2*x`.
Function arguments must be enclosed in parentheses. Inputs and calculated
values must remain finite, and division by zero is rejected.

## Run it

Open `index.html` in a browser, or start a local static server from this folder:

```bash
cd Calculator
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.
