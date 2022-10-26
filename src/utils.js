// @ts-ignore
import Table from 'cli-table'
import fs from 'fs'
// @ts-ignore
import { CID } from 'multiformats/cid'
// @ts-ignore
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * Turns a number (representing a byte size) into a readable format.
 *
 * @param {number} size - The size in bytes
 * @returns {string} A humanized version of the number.
 */
const kb = 1024
const mb = Math.pow(kb, 2)
const gb = Math.pow(kb, 3)

/**
 * Humanize a number of bytes into a readable string.
 * @param {number} size - The size in bytes.
 * @returns {string} The size in a human readable string.
 */
export function humanizeBytes(size) {
  if (size < kb / 2) {
    return size.toFixed(2) + 'B'
  } else if (size < mb / 2) {
    return (size / kb / 2).toPrecision(2) + 'KB'
  } else if (size < gb / 2) {
    return (size / mb).toFixed(2) + 'MB'
  }

  return (size / gb).toFixed(2) + 'GB'
}

/**
 * @param {string} pathName - The path to check if it's a directory
 * @returns {boolean}
 */
export const isDirectory = (pathName) =>
  fs.existsSync(pathName) && fs.lstatSync(pathName).isDirectory()

/**
 * @async
 * @param {Uint8Array} bytes - The bytes to get a CAR cid for.
 * @returns {Promise<CID>}
 */
export async function bytesToCarCID(bytes) {
  // this CID represents the byte content, but doesn't 'link' with the blocks inside
  const digest = await sha256.digest(bytes)
  return CID.createV1(0x202, digest)
}

/**
 * @param {Array<string>} head
 * @returns
 */
export function buildSimpleConsoleTable(head) {
  const table = new Table({
    truncate: false,
    head: head || [],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: ' ',
    },
    style: { 'padding-left': 0, 'padding-right': 2, head: ['blue'] },
  })

  table.push(new Array(head.length).fill('--------'))
  return table
}
