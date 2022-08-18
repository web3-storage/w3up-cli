/**
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isEmail = (email) => /(.+)@(.+){2,}\.(.+){2,}/.test(email)
