import { parseLink } from '@ucanto/server'

/**
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isEmail = (email) => /(.+)@(.+){2,}\.(.+){2,}/.test(email)

//TODO: implement a CID input validator
//https://github.com/nftstorage/w3up-cli/issues/21
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
