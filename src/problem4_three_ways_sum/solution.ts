// Here is my solution for the problem of Three ways to sum to n:

function sum_to_n_a(n: number): number {
  // The first one is to loop from the number 1 to the n number.
  // This approach would cost time complexity O(n). It would increase linear by the
  // increase of n.
  // It could be accomplished by serveral ways: brute force or recursive. Both have the
  // same time complexity.
  let s = 0;
  for (let i = 1; i <= n; i++) s += i;
  return s;
}

function sum_to_n_b(n: number): number {
  // The second way is to use the mathematic formula to sum a natural number
  // This should only cost O(1). Best approach for this problem.
  return (n * (n + 1)) / 2;
}

function sum_to_n_c(n: number): number {
  // The third approach to solve this problem is to use the two pointers method.
  // This solution is still O(n) in time complexity but it's slightly faster the
  // first one with the actual is O(n/2).
  // We can also use the sliding window method to have the same performance as well.
  let sum = 0,
    left = 1,
    right = n;
  while (left <= right) {
    if (left === right) {
      sum += left;
    } else {
      sum += left + right;
    }
    left++;
    right--;
  }
  return sum;
}
