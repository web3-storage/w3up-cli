import { parseLink } from '@ucanto/server'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

/**
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isEmail = (email) => /(.+)@(.+){2,}\.(.+){2,}/.test(email)

/**
 *
 * @param {string} cid
 * @returns {boolean}
 */
export const isCID = (cid) => {
  try {
    parseLink(cid)
    return true
  } catch (err) {
    throw err
  }
}

/**
 *
 * @param {string} targetPath
 * @returns {URL}
 */
export const resolvePath = (targetPath) =>
  pathToFileURL(path.resolve(process.cwd(), targetPath))

/**
 *
 * @param {string} targetPath
 * @returns {boolean}
 */
export const isPath = (targetPath) => {
  try {
    if (targetPath) {
      const stat = fs.lstatSync(resolvePath(targetPath))
      return stat.isDirectory() || stat.isFile()
    }
  } catch (err) {
    throw new Error(`File or directory does not exist: ${targetPath}`)
  }
  return false
}
