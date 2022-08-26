/**
 * Turns a number (representing a byte size) into a readable format.
 *
 * @param {number} size - The size in bytes
 * @returns {string} A humanized version of the number.
 */
const kb = 1024
const mb = Math.pow(kb, 2)
const gb = Math.pow(kb, 3)

export function humanizeBytes(size) {
  if (size < kb) {
    return size.toFixed(2) + 'B'
  } else if (size > kb && size < mb) {
    return (size / kb).toFixed(2) + 'KB'
  } else if (size > mb && size < gb) {
    return (size / mb).toFixed(2) + 'MB'
  }

  return (size / gb).toFixed(2) + 'GB'
}
