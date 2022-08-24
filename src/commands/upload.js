import client from '../client.js'
import ora from 'ora'
import { hasID, isPath, resolvePath } from '../validation.js'
import fs from 'fs'
import path from 'path'

/**
 * @typedef {{path?:string}} Upload
 * @typedef {import('yargs').Arguments<Upload>} UploadArgs
 */

/**
 * @async
 * @param {UploadArgs} argv
 * @returns {Promise<void>}
 */

const exe = async (argv) => {
  const _path = argv.path

  const view = ora({ text: `Uploading ${_path}...`, spinner: 'line' }).start()

  if (!_path) {
    return Promise.reject('You must Specify a Path')
  }

  //TODO: more robust filename checking
  if (path.extname(_path) !== 'car') {
    return Promise.reject(`${_path} must be a .car file`)
  }

  try {
    const buffer = await fs.promises.readFile(resolvePath(_path))
    const response = await client.upload(buffer)
    if (response) {
      view.succeed(`${response}`)
    }
  } catch (err) {
    view.fail('Upload did not complete successfully, check w3up-failure.log')
    await fs.promises.appendFile('w3up-failure.log', JSON.stringify(err) + '\n')
  }
}

/**
 * @type {import('yargs').CommandBuilder} yargs
 * @returns {import('yargs').Argv<{}>}
 */
const build = (yargs) => yargs.check(() => hasID()).check(checkPath)

/**
 * @param {UploadArgs} argv
 */
const checkPath = ({ path }) => {
  try {
    return isPath(path)
  } catch (err) {
    throw new Error(
      `${path} is probably not a valid path to a file or directory: \n${err}`
    )
  }
}

const upload = {
  cmd: ['upload <path>', 'import <path>'],
  description: 'Upload a file or directory to your account',
  build,
  exe,
  exampleIn: '$0 upload ../../duck.png',
  exampleOut: `uploaded bafy...`,
}

export default upload
