import ora from 'ora'
import Inquirer from 'inquirer'
import client from '../client.js'
import { isEmail, hasID } from '../validation.js'

const exe = async (argv) => {
  const { email } = argv
  // TODO: https://github.com/nftstorage/w3up-cli/issues/15
  // this can hang if there's network disconnectivity.
  const view = ora({
    text: `Registering ${email}, check your email for the link.`,
    spinner: 'line',
  }).start()

  try {
    let result = await client.register(email)
    if (result) {
      let checkres = await client.checkRegistration()
      if (checkres?.ok) {
        console.log('checkres', checkres)
        view.succeed(`Registration succeeded: ${email}`)
      }
    }
  } catch (err) {
    view.fail(err.toString())
  }
}

const register = {
  cmd: 'register <email>',
  description: 'Register your UCAN Identity with w3up',
  build: (yargs) => {
    yargs
      .check(() => hasID())
      .check((argv) => {
        const { email } = argv
        //pretty loose, really just checking typos.
        if (isEmail(email)) {
          return true
        }
        throw new Error(`Error: ${email} is probably not a valid email.`)
      })
    return yargs
  },
  exe,
}

export default register
