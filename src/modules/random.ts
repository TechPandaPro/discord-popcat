// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

/**
 * Generates a random integer within the given range.
 *
 * @param min - The minimum number, inclusive.
 * @param max - The maximum number, exclusive.
 * @returns A random integer within the given range
 */
export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

/**
 * Generates a random integer within the given range, inclusive.
 *
 * @param min - The minimum number, inclusive
 * @param max - The maximum number, inclusive
 * @returns A random integer within the given range
 */
export function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
