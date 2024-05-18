/**
 * Calculate the Levenshtein distance between two strings
 * Basically, the Levenshtein distance is the number of single-character edits (insertions, deletions, or substitutions) required to change one word into the other.
 *
 * @param str1
 * @param str2
 * @returns the Levenshtein distance between str1 and str2
 */
export function damerauLevenshteinDistance(str1: string, str2: string): number {
  let distanceMatrix: number[][] = new Array(str1.length + 1)
    .fill(0)
    .map(() => new Array(str2.length + 1).fill(0));

  for (let i = 0; i <= str1.length; i++) {
    distanceMatrix[i][0] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    distanceMatrix[0][j] = j;
  }

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        distanceMatrix[i][j] = distanceMatrix[i - 1][j - 1];
      } else {
        distanceMatrix[i][j] =
          1 +
          Math.min(
            distanceMatrix[i - 1][j], // Deletion
            distanceMatrix[i][j - 1], // Insertion
            distanceMatrix[i - 1][j - 1] // Substitution
          );
      }
    }
  }

  return distanceMatrix[str1.length][str2.length];
}
