insert into
    cards (deck_id, front, back)
values
    (
        (
            select
                id
            from
                decks
            where
                name = 'JavaScript Basics'
        ),
        'What does `const` mean in JavaScript?',
        '`const` creates a block-scoped constant variable.'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'JavaScript Basics'
        ),
        'What is the result of `typeof null`?',
        '`object` — it is a historical bug in JS.'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '**Algorithm Challenge**: Implement a function to reverse a string

```javascript
// Your implementation here
function reverseString(str) {
  // TODO: Complete this
}
```

*Hint: Think about multiple approaches - loops, recursion, or built-in methods*',
        '## Multiple Solutions

### 1. Built-in Method (Simplest)
```javascript
function reverseString(str) {
  return str.split("").reverse().join("");
}
```

### 2. For Loop Approach
```javascript
function reverseString(str) {
  let reversed = "";
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}
```

### 3. Recursive Approach
```javascript
function reverseString(str) {
  if (str === "") return "";
  return reverseString(str.substr(1)) + str.charAt(0);
}
```

**Time Complexity**: O(n) for all approaches  
**Space Complexity**: O(n) for string creation'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Promise Methods Comparison

| Method | Description | Behavior on Rejection |
|--------|-------------|---------------------|
| `Promise.all()` | ? | ? |
| `Promise.allSettled()` | ? | ? |
| `Promise.race()` | ? | ? |

Fill in the missing information.',
        '## Promise Methods Comparison

| Method | Description | Behavior on Rejection |
|--------|-------------|---------------------|
| `Promise.all()` | Waits for **all** promises to resolve | **Fails fast** - rejects immediately when any promise rejects |
| `Promise.allSettled()` | Waits for **all** promises to settle (resolve or reject) | **Never rejects** - always resolves with results array |
| `Promise.race()` | Resolves/rejects with the **first** settled promise | **Fails fast** - rejects if first settled promise rejects |

### Examples:

```javascript
// Promise.all() - fails fast
Promise.all([promise1, promise2, promise3])
  .then(results => console.log("All succeeded:", results))
  .catch(error => console.log("One failed:", error));

// Promise.allSettled() - never fails  
Promise.allSettled([promise1, promise2, promise3])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        console.log(`Promise ${index} succeeded:`, result.value);
      } else {
        console.log(`Promise ${index} failed:`, result.reason);
      }
    });
  });
```'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'World Capitals'
        ),
        'What is the capital of Canada?',
        'Ottawa'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'World Capitals'
        ),
        'What is the capital of Brazil?',
        'Brasília'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Geography Challenge 🌍

**Match the countries with their capitals:**

1. 🇦🇺 Australia  
2. 🇿🇦 South Africa  
3. 🇳🇿 New Zealand  
4. 🇳🇱 Netherlands  

> *Tip: Some of these might surprise you!*',
        '## Geography Challenge Answers 🌍

1. 🇦🇺 **Australia** → **Canberra**  
   *(Not Sydney or Melbourne!)*

2. 🇿🇦 **South Africa** → **Cape Town** (legislative), **Pretoria** (executive), **Bloemfontein** (judicial)  
   *(South Africa has 3 capitals!)*

3. 🇳🇿 **New Zealand** → **Wellington**  
   *(Not Auckland!)*

4. 🇳🇱 **Netherlands** → **Amsterdam**  
   *(The Hague is the seat of government)*

### Fun Facts:
- Australia chose Canberra as a compromise between Sydney and Melbourne
- South Africa is the only country with three capitals
- Many people think Auckland is New Zealand''s capital due to its size'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Calculus: Chain Rule

Find the derivative of: $f(x) = (3x^2 + 5x - 2)^4$

**Given:**
- Outer function: $u^4$ where $u = 3x^2 + 5x - 2$  
- Inner function: $u = 3x^2 + 5x - 2$

*Use the chain rule: $(f(g(x)))'' = f''(g(x)) \cdot g''(x)$*',
        '## Solution using Chain Rule

**Step 1:** Identify the functions
- $f(u) = u^4$ where $u = 3x^2 + 5x - 2$  
- $f''(u) = 4u^3$  
- $u''(x) = 6x + 5$

**Step 2:** Apply chain rule
$$\frac{d}{dx}[(3x^2 + 5x - 2)^4] = 4(3x^2 + 5x - 2)^3 \cdot (6x + 5)$$

**Final Answer:**
$$f''(x) = 4(3x^2 + 5x - 2)^3(6x + 5)$$

### Verification:
You can verify this by expanding $(3x^2 + 5x - 2)^4$ and differentiating directly, but the chain rule is much more efficient!

**Chain Rule Formula:**
$$\frac{d}{dx}[f(g(x))] = f''(g(x)) \cdot g''(x)$$'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Physics: Kinematics

A ball is thrown upward with initial velocity $v_0 = 20 \text{ m/s}$ from height $h_0 = 5 \text{ m}$.

**Given:** $g = 9.8 \text{ m/s}^2$ (downward)

Find:
1. Maximum height reached
2. Time to reach maximum height  
3. Time when ball hits the ground

**Use:** $h(t) = h_0 + v_0 t - \frac{1}{2}gt^2$',
        '## Physics Solution: Projectile Motion

**Given equation:** $h(t) = 5 + 20t - 4.9t^2$

### 1. Maximum Height
At maximum height, velocity = 0: $v(t) = \frac{dh}{dt} = 20 - 9.8t = 0$

$$t_{max} = \frac{20}{9.8} = 2.04 \text{ seconds}$$

$$h_{max} = 5 + 20(2.04) - 4.9(2.04)^2 = 5 + 40.8 - 20.4 = 25.4 \text{ m}$$

### 2. Time to Max Height
$$t_{max} = 2.04 \text{ seconds}$$

### 3. Time to Hit Ground
Set $h(t) = 0$:
$$0 = 5 + 20t - 4.9t^2$$
$$4.9t^2 - 20t - 5 = 0$$

Using quadratic formula: $t = \frac{20 \pm \sqrt{400 + 98}}{9.8} = \frac{20 \pm \sqrt{498}}{9.8}$

$$t = \frac{20 + 22.31}{9.8} = 4.32 \text{ seconds}$$

*(We take the positive root)*

### Summary:
- **Max height:** 25.4 m  
- **Time to max:** 2.04 s  
- **Time to ground:** 4.32 s'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Data Structures: Big O Analysis

Analyze the time complexity of this algorithm:

```python
def mystery_algorithm(arr, target):
    n = len(arr)
    
    # Step 1: Sort the array
    arr.sort()  # What''s the complexity here?
    
    # Step 2: Binary search
    left, right = 0, n - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

What is the **overall time complexity**?',
        '## Big O Analysis Solution

### Step-by-Step Analysis:

**Step 1: Sorting**
```python
arr.sort()  # O(n log n)
```
- Most efficient sorting algorithms (Timsort in Python) are O(n log n)

**Step 2: Binary Search**
```python
while left <= right:  # O(log n)
    # Each iteration cuts search space in half
```
- Binary search on sorted array is O(log n)

### Overall Complexity:

$$O(n \log n) + O(\log n) = O(n \log n)$$

**Why?** In Big O notation, we take the dominant term:
- $O(n \log n)$ grows much faster than $O(\log n)$
- So $O(n \log n)$ dominates

### Complexity Hierarchy:
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)
```

**Answer: O(n log n)** due to the sorting step.

> **Note:** If the array was already sorted, this would be O(log n)!'
    ),
    (
        (
            select
                id
            from
                decks
            where
                name = 'Rich Text'
        ),
        '## Chemistry: Balancing Equations ⚗️

Balance this chemical equation:

$${C_8H_{18} + O_2 -> CO_2 + H_2O}$$

**Steps to follow:**
1. Count atoms on each side
2. Use coefficients to balance  
3. Check your work

*This represents the combustion of octane (gasoline)*',
        '## Balanced Chemical Equation ⚗️

### Solution:
$${2C_8H_{18} + 25O_2 -> 16CO_2 + 18H_2O}$$

### Step-by-Step Process:

**1. Count atoms in unbalanced equation:**
- **Left side:** 8 C, 18 H, 2 O  
- **Right side:** 1 C, 2 H, 3 O

**2. Balance carbon first:**
- Need 8 CO₂ to balance 8 carbons: ${C_8H_{18} + O_2 -> 8CO_2 + H_2O}$

**3. Balance hydrogen:**
- Need 9 H₂O to balance 18 hydrogens: ${C_8H_{18} + O_2 -> 8CO_2 + 9H_2O}$

**4. Balance oxygen:**
- Right side has: $(8 \times 2) + (9 \times 1) = 25$ oxygen atoms
- Need $\frac{25}{2} = 12.5$ O₂ molecules

**5. Clear fraction by multiplying all by 2:**
$${2C_8H_{18} + 25O_2 -> 16CO_2 + 18H_2O}$$

### Verification:
| Element | Left Side | Right Side |
|---------|-----------|------------|
| C | $2 \times 8 = 16$ | $16 \times 1 = 16$ ✓ |
| H | $2 \times 18 = 36$ | $18 \times 2 = 36$ ✓ |
| O | $25 \times 2 = 50$ | $(16 \times 2) + (18 \times 1) = 50$ ✓ |'
    );

-- Add some example cards with partial_correct_count
UPDATE cards 
SET 
  partial_correct_count = FLOOR(RANDOM() * 5)::int,
  review_count = review_count + partial_correct_count
WHERE id IN (
  SELECT id FROM cards ORDER BY RANDOM() LIMIT 6
); 