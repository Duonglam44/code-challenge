# Refactoring Report for `WalletPage` Component

This document outlines the key refactoring improvements made to the `WalletPage` React component, focusing on computational efficiency and clean code practices.

---

## ✅ 1. Moved `getPriority` function outside the component
- **Before**: Defined inside `WalletPage`, recreated on each render.
- **After**: Moved outside the component.
- **Why**: Avoids unnecessary re-creation and supports memoization.

---

## ✅ 2. Fixed incorrect filtering logic
- **Before**:
  ```ts
  if (lhsPriority > -99) {
    if (balance.amount <= 0) {
      return true;
    }
  }
  ```
- **After**:
  ```ts
  .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
  ```
- **Why**: Corrects logic and filters relevant balances properly.

---

## ✅ 3. Removed unused variable `formattedBalances`
- **Before**: Defined but never used.
- **After**: Deleted.
- **Why**: Eliminates dead code and reduces clutter.

---

## ✅ 4. Memoized `.map()` for rendering JSX
- **Before**: Rows computed in the render path.
- **After**: Wrapped in `useMemo`.
- **Why**: Avoids recomputation on every render.

---

## ✅ 5. Replaced `index` as React key
- **Before**:
  ```tsx
  key={index}
  ```
- **After**:
  ```tsx
  key={balance.currency}
  ```
- **Why**: Ensures proper DOM reconciliation.

---

## ✅ 6. Eliminated use of `any` type
- **Before**:
  ```ts
  getPriority(blockchain: any)
  ```
- **After**:
  ```ts
  type Blockchain = 'Osmosis' | 'Ethereum' | ...
  ```
- **Why**: Enhances type safety.

---

## ✅ 7. Simplified sorting logic
- **Before**:
  ```ts
  if (leftPriority > rightPriority) return -1;
  else if (rightPriority > leftPriority) return 1;
  ```
- **After**:
  ```ts
  .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
  ```
- **Why**: Cleaner and more idiomatic.

---

## ✅ 8. Used destructuring in function parameters
- **Before**:
  ```ts
  const WalletPage = (props: Props) => {
    const { children, ...rest } = props;
  ```
- **After**:
  ```ts
  const WalletPage = ({ children, ...rest }) => {
  ```
- **Why**: Concise and modern syntax.

---

## ✅ 9. Ensured proper `useMemo` dependencies
- **Before**: Included unrelated dependencies or unstable ones.
- **After**: Used minimal and relevant dependencies.
- **Why**: Avoids unnecessary re-executions of memoized functions.