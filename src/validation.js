import * as API from '@ucanto/interface'
// @ts-ignore
import { parseLink } from '@ucanto/server'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

import { getSettings } from './client.js'

/**
 *
 * @param {string|undefined} email?
 * @returns {boolean}
 */
export const isEmail = (email) => {
  if (!email) return false
  return /(.+)@(.+){2,}\.(.+){2,}/.test(email)
}

/**
 *
 * @param {API.Link|undefined|string} cid
 * @returns {boolean}
 */
export const isCID = (cid) => {
  if (!cid) {
    throw 'A CID was not provided'
  }
  parseLink(cid)
  return true
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

/**
 * @param {import('yargs').Arguments<{path?:string}>} argv
 */
export const checkPath = ({ path }) => {
  try {
    return isPath(path)
  } catch (err) {
    throw new Error(
      `${path} is probably not a valid path to a file or directory: \n${err}`
    )
  }
}

/**
 * @param {import('yargs').Arguments<{profile?:string}>} argv
 */
export const hasID = ({ profile }) => {
  const settings = getSettings(profile)

  if (!settings.has('secret') && !settings.has('account_secret')) {
    throw new Error(`You have not setup an id, please run w3up id first.`)
  }
  return true
}

/**
 * @param {import('yargs').Arguments<{profile?:string}>} argv
 */
export const hasEmail = ({ profile }) => {
  const settings = getSettings(profile)

  if (!settings.has('email')) {
    throw new Error(
      `You have not setup an email, please run w3up register <email> first.`
    )
  }
  return true
}

/**
 * @param {import('yargs').Arguments<{profile?:string}>} argv
 */
export function hasSetupAccount(argv) {
  return hasID(argv) && hasEmail(argv)
}

/**
 *
 * @param {string | undefined} targetPath
 * @returns {boolean}
 */
export const isCarFile = (targetPath) => {
  if (!targetPath || !isPath(targetPath)) {
    return false
  }
  return path.extname(targetPath) === '.car'
}
