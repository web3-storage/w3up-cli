import { parseLink } from '@ucanto/server'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { settings } from './client.js'

/**
 *
 * @param {string|undefined} email
 * @returns {boolean}
 */
export const isEmail = (email) => {
  if (!email) return false
  return /(.+)@(.+){2,}\.(.+){2,}/.test(email)
}

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
 * @param {string|undefined} targetPath
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

export const hasID = () => {
  if (!settings.has('secret')) {
    throw new Error(`You have not setup an id, please run w3up id first.`)
  }
  return true
}
export const hasEmail = () => {
  if (!settings.has('email')) {
    throw new Error(
      `You have not setup an email, please run w3up register <email> first.`
    )
  }
  return true
}
